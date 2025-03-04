import nock, { cleanAll } from 'nock'
import {
  getMovies,
  getMovieById,
  getMovieByName,
  addMovie,
  deleteMovieById,
  updateMovie
} from './consumer'
import type { Movie, ErrorResponse } from './consumer'
import type {
  CreateMovieResponse,
  DeleteMovieResponse,
  GetMovieResponse
} from './provider-schema/movie-types'

const MOCKSERVER_URL = 'http://mockserver.com'

describe('Consumer API functions', () => {
  afterEach(() => {
    cleanAll()
  })

  describe('getMovies, getMovieByName', () => {
    it('should return all movies', async () => {
      const EXPECTED_BODY: Movie = {
        id: 1,
        name: 'The Matrix',
        year: 1999,
        rating: 7.5
      }

      nock(MOCKSERVER_URL)
        .get('/movies')
        .reply(200, { status: 200, data: [EXPECTED_BODY] })

      const res = await getMovies(MOCKSERVER_URL)
      expect(res.data).toEqual([EXPECTED_BODY])
    })

    it('should handle errors correctly', async () => {
      const errorRes: ErrorResponse = { error: 'Not found' }
      nock(MOCKSERVER_URL).get('/movies').reply(404, errorRes)

      const res = await getMovies(MOCKSERVER_URL)
      expect(res).toEqual(errorRes)
    })

    it('should return a specific movie by name', async () => {
      const EXPECTED_BODY: Movie = {
        id: 1,
        name: 'The Matrix',
        year: 1999,
        rating: 7.5
      }

      nock(MOCKSERVER_URL)
        .get(`/movies?name=${EXPECTED_BODY.name}`)
        .reply(200, { status: 200, data: EXPECTED_BODY })

      const res = (await getMovieByName(
        MOCKSERVER_URL,
        EXPECTED_BODY.name
      )) as GetMovieResponse
      expect(res.data).toEqual(EXPECTED_BODY)
    })

    it('should handle errors correctly', async () => {
      const errorRes: ErrorResponse = { error: 'Not found' }
      nock(MOCKSERVER_URL).get('/movies?name=The Matrix').reply(404, errorRes)

      const res = await getMovieByName(MOCKSERVER_URL, 'The Matrix')
      expect(res).toEqual(errorRes)
    })
  })

  describe('getMovieById', () => {
    it('should return a specific movie by ID', async () => {
      const EXPECTED_BODY: Movie = {
        id: 1,
        name: 'The Matrix',
        year: 1999,
        rating: 7.5
      }

      nock(MOCKSERVER_URL)
        .get(`/movies/${EXPECTED_BODY.id}`)
        .reply(200, { status: 200, data: EXPECTED_BODY })

      const res = (await getMovieById(
        MOCKSERVER_URL,
        EXPECTED_BODY.id
      )) as GetMovieResponse
      expect(res.data).toEqual(EXPECTED_BODY)
    })

    it('should handle errors correctly', async () => {
      // Arrange
      const testId = 999
      const errorRes: ErrorResponse = { error: 'Movie not found' }
      nock(MOCKSERVER_URL).get(`/movies/${testId}`).reply(404, errorRes)

      // Act
      const result = await getMovieById(MOCKSERVER_URL, testId)
      // Assert
      expect(result).toEqual(errorRes)
    })
  })

  describe('addMovie', () => {
    const movie: Omit<Movie, 'id'> = {
      name: 'The Matrix',
      year: 1999,
      rating: 7.5
    }
    it('should add a new movie', async () => {
      // Arrange
      nock(MOCKSERVER_URL)
        .post('/movies', movie)
        .reply(200, { status: 200, data: { id: 1, ...movie } })

      // Act
      const result = (await addMovie(
        MOCKSERVER_URL,
        movie
      )) as CreateMovieResponse
      // Assert
      expect(result).toEqual({ status: 200, data: { id: 1, ...movie } })
    })

    it('should not add a movie that already exists', async () => {
      // Arrange
      const errorRes: ErrorResponse = {
        error: `Movie ${movie.name} already exists`
      }
      nock(MOCKSERVER_URL).post('/movies', movie).reply(409, errorRes)

      // Act
      const res = await addMovie(MOCKSERVER_URL, movie)
      // Assert
      expect(res).toEqual(errorRes)
    })
  })

  describe('updateMovie', () => {
    const updatedMovieData = {
      name: 'The Matrix Reloaded',
      year: 2003,
      rating: 7.2
    }
    it('should update an existing movie sucessfully', async () => {
      // Arrange
      const testId = 1

      const EXPECTED_BODY: Movie = {
        id: testId,
        ...updatedMovieData
      }

      nock(MOCKSERVER_URL)
        .put(`/movies/${testId}`, updatedMovieData)
        .reply(200, { status: 200, data: EXPECTED_BODY })

      // Act
      const result = (await updateMovie(
        MOCKSERVER_URL,
        testId,
        updatedMovieData
      )) as GetMovieResponse
      // Assert
      expect(result).toEqual({ status: 200, data: EXPECTED_BODY })
    })

    it('should return an error if movie to update does not exist', async () => {
      // Arrange
      const testId = 999

      const errorRes: ErrorResponse = {
        error: `Movie with ID ${testId} not found`
      }

      nock(MOCKSERVER_URL)
        .put(`/movies/${testId}`, updatedMovieData)
        .reply(404, errorRes)

      // Act
      const res = await updateMovie(MOCKSERVER_URL, testId, updatedMovieData)
      // Assert
      expect(res).toEqual(errorRes)
    })
  })

  describe('deleteMovieById', () => {
    it('should delete a movie successfully', async () => {
      // Arrange
      const testId = 100
      const message = `Movie ${testId} has been deleted`

      nock(MOCKSERVER_URL)
        .delete(`/movies/${testId}`)
        .reply(200, { status: 200, message })
      // Act
      const res = (await deleteMovieById(
        MOCKSERVER_URL,
        testId
      )) as DeleteMovieResponse
      // Assert
      expect(res.message).toEqual(message)
    })

    it('should return an error if movie to delete does not exist', async () => {
      // Arrange
      const testId = 123456789
      const message = `Movie ${testId} not found`

      nock(MOCKSERVER_URL)
        .delete(`/movies/${testId}`)
        .reply(404, { status: 404, message })
      // Act
      const res = (await deleteMovieById(
        MOCKSERVER_URL,
        testId
      )) as DeleteMovieResponse
      // Assert
      expect(res.message).toEqual(message)
    })
  })
})
