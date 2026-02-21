'use strict';

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const Sinon = require('sinon');
const { deployment } = require('../server');

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe('FavoriteService', () => {
    let server;
    let favoriteService;
    let Movie;
    let Favorite;

    beforeEach(async () => {
        server = await deployment();
        favoriteService = server.services().favoriteService;

        const { Movie: M, Favorite: F } = server.models();
        Movie = M;
        Favorite = F;
    });

    afterEach(async () => {
        await server.stop();
        Sinon.restore();
    });

    describe('add()', () => {
        it('devrait ajouter un film en favori avec succès', async () => {

            Sinon.stub(Movie, 'query').returns({
                findById: Sinon.stub().resolves({ id: 123, titre: 'Inception' })
            });

            Sinon.stub(Favorite, 'query').returns({
                findOne: Sinon.stub().resolves(null),
                insertAndFetch: Sinon.stub().resolves({ user_id: 1, movie_id: 123 })
            });

            const result = await favoriteService.add(1, 123);

            expect(result).to.equal({ user_id: 1, movie_id: 123 });
        });

        it('devrait retourner une erreur 404 si le film n\'existe pas', async () => {

            Sinon.stub(Movie, 'query').returns({
                findById: Sinon.stub().resolves(null)
            });

            const promise = favoriteService.add(1, 999);

            await expect(promise).to.reject(Error, 'This movie does not exist');
        });

        it('devrait retourner une erreur 409 si le film est déjà en favori', async () => {

            Sinon.stub(Movie, 'query').returns({
                findById: Sinon.stub().resolves({ id: 123 })
            });

            Sinon.stub(Favorite, 'query').returns({
                findOne: Sinon.stub().resolves({ user_id: 1, movie_id: 123 })
            });

            const promise = favoriteService.add(1, 123);

            await expect(promise).to.reject(Error, 'Already in favorites');
        });
    });

    describe('delete()', () => {
        it('devrait supprimer un favori avec succès', async () => {

            Sinon.stub(Favorite, 'query').returns({
                deleteById: Sinon.stub().resolves(1)
            });

            const result = await favoriteService.delete(1, 123);

            expect(result).to.equal('');
        });

        it('devrait retourner une erreur 404 si le favori n\'existe pas pour cet utilisateur', async () => {

            Sinon.stub(Favorite, 'query').returns({
                deleteById: Sinon.stub().resolves(0)
            });

            const promise = favoriteService.delete(1, 999);

            await expect(promise).to.reject(Error, 'Favorite not found');
        });
    });
});