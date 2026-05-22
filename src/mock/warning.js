import Mock from 'mockjs'

const types = ['到期报废', '巡检逾期', '维保到期', '隐患超时']
const statuses = ['未处理', '已处理']

const data = Mock.mock({
  'list|25': [{
    'id|+1': 1,
    warningNo: function() { return 'WRN-' + Mock.Random.date('yyyyMMdd') + ('00' + this.id).slice(-2) },
    'type|1': types,
    equipmentId: function() { return 'EQ-' + (1000 + Mock.Random.integer(0, 99)) },
    equipmentName: function() { return ['灭火器', '消火栓', '烟感探测器', '应急灯', '疏散指示'][Mock.Random.integer(0, 4)] },
    location: function() { return ['教学楼A栋-101', '图书馆-202', '综合楼-301', '实验楼-103'][Mock.Random.integer(0, 3)] },
    warningTime: '@datetime("2024-01-01", "2025-05-18")',
    'status|1': statuses,
    detail: '@csentence(10, 25)'
  }]
}).list

Mock.mock(/\/api\/v1\/warning(\?|$)/, 'get', (options) => {
  let list = [...data]
  const url = new URL('http://localhost' + options.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const type = url.searchParams.get('type')
  const status = url.searchParams.get('status')
  if (type) list = list.filter(item => item.type === type)
  if (status) list = list.filter(item => item.status === status)
  const total = list.length
  const start = (page - 1) * pageSize
  return { code: 200, message: 'success', data: { list: list.slice(start, start + pageSize), total, page, pageSize } }
})

Mock.mock(/\/api\/v1\/warning\/\d+\/handle$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/warning\/(\d+)\/handle/)[1])
  const idx = data.findIndex(w => w.id === id)
  if (idx > -1) { data[idx].status = '已处理'; return { code: 200, message: '处理成功' } }
  return { code: 404, message: '不存在' }
})

Mock.mock(/\/api\/v1\/warning\/\d+\/ignore$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/warning\/(\d+)\/ignore/)[1])
  const idx = data.findIndex(w => w.id === id)
  if (idx > -1) { data[idx].status = '已处理'; return { code: 200, message: '已忽略' } }
  return { code: 404, message: '不存在' }
})
