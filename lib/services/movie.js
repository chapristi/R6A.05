'use strict';

const { Service } = require('@hapipal/schmervice');

module.exports = class MovieService extends Service {

    async create(movie) {
        try {
            const { Movie, User } = this.server.models();
            const { mailService } = this.server.services();
            const newMovie = await Movie.query().insertAndFetch(movie);
            const usersMail = await User.query().select('mail', 'firstName');

            const sendMail = usersMail.map((user) => {
                return mailService.sendMail({
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
        const { Movie } = this.server.models();
        return await Movie.query().patchAndFetchById(id, movie);
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