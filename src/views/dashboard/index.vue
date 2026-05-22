<template>
  <div class="page-container">
    <!-- Date filter -->
    <div class="search-bar">
      <el-form :inline="true" size="small">
        <el-form-item label="统计日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询统计</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Stat cards -->
    <div class="stat-card-row">
      <StatCard
        label="器材总数"
        :value="stats.equipmentTotal"
        unit="件"
        sub-text="环比上月 +5.2%"
        sub-icon="el-icon-top"
        sub-color="#52c41a"
        icon="el-icon-s-data"
        icon-color="#1677ff"
      />
      <StatCard
        label="待处理告警"
        :value="stats.pendingAlerts"
        unit="条"
        sub-text="较昨日 -3.1%"
        sub-icon="el-icon-bottom"
        sub-color="#ff4d4f"
        icon="el-icon-warning"
        icon-color="#ff4d4f"
      />
      <StatCard
        label="月度巡检完成率"
        :value="stats.inspectionRate"
        unit="%"
        :sub-text="'目标 ' + stats.inspectionTarget + '%'"
        icon="el-icon-document-checked"
        icon-color="#1677ff"
        :tag-label="stats.inspectionStatus"
        tag-color="warning"
      />
      <StatCard
        label="即将过期器材"
        :value="stats.expiringCount"
        unit="件"
        :sub-text="'未来 ' + stats.expiringDays + ' 天内'"
        icon="el-icon-timer"
        icon-color="#faad14"
        :tag-label="stats.expiringLevel"
        tag-color="danger"
      />
    </div>

    <!-- Charts grid -->
    <div class="chart-grid">
      <div class="chart-panel">
        <div class="chart-title">器材类型分布</div>
        <div class="chart-body" ref="equipmentChart"></div>
      </div>
      <div class="chart-panel">
        <div class="chart-title">近6个月巡检完成趋势</div>
        <div class="chart-body" ref="trendChart"></div>
      </div>
      <div class="chart-panel">
        <div class="chart-title">各区域器材分布</div>
        <div class="chart-body" ref="areaChart"></div>
      </div>
      <div class="chart-panel">
        <div class="chart-title">告警分类统计</div>
        <div class="chart-body" ref="alertChart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import StatCard from '@/components/StatCard.vue'
import * as echarts from 'echarts'
import { getDashboardStats, getEquipmentDistribution, getInspectionTrend, getAreaDistribution, getAlertCategories } from '@/api/dashboard'

export default {
  name: 'Dashboard',
  components: { StatCard },
  data() {
    return {
      dateRange: ['2025-01-01', '2025-05-18'],
      stats: {
        equipmentTotal: 0, pendingAlerts: 0, inspectionRate: 0,
        inspectionTarget: 95, inspectionStatus: '', expiringCount: 0,
        expiringDays: 7, expiringLevel: ''
      },
      charts: {}
    }
  },
  mounted() {
    this.fetchData()
  },
  beforeDestroy() {
    Object.values(this.charts).forEach(chart => chart && chart.dispose())
  },
  methods: {
    async fetchData() {
      try {
        const [statsRes, equipRes, trendRes, areaRes, alertRes] = await Promise.all([
          getDashboardStats(), getEquipmentDistribution(),
          getInspectionTrend(), getAreaDistribution(), getAlertCategories()
        ])
        this.stats = statsRes.data
        this.$nextTick(() => {
          this.renderEquipmentChart(equipRes.data)
          this.renderTrendChart(trendRes.data)
          this.renderAreaChart(areaRes.data)
          this.renderAlertChart(alertRes.data)
        })
      } catch (e) {
        this.$message.error('获取数据失败')
      }
    },
    renderEquipmentChart(data) {
      if (this.charts.equipment) this.charts.equipment.dispose()
      const chart = echarts.init(this.$refs.equipmentChart)
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 12 } },
        series: [{
          type: 'pie', radius: ['55%', '75%'], center: ['40%', '50%'],
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
          data: data
        }]
      })
      this.charts.equipment = chart
    },
    renderTrendChart(data) {
      if (this.charts.trend) this.charts.trend.dispose()
      const chart = echarts.init(this.$refs.trendChart)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['已完成', '计划'], bottom: 0 },
        grid: { left: 40, right: 20, top: 20, bottom: 44 },
        xAxis: { type: 'category', data: data.months, boundaryGap: false },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
        series: [
          { name: '已完成', type: 'line', data: data.completed, smooth: true,
            lineStyle: { color: '#1677ff', width: 3 }, areaStyle: { color: 'rgba(22,119,255,0.1)' },
            itemStyle: { color: '#1677ff' } },
          { name: '计划', type: 'line', data: data.total, smooth: true,
            lineStyle: { color: '#91cc75', width: 2, type: 'dashed' },
            itemStyle: { color: '#91cc75' } }
        ]
      })
      this.charts.trend = chart
    },
    renderAreaChart(data) {
      if (this.charts.area) this.charts.area.dispose()
      const chart = echarts.init(this.$refs.areaChart)
      chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 100, right: 30, top: 10, bottom: 20 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: data.map(d => d.area).reverse(), axisLabel: { fontSize: 11 } },
        series: [{
          type: 'bar', data: data.map(d => d.count).reverse(),
          itemStyle: { color: '#1677ff', borderRadius: [0, 4, 4, 0] },
          barMaxWidth: 20
        }]
      })
      this.charts.area = chart
    },
    renderAlertChart(data) {
      if (this.charts.alert) this.charts.alert.dispose()
      const chart = echarts.init(this.$refs.alertChart)
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, textStyle: { fontSize: 12 } },
        series: [{
          type: 'pie', radius: ['55%', '75%'], center: ['50%', '45%'],
          label: { show: true, formatter: '{b}\n{d}%' },
          data: data,
          itemStyle: {
            color: function(params) {
              const colors = ['#ff4d4f', '#faad14', '#1677ff', '#ff7a45']
              return colors[params.dataIndex]
            }
          }
        }]
      })
      this.charts.alert = chart
    }
  }
}
</script>
