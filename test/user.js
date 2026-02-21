'use strict';

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const Sinon = require('sinon');
const { deployment } = require('../server');

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe('Tests API avec Mocks', () => {
    let server;
    let userService;
    let favoriteService;

    beforeEach(async () => {
        server = await deployment();
        userService = server.services().userService;
        favoriteService = server.services().favoriteService;
    });

    afterEach(async () => {
        await server.stop();
        Sinon.restore();
    });

    describe('POST /user', () => {
        it('crée un utilisateur avec succès (Mock)', async () => {
            const payload = {
                firstName: 'John',
                lastName: 'Doe',
                username: 'jdoe',
                mail: 'john.new@example.com',
                password: 'password123'
            };

            const stub = Sinon.stub(userService, 'create').resolves({ id: 1, ...payload });

            const res = await server.inject({
                method: 'post',
                url: '/user',
                payload
            });

            expect(res.statusCode).to.equal(200);
            expect(stub.calledOnce).to.be.true();
        });

        it('retourne 400 si l\'utilisateur existe déjà (Mock)', async () => {
            const error = new Error('Unique violation');


            Sinon.stub(userService, 'create').rejects(error);

            const res = await server.inject({
                method: 'post',
                url: '/user',
                payload: { mail: 'exist@test.com' }
            });

            expect(res.statusCode).to.equal(400);
        });
    });

    describe('POST /favorite/{id}', () => {
        it('ajoute un film aux favoris avec succès (Mock)', async () => {
            const stub = Sinon.stub(favoriteService, 'add').resolves({ movie_id: 123, user_id: 1 });

            const res = await server.inject({
                method: 'post',
                url: '/favorite/123',
                auth: {
                    strategy: 'jwt',
                    credentials: { userId: 1, scope: ['user'] }
                }
            });

            expect(res.statusCode).to.equal(201);
            expect(res.result.message).to.equal('Le film a été ajouté à vos favoris avec succès.');
            expect(stub.calledWith(1, 123)).to.be.true();
        });
    });

    describe('DELETE /favorite/{id}', () => {
        it('supprime un film des favoris avec succès (Mock)', async () => {
            const stub = Sinon.stub(favoriteService, 'delete').resolves();

            const res = await server.inject({
                method: 'delete',
                url: '/favorite/123',
                auth: {
                    strategy: 'jwt',
                    credentials: { userId: 1, scope: ['user'] }
                }
            });

            expect(res.statusCode).to.equal(200);
            expect(res.result.message).to.equal('Le film a été retiré de vos favoris avec succès.');
            expect(stub.calledWith(1, 123)).to.be.true();
        });
    });
});