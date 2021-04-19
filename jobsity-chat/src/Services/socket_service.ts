import 'reflect-metadata';
import { injectable } from 'inversify';
import { UserData } from 'src/Types/message';
import { userService, logger } from '../Containers/decorators';
import UserService from '../Services/user_service';
import Logger from '../utils/Logger';

@injectable()
class SocketService {
    @userService _userService: UserService;
    @logger _logger: Logger;

    public async joinUser(username: string, password: string, room: string, socket: any, io: any): Promise<string> {
        const userAuthenticated = await this._userService.userAuthenticate(username, password);

        if (!userAuthenticated) {
            return 'User or password are incorrect';
        }

        const userBeingUsed = this._userService.userBeingUsed(username);

        if (userBeingUsed) {
            return 'User is being used right now';
        }

        const roomToJoin = room.toLowerCase().trim();

        socket.join(roomToJoin);

        this._userService.addUserToRoom(username, roomToJoin, socket);

        io.to(roomToJoin).emit("message", this._userService.generateUserMessage('General-Info', `User ${username} has joined!`, roomToJoin))

        io.to(roomToJoin).emit("roomData", {
            room: roomToJoin,
            users: this._userService.getUsersInRoom(roomToJoin)
        });

        return null;
    }

    public async sendMessage(username: string, msg: string, io: any, stockChannel: any): Promise<void> {
        const userData: UserData = this._userService.getUser(username);

        io.to(userData.room).emit("message", this._userService.generateUserMessage(userData.username, msg, userData.room))

        const stockCommand: Array<String> = msg.split('/stock=');

        if (stockCommand.length > 1) {
            const stockRoomRequestQueue = 'stockRoomRequest';
            const stockRoomResponseQueue = 'stockRoomResponse';

            const stockCode = stockCommand[1];

            await stockChannel.assertQueue(stockRoomRequestQueue);

            const stockCodeSent = await stockChannel.sendToQueue(stockRoomRequestQueue, Buffer.from(stockCode), {
                contentEncoding: "utf-8",
                contentType: "text/plain"
            })

            if (!stockCodeSent) {
                this._logger.logError(`Could not send stock code: ${stockCode} to the room's queue.`);
            }
            else {
                await stockChannel.assertQueue(stockRoomResponseQueue);

                stockChannel.consume(stockRoomResponseQueue, (stockInfo) => {
                    const stockQuote = stockInfo.content.toString();

                    io.to(userData.room).emit("message", this._userService.generateUserMessage('Stock-Bot', stockQuote, userData.room));

                    stockChannel.ack(stockInfo);
                })
            }
        }
    }

    public disconnectUser(socket: any, io: any): void {
        const userData: UserData = this._userService.removeUserFromRoom(socket)
        if (userData) {
            io.to(userData.room).emit("message", this._userService.generateUserMessage('General-Info', `User ${userData.username} has left the room`, userData.room))

            io.to(userData.room).emit("roomData", {
                room: userData.room,
                users: this._userService.getUsersInRoom(userData.room)
            })
        }
    }
}

export default SocketService;