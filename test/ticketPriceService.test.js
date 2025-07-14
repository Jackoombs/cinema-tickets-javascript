import assert from 'node:assert'
import { it, describe } from 'node:test'
import TicketPriceService from '../src/pairtest/TicketPriceService.js'

describe('ticketPriceService', () => {
  const ticketPriceService = new TicketPriceService()

  it('Should calculate the ticket prices correctly', () => {
    const ticketMap = new Map()
    ticketMap.set('ADULT', 3)
    ticketMap.set('CHILD', 3)
    ticketMap.set('INFANT', 3)

    assert.strictEqual(
      ticketPriceService.calculateTicketPaymentTotal(ticketMap),
      3 * 25 + 3 * 15 + 3 * 0
    )
  })

  it('Should return 0 for empty map', () => {
    const ticketMap = new Map()
    assert.strictEqual(
      ticketPriceService.calculateTicketPaymentTotal(ticketMap),
      0
    )
  })

  it('Should handle map values of 0', () => {
    const ticketMap = new Map()
    ticketMap.set('ADULT', 0)
    ticketMap.set('CHILD', 3)
    ticketMap.set('INFANT', 3)

    assert.strictEqual(
      ticketPriceService.calculateTicketPaymentTotal(ticketMap),
      3 * 0 + 3 * 15 + 3 * 0
    )
  })

  it('Should return 0 for unknown ticket types', () => {
    const ticketMap = new Map()
    ticketMap.set('ADULT', 1)
    ticketMap.set('TEENAGER', 5)

    assert.strictEqual(
      ticketPriceService.calculateTicketPaymentTotal(ticketMap),
      25
    )
  })
})
