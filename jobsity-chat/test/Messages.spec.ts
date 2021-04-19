import { DIContainer, referenceDataIoCModule } from '../src/Containers/di_containers';
import { TYPES } from '../src/Containers/types';
import UserService from '../src/Services/user_service';
import { RoomMessage } from '../src/Types/cache';
import Environment from '../src/Types/environment_schema';
import { UserData } from '../src/Types/message';
import { DbClient, getDatabaseClient } from '../src/utils/db_client';
import { container } from '../src/utils/ioc_container';
import Logger from '../src/utils/Logger';

const createContainerWithDependencies = async (): Promise<DbClient> => {
    const logger = DIContainer.resolve<Logger>(Logger);
    const environment = DIContainer.get<Environment>(TYPES.Environment);
    const dbClient = await getDatabaseClient(
        environment.DB_HOST,
        environment.DB_NAME,
        environment.DB_RECONNECTION_TIME,
        logger
    );

    container.bind<DbClient>(TYPES.DbClient).toConstantValue(dbClient);
    container.load(referenceDataIoCModule);

    return dbClient;
}

describe('Chat handler', () => {
    it('Should create message text correctly', async (done) => {
        const dbClient = await createContainerWithDependencies();
        const message: string = 'Test message for TestUser';
        const userMessage: RoomMessage = container.resolve(UserService).generateUserMessage('TestUser', message, 'Test room 1');
        expect(userMessage.messages[0].text).toBe(message);
        await dbClient.disconnect();
        done();
    });
});