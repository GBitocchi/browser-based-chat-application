import 'reflect-metadata';
import { App } from './App';
import { referenceDataIoCModule, DIContainer } from './Containers/di_containers';
import Environment from './Types/environment_schema';
import { TYPES } from './Containers/types';
import { container } from './utils/ioc_container';
import Logger from './utils/Logger';

const logger = DIContainer.resolve<Logger>(Logger);

async function server() {
	const environment = DIContainer.get<Environment>(TYPES.Environment);

	const app = await App(
		container,
		logger,
		environment.HTTP_PORT,
		environment.RABBIT_HOST,
		environment.DB_HOST,
		environment.DB_NAME,
		environment.DB_RECONNECTION_TIME,
		referenceDataIoCModule
	);

	return app;
}

process.on('SIGINT', () => {
	logger.logError(`Process killed by SIGINT call`);
	process.exit(0);
});

process.on('uncaughtException', (e) => {
	logger.logError(`Something went wrong, uncaught exception detected - ${e}`);
	process.exit(0);
});

process.on('unhandledRejection', (e) => {
	logger.logError(`Something went wrong, unhandled rejection detected - ${e}`);
	process.exit(0);
});

if (!module.parent) {
	(async () => {
		await server();
	})();
}

export default server;
