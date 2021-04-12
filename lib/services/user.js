'use strict';

const { Service } = require('@hapipal/schmervice');
const Jwt = require('@hapi/jwt');
const { compareSha1,sha1 } = require("@hugoheml/iut-encrypt");

module.exports = class UserService extends Service {
    list() {
        const { User }  = this.server.models();
        return User.query();
    }
    create(user) {

        const { User } = this.server.models();

        const { mailService } = this.server.services();

        const mailOptions = {
            from: 'louis@louis.com',
            to: user.mail,
            subject: 'Bienvenue',
            text: 'Message de bienvenue'
        };

        mailService.sendMail(mailOptions);

        return User.query().insertAndFetch(user);
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
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.mail,
                scope: user.scope
            },
            {
                key: 'random_string',
                algorithm: 'HS512'
            },
            {
                ttlSec: 14400
            }
        );
    }

};
