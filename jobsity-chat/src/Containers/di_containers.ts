import * as dotenv from 'dotenv';
import { Container, ContainerModule } from 'inversify';
import SocketService from '../Services/socket_service';
import { SocketConnectionHandler } from '../utils/socket_handler';
import { UserRepository as UserRepositoryInterface } from '../Interfaces/repositories';
import { UserRepository } from '../Repositories/user_repository';
import UserService from '../Services/user_service';
import Environment from '../Types/environment_schema';
import Logger from '../utils/Logger';
import { TYPES } from './types';
import { RequestController } from '../Controllers/request_controller';
import { registerController } from '../utils/reg_controller';

dotenv.config({ path: './.env' });

const environment = new Environment(process);

export const referenceDataIoCModule = new ContainerModule((bind) => {
	bind<UserService>(TYPES.UserService).to(UserService);

	registerController(bind, RequestController);

	bind<SocketService>(TYPES.SocketService).to(SocketService);

	bind<Environment>(TYPES.Environment).toConstantValue(environment);

	bind<Logger>(TYPES.Logger).to(Logger);

	bind<SocketConnectionHandler>(TYPES.SocketConnectionHandler).to(SocketConnectionHandler);
	
	bind<UserRepositoryInterface>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
});

const DIContainer = new Container();

DIContainer.load(referenceDataIoCModule);

export { DIContainer };
