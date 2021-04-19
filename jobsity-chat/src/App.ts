import { Container, ContainerModule } from 'inversify';
import * as express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { DbClient, getDatabaseClient } from './utils/db_client';
import { TYPES } from './Containers/types';
import middlewares from './ApiResources/middlewares';
import Logger from './utils/Logger';
import { createServers } from './utils/servers';
import * as path from 'path';
import * as amqp from 'amqplib';
import { SocketConnectionHandler } from './utils/socket_handler';

export async function App(
  container: Container,
  logger: Logger,
  httpPort: number,
  rabbitHost: string,
  dbHost: string,
  dbName: string,
  reconnectionTime: number,
  ...modules: ContainerModule[]
) {
  if (container.isBound(TYPES.App) === false) {
    const dbClient = await getDatabaseClient(
      dbHost,
      dbName,
      reconnectionTime,
      logger
    );
    container.bind<DbClient>(TYPES.DbClient).toConstantValue(dbClient);
    container.load(...modules);

    const server = new InversifyExpressServer(container);

    const middlewaresArray = Object.keys(middlewares).map((middlewareKey) => {
      return middlewares[middlewareKey];
    });

    server.setConfig((app) => {
      middlewaresArray.forEach((middleware) => {
        app.use(middleware);
      });

      app.use(express.static(path.join(__dirname, '../public')))
    });

    const app = server.build();

    const servers = createServers({ app, httpPort, server });

    servers.http && logger.logInfo(`HTTP: Listening on port ${httpPort}`);

    const rabbitConnection = await amqp.connect(`amqp://${rabbitHost}`);
    const stockChannel = await rabbitConnection.createChannel();

    logger.logInfo(`Connected to RabbitMQ!`);

    const socketHandler = container.resolve<SocketConnectionHandler>(SocketConnectionHandler);

    socketHandler.handleRequests(servers.io, stockChannel);

    container.bind<express.Application>(TYPES.App).toConstantValue(app);

    return servers;
  } else {
    return container.get<express.Application>(TYPES.App);
  }
}