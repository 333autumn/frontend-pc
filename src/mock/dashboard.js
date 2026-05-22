import Mock from 'mockjs'

Mock.mock(/\/api\/v1\/dashboard\/stats/, 'get', {
  code: 200,
  message: 'success',
  data: {
    equipmentTotal: 1230,
    equipmentMoM: 5.2,
    pendingAlerts: 12,
    alertMoM: -3.1,
    inspectionRate: 87,
    inspectionTarget: 95,
    inspectionStatus: '进行中',
    expiringCount: 5,
    expiringDays: 7,
    expiringLevel: '高风险'
  }
})

Mock.mock(/\/api\/v1\/dashboard\/equipment-distribution/, 'get', {
  code: 200,
  message: 'success',
  data: [
    { name: '灭火器', value: 450, itemStyle: { color: '#1677ff' } },
    { name: '消火栓', value: 230, itemStyle: { color: '#52c41a' } },
    { name: '应急照明', value: 180, itemStyle: { color: '#faad14' } },
    { name: '疏散指示', value: 150, itemStyle: { color: '#ff4d4f' } },
    { name: '防火门', value: 100, itemStyle: { color: '#722ed1' } },
    { name: '烟感温感', value: 80, itemStyle: { color: '#13c2c2' } },
    { name: '其他', value: 40, itemStyle: { color: '#fa8c16' } }
  ]
})

Mock.mock(/\/api\/v1\/dashboard\/inspection-trend/, 'get', {
  code: 200,
  message: 'success',
  data: {
    months: ['12月', '1月', '2月', '3月', '4月', '5月'],
    completed: [42, 38, 45, 48, 50, 46],
    total: [50, 48, 52, 55, 55, 53]
  }
})

Mock.mock(/\/api\/v1\/dashboard\/area-distribution/, 'get', {
  code: 200,
  message: 'success',
  data: [
    { area: '教学楼A栋', count: 180 },
    { area: '教学楼B栋', count: 150 },
    { area: '图书馆', count: 140 },
    { area: '综合楼', count: 130 },
    { area: '实验楼', count: 120 },
    { area: '学生宿舍1栋', count: 110 },
    { area: '学生宿舍2栋', count: 100 },
    { area: '行政楼', count: 90 },
    { area: '体育馆', count: 80 },
    { area: '食堂', count: 70 },
    { area: '校医院', count: 60 }
  ]
})

Mock.mock(/\/api\/v1\/dashboard\/alert-categories/, 'get', {
  code: 200,
  message: 'success',
  data: [
    { name: '到期报废', value: 8 },
    { name: '巡检逾期', value: 12 },
    { name: '维保到期', value: 6 },
    { name: '隐患超时', value: 4 }
  ]
})
