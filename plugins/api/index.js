const Joi = require('joi');
const Boom = require('boom');
const request = require('request');

const searchEmail = (userName, callback) => {
    let result;
    request({
        url: `https://api.github.com/users/${userName}/events/public`,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36'
        },
        json: true
    }, (error, response, body) => {
        if (!error && (200 <= response.statusCode && response.statusCode <= 299)) {
            const events = body || [];
            events.forEach((event) => {
                const payload = event.payload || {};
                const commits = payload.commits || [];
                commits.forEach((commit) => {
                    const author = commit.author || {};
                    const email = author.email;
                    const name = author.name;
                    result = result || {
                        userName,
                        email,
                        name
                    };
                });
            });
        }

        if (result) {
            return callback(null, result);
        } else {
            callback(Boom.notFound(`Email address for user "${userName}" could not be found`), null);
        }
    });
};

const getEmailHandler = (request, reply) => {
    const {userName} = request.params;
    searchEmail(userName, (error, result) => {
        if (error) {
            reply(error);
        } else {
            reply(result);
        }
    });
};

exports.register = (server, options, next) => {
    server.route({
        method: 'GET',
        path: '/api/email/{userName}',
        handler: getEmailHandler,
        config: {
            validate: {
                params: {
                    userName: Joi.string()
                }
            }
        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
