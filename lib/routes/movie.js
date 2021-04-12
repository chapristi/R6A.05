'use strict';

const Joi = require('joi');

module.exports = [
    {
        method: 'post',
        path: '/movie',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    titre: Joi.string().min(3).example('die Welle').description('Title of the movie'),
                    description: Joi.string().min(3).example('Un professeur en Allemagne fait une expérience sur les regimes autocratiques').description('Description of the movie'),
                    dateSortie: Joi.date().example('2009-01-13').description('Date of release'),
                    realisateur: Joi.string().example('Jean Bon').description('Movie maker')
                })
            }
        },
        handler: async (request, h) => {
            const { movieService } = request.services();

            return await movieService.create(request.payload);
        }
    },
    {
        method: 'patch',
        path: '/movie/{id}',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('ID of the user to delete')
                }),
                payload: Joi.object({
                    titre: Joi.string().min(3).example('die Welle').description('Title of the movie'),
                    description: Joi.string().min(3).example('Un professeur en Allemagne fait une expérience sur les regimes autocratiques').description('Description of the movie'),
                    dateSortie: Joi.date().example('2009-01-13').description('Date of release'),
                    realisateur: Joi.string().example('Jean Bon').description('Movie maker')
                })
            },
            handler: async (request) => {
                const { movieService } = request.services();

                return await movieService.modify(request.params.id, request.payload);
            }
        }

    },
    {
        method: 'delete',
        path: '/movie/{id}',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('ID of the movie to delete')
                })
            }
        },
        handler: async (request, h) => {
            const { movieService } = request.services();

            await movieService.delete(request.params.id);

            return '';
        }
    },
    {
        method: 'get',
        path: '/movie',
        options: {
            auth: {
                scope: [ 'user', 'admin' ]
            },
            tags: ['api']
        },
        handler: async (request, h) => {
            const { movieService } = request.services();

            return await movieService.list();
        }
    }
];