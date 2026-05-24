import request from './request'

// 隐患上报
export function reportHazard(data) {
  return request.post('/hazard/report', data)
}

// 审核派单
export function reviewHazard(id, data) {
  return request.put('/hazard/review/' + id, data)
}

// 接受任务
export function acceptHazard(id) {
  return request.put('/hazard/accept/' + id)
}

// 隐患处置
export function handleHazard(id, data) {
  return request.put('/hazard/handle/' + id, data)
}

// 隐患复核
export function recheckHazard(id) {
  return request.put('/hazard/recheck/' + id)
}

// 分页查询
export function getHazardList(params) {
  return request.get('/hazard/info/page', { params })
}

// 统计
export function getHazardStats() {
  return request.get('/hazard/statistics')
}

// 导出
export function exportHazards(params) {
  return request.get('/hazard/export', { params })
}
