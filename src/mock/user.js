import Mock from 'mockjs'

const roles = ['超级管理员', '安全管理员', '巡检员', '维保人员', '部门管理员', '只读用户']
const departments = ['信息中心', '保卫处', '后勤管理处', '设备科', '学生处', '教务处', '图书馆', '化学系', '物理系', '校医院']
const userStatuses = ['启用', '禁用']

const data = Mock.mock({
  'list|24': [{
    'id|+1': 1,
    username: function() { return 'user' + this.id },
    name: '@cname',
    phone: function() { return '1' + Mock.Random.string('3456789', 1) + Mock.Random.string('number', 9) },
    'role|1': roles,
    department: function() { return departments[Mock.Random.integer(0, 9)] },
    'status|1': userStatuses,
    lastLogin: '@datetime("2024-01-01", "2025-05-18")',
    createTime: '@date("2023-01-01", "2024-12-31")'
  }]
}).list

// Ensure admin user
data.unshift({
  id: 0,
  username: 'admin',
  name: '系统管理员',
  phone: '13800001111',
  role: '超级管理员',
  department: '信息中心',
  status: '启用',
  lastLogin: '2025-05-18 09:30:00',
  createTime: '2023-01-01'
})

Mock.mock(/\/api\/v1\/user\/stats/, 'get', {
  code: 200, message: 'success',
  data: { total: 25, online: 18, todayNew: 2 }
})

Mock.mock(/\/api\/v1\/user(\?|$)/, 'get', (options) => {
  let list = [...data]
  const url = new URL('http://localhost' + options.url)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const username = url.searchParams.get('username')
  const role = url.searchParams.get('role')
  const status = url.searchParams.get('status')
  if (username) list = list.filter(item => item.username.includes(username) || item.name.includes(username))
  if (role) list = list.filter(item => item.role === role)
  if (status) list = list.filter(item => item.status === status)
  const total = list.length
  const start = (page - 1) * pageSize
  return { code: 200, message: 'success', data: { list: list.slice(start, start + pageSize), total, page, pageSize } }
})

Mock.mock(/\/api\/v1\/user$/, 'post', (options) => {
  const body = JSON.parse(options.body)
  const newUser = {
    id: data.length + 1,
    ...body,
    lastLogin: '-',
    createTime: new Date().toISOString().split('T')[0]
  }
  data.unshift(newUser)
  return { code: 200, message: '新增成功', data: newUser }
})

Mock.mock(/\/api\/v1\/user\/\d+$/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/user\/(\d+)/)[1])
  const body = JSON.parse(options.body)
  const idx = data.findIndex(u => u.id === id)
  if (idx > -1) { data[idx] = { ...data[idx], ...body }; return { code: 200, message: '更新成功', data: data[idx] } }
  return { code: 404, message: '不存在' }
})

Mock.mock(/\/api\/v1\/user\/\d+$/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/user\/(\d+)/)[1])
  const idx = data.findIndex(u => u.id === id)
  if (idx > -1) { data.splice(idx, 1); return { code: 200, message: '删除成功' } }
  return { code: 404, message: '不存在' }
})

Mock.mock(/\/api\/v1\/user\/\d+\/reset-password$/, 'put', {
  code: 200, message: '密码重置成功', data: null
})

// Add passwords to existing data (for login validation)
data.forEach(u => { u.password = '123456' })
const adminUser = data.find(u => u.username === 'admin')
if (adminUser) adminUser.password = 'admin123'

Mock.mock(/\/api\/v1\/login/, 'post', (options) => {
  const { username, password } = JSON.parse(options.body)
  const user = data.find(u => u.username === username && u.password === password)
  if (user) {
    return {
      code: 200, msg: '登录成功',
      data: {
        token: 'mock-token-' + user.id + '-' + Date.now(),
        userInfo: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          department: user.department,
          phone: user.phone,
          avatar: ''
        }
      }
    }
  }
  return { code: 401, msg: '用户名或密码错误', data: null }
})

Mock.mock(/\/api\/v1\/register/, 'post', (options) => {
  const body = JSON.parse(options.body)
  const exists = data.find(u => u.username === body.username)
  if (exists) {
    return { code: 400, msg: '用户名已存在', data: null }
  }
  const newUser = {
    id: data.length + 1,
    username: body.username,
    password: body.password,
    name: body.name,
    phone: body.phone,
    role: body.role || '巡检员',
    department: body.department || '',
    status: '启用',
    lastLogin: '-',
    createTime: new Date().toISOString().split('T')[0]
  }
  data.unshift(newUser)
  return { code: 200, msg: '注册成功', data: { id: newUser.id, username: newUser.username } }
})

Mock.mock(/\/api\/v1\/forgot-password/, 'post', (options) => {
  const { phone, smsCode, newPassword } = JSON.parse(options.body)
  if (!smsCode || smsCode !== '888888') {
    return { code: 400, msg: '验证码错误', data: null }
  }
  const user = data.find(u => u.phone === phone)
  if (!user) {
    return { code: 400, msg: '该手机号未注册', data: null }
  }
  user.password = newPassword
  return { code: 200, msg: '密码重置成功', data: null }
})

Mock.mock(/\/api\/v1\/sms\/send/, 'post', (options) => {
  const { phone } = JSON.parse(options.body)
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return { code: 400, msg: '手机号格式不正确', data: null }
  }
  return { code: 200, msg: '验证码已发送', data: { smsCode: '888888' } }
})

Mock.mock(/\/api\/v1\/user\/info/, 'get', (options) => {
  // Extract token from header (simplified: always return admin for demo)
  const token = (options.headers || {}).Authorization || ''
  // In production, parse token to get user; for mock return admin
  const user = data.find(u => u.username === 'admin')
  if (user) {
    return {
      code: 200, msg: 'success',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
        phone: user.phone,
        avatar: ''
      }
    }
  }
  return { code: 401, msg: '未登录', data: null }
})
