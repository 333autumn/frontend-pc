import request from './request'

export function getCategories() {
  return request.get('/common/categories')
}
export function getDepartments() {
  return request.get('/common/departments')
}
export function getAreas() {
  return request.get('/common/areas')
}
