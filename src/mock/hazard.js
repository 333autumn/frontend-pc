import Mock from 'mockjs'

const levels = ['严重', '一般', '轻微']
const statuses = ['待审核', '处置中', '待派单', '已归档']
const locations = ['图书馆2楼南侧', '教学楼A栋3F走廊', '实验楼1F', '学生宿舍1栋', '综合楼地下室', '体育馆器材室', '食堂后厨', '行政楼大厅']

const data = Mock.mock({
  'list|25': [{
    'id|+1': 1,
    hazardNo: function() { return 'HZ-' + Mock.Random.date('yyyyMMdd') + ('00' + this.id).slice(-2) },
    description: '@csentence(10, 30)',
    location: function() { return locations[Mock.Random.integer(0, 7)] },
    'level|1': levels,
    reporter: '@cname',
    reportTime: '@datetime("2024-01-01", "2025-05-18")',
    'status|1': statuses,
    measures: '@csentence(15, 30)',
    deadline: '@date("2025-05-20", "2025-12-31")',
    handler: '@cname'
  }]
}).list

Mock.mock(/\/api\/v1\/hazard\/stats/, 'get', {
  code: 200, message: 'success',
  data: { pendingCount: 12, monthlyNew: 45, resolutionRate: 92.5 }
})

Mock.mock(/\/api\/v1\/hazard\/stats\/distribution/, 'get', () => {
  const byLevel = levels.map(l => ({ name: l, value: data.filter(d => d.level === l).length }))
  const byStatus = statuses.map(s => ({ name: s, value: data.filter(d => d.status === s).length }))
  return { code: 200, message: 'success', data: { byLevel, byStatus } }
})

Mock.mock(/\/api\/v1\/hazard(\?|$)/, 'get', (options) => {
  let list = [...data]
  const url = new URL('http://localhost' + options.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const level = url.searchParams.get('level')
  const status = url.searchParams.get('status')
  if (level) list = list.filter(item => item.level === level)
  if (status) list = list.filter(item => item.status === status)
  const total = list.length
  const start = (page - 1) * pageSize
  return { code: 200, message: 'success', data: { list: list.slice(start, start + pageSize), total, page, pageSize } }
})

Mock.mock(/\/api\/v1\/hazard$/, 'post', (options) => {
  const body = JSON.parse(options.body)
  const newHazard = {
    id: data.length + 1,
    hazardNo: 'HZ-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + ('00' + (data.length + 1)).slice(-2),
    ...body,
    reportTime: new Date().toISOString(),
    status: '待审核'
  }
  data.unshift(newHazard)
  return { code: 200, message: '上报成功', data: newHazard }
})

Mock.mock(/\/api\/v1\/hazard\/\d+\/status$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/hazard\/(\d+)\/status/)[1])
  const body = JSON.parse(options.body)
  const idx = data.findIndex(h => h.id === id)
  if (idx > -1) { data[idx].status = body.status; return { code: 200, message: '更新成功' } }
  return { code: 404, message: '不存在' }
})

Mock.mock(/\/api\/v1\/hazard\/\d+\/flow$/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/hazard\/(\d+)\/flow/)[1])
  const item = data.find(h => h.id === id)
  return {
    code: 200, message: 'success',
    data: item ? [
      { step: '上报', operator: item.reporter, time: item.reportTime, remark: item.description },
      { step: '审核', operator: '管理员', time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'), remark: '已审核通过' },
      { step: '派单', operator: '管理员', time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'), remark: '已派单至' + item.handler },
      { step: item.status === '已归档' ? '归档' : '处置中', operator: item.handler || '待定', time: item.status === '已归档' ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : '-', remark: item.status === '已归档' ? '处置完成，验收通过' : '正在处理中' }
    ] : []
  }
})
