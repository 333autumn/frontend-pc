<template>
  <div>
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-plus" @click="openForm()">新增记录</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" stripe border>
      <el-table-column prop="transferNo" label="编号" width="130" />
      <el-table-column label="类型" width="80">
        <template slot-scope="{ row }">
          <StatusTag v-bind="getTypeTag(row.type)" />
        </template>
      </el-table-column>
      <el-table-column prop="equipmentName" label="器材名称" min-width="150" />
      <el-table-column prop="equipmentCode" label="器材编号" width="120" />
      <el-table-column prop="quantity" label="数量" width="60" />
      <el-table-column label="位置" min-width="200">
        <template slot-scope="{ row }">
          <template v-if="row.type === '调拨'">
            {{ row.fromBuilding }}-{{ row.fromFloor }}-{{ row.fromRoom }} → {{ row.toBuilding }}-{{ row.toFloor }}-{{ row.toRoom }}
          </template>
          <template v-else-if="row.type === '入库'">
            {{ row.toBuilding }}-{{ row.toFloor }}-{{ row.toRoom }}
          </template>
          <template v-else-if="row.type === '出库'">
            {{ row.fromBuilding }}-{{ row.fromFloor }}-{{ row.fromRoom }}
          </template>
          <template v-else>
            {{ row.fromBuilding }}-{{ row.fromFloor }}-{{ row.fromRoom }}
          </template>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" size="small" @click="openForm(row)">编辑</el-button>
          <el-button type="text" size="small" style="color:#ff4d4f" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="total, prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page.sync="currentPage"
      @current-change="fetchData"
    />

    <el-dialog
      :title="isEdit ? '编辑记录' : '新增记录'"
      :visible.sync="dialogVisible"
      width="600px"
      @closed="resetForm"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="small">
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width:100%" @change="onTypeChange">
            <el-option v-for="(v, k) in TRANSFER_TYPE" :key="k" :label="v.label" :value="v.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="器材名称" prop="equipmentName">
          <el-input v-model="form.equipmentName" placeholder="请输入器材名称" />
        </el-form-item>
        <el-form-item label="器材编号" prop="equipmentCode">
          <el-input v-model="form.equipmentCode" placeholder="请输入器材编号" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" :max="999" style="width:100%" />
        </el-form-item>

        <!-- 更换: single location -->
        <template v-if="form.type === '更换'">
          <el-form-item label="楼栋" prop="fromBuilding">
            <el-input v-model="form.fromBuilding" placeholder="例如：1号教学楼" />
          </el-form-item>
          <el-form-item label="楼层" prop="fromFloor">
            <el-input v-model="form.fromFloor" placeholder="例如：3层" />
          </el-form-item>
          <el-form-item label="房间" prop="fromRoom">
            <el-input v-model="form.fromRoom" placeholder="例如：302教室" />
          </el-form-item>
        </template>

        <!-- 调拨: from + to locations -->
        <template v-if="form.type === '调拨'">
          <el-form-item label="来源楼栋" prop="fromBuilding">
            <el-input v-model="form.fromBuilding" placeholder="例如：1号教学楼" />
          </el-form-item>
          <el-form-item label="来源楼层" prop="fromFloor">
            <el-input v-model="form.fromFloor" placeholder="例如：3层" />
          </el-form-item>
          <el-form-item label="来源房间" prop="fromRoom">
            <el-input v-model="form.fromRoom" placeholder="例如：302教室" />
          </el-form-item>
          <el-form-item label="目标楼栋" prop="toBuilding">
            <el-input v-model="form.toBuilding" placeholder="例如：2号教学楼" />
          </el-form-item>
          <el-form-item label="目标楼层" prop="toFloor">
            <el-input v-model="form.toFloor" placeholder="例如：2层" />
          </el-form-item>
          <el-form-item label="目标房间" prop="toRoom">
            <el-input v-model="form.toRoom" placeholder="例如：201室" />
          </el-form-item>
        </template>

        <!-- 入库: target location only -->
        <template v-if="form.type === '入库'">
          <el-form-item label="目标楼栋" prop="toBuilding">
            <el-input v-model="form.toBuilding" placeholder="例如：2号教学楼" />
          </el-form-item>
          <el-form-item label="目标楼层" prop="toFloor">
            <el-input v-model="form.toFloor" placeholder="例如：2层" />
          </el-form-item>
          <el-form-item label="目标房间" prop="toRoom">
            <el-input v-model="form.toRoom" placeholder="例如：201室" />
          </el-form-item>
        </template>

        <!-- 出库: source location only -->
        <template v-if="form.type === '出库'">
          <el-form-item label="来源楼栋" prop="fromBuilding">
            <el-input v-model="form.fromBuilding" placeholder="例如：1号教学楼" />
          </el-form-item>
          <el-form-item label="来源楼层" prop="fromFloor">
            <el-input v-model="form.fromFloor" placeholder="例如：3层" />
          </el-form-item>
          <el-form-item label="来源房间" prop="fromRoom">
            <el-input v-model="form.fromRoom" placeholder="例如：302教室" />
          </el-form-item>
        </template>

        <el-form-item label="申请原因" prop="reason">
          <el-input v-model="form.reason" type="textarea" :rows="2" placeholder="请输入申请原因" />
        </el-form-item>
        <el-form-item label="执行人" prop="operator">
          <el-input v-model="form.operator" placeholder="请输入执行人" />
        </el-form-item>
        <el-form-item label="执行时间" prop="operateDate">
          <el-date-picker v-model="form.operateDate" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" style="width:100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="备注信息" />
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
import { TRANSFER_TYPE } from '@/utils/constants'
import { getTransferList, createTransfer, updateTransfer, deleteTransfer } from '@/api/maintenance'

