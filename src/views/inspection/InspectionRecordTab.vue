<template>
  <div>
    <div class="search-bar">
      <el-form :inline="true" :model="query" size="small">
        <el-form-item label="器材编号">
          <el-input v-model="query.equipmentId" placeholder="输入器材编号" clearable />
        </el-form-item>
        <el-form-item label="巡检人">
          <el-input v-model="query.inspector" placeholder="输入巡检人" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="equipmentId" label="器材编号" width="110" />
      <el-table-column prop="equipmentName" label="器材名称" min-width="120" />
      <el-table-column prop="inspector" label="巡检人员" width="90" />
      <el-table-column prop="inspectTime" label="巡检时间" width="160" />
      <el-table-column label="外观" width="80">
        <template slot-scope="{ row }">
          <StatusTag :label="row.appearanceStatus" :color="row.appearanceStatus === '正常' ? 'success' : 'danger'" />
        </template>
      </el-table-column>
      <el-table-column prop="pressureValue" label="压力值" width="90" />
      <el-table-column label="整体结果" width="90">
        <template slot-scope="{ row }">
          <StatusTag :label="row.result" :color="row.result === '合格' ? 'success' : 'danger'" />
        </template>
      </el-table-column>
      <el-table-column prop="abnormalNote" label="异常说明" min-width="150" show-overflow-tooltip />
    </el-table>

    <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" :current-page.sync="currentPage" @current-change="fetchData" />
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag.vue'
import { getInspectionRecords } from '@/api/inspection'

export default {
  name: 'InspectionRecordTab',
  components: { StatusTag },
  data() {
    return {
      query: { equipmentId: '', inspector: '' },
      tableData: [], loading: false, total: 0, currentPage: 1, pageSize: 10
    }
  },
  created() { this.fetchData() },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await getInspectionRecords({ page: this.currentPage, pageSize: this.pageSize, equipmentId: this.query.equipmentId, inspector: this.query.inspector })
        this.tableData = res.data.list; this.total = res.data.total
      } catch (e) { this.$message.error('获取数据失败') }
      this.loading = false
    },
    handleQuery() { this.currentPage = 1; this.fetchData() }
  }
}
</script>
