'use strict';

const Joi = require('joi');
const { compareSha1,sha1 } = require("@hugoheml/iut-encrypt");

module.exports = [
    {
        method: 'post',
        path: '/user',
        options: {
            auth: false,
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    firstName: Joi.string().required().min(3).example('John').description('Firstname of the user'),
                    lastName: Joi.string().required().min(3).example('Doe').description('Lastname of the user'),
                    username: Joi.string().required().min(3).example('Username'),
                    mail: Joi.string().email().min(8).required(),
                    password: Joi.string().min(8).required()
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();

            request.payload.password = sha1(request.payload.password);

            return await userService.create(request.payload);
        }
    },

    {
        method: 'get',
        path: '/user',
        options: {
            auth: {
                scope: ['user', 'admin']
            },
            tags: ['api'],
            validate: {
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();

            return await userService.list();

        }
    },
    {
        method: 'delete',
        path: '/user/{id}',
        options: {
            auth: {
                scope: ['admin']
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number()
                        .required()
                        .description('the id for the todo item')
                })
            }
        },
        handler: async (request, h) => {
            const { userService } = request.services();
            await userService.delete(request.params.id);
            return '';
        }
    },

    {
        method: 'POST',
        path: '/user/connect',
        options: {
            auth: false,
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    mail: Joi.string().email().min(8).required(),
                    password: Joi.string().min(8).required()
                })
            }
        },
        handler: async (request, h) => {
            const { userService } = request.services();
            const token = await userService.login(request.payload.mail, request.payload.password);
            return { token };

        }
    },
    {
        method: 'PATCH',
        path: '/user/promote/{id}',
        options: {
            auth: {
                scope: 'admin'
            },
            tags: ['api'],
            validate: {
                params: Joi.object({
                    id: Joi.number()
                        .required()
                        .description('the id of the user')
                })
            }
        },
        handler: async (request, h) => {
            const { userService } = request.services();
            await userService.promote(request.params.id);

            return '';
        }
    }
];