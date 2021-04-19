import * as bodyParser from 'body-parser';
import { NextFunction, Request, Response } from 'express';
import * as helmet from 'helmet';

export default {
	cors: function (req: Request, res: Response, next: NextFunction) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
		res.header(
			'Access-Control-Allow-Headers',
			'Origin, X-Requested-With, Content-Type, Accept, Authorization, stayconnected'
		);
		next();
	},
	helmet: helmet(),
	json: bodyParser.json({ limit: '50mb' }),
	urlencoded: bodyParser.urlencoded({ extended: true, limit: '50mb' })
};
