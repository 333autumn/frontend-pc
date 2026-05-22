<template>
  <el-card class="stat-card" shadow="never">
    <div class="stat-card-content">
      <div class="stat-left">
        <div class="stat-label">{{ label }}</div>
        <div class="stat-value">
          <span class="stat-number">{{ value }}</span>
          <span v-if="unit" class="stat-unit">{{ unit }}</span>
        </div>
        <div v-if="subText" class="stat-sub">
          <i v-if="subIcon" :class="subIcon" :style="{ color: subColor }"></i>
          <span :style="{ color: subColor }">{{ subText }}</span>
          <el-tag v-if="tagLabel" :type="tagColor" size="mini">{{ tagLabel }}</el-tag>
        </div>
      </div>
      <div class="stat-right">
        <i :class="icon" :style="{ color: iconColor, fontSize: '48px', opacity: 0.15 }"></i>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    label: { type: String, default: '' },
    value: { type: [String, Number], default: 0 },
    unit: { type: String, default: '' },
    subText: { type: String, default: '' },
    subIcon: { type: String, default: '' },
    subColor: { type: String, default: '#52c41a' },
    icon: { type: String, default: 'el-icon-s-data' },
    iconColor: { type: String, default: '#1677ff' },
    tagLabel: { type: String, default: '' },
    tagColor: { type: String, default: 'warning' }
  }
}
</script>

<style scoped>
.stat-card {
  flex: 1;
  min-width: 220px;
}
.stat-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}
.stat-value {
  margin-bottom: 6px;
}
.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}
.stat-unit {
  font-size: 14px;
  color: #606266;
  margin-left: 4px;
}
.stat-sub {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.stat-right {
  flex-shrink: 0;
  margin-left: 16px;
}
</style>
