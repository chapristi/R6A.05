'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');


module.exports = class Movie extends Model {

    static get tableName() {

        return 'movie';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            titre: Joi.string().min(3).example('Pirates des Caraïbes').description('Title of the movie'),
            description: Joi.string().min(3).example('Elizabeth Swann fille du gouverneur ...').description('Description of the movie'),
            dateSortie: Joi.date().example('13-08-2003').description('Date of release'),
            realisateur: Joi.string().example('Gore Verbinski').description('Movie maker'),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    $beforeInsert(queryContext) {
        this.updatedAt = new Date();
        this.createdAt = this.updatedAt;
    }

    $beforeUpdate(opt, queryContext) {
        this.updatedAt = new Date();
    }

};