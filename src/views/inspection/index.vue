<template>
  <div class="page-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="巡检计划" name="plan">
        <InspectionPlanTab />
      </el-tab-pane>
      <el-tab-pane label="巡检记录" name="record">
        <InspectionRecordTab />
      </el-tab-pane>
      <el-tab-pane label="数据导入" name="import">
        <DataImportTab />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import InspectionPlanTab from './InspectionPlanTab.vue'
import InspectionRecordTab from './InspectionRecordTab.vue'
import DataImportTab from './DataImportTab.vue'

export default {
  name: 'Inspection',
  components: { InspectionPlanTab, InspectionRecordTab, DataImportTab },
  data() {
    return { activeTab: 'plan' }
  }
}
</script>
