'use strict';

const { Service } = require('@hapipal/schmervice');
const { Boom } = require('@hapi/boom');

module.exports = class MovieService extends Service {

    async create(movie) {
        try {
            const { Movie, User } = this.server.models();
            const { mailService } = this.server.services();
            const newMovie = await Movie.query().insertAndFetch(movie);
            const usersMail = await User.query().select('mail', 'firstName');

            const sendMail = usersMail.map((user) => {
                return mailService.sendMail({
                    from: 'louis.bec@gmail.com',
                    to: user.mail,
                    subject: 'Nouveau film disponible',
                    text: `Bonjour, ${user.firstName}, le film "${newMovie.titre}" a été ajouté !`
                }).catch(() => console.warn('Echec envoi du mail'));
            });

            await Promise.all(sendMail);

            return newMovie;

        } catch (globalError) {
            console.error('ERREUR CRITIQUE :', globalError.message);
            throw globalError;
        }
    }

    async modify(id, movie){
        const { Movie, Favorite } = this.server.models();
        const { mailService } = this.server.services();

        const updatedMovie = await Movie.query().patchAndFetchById(id, movie);

        if (!updatedMovie) {
            throw Boom.notFound('Movie not found');
        }

        const favorites = await Favorite.query()
            .where('movie_id', id)
            .withGraphFetched('user')
            .select();

        for (const favorite of favorites) {
            const user = favorite.user;
            mailService.sendMail({ from: 'louis.bec@gmail.com',
                to: user.mail, subject: `${user.firstName} un film a etait modifié`, text: updatedMovie.title })
                .catch((err) => console.error(`Error sending update notification to ${user.mail}`, err));
        }

        return updatedMovie;
    }

    async delete(id){
        const { Movie } = this.server.models();

        return await Movie.query().deleteById(id);
    }

    async list() {
        const { Movie } = this.server.models();
        return await Movie.query();
    }
};