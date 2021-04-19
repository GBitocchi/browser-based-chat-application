import { injectable } from 'inversify';
import { Document } from 'mongoose';
import { DbClient } from '../utils/db_client';
import { dbClient } from '../Containers/decorators';
import { GenericRepository } from './generic_repository';
import { User } from '../Models/User/user';
import { UserRepository as UserRepositoryInterface } from '../Interfaces/repositories';

type UserModel = User & Document;

@injectable()
export class UserRepository extends GenericRepository<User, UserModel> implements UserRepositoryInterface {
	public constructor(@dbClient dbClient: DbClient) {
		super(dbClient, 'user', {
			userId: String,
			username: String,
			password: String,
		});
	}
}
