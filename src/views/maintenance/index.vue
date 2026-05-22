<template>
  <div class="page-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="维保计划" name="plan">
        <MaintenancePlanTab />
      </el-tab-pane>
      <el-tab-pane label="维保记录" name="record">
        <MaintenanceRecordTab />
      </el-tab-pane>
      <el-tab-pane label="报废管理" name="scrap">
        <ScrapManagementTab />
      </el-tab-pane>
      <el-tab-pane label="器材更换与调拨" name="transfer">
        <TransferTab />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import MaintenancePlanTab from './MaintenancePlanTab.vue'
import MaintenanceRecordTab from './MaintenanceRecordTab.vue'
import ScrapManagementTab from './ScrapManagementTab.vue'
import TransferTab from './TransferTab.vue'

export default {
  name: 'Maintenance',
  components: { MaintenancePlanTab, MaintenanceRecordTab, ScrapManagementTab, TransferTab },
  data() { return { activeTab: 'plan' } }
}
</script>
