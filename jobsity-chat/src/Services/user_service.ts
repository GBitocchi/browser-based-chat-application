import { injectable } from 'inversify';
import 'reflect-metadata';
import { User } from 'src/Models/User/user';
import { userRepository, logger } from '../Containers/decorators';
import { UserRepository } from '../Interfaces/repositories';
import Logger from '../utils/Logger';
import * as bcrypt from 'bcrypt';
import * as NodeCache from 'node-cache';
import { Message, UserData } from '../Types/message';
import { RoomCache, RoomMessage, SocketCache, UserCache } from '../Types/cache';

@injectable()
class UserService {
	@userRepository public _userRepository: UserRepository;
	@logger _logger: Logger;
	userCache: NodeCache;
	socketCache: NodeCache;
	roomCache: NodeCache;
	messageCache: NodeCache;

	constructor() {
		this.userCache = new NodeCache({ deleteOnExpire: false });
		this.socketCache = new NodeCache({ deleteOnExpire: false });
		this.roomCache = new NodeCache({ deleteOnExpire: false });
		this.messageCache = new NodeCache({ deleteOnExpire: false });
	}

	public async userAuthenticate(usernameRequest: string, passwordRequest: string): Promise<boolean> {
		try {
			const userRetrieved: User = await this._userRepository.findOneByQuery({ username: usernameRequest })
			const salt = await bcrypt.genSalt(10);
			const hashedPasswordRequest = await bcrypt.hash(passwordRequest, salt)
			return await bcrypt.compare(userRetrieved.password, hashedPasswordRequest)
		}
		catch (error) {
			this._logger.logInfo(`User ${usernameRequest} does not exist in database`);
		}

		return false;
	}

	public userBeingUsed(usernameRequest: string): boolean {
		return this.userCache.has(usernameRequest);
	}

	public generateUserMessage = (username: string, text: string, room: string): RoomMessage => {
		const userMessage: Message = {
			username,
			text,
			createdAt: new Date().getTime()
		};

		let roomMessages: RoomMessage = { messages: [userMessage] };

		if (this.messageCache.has(room)) {
			roomMessages = this.messageCache.take(room);
			roomMessages.messages.push(userMessage);
			roomMessages.messages = roomMessages.messages.slice(-50);
		}

		this.messageCache.set(room, roomMessages);

		return roomMessages;
	}

	public addUserToRoom = (username: string, room: string, socket: any): void => {
		const userCache: UserCache = { socketId: socket.id, room: room };
		const socketCache: SocketCache = { user: username };
		const roomCache: RoomCache = { userSockets: [socket.id] };

		this.userCache.set(username, userCache);
		this.socketCache.set(socket.id, socketCache);

		if (this.roomCache.has(room)) {
			const roomRetrieved: RoomCache = this.roomCache.take(room);
			roomRetrieved.userSockets.push(socket.id);
			this.roomCache.set(room, roomRetrieved);
			return;
		}

		this.roomCache.set(room, roomCache);
	}

	public getUsersInRoom = (roomRequest: string): Array<UserData> => {
		const usersInRoom = new Array<UserData>();

		const retrievedUsersFromRoom: RoomCache = this.roomCache.get(roomRequest);

		if (retrievedUsersFromRoom) {
			for (const socketUser of retrievedUsersFromRoom.userSockets) {
				const retrievedSocketUser: SocketCache = this.socketCache.get(socketUser);
				const userInRoom: UserData = { room: roomRequest, socketId: socketUser, username: retrievedSocketUser.user };
				usersInRoom.push(userInRoom);
			}
		}

		return usersInRoom;
	}

	public getUser = (username: string): UserData => {
		const userRetrieved: UserCache = this.userCache.get(username);

		if (userRetrieved) {
			return { room: userRetrieved.room, username, socketId: userRetrieved.socketId };
		}

		this._logger.logError(`Error while retrieving user ${username} from cache`);
	}

	public removeUserFromRoom = (socket: any): UserData => {
		const removedSocket: SocketCache = this.socketCache.take(socket.id);

		if (removedSocket) {
			const removedUser: UserCache = this.userCache.take(removedSocket.user);

			if (removedUser) {
				const roomRetrieved: RoomCache = this.roomCache.take(removedUser.room);
				roomRetrieved.userSockets = roomRetrieved.userSockets.filter(socket => socket !== removedUser.socketId)
				this.roomCache.set(removedUser.room, roomRetrieved);
			}

			return { room: removedUser.room, socketId: socket.id, username: removedSocket.user };
		}
	}
}

export default UserService;
