const Hapi = require('hapi');
const Good = require('good');
const Path = require('path');
const Inert = require('inert');
const API = require('./plugins/api');

const server = new Hapi.Server();

server.connection({ 
    host: 'localhost', 
    port: 8000
});

server.register([
    {
        register: Good,
        options: {
            reporters: {
                goodConsoleReporter: [{
                        module: 'good-console',
                        args: [{ log: '*', response: '*' }]
                    }, 'stdout'
                ]
            }
        }
    },
    Inert,
    API
], (err) => {
    if (err) {
        throw err;
    }

    server.start(() => {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public'
        }
    }
});
