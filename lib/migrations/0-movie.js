'use strict';

module.exports = {

    async up(knex) {

        await knex.schema.createTable('movie', (table) => {

            table.increments('id').primary();
            table.string('titre').notNullable();
            table.text('description').notNullable();
            table.date('dateSortie').notNullable();
            table.string('realisateur').notNullable();

            table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
            table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
        });
    },

    async down(knex) {

        await knex.schema.dropTableIfExists('movie');
    }
};