import request from './request'

export function getMaintenancePlans(params) {
  return request.get('/maintenance/plans', { params })
}
export function createMaintenancePlan(data) {
  return request.post('/maintenance/plans', data)
}
export function updateMaintenancePlan(id, data) {
  return request.put('/maintenance/plans/' + id, data)
}
export function getMaintenanceRecords(params) {
  return request.get('/maintenance/records', { params })
}
export function getMaintenanceReport(id) {
  return request.get('/maintenance/records/' + id + '/report')
}
export function getScrapList(params) {
  return request.get('/maintenance/scraps', { params })
}
export function approveScrap(id, status) {
  return request.put('/maintenance/scraps/' + id + '/approve', { status })
}

// Transfer / Replacement / Allocation
export function getTransferList(params) {
  return request.get('/maintenance/transfers', { params })
}
export function createTransfer(data) {
  return request.post('/maintenance/transfers', data)
}
export function updateTransfer(id, data) {
  return request.put('/maintenance/transfers/' + id, data)
}
export function deleteTransfer(id) {
  return request.delete('/maintenance/transfers/' + id)
}
