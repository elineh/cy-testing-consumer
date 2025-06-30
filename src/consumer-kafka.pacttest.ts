import {
  MessageConsumerPact,
  Matchers,
  asynchronousBodyHandler
} from '@pact-foundation/pact'
import { consumeMovieEvents } from './events/movie-events'
import path from 'node:path'

const { like, eachLike, term } = Matchers

const messagePact = new MessageConsumerPact({
  dir: path.resolve(process.cwd(), 'pacts'),
  consumer: 'WebConsumer-event-consumer',
  provider: 'WebConsumer-event-provider'
  // logLevel: 'debug',
})

describe('Kafka Movie Event Consumer', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  // generate: will be returned during mock consumer testing to simulate valid response.
  // matcher: will be used to ensure the provider returns a value that fits the expected pattern
  // when the contract is verified on the provider side.
  const matcher = '^movie-(created|updated|deleted)$'

  const messages = eachLike({
    key: like('1'),
    value: {
      id: like(1),
      name: like('Matrix'),
      year: like(1999)
    }
  })

  it('should receive a movie-created event from Kafka', async () => {
    await messagePact
      .given('No movie exists')
      .expectsToReceive('a movie-created event')
      .withContent({
        topic: term({
          generate: 'movie-created',
          matcher
        }),
        messages
      })
      .withMetadata({
        'content-type': 'application/json'
      })
      .verify(asynchronousBodyHandler(consumeMovieEvents))
  })

  it('should receive a movie-updated event from Kafka', async () => {
    await messagePact
      .given('A movie exists')
      .expectsToReceive('a movie-updated event')
      .withContent({
        topic: term({
          generate: 'movie-updated',
          matcher
        }),
        messages
      })
      .withMetadata({
        'content-type': 'application/json'
      })
      .verify(asynchronousBodyHandler(consumeMovieEvents))
  })

  it('should receive a movie-deleted event from Kafka', async () => {
    await messagePact
      .given('A movie exists')
      .expectsToReceive('a movie-deleted event')
      .withContent({
        topic: term({
          generate: 'movie-deleted',
          matcher
        }),
        messages
      })
      .withMetadata({
        'content-type': 'application/json'
      })
      .verify(asynchronousBodyHandler(consumeMovieEvents))
  })
})
