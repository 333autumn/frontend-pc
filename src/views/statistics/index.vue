<template>
  <div class="page-container">
    <div class="search-bar">
      <el-form :inline="true" size="small">
        <el-form-item label="统计周期">
          <el-select v-model="period" placeholder="选择周期">
            <el-option label="本月" value="month" />
            <el-option label="本季度" value="quarter" />
            <el-option label="本年度" value="year" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button icon="el-icon-download">导出报表</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="chart-grid">
      <div class="chart-panel">
        <div class="chart-title">器材状态分布</div>
        <div class="chart-body" ref="statusChart"></div>
      </div>
      <div class="chart-panel">
        <div class="chart-title">各校区器材数量统计</div>
        <div class="chart-body" ref="campusChart"></div>
      </div>
      <div class="chart-panel">
        <div class="chart-title">月度隐患趋势</div>
        <div class="chart-body" ref="hazardTrendChart"></div>
      </div>
      <div class="chart-panel">
        <div class="chart-title">巡检合规率</div>
        <div class="chart-body" ref="complianceChart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Statistics',
  data() {
    return { period: 'month', charts: {} }
  },
  mounted() { this.renderCharts() },
  beforeDestroy() {
    Object.values(this.charts).forEach(c => c && c.dispose())
  },
  methods: {
    renderCharts() {
      this.$nextTick(() => {
        this.renderStatusChart()
        this.renderCampusChart()
        this.renderHazardTrendChart()
        this.renderComplianceChart()
      })
    },
    renderStatusChart() {
      const chart = echarts.init(this.$refs.statusChart)
      chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [{
          type: 'pie', radius: ['40%', '65%'], center: ['50%', '45%'],
          data: [
            { value: 980, name: '正常', itemStyle: { color: '#52c41a' } },
            { value: 150, name: '待维保', itemStyle: { color: '#faad14' } },
            { value: 100, name: '已报废', itemStyle: { color: '#909399' } }
          ]
        }]
      })
      this.charts.status = chart
    },
    renderCampusChart() {
      const chart = echarts.init(this.$refs.campusChart)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 30, right: 20, top: 10, bottom: 20 },
        xAxis: { type: 'category', data: ['教学楼A', '教学楼B', '图书馆', '综合楼', '实验楼', '宿舍区', '行政楼', '体育馆'] },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [180, 150, 140, 130, 120, 210, 90, 80], itemStyle: { color: '#1677ff', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 30 }]
      })
      this.charts.campus = chart
    },
    renderHazardTrendChart() {
      const chart = echarts.init(this.$refs.hazardTrendChart)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['上报', '已处理'], bottom: 0 },
        grid: { left: 40, right: 20, top: 20, bottom: 30 },
        xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
        yAxis: { type: 'value' },
        series: [
          { name: '上报', type: 'line', data: [8, 12, 10, 15, 9, 7], smooth: true, itemStyle: { color: '#ff4d4f' } },
          { name: '已处理', type: 'line', data: [6, 10, 9, 14, 8, 6], smooth: true, itemStyle: { color: '#52c41a' } }
        ]
      })
      this.charts.hazardTrend = chart
    },
    renderComplianceChart() {
      const chart = echarts.init(this.$refs.complianceChart)
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
        series: [{
          type: 'gauge',
          startAngle: 210, endAngle: -30,
          min: 0, max: 100,
          pointer: { show: false },
          progress: { show: true, width: 18, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, colorStops: [{ offset: 0, color: '#ff4d4f' }, { offset: 0.5, color: '#faad14' }, { offset: 1, color: '#52c41a' }] } } },
          axisLine: { lineStyle: { width: 18, color: [[1, '#f0f0f0']] } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: { fontSize: 28, fontWeight: 'bold', offsetCenter: [0, '40%'], formatter: '{value}%' },
          data: [{ value: 92.5 }]
        }]
      })
      this.charts.compliance = chart
    }
  }
}
</script>
