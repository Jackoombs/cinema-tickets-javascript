export default class TicketPriceService {
  #ticketPrices

  constructor() {
    this.#ticketPrices = this.#fetchTicketPrices()
  }

  calculateTicketPaymentTotal(ticketMap) {
    return ticketMap
      .entries()
      .map((entry) => {
        const [ticketType, noOfTickets] = entry
        const ticketPrice = this.#getTicketPrice(ticketType)

        return ticketPrice * noOfTickets
      })
      .reduce((a, b) => a + b, 0)
  }

  #fetchTicketPrices() {
    return {
      INFANT: 0,
      CHILD: 15,
      ADULT: 25,
    }
  }

  #getTicketPrice(ticketType) {
    return this.#ticketPrices[ticketType] ?? 0
  }
}
