import * as http from 'http';
import * as express from 'express';
import { Server } from "socket.io";

type Servers = {
	http: http.Server;
	io: any;
};

type ServerParams = {
	httpPort: number;
	app: express.Application;
	server: any;
};

export const createServers = (serverConfig: ServerParams): Servers => {
	const httpServer: http.Server = http.createServer(serverConfig.app);
	const ioConnection = new Server(httpServer);
	httpServer.listen(serverConfig.httpPort);
	return { http: httpServer, io: ioConnection };
};
