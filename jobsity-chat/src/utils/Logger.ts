import { injectable } from 'inversify';
import * as moment from 'moment';
import 'reflect-metadata';
import * as winston from 'winston';
import { environment } from '../Containers/decorators';
import Environment from '../Types/environment_schema';

moment().locale('es');

const timestamp = () => moment().format('YYYY-MM-DD HH:mm:ss');

@injectable()
class Logger {
	private winstonLogger: winston.Logger;

	constructor(@environment _environment: Environment) {
		const format = winston.format;
		this.winstonLogger = winston.createLogger({
			format: format.combine(
				format.simple(),
				format.timestamp(),
				format.printf((info) => `[${timestamp()}] [${info.level}] - ${info.message}`)
			),
			transports: [
				new winston.transports.File({
					maxFiles: _environment.LOG_MAX_FILE,
					maxsize: _environment.LOG_MAX_SIZE * 1024 * 1024,
					filename: `${_environment.LOG_PATH}/ChatJobsity.log`,
					level: _environment.LOG_LEVEL,
					tailable: true,
				}),
				new winston.transports.Console({
					level: _environment.LOG_LEVEL_DAEMON,
				}),
			],
		});
	}

	public logInfo(message: string): void {
		this.winstonLogger.info(message);
	}

	public logError(message: string): void {
		this.winstonLogger.error(message);
	}

	public logWarning(message: string): void {
		this.winstonLogger.warn(message);
	}

	public logDebug(message: string): void {
		this.winstonLogger.debug(message);
	}
}

export default Logger;
