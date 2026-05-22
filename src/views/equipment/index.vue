<template>
  <div class="page-container">
    <!-- Search -->
    <div class="search-bar">
      <el-form :inline="true" :model="query" size="small">
        <el-form-item label="分类">
          <el-select v-model="query.category_id" placeholder="全部分类" clearable>
            <el-option v-for="c in categoryOptions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.equipment_status" placeholder="全部状态" clearable>
            <el-option v-for="(v, k) in EQUIPMENT_STATUS" :key="k" :label="v.label" :value="v.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="编号">
          <el-input v-model="query.equipment_code" placeholder="输入器材编号" clearable />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="query.name" placeholder="输入器材名称" clearable />
        </el-form-item>
        <el-form-item label="位置">
          <el-popover
            v-model="locationPopoverVisible"
            placement="bottom-start"
            width="200"
            trigger="click"
            popper-class="location-popover-popper"
          >
            <div class="location-popover">
              <el-select v-model="query.location_building" placeholder="全部楼栋" clearable size="small" style="width:100%;margin-bottom:8px">
                <el-option v-for="b in buildingOptions" :key="b" :label="b" :value="b" />
              </el-select>
              <el-select v-model="query.location_floor" placeholder="全部楼层" clearable size="small" style="width:100%;margin-bottom:8px">
                <el-option v-for="f in floorOptions" :key="f" :label="f" :value="f" />
              </el-select>
              <el-select v-model="query.location_room" placeholder="全部房间" clearable size="small" style="width:100%;margin-bottom:8px">
                <el-option v-for="r in roomOptions" :key="r" :label="r" :value="r" />
              </el-select>
              <div style="text-align:right">
                <el-button type="primary" size="mini" @click="locationPopoverVisible = false">确定</el-button>
              </div>
            </div>
            <el-input
              slot="reference"
              :value="locationSummary"
              placeholder="输入位置"
              readonly
              style="cursor:pointer"
            >
              <i
                slot="suffix"
                class="el-input__icon"
                :class="locationSummary ? 'el-icon-circle-close' : 'el-icon-arrow-up'"
                :style="suffixIconStyle"
                @click.stop="onLocationIconClick"
              />
            </el-input>
          </el-popover>
        </el-form-item>
        <el-form-item label="责任人">
          <el-input v-model="query.responsible_person" placeholder="输入责任人" clearable />
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker
            v-model="query.expiryDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-plus" @click="openForm()">新增器材</el-button>
      <el-button type="success" icon="el-icon-upload2" @click="handleImport">批量导入</el-button>
      <el-button type="warning" icon="el-icon-download" @click="handleExport">导出Excel</el-button>
      <el-button icon="el-icon-printer" @click="handleQrPrint">二维码打印</el-button>
    </div>

    <!-- Table -->
    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="equipment_code" label="编号" width="120" />
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="category_name" label="分类" width="100" />
      <el-table-column label="配置位置" min-width="180">
        <template slot-scope="{ row }">
          {{ row.location_building }}-{{ row.location_floor }}-{{ row.location_room }}
        </template>
      </el-table-column>
      <el-table-column prop="responsible_person" label="责任人" width="80" />
      <el-table-column label="状态" width="80">
        <template slot-scope="{ row }">
          <StatusTag v-bind="getStatusTag(row.equipment_status_text)" />
        </template>
      </el-table-column>
      <el-table-column prop="expiry_date" label="有效期" width="110" />
      <el-table-column label="操作" width="140" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="openForm(row)">编辑</el-button>
          <el-button type="text" size="small" style="color: #ff4d4f" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination
      background
      layout="total, prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page.sync="currentPage"
      @current-change="fetchData"
    />

    <!-- Dialog -->
    <el-dialog
      :title="isEdit ? '编辑器材' : '新增器材'"
      :visible.sync="dialogVisible"
      width="600px"
      @closed="resetForm"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="small">
        <el-form-item label="器材名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入器材名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择分类" style="width:100%">
            <el-option v-for="c in categoryOptions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼栋" prop="location_building">
          <el-input v-model="form.location_building" placeholder="例如：1号教学楼" />
        </el-form-item>
        <el-form-item label="楼层" prop="location_floor">
          <el-input v-model="form.location_floor" placeholder="例如：3层" />
        </el-form-item>
        <el-form-item label="房间" prop="location_room">
          <el-input v-model="form.location_room" placeholder="例如：302教室" />
        </el-form-item>
        <el-form-item label="责任人" prop="responsible_person">
          <el-input v-model="form.responsible_person" placeholder="请输入责任人" />
        </el-form-item>
        <el-form-item label="状态" prop="equipment_status">
          <el-select v-model="form.equipment_status" placeholder="请选择状态" style="width:100%">
            <el-option v-for="(v, k) in EQUIPMENT_STATUS" :key="k" :label="v.label" :value="v.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期" prop="expiry_date">
          <el-date-picker v-model="form.expiry_date" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" style="width:100%" />
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
import StatusTag from '@/components/StatusTag.vue'
import { EQUIPMENT_STATUS, EQUIPMENT_CATEGORIES } from '@/utils/constants'
import { getEquipmentList, createEquipment, updateEquipment, deleteEquipment } from '@/api/equipment'

const defaultForm = {
  name: '',
  category_id: '',
  location_building: '',
  location_floor: '',
  location_room: '',
  responsible_person: '',
  equipment_status: 1,
  expiry_date: ''
}

