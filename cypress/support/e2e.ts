import './commands'
import 'cypress-map'
import '@bahmutov/cy-api'
import 'cy-spok'
import type { Movie } from '../../src/consumer'

const apiUrl = Cypress.config('baseUrl') || 'http://localhost:3001'

Cypress.Commands.add('getMovies', (url = apiUrl) => {
  cy.log('**getMovies**')
  return cy.task('getMovies', url)
})

Cypress.Commands.add('getMovieById', (id: number, url = apiUrl) => {
  cy.log('**getMovieById**')
  return cy.task('getMovieById', { url, id })
})

Cypress.Commands.add('getMovieByName', (name: string, url = apiUrl) => {
  cy.log(`**getMovieByName** ${name}`)
  return cy.task('getMovieByName', { url, name })
})

Cypress.Commands.add('addMovie', (data: Omit<Movie, 'id'>, url = apiUrl) => {
  cy.log(`**addMovie** ${JSON.stringify(data)}`)
  return cy.task('addMovie', { url, data })
})

Cypress.Commands.add('deleteMovie', (id: number, url = apiUrl) => {
  cy.log(`**deleteMovieById** ${id}`)
  return cy.task('deleteMovieById', { url, id })
})

Cypress.Commands.add(
  'updateMovie',
  (id: number, data: Partial<Omit<Movie, 'id'>>, url = apiUrl) => {
    cy.log(`**updateMovie** ${id}`)
    return cy.task('updateMovie', { url, id, data })
  }
)
