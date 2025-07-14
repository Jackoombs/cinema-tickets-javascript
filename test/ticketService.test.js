import assert from 'node:assert'
import { it, describe, mock, beforeEach } from 'node:test'
import TicketService from '../src/pairtest/TicketService.js'
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js'

describe('ticketService', () => {
  const reserveSeatSpy = mock.fn()
  const makePaymentSpy = mock.fn()
  const calculateTicketPaymentTotalSpy = mock.fn(() => 100)
  class MockSeatReservationService {
    reserveSeat = reserveSeatSpy
  }
  class MockTicketPaymentService {
    makePayment = makePaymentSpy
  }
  class MockTicketPriceService {
    calculateTicketPaymentTotal = calculateTicketPaymentTotalSpy
  }
  const ticketService = new TicketService(
    new MockSeatReservationService(),
    new MockTicketPaymentService(),
    new MockTicketPriceService()
  )

  beforeEach(() => {
    reserveSeatSpy.mock.resetCalls()
    makePaymentSpy.mock.resetCalls()
    calculateTicketPaymentTotalSpy.mock.resetCalls()
  })

  it('Should throw an exception if the account ID is 0 or fewer.', () => {
    const ticketTypeRequests = [
      new TicketTypeRequest('ADULT', 1),
      new TicketTypeRequest('CHILD', 1),
      new TicketTypeRequest('INFANT', 1),
    ]

    assert.throws(
      () => ticketService.purchaseTickets(0, ...ticketTypeRequests),
      {
        message: 'Account ID is invalid.',
      }
    )
    assert.doesNotThrow(() =>
      ticketService.purchaseTickets(1, ...ticketTypeRequests)
    )
  })

  it('Should throw an expection if there are no adult tickets purchased.', () => {
    const accountId = 1
    const ticketTypeRequests = [
      new TicketTypeRequest('ADULT', 0),
      new TicketTypeRequest('CHILD', 1),
      new TicketTypeRequest('INFANT', 1),
    ]

    assert.throws(
      () => ticketService.purchaseTickets(accountId, ...ticketTypeRequests),
      {
        message: 'No adult tickets purchased.',
      }
    )
  })

  it('Should throw an exception if more infant tickets are purchased than adult tickets', () => {
    const accountId = 1
    const ticketTypeRequests = [
      new TicketTypeRequest('ADULT', 1),
      new TicketTypeRequest('INFANT', 2),
    ]

    assert.throws(
      () => ticketService.purchaseTickets(accountId, ...ticketTypeRequests),
      {
        message:
          '1 adult ticket must be purchased for every infant ticket purchased.',
      }
    )
  })

  it('Should throw an exception if the ticket limit of 25 is exceeded.', () => {
    const accountId = 1
    const ticketTypeRequests = [new TicketTypeRequest('ADULT', 25)]
    const exceedingTicketTypeRequests = [new TicketTypeRequest('ADULT', 26)]

    assert.doesNotThrow(() =>
      ticketService.purchaseTickets(accountId, ...ticketTypeRequests)
    )
    assert.throws(
      () =>
        ticketService.purchaseTickets(
          accountId,
          ...exceedingTicketTypeRequests
        ),
      { message: 'Number of tickets purchased is invalid.' }
    )
  })

  it('Should throw an exception if no tickets are purchased.', () => {
    const accountId = 1
    const ticketTypeRequests = [
      new TicketTypeRequest('ADULT', 0),
      new TicketTypeRequest('CHILD', 0),
      new TicketTypeRequest('INFANT', 0),
    ]

    assert.throws(
      () => ticketService.purchaseTickets(accountId, ...ticketTypeRequests),
      { message: 'Number of tickets purchased is invalid.' }
    )

    assert.throws(() => ticketService.purchaseTickets(accountId, ...[]), {
      message: 'Number of tickets purchased is invalid.',
    })
  })

  it('Should not throw when only adult tickets are purchased', () => {
    const accountId = 1
    const ticketTypeRequests = [new TicketTypeRequest('ADULT', 1)]

    assert.doesNotThrow(() =>
      ticketService.purchaseTickets(accountId, ...ticketTypeRequests)
    )
  })

  it('Should call the ticket calucation service with the correct ticket map', () => {
    const accountId = 1
    const ticketTypeRequests = [
      new TicketTypeRequest('ADULT', 1),
      new TicketTypeRequest('CHILD', 1),
      new TicketTypeRequest('INFANT', 1),
    ]

    const ticketMap = new Map()
    ticketMap.set('ADULT', 1)
    ticketMap.set('CHILD', 1)
    ticketMap.set('INFANT', 1)

    ticketService.purchaseTickets(accountId, ...ticketTypeRequests)
    assert.strictEqual(calculateTicketPaymentTotalSpy.mock.calls.length, 1)
    assert.deepStrictEqual(
      calculateTicketPaymentTotalSpy.mock.calls[0].arguments,
      [ticketMap]
    )
  })

  it('Should call the seat reservation service with the correct number of seats and account ID.', (t) => {
    const accountId = 1
    const ticketTypeRequests = [
      new TicketTypeRequest('ADULT', 3),
      new TicketTypeRequest('CHILD', 3),
      new TicketTypeRequest('INFANT', 3),
    ]

    ticketService.purchaseTickets(accountId, ...ticketTypeRequests)
    assert.strictEqual(makePaymentSpy.mock.calls.length, 1)
    assert.deepStrictEqual(reserveSeatSpy.mock.calls[0].arguments, [
      1,
      3 + 3 + 0,
    ])
  })

  it('Should call the ticket payment service with the correct payment amount and account ID', () => {
    const accountId = 1
    const ticketTypeRequests = [
      new TicketTypeRequest('ADULT', 4),
      new TicketTypeRequest('CHILD', 4),
      new TicketTypeRequest('INFANT', 4),
    ]

    ticketService.purchaseTickets(accountId, ...ticketTypeRequests)
    assert.strictEqual(makePaymentSpy.mock.calls.length, 1)
    assert.deepStrictEqual(makePaymentSpy.mock.calls[0].arguments, [1, 100])
  })
})
