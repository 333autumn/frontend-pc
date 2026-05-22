<template>
  <div>
    <div class="search-bar">
      <el-form :inline="true" :model="query" size="small">
        <el-form-item label="计划名称">
          <el-input v-model="query.name" placeholder="输入名称或编号" clearable />
        </el-form-item>
        <el-form-item label="维保类型">
          <el-select v-model="query.type" placeholder="全部类型" clearable>
            <el-option v-for="(v, k) in MAINTENANCE_TYPE" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="openForm()">新增维保计划</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="planNo" label="计划编号" width="140" />
      <el-table-column prop="equipmentName" label="器材名称" min-width="140" />
      <el-table-column label="维保类型" width="100">
        <template slot-scope="{ row }">
          <StatusTag :label="row.type" :color="row.type === '故障维修' ? 'warning' : 'primary'" />
        </template>
      </el-table-column>
      <el-table-column prop="unit" label="负责单位" min-width="140" />
      <el-table-column prop="planDate" label="计划日期" width="110" />
      <el-table-column label="状态" width="90">
        <template slot-scope="{ row }">
          <StatusTag :label="row.status" :color="row.status === '已完成' ? 'success' : row.status === '执行中' ? 'primary' : 'warning'" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="openForm(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" :current-page.sync="currentPage" @current-change="fetchData" />

    <el-dialog :title="editId ? '编辑维保计划' : '新增维保计划'" :visible.sync="dialogVisible" width="550px">
      <el-form ref="form" :model="form" label-width="100px" size="small">
        <el-form-item label="器材名称" prop="equipmentName">
          <el-input v-model="form.equipmentName" />
        </el-form-item>
        <el-form-item label="维保类型">
          <el-select v-model="form.type" style="width:100%">
            <el-option v-for="(v, k) in MAINTENANCE_TYPE" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责单位">
          <el-input v-model="form.unit" />
        </el-form-item>
        <el-form-item label="计划日期">
          <el-date-picker v-model="form.planDate" type="date" value-format="yyyy-MM-dd" style="width:100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width:100%">
            <el-option label="待执行" value="待执行" />
            <el-option label="执行中" value="执行中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag.vue'
import { MAINTENANCE_TYPE } from '@/utils/constants'
import { getMaintenancePlans, createMaintenancePlan, updateMaintenancePlan } from '@/api/maintenance'

export default {
  name: 'MaintenancePlanTab',
  components: { StatusTag },
  data() {
    return {
      MAINTENANCE_TYPE,
      query: { name: '', type: '' },
      tableData: [], loading: false, total: 0, currentPage: 1, pageSize: 10,
      dialogVisible: false, editId: null, form: { equipmentName: '', type: '定期维保', unit: '', planDate: '', status: '待执行' }
    }
  },
  created() { this.fetchData() },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await getMaintenancePlans({ page: this.currentPage, pageSize: this.pageSize, name: this.query.name, type: this.query.type })
        this.tableData = res.data.list; this.total = res.data.total
      } catch (e) { this.$message.error('获取数据失败') }
      this.loading = false
    },
    handleQuery() { this.currentPage = 1; this.fetchData() },
    openForm(row) {
      this.dialogVisible = true
      if (row) { this.editId = row.id; this.form = { ...row } }
      else { this.editId = null; this.form = { equipmentName: '', type: '定期维保', unit: '', planDate: '', status: '待执行' } }
    },
    async submitForm() {
      try {
        if (this.editId) {
          await updateMaintenancePlan(this.editId, this.form)
          this.$message.success('更新成功')
        } else {
          await createMaintenancePlan(this.form)
          this.$message.success('新增成功')
        }
        this.dialogVisible = false; this.fetchData()
      } catch (e) { this.$message.error('操作失败') }
    }
  }
}
</script>
