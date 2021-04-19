import { injectable, unmanaged } from 'inversify';
import { Schema, Document, Model, SchemaDefinition } from 'mongoose';
import { DbClient } from '../utils/db_client';
import { dbClient } from '../Containers/decorators';
import { Repository, Query } from '../Interfaces/repositories';

@injectable()
export class GenericRepository<TEntity, TModel extends Document> implements Repository<TEntity> {
	private _name: string;
	protected Model: Model<TModel>;

	public constructor(
		@dbClient dbClient: DbClient,
		@unmanaged() name: string,
		@unmanaged() schemaDefinition: SchemaDefinition
	) {
		this._name = name;
		const schema = new Schema(schemaDefinition, {
			collection: this._name,
			versionKey: false,
		});
		this.Model = dbClient.model<TModel>(this._name, schema);
	}

	public async findById(id: string) {
		return new Promise<TEntity>((resolve, reject) => {
			this.Model.findById(id, (err, res) => {
				if (err) {
					reject(err.message);
				} else if (res === null) {
					reject('No object was found');
				} else {
					const result = this._readMapper(res);
					resolve(result);
				}
			});
		});
	}

	public async upsert(doc: TEntity, query: any = {}) {
		return new Promise<TEntity>((resolve, reject) => {
			this.Model.findOneAndUpdate(query, doc, { upsert: true, new: true }, (err, res) => {
				if (err) {
					reject(err.message);
				} else {
					const result = this._readMapper(res);
					resolve(result);
				}
			});
		});
	}

	public async save(doc: TEntity) {
		return new Promise<TEntity>((resolve, reject) => {
			const instance = new this.Model(doc);
			instance.save((err, res) => {
				if (err) {
					reject(err.message);
				} else {
					resolve(this._readMapper(res));
				}
			});
		});
	}

	public async findOne(project: any = {}) {
		return new Promise<TEntity>((resolve, reject) => {
			this.Model.findOne({}, project, (err, res) => {
				if (err) {
					reject(err.message);
				} else if (res === null) {
					reject('No object was found');
				} else {
					const result = this._readMapper(res);
					resolve(result);
				}
			});
		});
	}

	public async findOneByQuery(query: Query<TEntity>, project: any = {}) {
		return new Promise<TEntity>((resolve, reject) => {
			this.Model.findOne(query as any, project, (err, res) => {
				if (err) {
					reject(err.message);
				} else if (res === null) {
					reject('No object was found');
				} 
				else {
					const result = this._readMapper(res);
					resolve(result);
				}
			})
		});
	}

	public findManyByQuery(sortBy: any = {}, query: Query<TEntity>, project: any = {}) {
		return new Promise<TEntity[]>((resolve, reject) => {
			this.Model.find(query as any, project, (err, res) => {
				if (err) {
					reject(err.message);
				} else {
					resolve(res.map((r) => this._readMapper(r)));
				}
			}).sort(sortBy);
		});
	}

	protected _readMapper(model: TModel) {
		const obj: any = model.toJSON();
		Object.defineProperty(obj, 'id', Object.getOwnPropertyDescriptor(obj, '_id'));
		delete obj['_id'];
		return obj as TEntity;
	}
}
