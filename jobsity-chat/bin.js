const { version } = require('./package');

const server = require('./dist/server').default;

console.info('Process version: ', version);

server();
