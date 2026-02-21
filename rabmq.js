'use strict';

require('dotenv').config();

const Amqp = require('amqplib');
const Knex = require('knex');
const { Model } = require('objection');
const KnexConfig = require('./knexfile');
const Movie = require('./lib/models/movie');
const Nodemailer = require('nodemailer');
const { stringify } = require('csv-stringify/sync');

const knex = Knex(KnexConfig);
Model.knex(knex);

const startWorker = async () => {

    const testAccount = await Nodemailer.createTestAccount();

    const transporter = Nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    const queue = 'export_movies';
    const amqpUrl = process.env.AMQP_URL || 'amqp://localhost';

    try {
        const connection = await Amqp.connect(amqpUrl);
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, { durable: false });

        console.log('Worker waiting for messages in %s.', queue);
        console.log('Ethereal Email User:', testAccount.user);

        channel.consume(queue, async (msg) => {

            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const adminEmail = content.email;

                console.log('Received request for:', adminEmail);

                try {
                    const movies = await Movie.query();

                    const csvData = movies.map((m) => ({
                        title: m.titre,
                        description: m.description,
                        releaseDate: m.dateSortie ? new Date(m.dateSortie).toLocaleDateString('fr-FR') : '',
                        director: m.realisateur,
                        createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : '',
                        updatedAt: m.updatedAt ? new Date(m.updatedAt).toISOString() : ''
                    }));

                    const csvString = stringify(csvData, { header: true });

                    const info = await transporter.sendMail({
                        from: '"Export Service" <no-reply@example.com>',
                        to: adminEmail,
                        subject: 'Export CSV de vos films',
                        text: 'Voici l\'export de vos films au format CSV.',
                        attachments: [
                            {
                                filename: 'movies.csv',
                                content: csvString,
                                contentType: 'text/csv'
                            }
                        ]
                    });

                    console.log('Email sent to %s', adminEmail);
                    console.log('Preview URL: %s', Nodemailer.getTestMessageUrl(info));

                    channel.ack(msg);

                }
                catch (error) {
                    console.error('Error processing export:', error);
                }
            }
        });
    }
    catch (err) {
        console.error('Worker Error:', err);
    }
};

startWorker();