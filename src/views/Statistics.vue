<template>
  <div class="statistics-page" :style="themeStyle">
    <div class="stats-section">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="layui-icon layui-icon-group"></i>
          </div>
          <div class="stat-value">{{ totalUsers }}</div>
          <div class="stat-label">总用户数</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon admin">
            <i class="layui-icon layui-icon-user"></i>
          </div>
          <div class="stat-value">{{ adminCount }}</div>
          <div class="stat-label">管理员数</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon student">
            <i class="layui-icon layui-icon-user"></i>
          </div>
          <div class="stat-value">{{ studentCount }}</div>
          <div class="stat-label">学生用户</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon teacher">
            <i class="layui-icon layui-icon-user"></i>
          </div>
          <div class="stat-value">{{ teacherCount }}</div>
          <div class="stat-label">教师用户</div>
        </div>
      </div>
    </div>

    <div class="charts-section">
      <div class="section-title">用户类型分布</div>
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">饼状图</div>
          </div>
          <div class="chart-content-wrapper">
            <div ref="pieChartRef" class="chart-container"></div>
            <div class="chart-data-panel">
              <div class="data-item">
                <div class="data-color"
                  style="background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);">
                </div>
                <div class="data-info">
                  <div class="data-label">管理员</div>
                  <div class="data-value">{{ adminCount }}</div>
                </div>
                <div class="data-percentage">{{ totalUsers > 0 ? ((adminCount / totalUsers) * 100).toFixed(1) : 0 }}%
                </div>
              </div>
              <div class="data-item">
                <div class="data-color"
                  style="background: linear-gradient(135deg, var(--success-color, #0d9488) 0%, color-mix(in srgb, var(--success-color, #0d9488) 70%, white) 100%);">
                </div>
                <div class="data-info">
                  <div class="data-label">学生</div>
                  <div class="data-value">{{ studentCount }}</div>
                </div>
                <div class="data-percentage">{{ totalUsers > 0 ? ((studentCount / totalUsers) * 100).toFixed(1) : 0 }}%
                </div>
              </div>
              <div class="data-item">
                <div class="data-color"
                  style="background: linear-gradient(135deg, var(--warning-color, #fbbf24) 0%, color-mix(in srgb, var(--warning-color, #fbbf24) 70%, white) 100%);">
                </div>
                <div class="data-info">

                  <div class="data-value">{{ teacherCount }}</div>
                </div>
                <div class="data-percentage">{{ totalUsers > 0 ? ((teacherCount / totalUsers) * 100).toFixed(1) : 0 }}%
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">柱状图</div>
          </div>
          <div class="chart-content-wrapper">
            <div ref="barChartRef" class="chart-container"></div>
            <div class="chart-data-panel bar-data-panel">
              <div class="bar-data-item">
                <div class="bar-data-label">管理员</div>
                <div class="bar-data-value">{{ adminCount }}人</div>
                <div class="bar-data-bar">
                  <div class="bar-data-fill"
                    :style="{ width: totalUsers > 0 ? ((adminCount / totalUsers) * 100) + '%' : '0%', background: 'linear-gradient(90deg, var(--primary-color, #1e4d7b), var(--primary-light, #3d7ab5))' }">
                  </div>
                </div>
              </div>
              <div class="bar-data-item">
                <div class="bar-data-label">学生</div>
                <div class="bar-data-value">{{ studentCount }}人</div>
                <div class="bar-data-bar">
                  <div class="bar-data-fill"
                    :style="{ width: totalUsers > 0 ? ((studentCount / totalUsers) * 100) + '%' : '0%', background: 'linear-gradient(90deg, var(--success-color, #0d9488), color-mix(in srgb, var(--success-color, #0d9488) 70%, white))' }">
                  </div>
                </div>
              </div>
              <div class="bar-data-item">
                <div class="bar-data-label">教师</div>
                <div class="bar-data-value">{{ teacherCount }}人</div>
                <div class="bar-data-bar">
                  <div class="bar-data-fill"
                    :style="{ width: totalUsers > 0 ? ((teacherCount / totalUsers) * 100) + '%' : '0%', background: 'linear-gradient(90deg, var(--warning-color, #fbbf24), color-mix(in srgb, var(--warning-color, #fbbf24) 70%, white))' }">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { useAppStore } from '@/stores/modules/app'
import { getStatistics } from '../api/user'

const appStore = useAppStore()
const pieChartRef = ref(null)
const barChartRef = ref(null)
let pieChart = null
let barChart = null

