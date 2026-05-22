import Mock from 'mockjs'

const types = ['定期维保', '故障维修']
const planStatuses = ['待执行', '执行中', '已完成']
const resultTypes = ['合格', '不合格']
const scrapStatuses = ['待审批', '已批准', '已驳回']
const units = ['设备科', '保卫处消防维保组', '第三方维保公司A', '消防工程有限公司B']

// Maintenance Plans
const plans = Mock.mock({
  'list|12': [{
    'id|+1': 1,
    planNo: function() { return 'MP-' + Mock.Random.date('yyyy') + ('000' + this.id).slice(-3) },
    equipmentName: function() { return ['灭火器', '消火栓', '烟感探测器', '应急灯', '疏散指示'][Mock.Random.integer(0, 4)] },
    'type|1': types,
    unit: function() { return units[Mock.Random.integer(0, 3)] },
    planDate: '@date("2024-01-01", "2025-06-30")',
    'status|1': planStatuses,
    operator: '@cname',
    remark: '@csentence(8, 15)'
  }]
}).list

// Maintenance Records
const records = Mock.mock({
  'list|20': [{
    'id|+1': 1,
    equipmentId: function() { return 'EQ-' + (1000 + Mock.Random.integer(0, 99)) },
    equipmentName: function() { return ['灭火器', '消火栓', '烟感探测器', '应急灯'][Mock.Random.integer(0, 3)] },
    unit: function() { return units[Mock.Random.integer(0, 3)] },
    maintainer: '@cname',
    maintainDate: '@date("2024-01-01", "2025-05-18")',
    'result|1': resultTypes,
    report: '@csentence(20, 40)',
    cost: function() { return Mock.Random.float(100, 5000, 2, 2) }
  }]
}).list

// Scrap applications
const scraps = Mock.mock({
  'list|10': [{
    'id|+1': 1,
    equipmentId: function() { return 'EQ-' + (1000 + Mock.Random.integer(0, 99)) },
    equipmentName: function() { return ['灭火器', '消火栓', '消防水带', '应急灯'][Mock.Random.integer(0, 3)] },
    applyDate: '@date("2024-01-01", "2025-05-01")',
    applicant: '@cname',
    'approvalStatus|1': scrapStatuses,
    reason: '@csentence(10, 20)',
    approver: '@cname',
    approvalDate: '@date("2024-03-01", "2025-05-18")'
  }]
}).list

// Plan endpoints
Mock.mock(/\/api\/v1\/maintenance\/plans(\?|$)/, 'get', (options) => {
  let list = [...plans]
  const url = new URL('http://localhost' + options.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const name = url.searchParams.get('name')
  const type = url.searchParams.get('type')
  if (name) list = list.filter(item => item.equipmentName.includes(name) || item.planNo.includes(name))
  if (type) list = list.filter(item => item.type === type)
  const total = list.length
  const start = (page - 1) * pageSize
  return { code: 200, message: 'success', data: { list: list.slice(start, start + pageSize), total, page, pageSize } }
})

Mock.mock(/\/api\/v1\/maintenance\/plans$/, 'post', (options) => {
  const body = JSON.parse(options.body)
  const newPlan = { id: plans.length + 1, planNo: 'MP-' + new Date().getFullYear() + ('000' + (plans.length + 1)).slice(-3), ...body }
  plans.unshift(newPlan)
  return { code: 200, message: '新增成功', data: newPlan }
})

Mock.mock(/\/api\/v1\/maintenance\/plans\/\d+$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/plans\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  const idx = plans.findIndex(p => p.id === id)
  if (idx > -1) { plans[idx] = { ...plans[idx], ...body }; return { code: 200, message: '更新成功' } }
  return { code: 404, message: '不存在' }
})

// Record endpoints
Mock.mock(/\/api\/v1\/maintenance\/records(\?|$)/, 'get', (options) => {
  let list = [...records]
  const url = new URL('http://localhost' + options.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const equipmentId = url.searchParams.get('equipmentId')
  if (equipmentId) list = list.filter(item => item.equipmentId.includes(equipmentId))
  const total = list.length
  const start = (page - 1) * pageSize
  return { code: 200, message: 'success', data: { list: list.slice(start, start + pageSize), total, page, pageSize } }
})

Mock.mock(/\/api\/v1\/maintenance\/records\/\d+\/report$/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/records\/(\d+)\/report/)[1])
  const item = records.find(r => r.id === id)
  return { code: 200, message: 'success', data: item || null }
})

