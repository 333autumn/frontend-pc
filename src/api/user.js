import request from './request'

export function getUserStats() {
  return request.get('/user/stats')
}
export function getUserList(params) {
  return request.get('/user', { params })
}
export function createUser(data) {
  return request.post('/user', data)
}
export function updateUser(id, data) {
  return request.put('/user/' + id, data)
}
export function deleteUser(id) {
  return request.delete('/user/' + id)
}
export function resetUserPassword(id) {
  return request.put('/user/' + id + '/reset-password')
}
export function login(data) {
  return request.post('/login', data)
}
export function register(data) {
  return request.post('/register', data)
}
export function forgotPassword(data) {
  return request.post('/forgot-password', data)
}
export function sendSmsCode(phone) {
  return request.post('/sms/send', { phone })
}
export function getUserInfo() {
  return request.get('/user/info')
}
