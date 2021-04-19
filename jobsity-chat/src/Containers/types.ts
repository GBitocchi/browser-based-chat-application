export const TYPES = {
	App: Symbol('App'),
	DbClient: Symbol('DbClient'),
	UserRepository: Symbol('UserRepository'),
	Environment: Symbol.for('process.env'),
	Logger: Symbol.for('Logger'),
	SocketConnectionHandler: Symbol.for('SocketConnectionHandler'),
	UserService: Symbol('UserService'),
	SocketService: Symbol('SocketService')
};
