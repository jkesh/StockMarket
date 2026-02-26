import http from './http'

export const matchTrade = (payload) => http.post('/trade/match', payload)

export const fetchTradeProfit = (tradeId) => http.post(`/trade/profit/${tradeId}`)
