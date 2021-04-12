'use strict';

module.exports = {

    async up(knex) {

        await knex.schema.alterTable('user', (table) => {
            table.string('password').notNullable();
            table.string('mail').notNullable();
            table.string('username').notNullable();
        });
    },

    async down(knex) {

        await knex.schema.alterTable('user', (table) => {
            table.dropColumn('password');
            table.dropColumn('mail');
            table.dropColumn('username');
        });
    }
};