'use strict';

const Joi = require('joi');

module.exports = [
    {
        method: 'POST',
        path: '/favorite/{id}',
        options: {
            auth: { scope: ['user', 'admin'] },
            tags: ['api'],
            description: 'Add a movie to favorites',
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('Film ID to add to favorites')
                })
            }
        },
        handler: async (request, h) => {

            const { favoriteService } = request.services();
            const favorite = await favoriteService.add(request.auth.credentials.userId, request.params.id);

            return h.response({
                message: 'Le film a été ajouté à vos favoris avec succès.',
                data: favorite
            }).code(201);
        }
    },
    {
        method: 'DELETE',
        path: '/favorite/{id}',
        options: {
            auth: { scope: ['user', 'admin'] },
            tags: ['api'],
            description: 'Remove a movie from favorites',
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('Film ID to remove from favorites')
                })
            }
        },
        handler: async (request, h) => {

            const { favoriteService } = request.services();
            await favoriteService.delete(request.auth.credentials.userId, request.params.id);

            return h.response({
                message: 'Le film a été retiré de vos favoris avec succès.'
            }).code(200);
        }
    }
];