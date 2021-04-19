import { inject } from 'inversify';
import { TYPES } from './types';

export const dbClient = inject(TYPES.DbClient);
export const userRepository = inject(TYPES.UserRepository);
export const environment = inject(TYPES.Environment);
export const userService = inject(TYPES.UserService);
export const socketService = inject(TYPES.SocketService);
export const logger = inject(TYPES.Logger);
export const socketConnectionHandler = inject(TYPES.SocketConnectionHandler);
