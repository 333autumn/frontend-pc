<template>
  <div class="page-container">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="实时预警" name="realtime">
        <RealtimeWarningTab />
      </el-tab-pane>
      <el-tab-pane label="预警规则设置" name="rule">
        <WarningRuleTab />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import RealtimeWarningTab from './RealtimeWarningTab.vue'
import WarningRuleTab from './WarningRuleTab.vue'

export default {
  name: 'Warning',
  components: { RealtimeWarningTab, WarningRuleTab },
  data() { return { activeTab: 'realtime' } }
}
</script>
