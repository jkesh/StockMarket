import axios from 'axios'

const resolveBaseUrl = (serviceEnvKey) => {
  const serviceUrl = import.meta.env[serviceEnvKey]
  if (serviceUrl) return serviceUrl
  return import.meta.env.VITE_API_BASE_URL || '/api'
}

const createHttpClient = (serviceEnvKey) => {
  const client = axios.create({
    baseURL: resolveBaseUrl(serviceEnvKey),
    timeout: 10000
  })

  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      const message = error?.response?.data?.message || error.message || '请求失败'
      return Promise.reject(new Error(message))
    }
  )

  return client
}

export const marketHttp = createHttpClient('VITE_MARKET_API_BASE_URL')
export const tradeHttp = createHttpClient('VITE_TRADE_API_BASE_URL')
