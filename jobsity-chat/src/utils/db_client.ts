import * as mongoose from 'mongoose';
import Logger from './Logger';

export type DbClient = mongoose.Mongoose;

export async function getDatabaseClient(
	dbHost: string,
	dbName: string,
	reconnectionTime: number,
	logger: Logger
) {
	return new Promise<DbClient>((resolve, reject) => {
		const connString = `mongodb://${dbHost}/${dbName}`;

		const connect = () => {
			mongoose
				.connect(connString, {
					useNewUrlParser: true,
					useUnifiedTopology: true,
					useFindAndModify: false,
				})
				.catch((err) => {
					logger.logError(`DB Connection Error: ${err}`);
				});
		};
		connect();
		const db = mongoose.connection;
		db.on('error', (e: Error) => {
			setTimeout(() => {
				connect();
			}, reconnectionTime * 1000);
		});
		db.once('open', () => {
			logger.logInfo(`DB Connection Success: ${connString}`);
			resolve(mongoose);
		});
	});
}
