import request from './request'

export function getEquipmentList(params) {
  return request.get('/equipmentInfo/info/page', { params })
}
export function getEquipment(id) {
  return request.get('/equipmentInfo/info/' + id)
}
export function createEquipment(data) {
  return request.post('/equipmentInfo/info', data)
}
export function updateEquipment(id, data) {
  return request.put('/equipmentInfo/info/' + id, data)
}
export function deleteEquipment(id) {
  return request.delete('/equipmentInfo/info/' + id)
}
