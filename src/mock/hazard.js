import Mock from 'mockjs'

const levels = [1, 2, 3]
const levelTexts = { 1: '一般', 2: '严重', 3: '紧急' }
const statusTexts = { 1: '待审核', 2: '已派单', 3: '处置中', 4: '待复核', 5: '已归档' }
const buildings = ['1号教学楼', '2号实验楼', '图书馆', '综合楼', '体育馆', '学生宿舍1栋']
const rooms = ['101室', '202室', '301教室', '走廊东侧', '大厅', '地下室', '402实验室']
const equipmentNames = ['干粉灭火器', '消防水带', '消火栓', '应急灯', '烟感探测器', '防火门', '灭火器箱', '疏散指示牌']

const data = Mock.mock({
  'list|30': [{
    'id|+1': 1,
    hazard_code: function () { return 'HZ' + Mock.Random.date('yyyyMMdd') + ('000' + this.id).slice(-3) },
    equipment_name: function () { return equipmentNames[Mock.Random.integer(0, 7)] },
    location_building: function () { return buildings[Mock.Random.integer(0, 5)] },
    location_room: function () { return rooms[Mock.Random.integer(0, 6)] },
    reporter_name: '@cname',
    hazard_desc: '@csentence(10, 30)',
    'hazard_level|1': levels,
    'hazard_status|1': [1, 2, 3, 4, 5],
    maintenance_name: '@cname',
    deadline: '@date("2025-05-25", "2025-12-31")',
    report_time: '@datetime("2025-01-01", "2025-05-20")',
    review_opinion: '@csentence(5, 15)',
    measure: '@csentence(8, 25)'
  }]
}).list

// Add dynamic computed fields
data.forEach(item => {
  item.hazard_level_text = levelTexts[item.hazard_level]
  item.hazard_status_text = statusTexts[item.hazard_status]
})

function updateStatus(id, newStatus) {
  const idx = data.findIndex(h => h.id === id)
  if (idx > -1) {
    data[idx].hazard_status = newStatus
    data[idx].hazard_status_text = statusTexts[newStatus]
    return data[idx]
  }
  return null
}

// Statistics
Mock.mock(/\/api\/v1\/hazard\/statistics(\?|$)/, 'get', () => {
  const total = data.length
  const by_status = [1, 2, 3, 4, 5].map(s => ({
    status: s, text: statusTexts[s], count: data.filter(d => d.hazard_status === s).length
  }))
  const by_level = [1, 2, 3].map(l => ({
    level: l, text: levelTexts[l], count: data.filter(d => d.hazard_level === l).length
  }))
  return { code: 200, msg: 'success', data: { total, by_status, by_level } }
})

// Paginated query
Mock.mock(/\/api\/v1\/hazard\/info\/page/, 'get', (options) => {
  let list = [...data]
  const url = new URL('http://localhost' + options.url)
  const pageNum = parseInt(url.searchParams.get('pageNum')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const level = url.searchParams.get('hazard_level')
  const status = url.searchParams.get('hazard_status')
  if (level) list = list.filter(item => String(item.hazard_level) === level)
  if (status) list = list.filter(item => String(item.hazard_status) === status)
  // Sort by id descending
  list.sort((a, b) => b.id - a.id)
  const total = list.length
  const totalPage = Math.ceil(total / pageSize)
  const start = (pageNum - 1) * pageSize
  return {
    code: 200, msg: 'success',
    data: {
      total, pageSize, totalPage, currPage: pageNum,
      list: list.slice(start, start + pageSize)
    }
  }
})

// Report
Mock.mock(/\/api\/v1\/hazard\/report$/, 'post', (options) => {
  const body = JSON.parse(options.body)
  const newId = data.length + 1
  const newHazard = {
    id: newId,
    hazard_code: 'HZ' + Mock.Random.date('yyyyMMdd') + ('000' + newId).slice(-3),
    equipment_name: body.equipment_id ? '关联器材' + body.equipment_id : '未指定器材',
    location_building: body.location_building || '',
    location_room: body.location_room || '',
    reporter_name: '当前用户',
    hazard_desc: body.hazard_desc,
    hazard_level: body.hazard_level,
    hazard_level_text: levelTexts[body.hazard_level] || '',
    hazard_status: 1,
    hazard_status_text: '待审核',
    maintenance_name: '',
    deadline: '',
    report_time: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    review_opinion: '',
    measure: '',
    hazard_photo: body.hazard_photo || ''
  }
  data.push(newHazard)
  return { code: 200, msg: '上报成功', data: { id: newHazard.id, hazard_code: newHazard.hazard_code } }
})

// Review
Mock.mock(/\/api\/v1\/hazard\/review\/\d+$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/review\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  const item = updateStatus(id, 2)
  if (item) {
    item.review_opinion = body.review_opinion || ''
    item.deadline = body.deadline || ''
    item.maintenance_name = Mock.Random.cname()
    return {
      code: 200, msg: '审核通过，已自动分配',
      data: {
        maintenance_id: id + 100,
        maintenance_name: item.maintenance_name,
        assignee_id: id + 200,
        assignee_name: Mock.Random.cname()
      }
    }
  }
  return { code: 404, msg: '隐患不存在' }
})

// Accept
Mock.mock(/\/api\/v1\/hazard\/accept\/\d+$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/accept\/(\d+)/)[1])
  const item = updateStatus(id, 3)
  if (item) return { code: 200, msg: '任务已接受' }
  return { code: 404, msg: '隐患不存在' }
})

// Handle
Mock.mock(/\/api\/v1\/hazard\/handle\/\d+$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/handle\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  const item = updateStatus(id, 4)
  if (item) {
    item.measure = body.measure || ''
    return { code: 200, msg: '处置完成，已提交复核' }
  }
  return { code: 404, msg: '隐患不存在' }
})

// Recheck
Mock.mock(/\/api\/v1\/hazard\/recheck\/\d+$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/recheck\/(\d+)/)[1])
  const item = updateStatus(id, 5)
  if (item) return { code: 200, msg: '复核通过，已归档' }
  return { code: 404, msg: '隐患不存在' }
})

// Export
Mock.mock(/\/api\/v1\/hazard\/export/, 'get', () => {
  return { code: 200, msg: '导出成功', data: null }
})
