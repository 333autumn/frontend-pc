import request from './request'

export function getWarningList(params) {
  return request.get('/warning', { params })
}
export function handleWarning(id) {
  return request.put('/warning/' + id + '/handle')
}
export function ignoreWarning(id) {
  return request.put('/warning/' + id + '/ignore')
}
