import log from './log'
import type { Movie } from '../../src/consumer'
import {
  getMovies,
  getMovieByName,
  getMovieById,
  addMovie,
  deleteMovieById,
  updateMovie
} from '../../src/consumer'

/**
 * The collection of tasks to use with `cy.task()`
 * @param on `on` is used to hook into various events Cypress emits
 */
export default function tasks(on: Cypress.PluginEvents) {
  on('task', { log })

  // (a) => f(a)
  // f
  // Identity Function: The comment (a) => f(a) suggests that the function takes an argument a and simply passes it to another function f
  // This is a common pattern in functional programming to create higher-order functions or to simplify function calls.
  on('task', { getMovies: (url: string) => getMovies(url) })
  // The above line can also be written as:
  // on('task', { getMovies }) as it only takes one argument and passes it to getMovies

  // KEY: a pattern to fine tune cy task when handling multiple aguments
  // Cypress tasks only accept a single argument, but we can pass multiple values
  // by wrapping them inside an object. This ensures the argument is serializable,
  // which is a reuirement for passing data between Cypress and Node.js.
  // Adjust functions to expect an object, even if the original function took multiple arguments.

  on('task', {
    // the cy task
    getMovieById: ({ url, id }: { url: string; id: number }) =>
      // the original function
      getMovieById(url, id),

    getMovieByName: ({ url, name }: { url: string; name: string }) =>
      getMovieByName(url, name),

    addMovie: ({ url, data }: { url: string; data: Omit<Movie, 'id'> }) =>
      addMovie(url, data),

    updateMovie: ({
      url,
      id,
      data
    }: {
      url: string
      id: number
      data: Partial<Omit<Movie, 'id'>>
    }) => updateMovie(url, id, data)
  })

  on('task', {
    deleteMovieById: ({ url, id }: { url: string; id: number }) =>
      deleteMovieById(url, id)
  })
}
