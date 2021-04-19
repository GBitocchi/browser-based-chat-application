import * as dotenv from 'dotenv';
import { Container, ContainerModule } from 'inversify';
import Environment from '../Types/environment_schema';
import Logger from '../utils/Logger';
import { TYPES } from './types';

dotenv.config({ path: './.env' });

const environment = new Environment(process);

export const referenceDataIoCModule = new ContainerModule((bind) => {
	bind<Environment>(TYPES.Environment).toConstantValue(environment);

	bind<Logger>(TYPES.Logger).to(Logger);
});

const DIContainer = new Container();

DIContainer.load(referenceDataIoCModule);

export { DIContainer };
