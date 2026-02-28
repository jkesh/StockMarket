import { marketHttp } from './http'

export const fetchStockSnapshot = () => marketHttp.post('/market/snapshot')

export const fetchStockKline = (stock) => marketHttp.post(`/market/kline/${stock}`)
