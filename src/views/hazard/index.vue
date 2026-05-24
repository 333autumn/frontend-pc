<template>
  <div class="page-container">
    <!-- Stat cards -->
    <div class="stat-card-row">
      <StatCard label="待审核隐患" :value="statsByStatus[1]" unit="条" icon="el-icon-warning" icon-color="#ff4d4f" />
      <StatCard label="处置中隐患" :value="statsByStatus[3]" unit="条" icon="el-icon-loading" icon-color="#1677ff" />
      <StatCard label="已归档隐患" :value="statsByStatus[5]" unit="条" icon="el-icon-circle-check" icon-color="#52c41a" />
    </div>

    <!-- Search -->
    <div class="search-bar">
      <el-form :inline="true" :model="query" size="small">
        <el-form-item label="等级">
          <el-select v-model="query.hazard_level" placeholder="全部等级" clearable>
            <el-option v-for="(v, k) in HAZARD_LEVEL" :key="k" :label="v.label" :value="Number(k)" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.hazard_status" placeholder="全部状态" clearable>
            <el-option v-for="(v, k) in HAZARD_STATUS" :key="k" :label="v.label" :value="Number(k)" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button type="warning" icon="el-icon-download" @click="handleExport">导出</el-button>
          <el-button type="danger" icon="el-icon-warning" @click="openReportDialog">隐患上报</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table -->
    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="hazard_code" label="隐患编号" width="160" />
      <el-table-column prop="equipment_name" label="关联器材" width="120" />
      <el-table-column label="位置" min-width="150">
        <template slot-scope="{ row }">
          {{ row.location_building }}{{ row.location_room }}
        </template>
      </el-table-column>
      <el-table-column prop="hazard_desc" label="隐患描述" min-width="160" show-overflow-tooltip />
      <el-table-column label="等级" width="80">
        <template slot-scope="{ row }">
          <StatusTag v-bind="getLevelTag(row.hazard_level)" />
        </template>
      </el-table-column>
      <el-table-column prop="reporter_name" label="上报人" width="80" />
      <el-table-column prop="report_time" label="上报时间" width="160" />
      <el-table-column label="状态" width="90">
        <template slot-scope="{ row }">
          <StatusTag v-bind="getStatusTag(row.hazard_status)" />
        </template>
      </el-table-column>
      <el-table-column prop="maintenance_name" label="处理人" width="80" />
      <el-table-column prop="deadline" label="整改期限" width="110" />
      <el-table-column label="操作" width="200">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="openFlowDialog(row)">流程跟踪</el-button>
          <el-button v-if="row.hazard_status === 1" type="text" size="small" @click="openReviewDialog(row)">审核派单</el-button>
          <el-button v-if="row.hazard_status === 2" type="text" size="small" @click="handleAccept(row)">接受任务</el-button>
          <el-button v-if="row.hazard_status === 3" type="text" size="small" @click="openHandleDialog(row)">提交处置</el-button>
          <el-button v-if="row.hazard_status === 4" type="text" size="small" @click="handleRecheck(row)">复核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, prev, pager, next" :total="total" :page-size="pageSize" :current-page.sync="currentPage" @current-change="fetchData" />

    <!-- Report Dialog -->
    <el-dialog title="隐患上报" :visible.sync="reportVisible" width="550px">
      <el-form ref="reportForm" :model="reportForm" :rules="reportRules" label-width="100px" size="small">
        <el-form-item label="关联器材" prop="equipment_id">
          <el-select v-model="reportForm.equipment_id" filterable clearable placeholder="请选择关联器材" style="width:100%">
            <el-option v-for="eq in equipmentOptions" :key="eq.id" :label="eq.name + ' (' + eq.equipment_code + ')'" :value="eq.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="所在楼栋">
          <el-input v-model="reportForm.location_building" placeholder="如：1号教学楼" />
        </el-form-item>
        <el-form-item label="具体位置">
          <el-input v-model="reportForm.location_room" placeholder="如：302教室走廊" />
        </el-form-item>
        <el-form-item label="隐患描述" prop="hazard_desc">
          <el-input v-model="reportForm.hazard_desc" type="textarea" :rows="3" placeholder="请描述隐患情况" />
        </el-form-item>
        <el-form-item label="等级" prop="hazard_level">
          <el-select v-model="reportForm.hazard_level" style="width:100%">
            <el-option v-for="(v, k) in HAZARD_LEVEL" :key="k" :label="v.label" :value="Number(k)" />
          </el-select>
        </el-form-item>
        <el-form-item label="现场照片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :file-list="photoList"
            :on-change="handlePhotoChange"
            :on-remove="handlePhotoRemove"
            :limit="5"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <span style="font-size:12px;color:#909399;">支持随手拍上传，最多5张</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="reportVisible = false">取消</el-button>
        <el-button type="primary" :loading="reportLoading" @click="submitReport">提交上报</el-button>
      </div>
    </el-dialog>

    <!-- Review Dialog -->
    <el-dialog title="审核派单" :visible.sync="reviewVisible" width="500px">
      <el-form ref="reviewForm" :model="reviewForm" :rules="reviewRules" label-width="100px" size="small">
        <el-form-item label="审核意见" prop="review_opinion">
          <el-input v-model="reviewForm.review_opinion" type="textarea" :rows="3" placeholder="审核意见" />
        </el-form-item>
        <el-form-item label="整改时限" prop="deadline">
          <el-date-picker v-model="reviewForm.deadline" type="date" value-format="yyyy-MM-dd" placeholder="选择整改截止日期" style="width:100%" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button type="primary" :loading="reviewLoading" @click="submitReview">审核通过并派单</el-button>
      </div>
    </el-dialog>

    <!-- Handle Dialog -->
    <el-dialog title="提交处置" :visible.sync="handleVisible" width="500px">
      <el-form ref="handleForm" :model="handleForm" :rules="handleRules" label-width="100px" size="small">
        <el-form-item label="处理措施" prop="measure">
          <el-input v-model="handleForm.measure" type="textarea" :rows="4" placeholder="请填写实际处理措施及处理结果" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="handleVisible = false">取消</el-button>
        <el-button type="primary" :loading="handleLoading" @click="submitHandle">提交复核</el-button>
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
          :color="item.color"
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
import { reportHazard, reviewHazard, acceptHazard, handleHazard, recheckHazard, getHazardList, getHazardStats, exportHazards } from '@/api/hazard'
import { getEquipmentList } from '@/api/equipment'

