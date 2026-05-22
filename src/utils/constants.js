// Equipment status (aligned with API doc: 1=正常 2=待维保 3=已报废)
export const EQUIPMENT_STATUS = {
  NORMAL: { label: '正常', value: 1, color: 'success' },
  PENDING_MAINTENANCE: { label: '待维保', value: 2, color: 'warning' },
  SCRAPPED: { label: '已报废', value: 3, color: 'info' }
}

export const EQUIPMENT_CATEGORIES = [
  '灭火器', '消火栓', '消防水带', '灭火器箱', '应急灯',
  '疏散指示', '防火门', '烟感温感', '消防服', '其他'
]

// Inspection
export const INSPECTION_CYCLE = {
  DAILY: { label: '日检' },
  WEEKLY: { label: '周检' },
  MONTHLY: { label: '月检' },
  SEMESTER: { label: '学期检' }
}

export const INSPECTION_RESULT = {
  PASS: { label: '合格', color: 'success' },
  FAIL: { label: '不合格', color: 'danger' }
}

// Hazard
export const HAZARD_LEVEL = {
  CRITICAL: { label: '严重', color: 'danger' },
  MODERATE: { label: '一般', color: 'warning' },
  MINOR: { label: '轻微', color: 'info' }
}

export const HAZARD_STATUS = {
  PENDING_REVIEW: { label: '待审核', color: 'warning' },
  PROCESSING: { label: '处置中', color: 'primary' },
  PENDING_ASSIGN: { label: '待派单', color: 'info' },
  ARCHIVED: { label: '已归档', color: 'success' }
}

// Maintenance
export const MAINTENANCE_TYPE = {
  REGULAR: { label: '定期维保', color: 'primary' },
  REPAIR: { label: '故障维修', color: 'warning' }
}

export const MAINTENANCE_STATUS = {
  PENDING: { label: '待执行', color: 'warning' },
  IN_PROGRESS: { label: '执行中', color: 'primary' },
  COMPLETED: { label: '已完成', color: 'success' }
}

// Scrap
export const SCRAP_STATUS = {
  PENDING: { label: '待审批', color: 'warning' },
  APPROVED: { label: '已批准', color: 'success' },
  REJECTED: { label: '已驳回', color: 'danger' }
}

// Warning
export const WARNING_TYPE = {
  EXPIRY: { label: '到期报废', color: 'danger' },
  INSPECTION_OVERDUE: { label: '巡检逾期', color: 'warning' },
  MAINTENANCE_DUE: { label: '维保到期', color: 'primary' },
  HAZARD_TIMEOUT: { label: '隐患超时', color: 'danger' }
}

export const WARNING_STATUS = {
  PENDING: { label: '未处理', color: 'warning' },
  HANDLED: { label: '已处理', color: 'success' }
}

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: { label: '超级管理员', color: 'danger' },
  SECURITY_ADMIN: { label: '安全管理员', color: 'warning' },
  INSPECTOR: { label: '巡检员', color: 'primary' },
  MAINTENANCE_STAFF: { label: '维保人员', color: 'success' },
  DEPT_ADMIN: { label: '部门管理员', color: 'info' },
  READONLY: { label: '只读用户', color: '' }
}

export const USER_STATUS = {
  ENABLED: { label: '启用', color: 'success' },
  DISABLED: { label: '禁用', color: 'danger' }
}

// Transfer
export const TRANSFER_TYPE = {
  REPLACE: { label: '更换', color: 'primary' },
  ALLOCATE: { label: '调拨', color: 'warning' },
  INBOUND: { label: '入库', color: 'success' },
  OUTBOUND: { label: '出库', color: 'info' }
}

export const TRANSFER_STATUS = {
  PENDING: { label: '待执行', color: 'warning' },
  COMPLETED: { label: '已完成', color: 'success' },
  CANCELLED: { label: '已取消', color: 'info' }
}

export const DEPARTMENTS = [
  '保卫处', '信息中心', '后勤管理处', '学生处', '教务处',
  '设备科', '图书馆', '化学系', '物理系', '校医院'
]