const defaultForm = {
  type: '更换',
  equipmentName: '',
  equipmentCode: '',
  quantity: 1,
  fromBuilding: '',
  fromFloor: '',
  fromRoom: '',
  toBuilding: '',
  toFloor: '',
  toRoom: '',
  reason: '',
  operator: '',
  operateDate: '',
  remark: ''
}

export default {
  name: 'TransferTab',
  components: { StatusTag },
  data() {
    return {
      TRANSFER_TYPE,
      tableData: [],
      loading: false,
      total: 0,
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      isEdit: false,
      editId: null,
      form: { ...defaultForm },
      submitLoading: false,
      rules: {
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        equipmentName: [{ required: true, message: '请输入器材名称', trigger: 'blur' }],
        equipmentCode: [{ required: true, message: '请输入器材编号', trigger: 'blur' }],
        reason: [{ required: true, message: '请输入申请原因', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await getTransferList({
          page: this.currentPage,
          pageSize: this.pageSize
        })
        this.tableData = res.data.list
        this.total = res.data.total
      } catch (e) {
        this.$message.error('获取数据失败')
      }
      this.loading = false
    },
    getTypeTag(type) {
      const map = {
        '更换': { label: '更换', color: 'primary' },
        '调拨': { label: '调拨', color: 'warning' },
        '入库': { label: '入库', color: 'success' },
        '出库': { label: '出库', color: 'info' }
      }
      return map[type] || { label: type, color: 'info' }
    },
    onTypeChange() {
      this.form.fromBuilding = ''
      this.form.fromFloor = ''
      this.form.fromRoom = ''
      this.form.toBuilding = ''
      this.form.toFloor = ''
      this.form.toRoom = ''
    },
    openForm(row) {
      this.dialogVisible = true
      if (row) {
        this.isEdit = true
        this.editId = row.id
        this.form = {
          type: row.type,
          equipmentName: row.equipmentName,
          equipmentCode: row.equipmentCode,
          quantity: row.quantity,
          fromBuilding: row.fromBuilding,
          fromFloor: row.fromFloor,
          fromRoom: row.fromRoom,
          toBuilding: row.toBuilding,
          toFloor: row.toFloor,
          toRoom: row.toRoom,
          reason: row.reason,
          operator: row.operator,
          operateDate: row.operateDate,
          remark: row.remark
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
          const data = { ...this.form }
          if (data.type === '更换') {
            data.toBuilding = data.fromBuilding
            data.toFloor = data.fromFloor
            data.toRoom = data.fromRoom
          }
          if (this.isEdit) {
            await updateTransfer(this.editId, data)
            this.$message.success('更新成功')
          } else {
            await createTransfer(data)
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
      this.$confirm('确定删除记录 ' + row.transferNo + ' 吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteTransfer(row.id)
          this.$message.success('删除成功')
          this.fetchData()
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    }
  }
}
</script>