const defaultQuery = {
  equipment_code: '',
  name: '',
  category_id: '',
  equipment_status: '',
  location_building: '',
  location_floor: '',
  location_room: '',
  responsible_person: '',
  expiryDateRange: []
}

export default {
  name: 'Equipment',
  components: { StatusTag },
  data() {
    return {
      EQUIPMENT_STATUS,
      buildingOptions: ['1号教学楼', '2号教学楼', '图书馆', '综合楼', '实验楼', '学生宿舍1栋', '学生宿舍2栋', '行政楼', '体育馆', '食堂', '校医院'],
      floorOptions: ['1层', '2层', '3层', '4层', '5层', '地下1层'],
      roomOptions: ['101室', '102室', '201室', '202室', '301室', '302室', '走廊', '大厅', '主厅', '仓库'],
      query: { ...defaultQuery },
      tableData: [],
      loading: false,
      total: 0,
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      isEdit: false,
      editId: null,
      form: { ...defaultForm },
      locationPopoverVisible: false,
      submitLoading: false,
      rules: {
        name: [{ required: true, message: '请输入器材名称', trigger: 'blur' }],
        category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
        location_building: [{ required: true, message: '请输入楼栋', trigger: 'blur' }],
        location_floor: [{ required: true, message: '请输入楼层', trigger: 'blur' }],
        location_room: [{ required: true, message: '请输入房间', trigger: 'blur' }],
        responsible_person: [{ required: true, message: '请输入责任人', trigger: 'blur' }],
        equipment_status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  computed: {
    categoryOptions() {
      return EQUIPMENT_CATEGORIES.map((name, index) => ({ id: index + 1, name }))
    },
    suffixIconStyle() {
      return {
        color: '#c0c4cc',
        cursor: 'pointer',
        transform: (!this.locationPopoverVisible && !this.locationSummary) ? 'rotate(180deg)' : 'rotate(0deg)'
      }
    },
    locationSummary() {
      const parts = [this.query.location_building, this.query.location_floor, this.query.location_room].filter(Boolean)
      return parts.length ? parts.join('-') : ''
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await getEquipmentList({
          page: this.currentPage,
          limit: this.pageSize,
          sort: 'id',
          order: 'desc',
          equipment_code: this.query.equipment_code || undefined,
          name: this.query.name || undefined,
          category_id: this.query.category_id || undefined,
          equipment_status: this.query.equipment_status || undefined,
          location_building: this.query.location_building || undefined,
          location_floor: this.query.location_floor || undefined,
          location_room: this.query.location_room || undefined,
          responsible_person: this.query.responsible_person || undefined,
          expiry_start: this.query.expiryDateRange ? this.query.expiryDateRange[0] : undefined,
          expiry_end: this.query.expiryDateRange ? this.query.expiryDateRange[1] : undefined
        })
        this.tableData = res.data.list
        this.total = res.data.total
      } catch (e) {
        this.$message.error('获取器材列表失败')
      }
      this.loading = false
    },
    handleQuery() {
      this.currentPage = 1
      this.fetchData()
    },
    onLocationIconClick() {
      if (this.locationSummary) {
        this.clearLocation()
      } else {
        this.locationPopoverVisible = !this.locationPopoverVisible
      }
    },
    clearLocation() {
      this.query.location_building = ''
      this.query.location_floor = ''
      this.query.location_room = ''
    },
    handleReset() {
      this.query = { ...defaultQuery }
      this.handleQuery()
    },
    getStatusTag(statusText) {
      const map = {
        '正常': { label: '正常', color: 'success' },
        '待维保': { label: '待维保', color: 'warning' },
        '已报废': { label: '已报废', color: 'info' }
      }
      return map[statusText] || { label: statusText, color: 'info' }
    },
    openForm(row) {
      this.dialogVisible = true
      if (row) {
        this.isEdit = true
        this.editId = row.id
        this.form = {
          name: row.name,
          category_id: row.category_id,
          location_building: row.location_building,
          location_floor: row.location_floor,
          location_room: row.location_room,
          responsible_person: row.responsible_person,
          equipment_status: row.equipment_status,
          expiry_date: row.expiry_date
        }
      } else {
        this.isEdit = false
        this.editId = null
        this.form = { ...defaultForm }
      }
    },
    resetForm() {
      this.form = { ...defaultForm }
      this.isEdit = false
      this.editId = null
      if (this.$refs.form) this.$refs.form.resetFields()
    },
    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) return
        this.submitLoading = true
        try {
          if (this.isEdit) {
            await updateEquipment(this.editId, this.form)
            this.$message.success('更新成功')
          } else {
            await createEquipment(this.form)
            this.$message.success('新增成功')
          }
          this.dialogVisible = false
          this.fetchData()
        } catch (e) {
          this.$message.error('操作失败')
        }
        this.submitLoading = false
      })
    },
    handleDelete(row) {
      this.$confirm('确定删除器材 ' + row.equipment_code + ' 吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteEquipment(row.id)
          this.$message.success('删除成功')
          this.fetchData()
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    handleImport() {
      this.$message.info('批量导入功能开发中')
    },
    handleExport() {
      this.$message.info('导出Excel功能开发中')
    },
    handleQrPrint() {
      this.$message.info('二维码打印功能开发中')
    }
  }
}
</script>

<style>
.location-popover-popper[x-placement^="bottom"] .popper__arrow {
  left: 32px !important;
}
</style>
