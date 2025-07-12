import InvalidPurchaseException from './lib/InvalidPurchaseException.js'

export default class TicketService {
  #seatReservationService
  #ticketPaymentService
  #ticketPriceService

  constructor(
    SeatReservationService,
    TicketPaymentService,
    TicketPriceService
  ) {
    this.#seatReservationService = SeatReservationService
    this.#ticketPaymentService = TicketPaymentService
    this.#ticketPriceService = TicketPriceService
  }

  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (!this.#isAccountIdValid(accountId)) {
      throw new InvalidPurchaseException('Account ID is invalid.')
    }

    const ticketMap = this.#createTicketMap(ticketTypeRequests)

    const ticketTotal = this.#getTicketTotal(ticketMap)
    if (!this.#isTicketTotalValid(ticketTotal)) {
      throw new InvalidPurchaseException(
        'Number of tickets purchased is invalid.'
      )
    }

    if (!this.#hasAdultTicket(ticketMap)) {
      throw new InvalidPurchaseException('No adult tickets purchased.')
    }

    if (!this.#isInfantTicketCountValid(ticketMap)) {
      throw new InvalidPurchaseException(
        '1 adult ticket must be purchased for every infant ticket purchased.'
      )
    }

    const reservationTotal = this.#getReservationTotal(ticketMap)
    const paymentTotal =
      this.#ticketPriceService.calculateTicketPaymentTotal(ticketMap)
    this.#ticketPaymentService.makePayment(accountId, paymentTotal)
    this.#seatReservationService.reserveSeat(accountId, reservationTotal)
  }

  #createTicketMap(ticketTypeRequests) {
    const ticketMap = new Map()
    for (const ticketRequest of ticketTypeRequests) {
      const ticketType = ticketRequest.getTicketType()
      const noOfTickets = ticketRequest.getNoOfTickets()

      const currentCount = ticketMap.get(ticketType) ?? 0
      ticketMap.set(ticketType, currentCount + noOfTickets)
    }
    return ticketMap
  }

  #isAccountIdValid(accountId) {
    return accountId > 0
  }

  #hasAdultTicket(ticketMap) {
    const adultTicketCount = ticketMap.get('ADULT') ?? 0
    return adultTicketCount > 0
  }

  #isTicketTotalValid(ticketTotal) {
    return ticketTotal <= 25 && ticketTotal > 0
  }

  #isInfantTicketCountValid(ticketMap) {
    const infantTicketCount = ticketMap.get('INFANT') ?? 0
    const adultTicketCount = ticketMap.get('ADULT') ?? 0

    return infantTicketCount <= adultTicketCount
  }

  #getTicketTotal(ticketMap) {
    return ticketMap.values().reduce((a, b) => a + b, 0)
  }

  #getReservationTotal(ticketMap) {
    return ticketMap
      .entries()
      .reduce((totalTicketCount, [ticketType, ticketCount]) => {
        if (ticketType === 'INFANT') {
          return totalTicketCount
        }
        return totalTicketCount + ticketCount
      }, 0)
  }
}