export default {
  name: 'Hazard',
  components: { StatCard, StatusTag },
  data() {
    return {
      HAZARD_LEVEL, HAZARD_STATUS,
      stats: { total: 0, by_status: [], by_level: [] },
      query: { hazard_level: '', hazard_status: '' },
      tableData: [], loading: false, total: 0, currentPage: 1, pageSize: 10,

      // Report
      reportVisible: false, reportLoading: false,
      reportForm: { equipment_id: '', location_building: '', location_room: '', hazard_desc: '', hazard_level: 1, hazard_photo: '' },
      reportRules: {
        equipment_id: [{ required: true, message: '请选择关联器材', trigger: 'change' }],
        hazard_desc: [{ required: true, message: '请描述隐患情况', trigger: 'blur' }],
        hazard_level: [{ required: true, message: '请选择等级', trigger: 'change' }]
      },
      photoList: [],
      equipmentOptions: [],

      // Review
      reviewVisible: false, reviewLoading: false,
      reviewForm: { id: '', review_opinion: '', deadline: '' },
      reviewRules: {
        review_opinion: [{ required: true, message: '请输入审核意见', trigger: 'blur' }],
        deadline: [{ required: true, message: '请选择整改时限', trigger: 'change' }]
      },

      // Handle
      handleVisible: false, handleLoading: false,
      handleForm: { id: '', measure: '' },
      handleRules: {
        measure: [{ required: true, message: '请填写处理措施及结果', trigger: 'blur' }]
      },

      // Flow
      flowVisible: false, flowData: []
    }
  },
  computed: {
    statsByStatus() {
      const map = {}
      this.stats.by_status.forEach(s => { map[s.status] = s.count })
      return map
    }
  },
  created() {
    this.fetchStats()
    this.fetchData()
    this.fetchEquipment()
  },
  methods: {
    async fetchStats() {
      try {
        const res = await getHazardStats()
        this.stats = res.data
      } catch (e) { /* ignore */ }
    },
    async fetchData() {
      this.loading = true
      try {
        const params = { pageNum: this.currentPage, pageSize: this.pageSize }
        if (this.query.hazard_level) params.hazard_level = this.query.hazard_level
        if (this.query.hazard_status) params.hazard_status = this.query.hazard_status
        const res = await getHazardList(params)
        this.tableData = res.data.list
        this.total = res.data.total
      } catch (e) {
        this.$message.error('获取数据失败')
      }
      this.loading = false
    },
    async fetchEquipment() {
      try {
        const res = await getEquipmentList({ page: 1, pageSize: 200 })
        this.equipmentOptions = res.data.list || []
      } catch (e) { /* ignore */ }
    },
    handleQuery() {
      this.currentPage = 1
      this.fetchData()
    },
    async handleExport() {
      try {
        await exportHazards(this.query)
        this.$message.success('导出请求已提交，文件下载中')
      } catch (e) {
        this.$message.error('导出失败')
      }
    },
    getLevelTag(level) {
      return HAZARD_LEVEL[level] || { label: '未知', color: 'info' }
    },
    getStatusTag(status) {
      return HAZARD_STATUS[status] || { label: '未知', color: 'info' }
    },

    // ─── Report ───
    openReportDialog() {
      this.reportForm = { equipment_id: '', location_building: '', location_room: '', hazard_desc: '', hazard_level: 1, hazard_photo: '' }
      this.photoList = []
      this.reportVisible = true
    },
    handlePhotoChange(file) {
      this.photoList.push(file)
    },
    handlePhotoRemove(file) {
      const idx = this.photoList.findIndex(f => f.uid === file.uid)
      if (idx > -1) this.photoList.splice(idx, 1)
    },
    async submitReport() {
      this.$refs.reportForm.validate(async (valid) => {
        if (!valid) return
        this.reportLoading = true
        try {
          await reportHazard(this.reportForm)
          this.$message.success('上报成功')
          this.reportVisible = false
          this.fetchData()
          this.fetchStats()
        } catch (e) {
          this.$message.error('上报失败')
        }
        this.reportLoading = false
      })
    },

    // ─── Review ───
    openReviewDialog(row) {
      this.reviewForm = { id: row.id, review_opinion: '', deadline: '' }
      this.reviewVisible = true
    },
    async submitReview() {
      this.$refs.reviewForm.validate(async (valid) => {
        if (!valid) return
        this.reviewLoading = true
        try {
          const res = await reviewHazard(this.reviewForm.id, {
            review_opinion: this.reviewForm.review_opinion,
            deadline: this.reviewForm.deadline
          })
          this.$message.success(res.msg || '审核通过，已派单')
          this.reviewVisible = false
          this.fetchData()
          this.fetchStats()
        } catch (e) {
          this.$message.error('操作失败')
        }
        this.reviewLoading = false
      })
    },

    // ─── Accept ───
    async handleAccept(row) {
      try {
        await this.$confirm('确认接受该隐患处置任务吗？', '接受任务', {
          confirmButtonText: '确认接受',
          cancelButtonText: '取消',
          type: 'info'
        })
        const res = await acceptHazard(row.id)
        this.$message.success(res.msg || '任务已接受')
        this.fetchData()
        this.fetchStats()
      } catch (e) {
        if (e !== 'cancel') this.$message.error('操作失败')
      }
    },

    // ─── Handle ───
    openHandleDialog(row) {
      this.handleForm = { id: row.id, measure: '' }
      this.handleVisible = true
    },
    async submitHandle() {
      this.$refs.handleForm.validate(async (valid) => {
        if (!valid) return
        this.handleLoading = true
        try {
          const res = await handleHazard(this.handleForm.id, {
            measure: this.handleForm.measure
          })
          this.$message.success(res.msg || '处置完成，已提交复核')
          this.handleVisible = false
          this.fetchData()
          this.fetchStats()
        } catch (e) {
          this.$message.error('操作失败')
        }
        this.handleLoading = false
      })
    },

    // ─── Recheck ───
    async handleRecheck(row) {
      try {
        await this.$confirm('确认该隐患处置已通过复核验收吗？', '复核确认', {
          confirmButtonText: '通过归档',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const res = await recheckHazard(row.id)
        this.$message.success(res.msg || '复核通过，已归档')
        this.fetchData()
        this.fetchStats()
      } catch (e) {
        if (e !== 'cancel') this.$message.error('操作失败')
      }
    },

    // ─── Flow ───
    openFlowDialog(row) {
      const items = []
      const status = row.hazard_status
      items.push({
        step: '上报', operator: row.reporter_name, time: row.report_time,
        remark: row.hazard_desc, color: '#1677ff'
      })
      if (status >= 2) {
        items.push({
          step: '审核派单', operator: '安全管理员', time: row.deadline || '-',
          remark: (row.review_opinion || '已审核') + '，指派：' + (row.maintenance_name || '待定'),
          color: '#faad14'
        })
      }
      if (status >= 3) {
        items.push({
          step: '接受任务', operator: row.maintenance_name || '-', time: '-',
          remark: '维保人员已接受任务',
          color: '#1677ff'
        })
      }
      if (status >= 4) {
        items.push({
          step: '处置完成', operator: row.maintenance_name || '-', time: '-',
          remark: row.measure || '已提交处置措施',
          color: '#faad14'
        })
      }
      if (status >= 5) {
        items.push({
          step: '复核归档', operator: '复核人', time: '-',
          remark: '复核通过，隐患已归档',
          color: '#52c41a'
        })
      }
      this.flowData = items
      this.flowVisible = true
    }
  }
}
</script>