// Scrap endpoints
Mock.mock(/\/api\/v1\/maintenance\/scraps(\?|$)/, 'get', (options) => {
  let list = [...scraps]
  const url = new URL('http://localhost' + options.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const name = url.searchParams.get('name')
  const approvalStatus = url.searchParams.get('approvalStatus')
  if (name) list = list.filter(item => item.equipmentName.includes(name))
  if (approvalStatus) list = list.filter(item => item.approvalStatus === approvalStatus)
  const total = list.length
  const start = (page - 1) * pageSize
  return { code: 200, message: 'success', data: { list: list.slice(start, start + pageSize), total, page, pageSize } }
})

// Transfer / Replacement / Allocation records
const transferTypes = ['更换', '调拨', '入库', '出库']
const transferStatuses = ['待执行', '已完成', '已取消']
const equipmentNames = ['MFZ/ABC4灭火器', 'MFZ/ABC8灭火器', 'SN65消火栓', 'SN50消火栓', '消防水带8-65-25', 'LED-E12应急灯', 'LED-E24应急灯', 'SMD-360疏散指示', 'FM-2防火门', 'JTY-GD烟感探测器']
const buildings = ['1号教学楼', '2号教学楼', '图书馆', '综合楼', '实验楼', '学生宿舍1栋', '学生宿舍2栋', '行政楼', '体育馆', '食堂']
const floors = ['1层', '2层', '3层', '4层', '5层', '地下1层']
const rooms = ['101室', '102室', '201室', '202室', '301室', '302室', '走廊', '大厅', '仓库']

const transfers = Mock.mock({
  'list|20': [{
    'id|+1': 1,
    transferNo: function() { return 'TR-' + Mock.Random.date('yyyy') + ('000' + this.id).slice(-3) },
    'type|1': transferTypes,
    equipmentCode: function() { return 'EQ' + String(20250000 + Mock.Random.integer(1, 100)) },
    equipmentName: function() { return equipmentNames[Mock.Random.integer(0, equipmentNames.length - 1)] },
    'quantity|1-5': 1,
    fromBuilding: function() { return this.type === '入库' ? '' : buildings[Mock.Random.integer(0, buildings.length - 1)] },
    fromFloor: function() { return this.type === '入库' ? '' : floors[Mock.Random.integer(0, floors.length - 1)] },
    fromRoom: function() { return this.type === '入库' ? '' : rooms[Mock.Random.integer(0, rooms.length - 1)] },
    toBuilding: function() { return this.type === '出库' ? '' : buildings[Mock.Random.integer(0, buildings.length - 1)] },
    toFloor: function() { return this.type === '出库' ? '' : floors[Mock.Random.integer(0, floors.length - 1)] },
    toRoom: function() { return this.type === '出库' ? '' : rooms[Mock.Random.integer(0, rooms.length - 1)] },
    reason: '@csentence(8, 20)',
    applicant: '@cname',
    applyDate: '@date("2024-06-01", "2025-05-22")',
    operator: '@cname',
    operateDate: '@date("2024-07-01", "2025-05-22")',
    'status|1': transferStatuses,
    remark: '@csentence(5, 12)'
  }]
}).list

Mock.mock(/\/api\/v1\/maintenance\/transfers(\?|$)/, 'get', (options) => {
  let list = [...transfers]
  const url = new URL('http://localhost' + options.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const type = url.searchParams.get('type')
  const status = url.searchParams.get('status')
  const name = url.searchParams.get('name')
  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')

  if (type) list = list.filter(item => item.type === type)
  if (status) list = list.filter(item => item.status === status)
  if (name) list = list.filter(item => item.equipmentName.includes(name) || item.equipmentCode.includes(name) || item.transferNo.includes(name))
  if (startDate) list = list.filter(item => item.applyDate >= startDate)
  if (endDate) list = list.filter(item => item.applyDate <= endDate)

  list.sort((a, b) => b.id - a.id)
  const total = list.length
  const start = (page - 1) * pageSize
  return { code: 200, message: 'success', data: { list: list.slice(start, start + pageSize), total, page, pageSize } }
})

Mock.mock(/\/api\/v1\/maintenance\/transfers$/, 'post', (options) => {
  const body = JSON.parse(options.body)
  const newId = transfers.length + 1
  const newItem = {
    id: newId,
    transferNo: 'TR-' + new Date().getFullYear() + ('000' + newId).slice(-3),
    ...body,
    applyDate: body.applyDate || new Date().toISOString().split('T')[0]
  }
  transfers.unshift(newItem)
  return { code: 200, message: '新增成功', data: newItem }
})

Mock.mock(/\/api\/v1\/maintenance\/transfers\/\d+$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/transfers\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  const idx = transfers.findIndex(t => t.id === id)
  if (idx > -1) { transfers[idx] = { ...transfers[idx], ...body }; return { code: 200, message: '更新成功', data: transfers[idx] } }
  return { code: 404, message: '不存在' }
})

Mock.mock(/\/api\/v1\/maintenance\/transfers\/\d+$/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/transfers\/(\d+)/)[1])
  const idx = transfers.findIndex(t => t.id === id)
  if (idx > -1) { transfers.splice(idx, 1); return { code: 200, message: '删除成功' } }
  return { code: 404, message: '不存在' }
})

Mock.mock(/\/api\/v1\/maintenance\/scraps\/\d+\/approve$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/scraps\/(\d+)\/approve/)[1])
  const body = JSON.parse(options.body)
  const idx = scraps.findIndex(s => s.id === id)
  if (idx > -1) { scraps[idx].approvalStatus = body.status; scraps[idx].approvalDate = new Date().toISOString().split('T')[0]; return { code: 200, message: '操作成功' } }
  return { code: 404, message: '不存在' }
})
