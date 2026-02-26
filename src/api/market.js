import http from './http'

export const fetchStockSnapshot = () => http.post('/market/snapshot')

export const fetchStockKline = (stock) => http.post(`/market/kline/${stock}`)
