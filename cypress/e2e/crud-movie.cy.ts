import type { Movie } from '../../src/consumer'
import { generateMovie } from '../support/factories'
import spok from 'cy-spok'
import { retryableBefore } from 'cy-retryable-before'

describe('CRUD movie', () => {
  const movie = generateMovie()
  const updateMovie = { name: 'Updated Name', year: 2022 }
  const movieProps: Omit<Movie, 'id'> = {
    name: spok.string,
    year: spok.number,
    rating: spok.number
  }

  retryableBefore(() => {
    cy.api({
      method: 'GET',
      url: '/'
    })
      .its('body.message')
      .should('eq', 'Server is running')
  })

  it('should crud', () => {
    cy.addMovie(movie)
      .should(spok({ data: movieProps, status: 200 }))
      .print()
      .its('data.id')
      .then((id) => {
        cy.getMovies()
          .should(spok({ data: spok.array, status: 200 }))
          .findOne({ name: movie.name })

        cy.getMovieById(id)
          .its('data')
          .should(spok({ ...movieProps, id }))
          .its('name')
          .then((name) => {
            cy.getMovieByName(name)
              .its('data')
              .should(spok({ ...movieProps, id }))
          })

        cy.updateMovie(id, updateMovie).should(
          spok({
            data: { id, name: updateMovie.name, year: updateMovie.year },
            status: 200
          })
        )

        cy.deleteMovie(id).should(
          spok({ status: 200, message: `Movie ${id} has been deleted` })
        )

        cy.getMovies().findOne({ name: updateMovie.name }).should('not.exist')
      })
  })
})
