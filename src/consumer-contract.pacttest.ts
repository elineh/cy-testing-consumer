import type { V3MockServer } from '@pact-foundation/pact'
import { MatchersV3, PactV4 } from '@pact-foundation/pact'
import path from 'path'
import type { ErrorResponse, Movie } from './consumer'
import {
  addMovie,
  deleteMovieById,
  getMovieById,
  getMovies,
  getMovieByName,
  updateMovie
} from './consumer'

import { createProviderState, setJsonBody } from './test-helpers/helpers'
import type {
  DeleteMovieResponse,
  GetMovieResponse,
  MovieNotFoundResponse
} from './provider-schema/movie-types'

// full list of matchers:
// https://docs.pact.io/implementation_guides/javascript/docs/matching#v3-matching-rules
const { like, eachLike, integer, decimal, string } = MatchersV3

// 1) Setup the mock provider for the consumer
// https://github.com/pact-foundation/pact-js/blob/HEAD/docs/consumer.md
/* Creates a Mock Server test double of your Provider API. The class is not thread safe, but you can run tests in parallel by creating as many instances as you need.*/

const pact = new PactV4({
  dir: path.resolve(process.cwd(), 'pacts'),
  consumer: 'WebConsumer',
  provider: 'MoviesAPI'
})

describe.skip('Movies API', () => {
  describe.skip('When a GET request is made to /movies', () => {
    it('should return all movies', async () => {
      const EXPECTED_BODY: Movie = {
        id: 1,
        name: 'The Matrix',
        year: 1999,
        rating: 7.5
      }

      // we want to ensure at least 1 movie is returned in the array of movies
      const [stateName, stateParams] = createProviderState({
        name: 'An existing movie exists',
        params: EXPECTED_BODY
      })

      // 2) Register the consumer's expectations against the (mock) provider
      await pact
        .addInteraction()
        .given(stateName, stateParams)
        .uponReceiving('a request to get all movies')
        .withRequest('GET', '/movies')
        .willRespondWith(
          200,
          setJsonBody({ status: 200, data: eachLike(EXPECTED_BODY) })
        )
        .executeTest(async (mockServer: V3MockServer) => {
          // 3) Call the comsumer against the mock provider
          const res = await getMovies(mockServer.url)
          // 4) Verify the consumer test and generate the contract
          expect(res.data).toEqual([EXPECTED_BODY])
        })
    })

    it('should return empty when no movies exists', async () => {
      const EXPECTED_BODY: Movie[] = []

      await pact
        .addInteraction()
        .given('no movies exist')
        .uponReceiving('a request to get all movies')
        .withRequest('GET', '/movies')
        .willRespondWith(
          200,
          setJsonBody({ status: 200, data: like(EXPECTED_BODY) })
        )
        .executeTest(async (mockServer: V3MockServer) => {
          const res = await getMovies(mockServer.url)

          expect(res.data).toEqual(EXPECTED_BODY)
        })
    })

    it('should return a movie by name when requested with a query parameter', async () => {
      const EXPECTED_BODY: Movie = {
        id: 1,
        name: 'The Matrix',
        year: 1999,
        rating: 7.5
      }

      // we want to ensure at least 1 movie is returned in the array of movies
      const [stateName, stateParams] = createProviderState({
        name: 'An existing movie exists',
        params: EXPECTED_BODY
      })

      await pact
        .addInteraction()
        .given(stateName, stateParams)
        .uponReceiving('a request to get a movie by name TRIGGER')
        .withRequest('GET', '/movies', (builder) => {
          builder.query({ name: EXPECTED_BODY.name }) // use query to specify query parameters
        })
        .willRespondWith(
          200,
          setJsonBody({
            status: 200,
            data: {
              id: integer(EXPECTED_BODY.id),
              name: string(EXPECTED_BODY.name),
              year: integer(EXPECTED_BODY.year),
              rating: decimal(EXPECTED_BODY.rating)
            }
          })
        )
        .executeTest(async (mockServer: V3MockServer) => {
          const res = (await getMovieByName(
            mockServer.url,
            EXPECTED_BODY.name
          )) as GetMovieResponse

          expect(res.data).toEqual(EXPECTED_BODY)
        })
    })
  })

  describe.skip('When a GET request is made to a specific movie ID', () => {
    it('should return a specific movie', async () => {
      const testId = 100
      const EXPECTED_BODY: Movie = {
        id: testId,
        name: 'The Matrix',
        year: 1999,
        rating: 7.5
      }

      const [stateName, stateParams] = createProviderState({
        name: 'Has a movie with a specific ID',
        params: { id: testId }
      })

      await pact
        .addInteraction()
        .given(stateName, stateParams)
        .uponReceiving('a request to a specific movie')
        .withRequest('GET', `/movies/${testId}`)
        .willRespondWith(
          200,
          setJsonBody({
            status: 200,
            data: {
              id: integer(EXPECTED_BODY.id),
              name: string(EXPECTED_BODY.name),
              year: integer(EXPECTED_BODY.year),
              rating: decimal(EXPECTED_BODY.rating)
            }
          })
        )
        .executeTest(async (mockServer: V3MockServer) => {
          const res = (await getMovieById(
            mockServer.url,
            testId
          )) as GetMovieResponse

          expect(res.data).toEqual(EXPECTED_BODY)
        })
    })
  })

  describe.skip('When a POST request is made to /movies', () => {
    it('should add a new movie', async () => {
      const movie: Omit<Movie, 'id'> = {
        name: 'The Matrix',
        year: 1999,
        rating: 7.5
      }

      await pact
        .addInteraction()
        .given('no movies exist')
        .uponReceiving('a request to add a new movie')
        .withRequest('POST', '/movies', setJsonBody(movie))
        .willRespondWith(
          200,
          setJsonBody({
            status: 200,
            data: {
              id: integer(),
              name: string(movie.name),
              year: integer(movie.year),
              rating: decimal(movie.rating)
            }
          })
        )
        .executeTest(async (mockServer: V3MockServer) => {
          const res = await addMovie(mockServer.url, movie)

          expect(res).toEqual({
            status: 200,
            data: {
              id: expect.any(Number),
              name: movie.name,
              year: movie.year,
              rating: movie.rating
            }
          })
        })
    })

    it('should not add a movie which already exists', async () => {
      const movie: Omit<Movie, 'id'> = {
        name: 'My existing movie',
        year: 2001,
        rating: 8.5
      }
      const errorRes: ErrorResponse = {
        error: `Movie ${movie.name} already exists`
      }

      const [stateName, stateParams] = createProviderState({
        name: 'An existing movie exists',
        params: movie
      })

      await pact
        .addInteraction()
        .given(stateName, stateParams)
        .uponReceiving('a request to the existing movie')
        .withRequest('POST', '/movies', setJsonBody(movie))
        .willRespondWith(409, setJsonBody(errorRes))
        .executeTest(async (mockServer: V3MockServer) => {
          const res = await addMovie(mockServer.url, movie)

          expect(res).toEqual(errorRes)
        })
    })

    describe.skip('When a PUT request is made to a specific movie ID', () => {
      it('should update an existing movie', async () => {
        const testId = 99
        const updatedMovieData = {
          name: 'The Matrix Reloaded',
          year: 2003,
          rating: 7.2
        }

        const [stateName, stateParams] = createProviderState({
          name: 'Has a movie with a specific ID',
          params: { id: testId }
        })

        await pact
          .addInteraction()
          .given(stateName, stateParams)
          .uponReceiving('a request to update a specific movie')
          .withRequest(
            'PUT',
            `/movies/${testId}`,
            setJsonBody(updatedMovieData)
          )
          .willRespondWith(
            200,
            setJsonBody({
              status: 200,
              data: {
                id: integer(testId),
                name: updatedMovieData.name,
                year: updatedMovieData.year,
                rating: updatedMovieData.rating
              }
            })
          )
          .executeTest(async (mockServer: V3MockServer) => {
            const res = await updateMovie(
              mockServer.url,
              testId,
              updatedMovieData
            )
            // Assert
            expect(res).toEqual({
              status: 200,
              data: {
                id: testId,
                name: updatedMovieData.name,
                year: updatedMovieData.year,
                rating: updatedMovieData.rating
              }
            })
          })
      })

      describe.skip('When a DELETE request is made to /movies', () => {
        it('should delete an existing movie successfully', async () => {
          const testId = 100
          const message = `Movie ${testId} has been deleted`

          const state = createProviderState({
            name: 'Has a movie with a specific ID',
            params: { id: testId }
          })

          await pact
            .addInteraction()
            .given(...state)
            .uponReceiving('a request to delete a movie that exists')
            .withRequest('DELETE', `/movies/${testId}`)
            .willRespondWith(200, setJsonBody({ status: 200, message }))
            .executeTest(async (mockServer: V3MockServer) => {
              const res = (await deleteMovieById(
                mockServer.url,
                testId
              )) as DeleteMovieResponse

              expect(res).toEqual({
                status: 200,
                message
              })
              expect(res.message).toEqual(message)
            })
        })

        it('should throw an error if movie to delete does not exist', async () => {
          const testId = 123456789
          const error = `Movie with ID ${testId} not found`

          await pact
            .addInteraction()
            .uponReceiving('a request to delete a movie that does not exist')
            .withRequest('DELETE', `/movies/${testId}`)
            .willRespondWith(404, setJsonBody({ status: 404, error }))
            .executeTest(async (mockServer: V3MockServer) => {
              const res = (await deleteMovieById(
                mockServer.url,
                testId
              )) as MovieNotFoundResponse

              expect(res.error).toEqual(error)
            })
        })
      })
    })
  })
})
