import request from './request'

export function getInspectionPlans(params) {
  return request.get('/inspection/plans', { params })
}
export function createInspectionPlan(data) {
  return request.post('/inspection/plans', data)
}
export function updateInspectionPlan(id, data) {
  return request.put('/inspection/plans/' + id, data)
}
export function getInspectionRecords(params) {
  return request.get('/inspection/records', { params })
}
