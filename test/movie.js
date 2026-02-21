'use strict';

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const Sinon = require('sinon');
const { deployment } = require('../server');

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script();

describe('MovieService', () => {
    let server;
    let movieService;
    let mailService;
    let Movie;
    let User;
    let Favorite;

    beforeEach(async () => {
        server = await deployment();
        movieService = server.services().movieService;
        mailService = server.services().mailService;

        const { Movie: M, User: U, Favorite: F } = server.models();
        Movie = M;
        User = U;
        Favorite = F;
    });

    afterEach(async () => {
        await server.stop();
        Sinon.restore();
    });

    describe('create()', () => {
        it('devrait créer un film et envoyer des mails aux utilisateurs (Mock)', async () => {
            const moviePayload = { titre: 'Inception', description: 'Dream within a dream' };
            const usersMock = [
                { mail: 'user1@test.com', firstName: 'User1' },
                { mail: 'user2@test.com', firstName: 'User2' }
            ];

            const movieStub = Sinon.stub(Movie, 'query').returns({
                insertAndFetch: Sinon.stub().resolves({ id: 1, ...moviePayload })
            });

            const userStub = Sinon.stub(User, 'query').returns({
                select: Sinon.stub().resolves(usersMock)
            });

            const mailStub = Sinon.stub(mailService, 'sendMail').resolves();

            const result = await movieService.create(moviePayload);

            expect(result.id).to.equal(1);
            expect(result.titre).to.equal('Inception');
            expect(mailStub.callCount).to.equal(2);
        });
    });

    describe('modify()', () => {
        it('devrait modifier un film et notifier les utilisateurs l\'ayant en favori (Mock)', async () => {
            const movieId = 1;
            const updatePayload = { titre: 'Interstellar' };
            const favoritesMock = [
                { user: { mail: 'fan@test.com', firstName: 'Fan' } }
            ];

            Sinon.stub(Movie, 'query').returns({
                patchAndFetchById: Sinon.stub().resolves({ id: movieId, ...updatePayload })
            });

            Sinon.stub(Favorite, 'query').returns({
                where: Sinon.stub().returns({
                    withGraphFetched: Sinon.stub().returns({
                        select: Sinon.stub().resolves(favoritesMock)
                    })
                })
            });

            const mailStub = Sinon.stub(mailService, 'sendMail').resolves();

            const result = await movieService.modify(movieId, updatePayload);

            expect(result.titre).to.equal('Interstellar');
            expect(mailStub.calledOnce).to.be.true();
        });

        it('devrait retourner une erreur 404 si le film n\'existe pas (Mock)', async () => {
            Sinon.stub(Movie, 'query').returns({
                patchAndFetchById: Sinon.stub().resolves(null)
            });

            const promise = movieService.modify(999, { titre: 'Non-existant' });

            await expect(promise).to.reject(Error, 'Movie not found');
        });
    });

    describe('delete()', () => {
        it('devrait supprimer un film par son ID (Mock)', async () => {
            const stub = Sinon.stub(Movie, 'query').returns({
                deleteById: Sinon.stub().resolves(1)
            });

            const result = await movieService.delete(1);

            expect(result).to.equal(1);
            expect(stub.calledOnce).to.be.true();
        });
    });

    describe('list()', () => {
        it('devrait retourner la liste des films (Mock)', async () => {
            const moviesMock = [{ id: 1, titre: 'Alien' }, { id: 2, titre: 'Predator' }];

            Sinon.stub(Movie, 'query').resolves(moviesMock);

            const result = await movieService.list();

            expect(result).to.equal(moviesMock);
            expect(result.length).to.equal(2);
        });
    });
});