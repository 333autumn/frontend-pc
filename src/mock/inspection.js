import Mock from 'mockjs'

// Inspection Plans
const plans = Mock.mock({
  'list|15': [{
    'id|+1': 1,
    planName: function() {
      const year = 2024
      const depts = ['春季学期', '秋季学期', '寒假', '暑假']
      return year + '年' + depts[Mock.Random.integer(0, 3)] + '常规巡检'
    },
    'cycleType|1': ['日检', '周检', '月检', '学期检'],
    department: function() { return ['保卫处', '后勤管理处', '设备科'][Mock.Random.integer(0, 2)] },
    responsible: '@cname',
    startDate: '@date("2024-01-01", "2024-06-30")',
    endDate: '@date("2024-07-01", "2024-12-31")',
    'status|1': ['进行中', '已完成', '待开始'],
    remark: '@csentence(10, 20)'
  }]
}).list

// Inspection Records
const records = Mock.mock({
  'list|30': [{
    'id|+1': 1,
    equipmentId: function() { return 'EQ-' + (1000 + Mock.Random.integer(0, 99)) },
    equipmentName: function() { return ['灭火器', '消火栓', '应急灯', '疏散指示', '烟感温感'][Mock.Random.integer(0, 4)] },
    inspector: '@cname',
    inspectTime: '@datetime("2024-01-01", "2025-05-18")',
    'appearanceStatus|1': ['正常', '异常'],
    pressureValue: function() { return (Mock.Random.float(0.8, 2.5, 2, 2)).toFixed(2) + ' MPa' },
    'result|1': ['合格', '不合格'],
    abnormalNote: function() {
      return this.result === '不合格' ? Mock.Random.csentence(5, 15) : ''
    }
  }]
}).list

Mock.mock(/\/api\/v1\/inspection\/plans(\?|$)/, 'get', (options) => {
  let list = [...plans]
  const url = new URL('http://localhost' + options.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const name = url.searchParams.get('name')
  const cycleType = url.searchParams.get('cycleType')
  if (name) list = list.filter(item => item.planName.includes(name))
  if (cycleType) list = list.filter(item => item.cycleType === cycleType)
  const total = list.length
  const start = (page - 1) * pageSize
  return { code: 200, message: 'success', data: { list: list.slice(start, start + pageSize), total, page, pageSize } }
})

Mock.mock(/\/api\/v1\/inspection\/plans$/, 'post', (options) => {
  const body = JSON.parse(options.body)
  const newPlan = { id: plans.length + 1, ...body }
  plans.unshift(newPlan)
  return { code: 200, message: '新增成功', data: newPlan }
})

Mock.mock(/\/api\/v1\/inspection\/plans\/\d+$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/plans\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  const idx = plans.findIndex(p => p.id === id)
  if (idx > -1) { plans[idx] = { ...plans[idx], ...body }; return { code: 200, message: '更新成功' } }
  return { code: 404, message: '不存在' }
})

Mock.mock(/\/api\/v1\/inspection\/records(\?|$)/, 'get', (options) => {
  let list = [...records]
  const url = new URL('http://localhost' + options.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const equipmentId = url.searchParams.get('equipmentId')
  const inspector = url.searchParams.get('inspector')
  if (equipmentId) list = list.filter(item => item.equipmentId.includes(equipmentId))
  if (inspector) list = list.filter(item => item.inspector.includes(inspector))
  const total = list.length
  const start = (page - 1) * pageSize
  return { code: 200, message: 'success', data: { list: list.slice(start, start + pageSize), total, page, pageSize } }
})
