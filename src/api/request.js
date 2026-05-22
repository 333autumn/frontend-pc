import axios from 'axios'
import { Message } from 'element-ui'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

request.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code === 200 || data.code === 0) {
      return data
    }
    Message.error(data.message || data.msg || '请求失败')
    return Promise.reject(new Error(data.message || data.msg || '请求失败'))
  },
  (error) => {
    Message.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
