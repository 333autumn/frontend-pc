<template>
  <div>
    <div class="search-bar">
      <el-form :inline="true" :model="query" size="small">
        <el-form-item label="计划名称">
          <el-input v-model="query.name" placeholder="输入计划名称" clearable />
        </el-form-item>
        <el-form-item label="周期">
          <el-select v-model="query.cycleType" placeholder="全部周期" clearable>
            <el-option v-for="(v, k) in INSPECTION_CYCLE" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="planName" label="计划名称" min-width="200" />
      <el-table-column label="周期类型" width="90">
        <template slot-scope="{ row }">
          <StatusTag :label="getCycleLabel(row.cycleType)" color="primary" />
        </template>
      </el-table-column>
      <el-table-column prop="department" label="负责部门" width="120" />
      <el-table-column prop="responsible" label="负责人" width="80" />
      <el-table-column label="时间范围" width="200">
        <template slot-scope="{ row }">{{ row.startDate }} 至 {{ row.endDate }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template slot-scope="{ row }">
          <StatusTag :label="row.status" :color="row.status === '进行中' ? 'success' : row.status === '已完成' ? 'info' : 'warning'" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="openForm(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" :current-page.sync="currentPage" @current-change="fetchData" />

    <el-dialog title="编辑巡检计划" :visible.sync="dialogVisible" width="550px">
      <el-form ref="form" :model="form" label-width="100px" size="small">
        <el-form-item label="计划名称" prop="planName">
          <el-input v-model="form.planName" />
        </el-form-item>
        <el-form-item label="周期类型">
          <el-select v-model="form.cycleType" style="width:100%">
            <el-option v-for="(v, k) in INSPECTION_CYCLE" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责部门">
          <el-input v-model="form.department" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="form.responsible" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" value-format="yyyy-MM-dd" style="width:100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width:100%">
            <el-option label="进行中" value="进行中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="待开始" value="待开始" />
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
import { INSPECTION_CYCLE } from '@/utils/constants'
import { getInspectionPlans, updateInspectionPlan } from '@/api/inspection'

export default {
  name: 'InspectionPlanTab',
  components: { StatusTag },
  data() {
    return {
      INSPECTION_CYCLE,
      query: { name: '', cycleType: '' },
      tableData: [], loading: false, total: 0, currentPage: 1, pageSize: 10,
      dialogVisible: false, form: {}, dateRange: [], editId: null
    }
  },
  created() { this.fetchData() },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await getInspectionPlans({ page: this.currentPage, pageSize: this.pageSize, name: this.query.name, cycleType: this.query.cycleType })
        this.tableData = res.data.list; this.total = res.data.total
      } catch (e) { this.$message.error('获取数据失败') }
      this.loading = false
    },
    handleQuery() { this.currentPage = 1; this.fetchData() },
    getCycleLabel(type) {
      return INSPECTION_CYCLE[type] ? INSPECTION_CYCLE[type].label : type
    },
    openForm(row) {
      this.editId = row.id
      this.form = { ...row }
      this.dateRange = [row.startDate, row.endDate]
      this.dialogVisible = true
    },
    async submitForm() {
      if (this.dateRange.length === 2) {
        this.form.startDate = this.dateRange[0]
        this.form.endDate = this.dateRange[1]
      }
      try {
        await updateInspectionPlan(this.editId, this.form)
        this.$message.success('更新成功')
        this.dialogVisible = false
        this.fetchData()
      } catch (e) { this.$message.error('更新失败') }
    }
  }
}
</script>
