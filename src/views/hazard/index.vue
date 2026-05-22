<template>
  <div class="page-container">
    <!-- Stat cards -->
    <div class="stat-card-row">
      <StatCard label="待处理隐患" :value="stats.pendingCount" unit="条" icon="el-icon-warning" icon-color="#ff4d4f" />
      <StatCard label="本月新增隐患" :value="stats.monthlyNew" unit="条" icon="el-icon-document" icon-color="#1677ff" />
      <StatCard label="整改完成率" :value="stats.resolutionRate" unit="%" icon="el-icon-circle-check" icon-color="#52c41a" />
    </div>

    <!-- Search -->
    <div class="search-bar">
      <el-form :inline="true" :model="query" size="small">
        <el-form-item label="等级">
          <el-select v-model="query.level" placeholder="全部等级" clearable>
            <el-option v-for="(v, k) in HAZARD_LEVEL" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable>
            <el-option v-for="(v, k) in HAZARD_STATUS" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button type="warning" icon="el-icon-download" @click="handleExport">导出Excel</el-button>
          <el-button type="danger" icon="el-icon-warning" @click="openReportDialog">隐患上报</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table -->
    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="hazardNo" label="隐患编号" width="140" />
      <el-table-column prop="description" label="隐患描述" min-width="160" show-overflow-tooltip />
      <el-table-column prop="location" label="位置" min-width="140" />
      <el-table-column label="等级" width="80">
        <template slot-scope="{ row }">
          <StatusTag v-bind="getLevelTag(row.level)" />
        </template>
      </el-table-column>
      <el-table-column prop="reporter" label="上报人" width="80" />
      <el-table-column prop="reportTime" label="上报时间" width="160" />
      <el-table-column label="状态" width="90">
        <template slot-scope="{ row }">
          <StatusTag v-bind="getStatusTag(row.status)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="openFlowDialog(row)">流程跟踪</el-button>
          <el-button v-if="row.status === '待审核'" type="text" size="small" @click="handleReview(row)">审核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" :current-page.sync="currentPage" @current-change="fetchData" />

    <!-- Report Dialog -->
    <el-dialog title="隐患上报" :visible.sync="reportVisible" width="550px">
      <el-form ref="reportForm" :model="reportForm" :rules="reportRules" label-width="100px" size="small">
        <el-form-item label="隐患描述" prop="description">
          <el-input v-model="reportForm.description" type="textarea" :rows="3" placeholder="请描述隐患情况" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="reportForm.location" placeholder="请输入隐患位置" />
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-select v-model="reportForm.level" style="width:100%">
            <el-option v-for="(v, k) in HAZARD_LEVEL" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="整改措施">
          <el-input v-model="reportForm.measures" type="textarea" :rows="2" placeholder="建议整改措施" />
        </el-form-item>
        <el-form-item label="整改期限">
          <el-date-picker v-model="reportForm.deadline" type="date" value-format="yyyy-MM-dd" style="width:100%" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="reportVisible = false">取消</el-button>
        <el-button type="primary" :loading="reportLoading" @click="submitReport">提交</el-button>
      </div>
    </el-dialog>

    <!-- Flow Dialog -->
    <el-dialog title="流程跟踪" :visible.sync="flowVisible" width="650px">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in flowData"
          :key="index"
          :timestamp="item.time"
          placement="top"
          :color="index === 0 ? '#1677ff' : index === flowData.length - 1 ? '#52c41a' : '#faad14'"
        >
          <el-card shadow="never">
            <p><strong>{{ item.step }}</strong> - {{ item.operator }}</p>
            <p style="color:#909399;font-size:13px;margin-top:4px;">{{ item.remark }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <div v-if="flowData.length === 0" style="text-align:center;padding:40px;color:#909399;">暂无流程数据</div>
    </el-dialog>
  </div>
</template>

<script>
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { HAZARD_LEVEL, HAZARD_STATUS } from '@/utils/constants'
import { getHazardStats, getHazardList, createHazard, updateHazardStatus, getHazardFlow, exportHazards } from '@/api/hazard'

export default {
  name: 'Hazard',
  components: { StatCard, StatusTag },
  data() {
    return {
      HAZARD_LEVEL, HAZARD_STATUS,
      stats: { pendingCount: 0, monthlyNew: 0, resolutionRate: 0 },
      query: { level: '', status: '' },
      tableData: [], loading: false, total: 0, currentPage: 1, pageSize: 10,
      reportVisible: false, reportLoading: false,
      reportForm: { description: '', location: '', level: '一般', measures: '', deadline: '' },
      reportRules: {
        description: [{ required: true, message: '请描述隐患情况', trigger: 'blur' }],
        location: [{ required: true, message: '请输入隐患位置', trigger: 'blur' }],
        level: [{ required: true, message: '请选择等级', trigger: 'change' }]
      },
      flowVisible: false, flowData: []
    }
  },
  created() { this.fetchStats(); this.fetchData() },
  methods: {
    async fetchStats() {
      try { const res = await getHazardStats(); this.stats = res.data } catch (e) {}
    },
    async fetchData() {
      this.loading = true
      try {
        const res = await getHazardList({ page: this.currentPage, pageSize: this.pageSize, level: this.query.level, status: this.query.status })
        this.tableData = res.data.list; this.total = res.data.total
      } catch (e) { this.$message.error('获取数据失败') }
      this.loading = false
    },
    handleQuery() { this.currentPage = 1; this.fetchData() },
    async handleExport() {
      try {
        const res = await getHazardList({ page: 1, pageSize: 9999, level: this.query.level, status: this.query.status })
        exportHazards(res.data.list)
        this.$message.success('导出成功')
      } catch (e) {
        this.$message.error('导出失败')
      }
    },
    getLevelTag(level) {
      const map = { '严重': { label: '严重', color: 'danger' }, '一般': { label: '一般', color: 'warning' }, '轻微': { label: '轻微', color: 'info' } }
      return map[level] || { label: level, color: 'info' }
    },
    getStatusTag(status) {
      const map = { '待审核': { label: '待审核', color: 'warning' }, '处置中': { label: '处置中', color: 'primary' }, '待派单': { label: '待派单', color: 'info' }, '已归档': { label: '已归档', color: 'success' } }
      return map[status] || { label: status, color: 'info' }
    },
    openReportDialog() {
      this.reportForm = { description: '', location: '', level: '一般', measures: '', deadline: '' }
      this.reportVisible = true
    },
    async submitReport() {
      this.$refs.reportForm.validate(async (valid) => {
        if (!valid) return
        this.reportLoading = true
        try {
          await createHazard(this.reportForm)
          this.$message.success('上报成功')
          this.reportVisible = false
          this.fetchData(); this.fetchStats()
        } catch (e) { this.$message.error('上报失败') }
        this.reportLoading = false
      })
    },
    async handleReview(row) {
      this.$confirm('确定审核通过该隐患吗？', '审核确认', { confirmButtonText: '通过', cancelButtonText: '驳回', type: 'warning' }).then(async () => {
        await updateHazardStatus(row.id, '处置中')
        this.$message.success('审核通过')
        this.fetchData(); this.fetchStats()
      }).catch(async () => {
        await updateHazardStatus(row.id, '待派单')
        this.$message.info('已驳回')
        this.fetchData(); this.fetchStats()
      })
    },
    async openFlowDialog(row) {
      this.flowVisible = true
      try { const res = await getHazardFlow(row.id); this.flowData = res.data } catch (e) { this.flowData = [] }
    }
  }
}
</script>