const totalUsers = ref(0)
const adminCount = ref(0)
const studentCount = ref(0)
const teacherCount = ref(0)

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
  '--success-color': appStore.success,
  '--warning-color': appStore.warning,
  '--text-primary': appStore.textPrimary,
  '--text-secondary': appStore.textSecondary,
  '--text-muted': appStore.textMuted,
  '--surface-tint': appStore.surfaceTint,
}))

const fetchStatistics = async () => {
  try {
    const res = await getStatistics()
    totalUsers.value = res.data.total
    adminCount.value = res.data.adminCount
    studentCount.value = res.data.studentCount
    teacherCount.value = res.data.teacherCount
    updateCharts()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const initCharts = () => {
  // 初始化饼图
  if (pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
  }
  // 初始化柱状图
  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value)
  }
  updateCharts()
}

const updateCharts = () => {
  if (pieChart) {
    pieChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '10%',
        top: 'center',
      },
      series: [
        {
          name: '用户类型',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 18,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: adminCount.value, name: '管理员', itemStyle: { color: appStore.primary } },
            { value: studentCount.value, name: '学生', itemStyle: { color: appStore.success } },
            { value: teacherCount.value, name: '教师', itemStyle: { color: appStore.warning } },
          ],
        },
      ],
    })
  }

  if (barChart) {
    const maxValue = Math.max(adminCount.value, studentCount.value, teacherCount.value) + 2
    barChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: ['管理员', '学生', '教师'],
        axisLabel: {
          fontSize: 14,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: maxValue > 0 ? maxValue : 6,
        interval: maxValue > 0 ? Math.ceil(maxValue / 5) : 1,
      },
      series: [
        {
          name: '用户数',
          type: 'bar',
          barWidth: '50%',
          data: [
            { value: adminCount.value, itemStyle: { color: appStore.primary, borderRadius: [6, 6, 0, 0] } },
            { value: studentCount.value, itemStyle: { color: appStore.success, borderRadius: [6, 6, 0, 0] } },
            { value: teacherCount.value, itemStyle: { color: appStore.warning, borderRadius: [6, 6, 0, 0] } },
          ],
        },
      ],
    })
  }
}

const handleResize = () => {
  pieChart?.resize()
  barChart?.resize()
}

watch([totalUsers, adminCount, studentCount, teacherCount], () => {
  updateCharts()
})

onMounted(() => {
  fetchStatistics()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  barChart?.dispose()
})
</script>

<style scoped>
.statistics-page {
  padding: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary, #475569);
}

.stats-section {
  margin-bottom: 24px;
}

.stats-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  min-width: 220px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
}

.stat-icon.admin {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
}

.stat-icon.student {
  background: linear-gradient(135deg, var(--success-color, #0d9488) 0%, color-mix(in srgb, var(--success-color, #0d9488) 70%, white) 100%);
}

.stat-icon.teacher {
  background: linear-gradient(135deg, var(--warning-color, #fbbf24) 0%, color-mix(in srgb, var(--warning-color, #fbbf24) 70%, white) 100%);
}

.stat-value {
  font-size: 40px;
  font-weight: 700;
  color: var(--text-primary, #334155);
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
}

.charts-section {
  margin-bottom: 24px;
}

.charts-row {
  display: flex;
  gap: 20px;
}

.chart-card {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #475569);
}

.chart-content-wrapper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.chart-container {
  flex: 1;
  height: 300px;
  min-width: 0;
}

.chart-data-panel {
  width: 180px;
  background: var(--surface-tint, #f8fafc);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.data-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.data-color {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
}

.data-info {
  flex: 1;
}

.data-label {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
  margin-bottom: 4px;
}

.data-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #334155);
}

.data-percentage {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  min-width: 50px;
  text-align: right;
}

.bar-data-panel {
  width: 220px;
  gap: 20px;
}

.bar-data-item {
  background: #fff;
  padding: 14px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.bar-data-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.bar-data-label {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
  margin-bottom: 6px;
}

.bar-data-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #334155);
  margin-bottom: 10px;
}

.bar-data-bar {
  height: 8px;
  background: color-mix(in srgb, var(--surface-tint, #f8fafc) 50%, transparent);
  border-radius: 4px;
  overflow: hidden;
}

.bar-data-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
}

@media (max-width: 900px) {
  .charts-row {
    flex-direction: column;
  }

  .chart-content-wrapper {
    flex-direction: column;
  }

  .chart-data-panel,
  .bar-data-panel {
    width: 100%;
  }

  .chart-container {
    height: 250px;
  }
}
</style>
