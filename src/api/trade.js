import { tradeHttp } from './http'

export const matchTrade = (payload) => tradeHttp.post('/trade/match', payload)

export const fetchTradeProfit = (tradeId) => tradeHttp.post(`/trade/profit/${tradeId}`)
