export type Message = {
	username: string;
	text: string;
	createdAt: number;
};

export type UserData = {
	socketId: string;
	username: string;
	room: string;
}