<template>
  <div>
    <div class="search-bar">
      <el-form :inline="true" size="small">
        <el-form-item label="器材编号">
          <el-input v-model="query.equipmentId" placeholder="输入器材编号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="equipmentId" label="器材编号" width="110" />
      <el-table-column prop="equipmentName" label="器材名称" min-width="120" />
      <el-table-column prop="unit" label="维保单位" min-width="140" />
      <el-table-column prop="maintainer" label="维保人" width="80" />
      <el-table-column prop="maintainDate" label="维保日期" width="110" />
      <el-table-column label="维保结果" width="90">
        <template slot-scope="{ row }">
          <StatusTag :label="row.result" :color="row.result === '合格' ? 'success' : 'danger'" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="openReport(row)">查看报告</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" :current-page.sync="currentPage" @current-change="fetchData" />

    <el-dialog title="维保报告" :visible.sync="reportVisible" width="550px">
      <el-descriptions :column="2" border size="small" v-if="reportData">
        <el-descriptions-item label="器材编号">{{ reportData.equipmentId }}</el-descriptions-item>
        <el-descriptions-item label="器材名称">{{ reportData.equipmentName }}</el-descriptions-item>
        <el-descriptions-item label="维保单位">{{ reportData.unit }}</el-descriptions-item>
        <el-descriptions-item label="维保人">{{ reportData.maintainer }}</el-descriptions-item>
        <el-descriptions-item label="维保日期">{{ reportData.maintainDate }}</el-descriptions-item>
        <el-descriptions-item label="维保结果">
          <StatusTag :label="reportData.result" :color="reportData.result === '合格' ? 'success' : 'danger'" />
        </el-descriptions-item>
        <el-descriptions-item label="费用">{{ reportData.cost }} 元</el-descriptions-item>
        <el-descriptions-item label="报告" :span="2">{{ reportData.report }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag.vue'
import { getMaintenanceRecords, getMaintenanceReport } from '@/api/maintenance'

export default {
  name: 'MaintenanceRecordTab',
  components: { StatusTag },
  data() {
    return {
      query: { equipmentId: '' },
      tableData: [], loading: false, total: 0, currentPage: 1, pageSize: 10,
      reportVisible: false, reportData: null
    }
  },
  created() { this.fetchData() },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await getMaintenanceRecords({ page: this.currentPage, pageSize: this.pageSize, equipmentId: this.query.equipmentId })
        this.tableData = res.data.list; this.total = res.data.total
      } catch (e) { this.$message.error('获取数据失败') }
      this.loading = false
    },
    handleQuery() { this.currentPage = 1; this.fetchData() },
    async openReport(row) {
      this.reportVisible = true
      try { const res = await getMaintenanceReport(row.id); this.reportData = res.data } catch (e) { this.reportData = null }
    }
  }
}
</script>
