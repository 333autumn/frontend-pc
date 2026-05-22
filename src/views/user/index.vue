<template>
  <div class="page-container">
    <!-- Stat cards -->
    <div class="stat-card-row">
      <StatCard label="用户总数" :value="stats.total" unit="人" icon="el-icon-user" icon-color="#1677ff" />
      <StatCard label="当前在线" :value="stats.online" unit="人" icon="el-icon-monitor" icon-color="#52c41a" />
      <StatCard label="今日新增" :value="stats.todayNew" unit="人" icon="el-icon-plus" icon-color="#faad14" />
    </div>

    <!-- Search -->
    <div class="search-bar">
      <el-form :inline="true" :model="query" size="small">
        <el-form-item label="用户名">
          <el-input v-model="query.username" placeholder="输入用户名或姓名" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="query.role" placeholder="全部角色" clearable>
            <el-option v-for="(v, k) in USER_ROLES" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable>
            <el-option v-for="(v, k) in USER_STATUS" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="openForm()">新增用户</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table -->
    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="username" label="用户名" width="100" />
      <el-table-column prop="name" label="姓名" width="80" />
      <el-table-column prop="phone" label="手机号" width="120" />
      <el-table-column label="角色" width="110">
        <template slot-scope="{ row }">
          <StatusTag v-bind="getRoleTag(row.role)" />
        </template>
      </el-table-column>
      <el-table-column prop="department" label="所属部门" width="120" />
      <el-table-column label="状态" width="70">
        <template slot-scope="{ row }">
          <StatusTag :label="row.status" :color="row.status === '启用' ? 'success' : 'danger'" />
        </template>
      </el-table-column>
      <el-table-column prop="lastLogin" label="最后登录" width="160" />
      <el-table-column label="操作" width="180" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="openForm(row)">编辑</el-button>
          <el-button type="text" size="small" @click="handleResetPwd(row)">重置密码</el-button>
          <el-button type="text" size="small" style="color:#ff4d4f" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" :current-page.sync="currentPage" @current-change="fetchData" />

    <!-- Dialog -->
    <el-dialog
      :title="isEdit ? '编辑用户' : '新增用户'"
      :visible.sync="dialogVisible"
      width="550px"
      @closed="resetForm"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="90px" size="small">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width:100%">
            <el-option v-for="(v, k) in USER_ROLES" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门" prop="department">
          <el-select v-model="form.department" style="width:100%">
            <el-option v-for="d in DEPARTMENTS" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width:100%">
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { USER_ROLES, USER_STATUS, DEPARTMENTS } from '@/utils/constants'
import { getUserStats, getUserList, createUser, updateUser, deleteUser, resetUserPassword } from '@/api/user'

const defaultForm = {
  username: '', password: '', name: '', phone: '', role: '巡检员', department: '', status: '启用'
}

export default {
  name: 'User',
  components: { StatCard, StatusTag },
  data() {
    return {
      USER_ROLES, USER_STATUS, DEPARTMENTS,
      stats: { total: 0, online: 0, todayNew: 0 },
      query: { username: '', role: '', status: '' },
      tableData: [], loading: false, total: 0, currentPage: 1, pageSize: 10,
      dialogVisible: false, isEdit: false, editId: null,
      form: { ...defaultForm }, submitLoading: false,
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        department: [{ required: true, message: '请选择部门', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  created() { this.fetchStats(); this.fetchData() },
  methods: {
    async fetchStats() {
      try { const res = await getUserStats(); this.stats = res.data } catch (e) {}
    },
    async fetchData() {
      this.loading = true
      try {
        const res = await getUserList({ page: this.currentPage, pageSize: this.pageSize, username: this.query.username, role: this.query.role, status: this.query.status })
        this.tableData = res.data.list; this.total = res.data.total
      } catch (e) { this.$message.error('获取用户列表失败') }
      this.loading = false
    },
    handleQuery() { this.currentPage = 1; this.fetchData() },
    handleReset() { this.query = { username: '', role: '', status: '' }; this.handleQuery() },
    getRoleTag(role) {
      const map = {
        '超级管理员': { label: '超级管理员', color: 'danger' },
        '安全管理员': { label: '安全管理员', color: 'warning' },
        '巡检员': { label: '巡检员', color: 'primary' },
        '维保人员': { label: '维保人员', color: 'success' },
        '部门管理员': { label: '部门管理员', color: 'info' },
        '只读用户': { label: '只读用户', color: '' }
      }
      return map[role] || { label: role, color: 'info' }
    },
    openForm(row) {
      this.dialogVisible = true
      if (row) {
        this.isEdit = true; this.editId = row.id
        this.form = { ...row }
      } else {
        this.isEdit = false; this.editId = null
        this.form = { ...defaultForm }
      }
    },
    resetForm() {
      this.form = { ...defaultForm }; this.isEdit = false; this.editId = null
      if (this.$refs.form) this.$refs.form.resetFields()
    },
    submitForm() {
      // If editing, skip password validation
      const rules = { ...this.rules }
      if (this.isEdit) delete rules.password

      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        this.submitLoading = true
        try {
          if (this.isEdit) {
            const { password, ...data } = this.form
            await updateUser(this.editId, data)
            this.$message.success('更新成功')
          } else {
            await createUser(this.form)
            this.$message.success('新增成功')
          }
          this.dialogVisible = false; this.fetchData(); this.fetchStats()
        } catch (e) { this.$message.error('操作失败') }
        this.submitLoading = false
      })
    },
    handleDelete(row) {
      this.$confirm('确定删除用户 ' + row.name + ' 吗？', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(async () => {
        try {
          await deleteUser(row.id)
          this.$message.success('删除成功')
          this.fetchData(); this.fetchStats()
        } catch (e) { this.$message.error('删除失败') }
      }).catch(() => {})
    },
    handleResetPwd(row) {
      this.$confirm('确定重置用户 ' + row.name + ' 的密码吗？', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(async () => {
        try {
          await resetUserPassword(row.id)
          this.$message.success('密码重置成功')
        } catch (e) { this.$message.error('操作失败') }
      }).catch(() => {})
    }
  }
}
</script>
