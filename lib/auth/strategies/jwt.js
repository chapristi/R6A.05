'use strict';

const Dotenv = require('dotenv');


Dotenv.config({ path: `${__dirname}/.env` });
module.exports = {
    scheme: 'jwt',
    options: {
        keys: process.env.JWT_KEY,
        verify: {
            aud: 'urn:audience:iut',
            iss: 'urn:issuer:iut',
            sub: false,
            nbf: true,
            exp: true,
            maxAgeSec: 14400,
            timeSkewSec: 15
        },
        validate: async (artifacts, request, h) => {

            return {
                isValid: true,
                credentials: artifacts.decoded.payload
            };
        }
    }
};