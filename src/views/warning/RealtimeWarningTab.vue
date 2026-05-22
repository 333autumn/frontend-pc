<template>
  <div>
    <div class="search-bar">
      <el-form :inline="true" :model="query" size="small">
        <el-form-item label="预警类型">
          <el-select v-model="query.type" placeholder="全部类型" clearable>
            <el-option v-for="(v, k) in WARNING_TYPE" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable>
            <el-option v-for="(v, k) in WARNING_STATUS" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="warningNo" label="预警编号" width="140" />
      <el-table-column label="预警类型" width="100">
        <template slot-scope="{ row }">
          <StatusTag v-bind="getTypeTag(row.type)" />
        </template>
      </el-table-column>
      <el-table-column prop="equipmentId" label="关联器材" width="110" />
      <el-table-column prop="equipmentName" label="器材名称" min-width="120" />
      <el-table-column prop="location" label="器材位置" min-width="140" />
      <el-table-column prop="warningTime" label="预警时间" width="160" />
      <el-table-column label="处理状态" width="90">
        <template slot-scope="{ row }">
          <StatusTag :label="row.status" :color="row.status === '未处理' ? 'warning' : 'success'" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template slot-scope="{ row }">
          <el-button v-if="row.status === '未处理'" type="text" size="small" @click="handleWarning(row)">处理</el-button>
          <el-button v-if="row.status === '未处理'" type="text" size="small" style="color:#909399" @click="ignoreWarning(row)">忽略</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" :current-page.sync="currentPage" @current-change="fetchData" />
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag.vue'
import { WARNING_TYPE, WARNING_STATUS } from '@/utils/constants'
import { getWarningList, handleWarning, ignoreWarning } from '@/api/warning'

export default {
  name: 'RealtimeWarningTab',
  components: { StatusTag },
  data() {
    return {
      WARNING_TYPE, WARNING_STATUS,
      query: { type: '', status: '' },
      tableData: [], loading: false, total: 0, currentPage: 1, pageSize: 10
    }
  },
  created() { this.fetchData() },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await getWarningList({ page: this.currentPage, pageSize: this.pageSize, type: this.query.type, status: this.query.status })
        this.tableData = res.data.list; this.total = res.data.total
      } catch (e) { this.$message.error('获取数据失败') }
      this.loading = false
    },
    handleQuery() { this.currentPage = 1; this.fetchData() },
    getTypeTag(type) {
      const map = { '到期报废': { label: '到期报废', color: 'danger' }, '巡检逾期': { label: '巡检逾期', color: 'warning' }, '维保到期': { label: '维保到期', color: 'primary' }, '隐患超时': { label: '隐患超时', color: 'danger' } }
      return map[type] || { label: type, color: 'info' }
    },
    async handleWarning(row) {
      try {
        await handleWarning(row.id)
        this.$message.success('预警已处理')
        this.fetchData()
      } catch (e) { this.$message.error('操作失败') }
    },
    async ignoreWarning(row) {
      try {
        await ignoreWarning(row.id)
        this.$message.info('预警已忽略')
        this.fetchData()
      } catch (e) { this.$message.error('操作失败') }
    }
  }
}
</script>
