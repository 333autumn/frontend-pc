import request from './request'

export function getDashboardStats() {
  return request.get('/dashboard/stats')
}
export function getEquipmentDistribution() {
  return request.get('/dashboard/equipment-distribution')
}
export function getInspectionTrend() {
  return request.get('/dashboard/inspection-trend')
}
export function getAreaDistribution() {
  return request.get('/dashboard/area-distribution')
}
export function getAlertCategories() {
  return request.get('/dashboard/alert-categories')
}
