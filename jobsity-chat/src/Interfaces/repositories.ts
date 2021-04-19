import { User } from '../Models/User/user';

export type Query<T> = {
	[P in keyof T]?: T[P] | { $regex: RegExp };
};

export interface Repository<T> {
	findOne(project?: any): Promise<T>;
	upsert(doc: T, query?: any): Promise<T>;
	save(doc: T): Promise<T>;
	findById(id: string): Promise<T>;
	findOneByQuery(query?: Query<T>, project?: any): Promise<T>;
	findManyByQuery(sortBy?: any, query?: Query<T>, project?: any): Promise<T[]>;
}

export type UserRepository = Repository<User>;
