class Environment {
	public readonly HTTP_PORT: number;

	public readonly RABBIT_HOST: string;

	public readonly DB_HOST: string;
	public readonly DB_AUTH: string;
	public readonly DB_NAME: string;
	public readonly DB_RECONNECTION_TIME: number;

	public readonly LOG_PATH: string;
	public readonly LOG_LEVEL: string;
	public readonly LOG_LEVEL_DAEMON: string;
	public readonly LOG_MAX_SIZE: number;
	public readonly LOG_MAX_FILE: number;

	constructor(process: object) {
		this.HTTP_PORT = process['env']['HTTP_PORT'];

		this.RABBIT_HOST = process['env']['RABBIT_HOST'];

		this.DB_HOST = process['env']['DB_HOST'];
		this.DB_AUTH = process['env']['DB_AUTH'];
		this.DB_NAME = process['env']['DB_NAME'];
		this.DB_RECONNECTION_TIME = process['env']['DB_RECONNECTION_TIME'];

		this.LOG_PATH = process['env']['LOG_PATH'];
		this.LOG_LEVEL = process['env']['LOG_LEVEL'];
		this.LOG_LEVEL_DAEMON = process['env']['LOG_LEVEL_DAEMON'] || 'error';
		this.LOG_MAX_FILE = process['env']['LOG_MAX_FILE'];
		this.LOG_MAX_SIZE = process['env']['LOG_MAX_SIZE'];
	}
}

export default Environment;
