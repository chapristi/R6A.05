'use strict';

const { Service } = require('@hapipal/schmervice');
const Jwt = require('@hapi/jwt');
const { compareSha1,sha1 } = require("@hugoheml/iut-encrypt");
const Dotenv = require('dotenv');


Dotenv.config({ path: `${__dirname}/.env` });
module.exports = class UserService extends Service {
    list() {
        const { User }  = this.server.models();
        return User.query();
    }
    async create(user) {

        const { User } = this.server.models();
        const { mailService } = this.server.services();

        const existingUser = await User.query().findOne({ mail: user.mail });

        if (existingUser) {
            throw Error('Cet utilisateur existe déjà');
        }

        const userResult = await User.query().insertAndFetch(user);

        const mailOptions = {
            from: 'louis@louis.com',
            to: user.mail,
            subject: 'Bienvenue',
            text: 'Message de bienvenue'
        };

        mailService.sendMail(mailOptions);

        return userResult;
    }

    delete(id) {

        const { User } = this.server.models();

        return User.query().deleteById(id);
    }

    async promote(id) {
        const { User } = this.server.models();

        return await User.query().where('id', id).update({ scope: 'admin' });

    }

    async login(mail, password) {

        const { User } = this.server.models();

        const user  = await User.query().findOne({ mail });
        if (!user) {
            return null;
        }

        const isPasswordValid = compareSha1(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        return Jwt.token.generate(
            {
                aud: 'urn:audience:iut',
                iss: 'urn:issuer:iut',
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                mail: user.mail,
                scope: user.scope
            },
            {
                key: process.env.JWT_KEY,
                algorithm: 'HS512'
            },
            {
                ttlSec: 14400
            }
        );
    }

};
