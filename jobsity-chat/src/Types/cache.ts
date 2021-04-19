import { Message } from "./message";

export type UserCache = {
    socketId: any;
    room: string;
};

export type SocketCache = {
    user: string;
}

export type RoomCache = {
    userSockets: Array<string>;
}

export type RoomMessage = {
    messages: Array<Message>;
}