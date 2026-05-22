<template>
  <div>
    <div class="search-bar">
      <el-form :inline="true" :model="query" size="small">
        <el-form-item label="器材名称">
          <el-input v-model="query.name" placeholder="输入器材名称" clearable />
        </el-form-item>
        <el-form-item label="审批状态">
          <el-select v-model="query.approvalStatus" placeholder="全部状态" clearable>
            <el-option label="待审批" value="待审批" />
            <el-option label="已批准" value="已批准" />
            <el-option label="已驳回" value="已驳回" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="equipmentId" label="器材编号" width="110" />
      <el-table-column prop="equipmentName" label="器材名称" min-width="120" />
      <el-table-column prop="applyDate" label="申请日期" width="110" />
      <el-table-column prop="applicant" label="申请人" width="80" />
      <el-table-column label="审批状态" width="90">
        <template slot-scope="{ row }">
          <StatusTag :label="row.approvalStatus" :color="row.approvalStatus === '已批准' ? 'success' : row.approvalStatus === '已驳回' ? 'danger' : 'warning'" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template slot-scope="{ row }">
          <el-button v-if="row.approvalStatus === '待审批'" type="text" size="small" @click="handleApprove(row)">审批</el-button>
          <el-button type="text" size="small" @click="openView(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" :current-page.sync="currentPage" @current-change="fetchData" />

    <el-dialog title="报废详情" :visible.sync="viewVisible" width="500px">
      <el-descriptions :column="2" border size="small" v-if="viewData">
        <el-descriptions-item label="器材编号">{{ viewData.equipmentId }}</el-descriptions-item>
        <el-descriptions-item label="器材名称">{{ viewData.equipmentName }}</el-descriptions-item>
        <el-descriptions-item label="申请日期">{{ viewData.applyDate }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ viewData.applicant }}</el-descriptions-item>
        <el-descriptions-item label="审批状态">
          <StatusTag :label="viewData.approvalStatus" :color="viewData.approvalStatus === '已批准' ? 'success' : viewData.approvalStatus === '已驳回' ? 'danger' : 'warning'" />
        </el-descriptions-item>
        <el-descriptions-item label="审批人">{{ viewData.approver || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批日期">{{ viewData.approvalDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="报废原因" :span="2">{{ viewData.reason }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag.vue'
import { getScrapList, approveScrap } from '@/api/maintenance'

export default {
  name: 'ScrapManagementTab',
  components: { StatusTag },
  data() {
    return {
      query: { name: '', approvalStatus: '' },
      tableData: [], loading: false, total: 0, currentPage: 1, pageSize: 10,
      viewVisible: false, viewData: null
    }
  },
  created() { this.fetchData() },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await getScrapList({ page: this.currentPage, pageSize: this.pageSize, name: this.query.name, approvalStatus: this.query.approvalStatus })
        this.tableData = res.data.list; this.total = res.data.total
      } catch (e) { this.$message.error('获取数据失败') }
      this.loading = false
    },
    handleQuery() { this.currentPage = 1; this.fetchData() },
    handleApprove(row) {
      this.$confirm('审批报废申请：' + row.equipmentName, '审批', {
        confirmButtonText: '批准', cancelButtonText: '驳回', type: 'warning',
        distinguishCancelAndClose: true
      }).then(async () => {
        await approveScrap(row.id, '已批准')
        this.$message.success('已批准')
        this.fetchData()
      }).catch(async (action) => {
        if (action === 'cancel') {
          await approveScrap(row.id, '已驳回')
          this.$message.info('已驳回')
          this.fetchData()
        }
      })
    },
    openView(row) {
      this.viewData = row
      this.viewVisible = true
    }
  }
}
</script>
