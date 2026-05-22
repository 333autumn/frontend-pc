import request from './request'

export function getHazardStats() {
  return request.get('/hazard/stats')
}
export function getHazardDistribution() {
  return request.get('/hazard/stats/distribution')
}
export function getHazardList(params) {
  return request.get('/hazard', { params })
}
export function createHazard(data) {
  return request.post('/hazard', data)
}
export function updateHazardStatus(id, status) {
  return request.put('/hazard/' + id + '/status', { status })
}
export function getHazardFlow(id) {
  return request.get('/hazard/' + id + '/flow')
}

export function exportHazards(list) {
  const headers = ['隐患编号', '隐患描述', '位置', '等级', '上报人', '上报时间', '状态', '整改措施', '整改期限', '处理人']
  const keys = ['hazardNo', 'description', 'location', 'level', 'reporter', 'reportTime', 'status', 'measures', 'deadline', 'handler']
  const csvRows = [headers.join(',')]
  list.forEach(row => {
    csvRows.push(keys.map(k => {
      const v = row[k] != null ? String(row[k]) : ''
      return v.includes(',') || v.includes('"') ? '"' + v.replace(/"/g, '""') + '"' : v
    }).join(','))
  })
  const blob = new Blob(['﻿' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '隐患台账_' + new Date().toISOString().slice(0, 10) + '.csv'
  a.click()
  URL.revokeObjectURL(url)
}
