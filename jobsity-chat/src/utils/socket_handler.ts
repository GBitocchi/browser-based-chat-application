import { injectable } from 'inversify';
import { socketService, logger } from '../Containers/decorators';
import SocketService from '../Services/socket_service';
import Logger from './Logger';

@injectable()
export class SocketConnectionHandler {
    @socketService _socketService: SocketService;
    @logger _logger: Logger;

    public handleRequests(io, stockChannel) {
        try {
            io.on("connection", (socket) => {
                socket.on("join", async ({ username, password, room }, cb) => {
                    const joinError = await this._socketService.joinUser(username, password, room, socket, io);
                    if (joinError) {
                        cb(joinError);
                        return;
                    }
                    cb()
                })

                socket.on("sendMessage", async ({ username, msg }, cb) => {
                    await this._socketService.sendMessage(username, msg, io, stockChannel);
                    cb()
                })

                socket.on("disconnect", () => {
                    this._socketService.disconnectUser(socket, io);
                })
            })
        } catch (handlerError) {
            this._logger.logError(`An error has ocurred. Detail: ${handlerError}`);
        }
    }
}