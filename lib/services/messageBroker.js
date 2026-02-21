'use strict';

const { Service } = require('@hapipal/schmervice');
const Amqp = require('amqplib');

module.exports = class MessageBrokerService extends Service {

    async sendExportRequest(email) {

        const amqpUrl = process.env.AMQP_URL || 'amqp://localhost';
        const connection = await Amqp.connect(amqpUrl);
        const channel = await connection.createChannel();
        const queue = 'export_movies';

        await channel.assertQueue(queue, { durable: false });

        const message = JSON.stringify({ mail: email });
        channel.sendToQueue(queue, Buffer.from(message));

        console.log(`Sent export request for ${email}`);

        setTimeout(() => {

            connection.close();
        }, 500);

        return true;
    }
};