/* eslint-disable @typescript-eslint/no-namespace */
import type { Movie } from '../src/consumer'
export {}

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Gets a list of all mvovies
       * ```js
       * cy.getMovies()
       * ```
       */
      getMovies(url?: string): Chainable<Response<Movie[]> & Messages>

      /**
       * Gets a movie by its ID
       * ```js
       * cy.getMovieById(1)
       * ```
       */
      getMovieById(
        id: number,
        url?: string
      ): Chainable<Response<Movie> & Messages>

      /**
       * Gets a movie by its name
       * ```js
       * cy.getMovieByName('The Matrix')
       * ```
       */
      getMovieByName(
        name: string,
        url?: string
      ): Chainable<Response<Movie> & Messages>

      /**
       * Creates a movie
       * ```js
       * cy.addMovie({ name: 'The Matrix', year: 1999, rating: 7.5 })
       * ```
       */
      addMovie(
        body: Omit<Movie, 'id'>,
        url?: string
      ): Chainable<Response<Omit<Movie, 'id'>> & Messages>

      /**
       * Deletes a movie by its ID
       * ```js
       * cy.deleteMovieById(1)
       * ```
       */
      deleteMovie(
        id: number,
        url?: string
      ): Chainable<Response<Movie> & Messages>

      /**
       * Updates a movie by its ID
       * ```js
       * cy.updateMovie(1, { name: 'The Matrix resurrections', year: 2021, rating: 7.5 })
       * ```
       */
      updateMovie(
        id: number,
        body: Partial<Omit<Movie, 'id'>>,
        url?: string
      ): Chainable<Response<Partial<Movie> & Messages>>

      /** https://www.npmjs.com/package/@cypress/skip-test
       * `cy.skipOn('localhost')` */
      skipOn(
        nameOrFlag: string | boolean | (() => boolean),
        cb?: () => void
      ): Chainable<Subject>

      /** https://www.npmjs.com/package/@cypress/skip-test
       * `cy.onlyOn('localhost')` */
      onlyOn(
        nameOrFlag: string | boolean | (() => boolean),
        cb?: () => void
      ): Chainable<Subject>
    }
  }
}
