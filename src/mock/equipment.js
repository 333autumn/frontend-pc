import Mock from 'mockjs'

const categories = [
  { id: 1, name: '灭火器' },
  { id: 2, name: '消火栓' },
  { id: 3, name: '消防水带' },
  { id: 4, name: '灭火器箱' },
  { id: 5, name: '应急灯' },
  { id: 6, name: '疏散指示' },
  { id: 7, name: '防火门' },
  { id: 8, name: '烟感温感' },
  { id: 9, name: '消防服' },
  { id: 10, name: '其他' }
]

const statuses = [
  { value: 1, text: '正常' },
  { value: 2, text: '待维保' },
  { value: 3, text: '已报废' }
]

const buildings = ['1号教学楼', '2号教学楼', '图书馆', '综合楼', '实验楼', '学生宿舍1栋', '学生宿舍2栋', '行政楼', '体育馆', '食堂', '校医院']
const floors = ['1层', '2层', '3层', '4层', '5层', '地下1层']
const rooms = ['101室', '102室', '201室', '202室', '301室', '302室', '走廊', '大厅', '主厅', '仓库']

const models = ['MFZ/ABC4', 'MFZ/ABC8', 'SN65', 'SN50', '8-65-25', '10-50-20', 'LED-E12', 'LED-E24', 'SMD-360', 'FM-2', 'FM-1', 'JTY-GD', 'JTW-ZD', 'FH-02', 'FH-01']
const specs = ['4kg', '8kg', 'DN65', 'DN50', '25m', '20m', '12W', '24W', '360m²', '甲级', '乙级', null]
const maintenanceUnits = ['安防消防服务公司', '鑫盾消防器材公司', '永安消防工程公司', '长城消防维保公司']

const data = Mock.mock({
  'list|100': [{
    'id|+1': 1,
    equipment_code: function () { return 'EQ' + String(20250000 + this.id) },
    'category_id|1-10': 1,
    category_name: function () {
      const c = categories.find(c => c.id === this.category_id)
      return c ? c.name : '其他'
    },
    name: function () {
      const c = categories.find(c => c.id === this.category_id)
      const prefix = c ? c.name : '器材'
      return prefix
    },
    model: function () { return models[Mock.Random.integer(0, models.length - 1)] },
    spec: function () { return specs[Mock.Random.integer(0, specs.length - 1)] },
    location_building: function () { return buildings[Mock.Random.integer(0, buildings.length - 1)] },
    location_floor: function () { return floors[Mock.Random.integer(0, floors.length - 1)] },
    location_room: function () { return rooms[Mock.Random.integer(0, rooms.length - 1)] },
    responsible_person: '@cname',
    purchase_date: '@date("2023-01-01", "2025-05-01")',
    production_date: '@date("2022-06-01", "2025-04-01")',
    expiry_date: '@date("2025-06-01", "2028-12-31")',
    pressure_value: function () { return (Mock.Random.float(0, 2.5, 2, 2)).toFixed(2) * 1 },
    maintenance_unit: function () { return maintenanceUnits[Mock.Random.integer(0, maintenanceUnits.length - 1)] },
    next_maintenance_date: '@date("2025-06-01", "2026-12-31")',
    'equipment_status|1': [1, 2, 3],
    equipment_status_text: function () {
      const s = statuses.find(s => s.value === this.equipment_status)
      return s ? s.text : '正常'
    },
    qr_code: function () { return 'upload/qr/eq' + String(20250000 + this.id) + '.png' },
    photo: function () { return 'upload/photo/eq' + String(20250000 + this.id) + '.jpg' },
    create_time: '@datetime("2024-01-01", "2025-05-19")'
  }]
}).list

Mock.mock(/\/api\/v1\/equipmentInfo\/info\/page(\?|$)/, 'get', (options) => {
  let list = [...data]
  const url = new URL('http://localhost' + options.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const limit = parseInt(url.searchParams.get('limit')) || 10
  const name = url.searchParams.get('name')
  const equipment_code = url.searchParams.get('equipment_code')
  const category_id = url.searchParams.get('category_id')
  const equipment_status = url.searchParams.get('equipment_status')
  const location_building = url.searchParams.get('location_building')
  const location_floor = url.searchParams.get('location_floor')
  const location_room = url.searchParams.get('location_room')
  const responsible_person = url.searchParams.get('responsible_person')
  const expiry_start = url.searchParams.get('expiry_start')
  const expiry_end = url.searchParams.get('expiry_end')
  const sort = url.searchParams.get('sort') || 'id'
  const order = url.searchParams.get('order') || 'desc'

  if (name) list = list.filter(item => item.name.includes(name))
  if (equipment_code) list = list.filter(item => item.equipment_code.includes(equipment_code))
  if (category_id) list = list.filter(item => item.category_id === parseInt(category_id))
  if (equipment_status) list = list.filter(item => item.equipment_status === parseInt(equipment_status))
  if (location_building) list = list.filter(item => item.location_building.includes(location_building))
  if (location_floor) list = list.filter(item => item.location_floor.includes(location_floor))
  if (location_room) list = list.filter(item => item.location_room.includes(location_room))
  if (responsible_person) list = list.filter(item => item.responsible_person.includes(responsible_person))
  if (expiry_start) list = list.filter(item => item.expiry_date >= expiry_start)
  if (expiry_end) list = list.filter(item => item.expiry_date <= expiry_end)

  list.sort((a, b) => {
    const va = a[sort] != null ? a[sort] : ''
    const vb = b[sort] != null ? b[sort] : ''
    if (order === 'asc') {
      return va > vb ? 1 : va < vb ? -1 : 0
    }
    return va < vb ? 1 : va > vb ? -1 : 0
  })

  const total = list.length
  const totalPage = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const paged = list.slice(start, start + limit)

  return {
    code: total === 0 ? 0 : 200,
    msg: total === 0 ? '暂无符合条件的数据' : '查询成功',
    data: { list: paged, total, pageSize: limit, totalPage, currPage: page }
  }
})

Mock.mock(/\/api\/v1\/equipmentInfo\/info\/\d+$/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/info\/(\d+)/)[1])
  const item = data.find(e => e.id === id)
  return { code: 200, msg: 'success', data: item || null }
})

Mock.mock(/\/api\/v1\/equipmentInfo\/info$/, 'post', (options) => {
  const body = JSON.parse(options.body)
  const newId = data.length + 1
  const newItem = {
    id: newId,
    equipment_code: 'EQ' + String(20250000 + newId),
    ...body,
    create_time: new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
  data.unshift(newItem)
  return { code: 200, msg: '新增成功', data: newItem }
})

Mock.mock(/\/api\/v1\/equipmentInfo\/info\/\d+$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/info\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  const idx = data.findIndex(e => e.id === id)
  if (idx > -1) {
    data[idx] = { ...data[idx], ...body }
    return { code: 200, msg: '更新成功', data: data[idx] }
  }
  return { code: 404, msg: '器材不存在', data: null }
})

Mock.mock(/\/api\/v1\/equipmentInfo\/info\/\d+$/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/info\/(\d+)/)[1])
  const idx = data.findIndex(e => e.id === id)
  if (idx > -1) {
    data.splice(idx, 1)
    return { code: 200, msg: '删除成功', data: null }
  }
  return { code: 404, msg: '器材不存在', data: null }
})
