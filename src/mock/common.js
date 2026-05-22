import Mock from 'mockjs'

Mock.mock(/\/api\/v1\/common\/categories/, 'get', {
  code: 200, message: 'success',
  data: ['灭火器', '消火栓', '消防水带', '灭火器箱', '应急灯', '疏散指示', '防火门', '烟感温感', '消防服', '其他']
})

Mock.mock(/\/api\/v1\/common\/departments/, 'get', {
  code: 200, message: 'success',
  data: ['保卫处', '信息中心', '后勤管理处', '学生处', '教务处', '设备科', '图书馆', '化学系', '物理系', '校医院']
})

Mock.mock(/\/api\/v1\/common\/areas/, 'get', {
  code: 200, message: 'success',
  data: [
    '教学楼A栋', '教学楼B栋', '图书馆', '综合楼', '实验楼',
    '学生宿舍1栋', '学生宿舍2栋', '行政楼', '体育馆', '食堂', '校医院'
  ]
})
