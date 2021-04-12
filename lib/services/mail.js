'use strict';

const { Service } = require('@hapipal/schmervice');
const nodemailer = require('nodemailer');


module.exports = class MailService extends Service {

    async sendMail(mailOptions) {

        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email envoyé !');
            console.log('Lien ethereal  : ' + nodemailer.getTestMessageUrl(info));
            return info;
        } catch (error) {
            console.error('Erreur lors de l\'envoi : ' + error);
            throw error;
        }
    }
};
