<template>
  <div class="dashboard-page" :style="themeStyle">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">数据看板</h1>
        <p class="page-desc">自定义数据可视化与分析</p>
      </div>
      <div class="header-actions">
        <button class="export-btn" @click="exportData">
          <i class="layui-icon layui-icon-download"></i>
          导出数据
        </button>
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-card">
        <div class="filter-group">
          <span class="filter-label">时间范围</span>
          <div class="time-selector">
            <button v-for="option in timeOptions" :key="option.value" class="time-btn" :class="{ active: selectedTimeRange === option.value }" @click="selectedTimeRange = option.value">
              {{ option.label }}
            </button>
          </div>
          <div v-if="selectedTimeRange === 'custom'" class="custom-date">
            <input type="date" v-model="startDate" />
            <span class="date-separator">至</span>
            <input type="date" v-model="endDate" />
          </div>
        </div>
      </div>
    </div>

    <div class="content-row">
      <div class="left-panel">
        <div class="selector-card">
          <div class="card-header">
            <span class="card-title">数据选择器</span>
          </div>
          <div class="data-selector">
            <div v-for="dimension in dataDimensions" :key="dimension.key" class="dimension-item">
              <div class="dimension-header" @click="toggleDimension(dimension.key)">
                <i class="layui-icon" :class="expandedDimensions.includes(dimension.key) ? 'layui-icon-down' : 'layui-icon-right'"></i>
                <span class="dimension-name">{{ dimension.name }}</span>
                <span class="dimension-count">{{ getSelectedIndicators(dimension.key).length }}/{{ dimension.indicators.length }}</span>
              </div>
              <div class="indicator-list" :class="{ collapsed: !expandedDimensions.includes(dimension.key) }">
                <label v-for="indicator in dimension.indicators" :key="indicator.key" class="indicator-item">
                  <input type="checkbox" :checked="isIndicatorSelected(dimension.key, indicator.key)" @change="toggleIndicator(dimension.key, indicator.key)" />
                  <span>{{ indicator.name }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-type-card">
          <div class="card-header">
            <span class="card-title">图表类型</span>
          </div>
          <div class="chart-type-grid">
            <button v-for="type in chartTypes" :key="type.value" class="chart-type-btn" :class="{ active: selectedChartType === type.value }" @click="selectedChartType = type.value">
              <i :class="type.icon"></i>
              <span>{{ type.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="widget-grid">
          <div v-for="widget in displayedWidgets" :key="widget.id" class="widget-card">
            <div class="widget-header">
              <span class="widget-title">{{ widget.title }}</span>
              <button class="widget-close" @click="removeWidget(widget.id)">
                <i class="layui-icon layui-icon-close"></i>
              </button>
            </div>
            <div class="widget-body">
              <div v-if="widget.chartType === 'card'" class="number-card">
                <div class="card-value">{{ widget.value }}</div>
                <div class="card-label">{{ widget.subtitle }}</div>
                <div v-if="widget.trend" class="card-trend" :class="widget.trend > 0 ? 'up' : 'down'">
                  {{ widget.trend > 0 ? '↑' : '↓' }} {{ Math.abs(widget.trend) }}%
                </div>
              </div>
              <div v-else-if="widget.chartType === 'bar'" class="bar-chart">
                <div v-for="(item, index) in widget.data" :key="index" class="bar-item">
                  <div class="bar-fill" :style="{ height: item.value + '%', background: widget.colors[index % widget.colors.length] }"></div>
                  <span class="bar-label">{{ item.label }}</span>
                </div>
              </div>
              <div v-else-if="widget.chartType === 'pie'" class="pie-chart">
                <svg viewBox="0 0 100 100" class="pie-svg">
                  <circle v-for="(segment, index) in widget.pieSegments" :key="index" cx="50" cy="50" r="40" fill="none" :stroke="widget.colors[index % widget.colors.length]" stroke-width="20" :stroke-dasharray="segment.dashArray" :stroke-dashoffset="segment.dashOffset" transform="rotate(-90 50 50)" />
                </svg>
                <div class="pie-legend">
                  <div v-for="(item, index) in widget.data" :key="index" class="legend-item">
                    <span class="legend-color" :style="{ background: widget.colors[index % widget.colors.length] }"></span>
                    <span class="legend-label">{{ item.label }}</span>
                    <span class="legend-value">{{ item.value }}%</span>
                  </div>
                </div>
              </div>
              <div v-else-if="widget.chartType === 'line'" class="line-chart">
                <svg viewBox="0 0 300 150" class="line-svg">
                  <path :d="widget.linePath" fill="none" stroke="var(--primary-color, #1e4d7b)" stroke-width="2" />
                  <circle v-for="(point, index) in widget.linePoints" :key="index" :cx="point.x" :cy="point.y" r="4" fill="var(--primary-color, #1e4d7b)" />
                </svg>
                <div class="line-labels">
                  <span v-for="(item, index) in widget.data" :key="index" class="line-label">{{ item.label }}</span>
                </div>
              </div>
              <div v-else-if="widget.chartType === 'ring'" class="ring-chart">
                <svg viewBox="0 0 100 100" class="ring-svg">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" stroke-width="8" />
                  <circle cx="50" cy="50" r="40" fill="none" :stroke="widget.colors[0]" stroke-width="8" :stroke-dasharray="251.2" :stroke-dashoffset="251.2 * (1 - widget.value / 100)" stroke-linecap="round" />
                </svg>
                <div class="ring-center">
                  <div class="ring-value">{{ widget.value }}%</div>
                  <div class="ring-label">完成率</div>
                </div>
              </div>
              <div v-else-if="widget.chartType === 'ranking'" class="ranking-list">
                <div v-for="(item, index) in widget.data" :key="index" class="ranking-item">
                  <span class="ranking-number" :class="{ top: index < 3 }">{{ index + 1 }}</span>
                  <div class="ranking-info">
                    <span class="ranking-name">{{ item.name }}</span>
                    <div class="ranking-bar">
                      <div class="ranking-fill" :style="{ width: item.value + '%' }"></div>
                    </div>
                  </div>
                  <span class="ranking-value">{{ item.count }}</span>
                </div>
              </div>
              <div v-else-if="widget.chartType === 'heatmap'" class="heatmap-calendar">
                <div class="heatmap-months">
                  <span v-for="month in widget.months" :key="month">{{ month }}</span>
                </div>
                <div class="heatmap-weekdays">
                  <span>一</span><span>三</span><span>五</span><span>日</span>
                </div>
                <div class="heatmap-grid">
                  <div v-for="(day, index) in widget.heatmapData" :key="index" class="heatmap-cell" :class="day.level"></div>
                </div>
                <div class="heatmap-legend">
                  <span>少</span>
                  <div class="legend-cells">
                    <div class="cell level-0"></div>
                    <div class="cell level-1"></div>
                    <div class="cell level-2"></div>
                    <div class="cell level-3"></div>
                    <div class="cell level-4"></div>
                  </div>
                  <span>多</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="displayedWidgets.length === 0" class="empty-state">
          <i class="layui-icon layui-icon-chart-screen"></i>
          <span>请选择数据指标来生成图表</span>
        </div>
      </div>
    </div>

    <div v-if="showExportModal" class="modal-overlay" @click.self="showExportModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">导出数据</span>
          <button class="modal-close" @click="showExportModal = false">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="export-options">
            <div class="export-option">
              <input type="radio" id="export-excel" v-model="exportFormat" value="excel" />
              <label for="export-excel">
                <i class="layui-icon layui-icon-file"></i>
                <span>Excel (.xlsx)</span>
              </label>
            </div>
            <div class="export-option">
              <input type="radio" id="export-csv" v-model="exportFormat" value="csv" />
              <label for="export-csv">
                <i class="layui-icon layui-icon-file"></i>
                <span>CSV (.csv)</span>
              </label>
            </div>
            <div class="export-option">
              <input type="radio" id="export-json" v-model="exportFormat" value="json" />
              <label for="export-json">
                <i class="layui-icon layui-icon-file"></i>
                <span>JSON (.json)</span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showExportModal = false">取消</button>
          <button class="btn-confirm" @click="confirmExport">确认导出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { layer } from '@layui/layui-vue'

const appStore = useAppStore()

const selectedTimeRange = ref('week')
const selectedChartType = ref('card')
const expandedDimensions = ref(['todo', 'goals', 'schedule'])
const showExportModal = ref(false)
const exportFormat = ref('excel')

const startDate = ref('')
const endDate = ref('')

const selectedIndicators = reactive({
  todo: ['total', 'completed', 'rate'],
  goals: ['total', 'completed', 'days', 'rate'],
  schedule: ['total', 'week', 'month'],
  diary: ['total', 'month', 'mood'],
  pomodoro: ['count', 'hours', 'daily'],
  bookmarks: ['total', 'clicks'],
  users: ['total', 'roles']
})

const timeOptions = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '近7天', value: 'last7' },
  { label: '近30天', value: 'last30' },
  { label: '自定义', value: 'custom' }
]

const chartTypes = [
  { label: '数字卡片', value: 'card', icon: 'layui-icon layui-icon-screen' },
  { label: '柱状图', value: 'bar', icon: 'layui-icon layui-icon-chart' },
  { label: '饼图', value: 'pie', icon: 'layui-icon layui-icon-circle' },
  { label: '折线图', value: 'line', icon: 'layui-icon layui-icon-line' },
  { label: '环形图', value: 'ring', icon: 'layui-icon layui-icon-round' },
  { label: '排行榜', value: 'ranking', icon: 'layui-icon layui-icon-trophy' },
  { label: '日历热力图', value: 'heatmap', icon: 'layui-icon layui-icon-calendar' }
]

const dataDimensions = [
  {
    key: 'todo',
    name: '待办数据',
    indicators: [
      { key: 'total', name: '总任务数' },
      { key: 'completed', name: '已完成数' },
      { key: 'inProgress', name: '进行中数' },
      { key: 'overdue', name: '逾期数' },
      { key: 'rate', name: '完成率' }
    ]
  },
  {
    key: 'goals',
    name: '长期目标',
    indicators: [
      { key: 'total', name: '总目标数' },
      { key: 'inProgress', name: '进行中' },
      { key: 'completed', name: '已完成' },
      { key: 'days', name: '打卡天数' },
      { key: 'rate', name: '完成率' }
    ]
  },
  {
    key: 'schedule',
    name: '日程数据',
    indicators: [
      { key: 'total', name: '总日程数' },
      { key: 'week', name: '本周日程' },
      { key: 'month', name: '本月日程' },
      { key: 'category', name: '按分类分布' }
    ]
  },
  {
    key: 'diary',
    name: '日记数据',
    indicators: [
      { key: 'total', name: '总日记数' },
      { key: 'month', name: '本月日记数' },
      { key: 'mood', name: '心情分布' }
    ]
  },
  {
    key: 'pomodoro',
    name: '番茄钟数据',
    indicators: [
      { key: 'count', name: '总专注次数' },
      { key: 'hours', name: '总专注时长' },
      { key: 'daily', name: '日均专注时长' }
    ]
  },
  {
    key: 'bookmarks',
    name: '网站导航',
    indicators: [
      { key: 'total', name: '总链接数' },
      { key: 'clicks', name: '点击量排行' }
    ]
  },
  {
    key: 'users',
    name: '用户数据',
    indicators: [
      { key: 'total', name: '总用户数' },
      { key: 'roles', name: '各角色分布' }
    ]
  }
]

const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0d9488', '#ec4899', '#64748b']

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
}))

const getSelectedIndicators = (dimensionKey) => {
  return selectedIndicators[dimensionKey] || []
}

const isIndicatorSelected = (dimensionKey, indicatorKey) => {
  return (selectedIndicators[dimensionKey] || []).includes(indicatorKey)
}

const toggleDimension = (dimensionKey) => {
  const index = expandedDimensions.value.indexOf(dimensionKey)
  if (index === -1) {
    expandedDimensions.value.push(dimensionKey)
  } else {
    expandedDimensions.value.splice(index, 1)
  }
}

const toggleIndicator = (dimensionKey, indicatorKey) => {
  const list = selectedIndicators[dimensionKey] || []
  const index = list.indexOf(indicatorKey)
  if (index === -1) {
    list.push(indicatorKey)
  } else {
    list.splice(index, 1)
  }
}

const generateMockData = () => {
  const widgets = []
  let id = 1

  dataDimensions.forEach(dimension => {
    const indicators = selectedIndicators[dimension.key] || []
    indicators.forEach(indicator => {
      widgets.push(generateWidget(id++, dimension, indicator))
    })
  })

  return widgets
}

const generateWidget = (id, dimension, indicator) => {
  const baseColors = [...chartColors]
  
  switch (indicator.key) {
    case 'total':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'card', value: Math.floor(Math.random() * 200) + 50, subtitle: '总数', trend: (Math.random() - 0.5) * 20 }
    case 'completed':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'card', value: Math.floor(Math.random() * 100) + 20, subtitle: '已完成', trend: (Math.random() - 0.3) * 15 }
    case 'inProgress':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'card', value: Math.floor(Math.random() * 50) + 10, subtitle: '进行中', trend: (Math.random() - 0.5) * 10 }
    case 'overdue':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'card', value: Math.floor(Math.random() * 15), subtitle: '逾期', trend: (Math.random() - 0.7) * 8 }
    case 'rate':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'ring', value: Math.floor(Math.random() * 40) + 40, colors: baseColors }
    case 'days':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'card', value: Math.floor(Math.random() * 30) + 1, subtitle: '打卡天数', trend: Math.random() * 5 }
    case 'week':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'bar', data: [
        { label: '周一', value: Math.floor(Math.random() * 80) + 20 },
        { label: '周二', value: Math.floor(Math.random() * 80) + 20 },
        { label: '周三', value: Math.floor(Math.random() * 80) + 20 },
        { label: '周四', value: Math.floor(Math.random() * 80) + 20 },
        { label: '周五', value: Math.floor(Math.random() * 80) + 20 },
      ], colors: baseColors }
    case 'month':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'line', data: [
        { label: '第1周', value: Math.floor(Math.random() * 50) + 30 },
        { label: '第2周', value: Math.floor(Math.random() * 50) + 30 },
        { label: '第3周', value: Math.floor(Math.random() * 50) + 30 },
        { label: '第4周', value: Math.floor(Math.random() * 50) + 30 },
      ], colors: baseColors, linePath: 'M 20 100 Q 75 50 150 70 T 280 40', linePoints: [{ x: 20, y: 100 }, { x: 75, y: 50 }, { x: 150, y: 70 }, { x: 280, y: 40 }] }
    case 'category':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'pie', data: [
        { label: '工作', value: 35 },
        { label: '个人', value: 25 },
        { label: '学习', value: 20 },
        { label: '健康', value: 15 },
        { label: '其他', value: 5 },
      ], colors: baseColors, pieSegments: [
        { dashArray: '110.52 140.68', dashOffset: 0 },
        { dashArray: '78.54 172.66', dashOffset: -110.52 },
        { dashArray: '62.83 188.37', dashOffset: -189.06 },
        { dashArray: '47.12 204.08', dashOffset: -251.89 },
        { dashArray: '15.71 235.49', dashOffset: -299.01 },
      ] }
    case 'mood':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'bar', data: [
        { label: '开心', value: Math.floor(Math.random() * 60) + 20 },
        { label: '平静', value: Math.floor(Math.random() * 60) + 20 },
        { label: '放松', value: Math.floor(Math.random() * 60) + 20 },
        { label: '焦虑', value: Math.floor(Math.random() * 40) + 10 },
        { label: '疲惫', value: Math.floor(Math.random() * 30) + 5 },
        { label: '烦躁', value: Math.floor(Math.random() * 20) + 5 },
      ], colors: baseColors }
    case 'count':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'card', value: Math.floor(Math.random() * 50) + 5, subtitle: '专注次数', trend: Math.random() * 10 }
    case 'hours':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'card', value: (Math.random() * 40 + 10).toFixed(1), subtitle: '小时', trend: Math.random() * 8 }
    case 'daily':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'line', data: [
        { label: '周一', value: Math.floor(Math.random() * 60) + 30 },
        { label: '周二', value: Math.floor(Math.random() * 60) + 30 },
        { label: '周三', value: Math.floor(Math.random() * 60) + 30 },
        { label: '周四', value: Math.floor(Math.random() * 60) + 30 },
        { label: '周五', value: Math.floor(Math.random() * 60) + 30 },
        { label: '周六', value: Math.floor(Math.random() * 40) + 10 },
        { label: '周日', value: Math.floor(Math.random() * 40) + 10 },
      ], colors: baseColors, linePath: 'M 20 80 Q 60 50 100 60 T 180 40 T 260 70', linePoints: [{ x: 20, y: 80 }, { x: 60, y: 50 }, { x: 100, y: 60 }, { x: 140, y: 40 }, { x: 180, y: 50 }, { x: 220, y: 70 }, { x: 260, y: 60 }] }
    case 'clicks':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'ranking', data: [
        { name: 'GitHub', value: 100, count: 234 },
        { name: '掘金', value: 85, count: 198 },
        { name: 'MDN', value: 72, count: 167 },
        { name: '知乎', value: 65, count: 151 },
        { name: 'B站', value: 58, count: 136 },
      ] }
    case 'roles':
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'pie', data: [
        { label: '管理员', value: 15 },
        { label: '教师', value: 25 },
        { label: '学生', value: 60 },
      ], colors: baseColors, pieSegments: [
        { dashArray: '47.12 204.08', dashOffset: 0 },
        { dashArray: '78.54 172.66', dashOffset: -47.12 },
        { dashArray: '125.66 125.66', dashOffset: -125.66 },
      ] }
    default:
      return { id, title: `${dimension.name}-${indicator.name}`, chartType: 'card', value: '--', subtitle: '暂无数据' }
  }
}

const displayedWidgets = computed(() => {
  const widgets = generateMockData()
  return widgets.map(w => ({ ...w, chartType: selectedChartType.value === 'auto' ? w.chartType : selectedChartType.value }))
})

const removeWidget = (id) => {
  dataDimensions.forEach(dimension => {
    const indicators = selectedIndicators[dimension.key] || []
    const index = indicators.indexOf(displayedWidgets.value.find(w => w.id === id)?.title?.split('-')[1])
    if (index !== -1) {
      indicators.splice(index, 1)
    }
  })
}

const exportData = () => {
  showExportModal.value = true
}

const confirmExport = () => {
  const data = {
    timeRange: selectedTimeRange.value,
    startDate: startDate.value,
    endDate: endDate.value,
    dimensions: selectedIndicators,
    widgets: displayedWidgets.value
  }

  let content, filename, type

  if (exportFormat.value === 'json') {
    content = JSON.stringify(data, null, 2)
    filename = 'dashboard-data.json'
    type = 'application/json'
  } else if (exportFormat.value === 'csv') {
    content = generateCSV(data)
    filename = 'dashboard-data.csv'
    type = 'text/csv'
  } else {
    content = generateExcel(data)
    filename = 'dashboard-data.xlsx'
    type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }

  downloadFile(content, filename, type)
  showExportModal.value = false
  layer.msg('导出成功', { icon: 1 })
}

const generateCSV = (data) => {
  let csv = '指标类型,指标名称,数值,副标题\n'
  data.widgets.forEach(w => {
    const [type, name] = w.title.split('-')
    csv += `${type},${name},${w.value},${w.subtitle || ''}\n`
  })
  return csv
}

const generateExcel = (data) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">
  <worksheet name="Data">
    <table>
      <row><cell><data>指标类型</data></cell><cell><data>指标名称</data></cell><cell><data>数值</data></cell><cell><data>副标题</data></cell></row>`
  
  data.widgets.forEach(w => {
    const [type, name] = w.title.split('-')
    xml += `<row><cell><data>${type}</data></cell><cell><data>${name}</data></cell><cell><data>${w.value}</data></cell><cell><data>${w.subtitle || ''}</data></cell></row>`
  })
  
  xml += `</table></worksheet></workbook>`
  return xml
}

const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #334155;
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 4px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

.time-selector {
  display: flex;
  gap: 8px;
}

.time-btn {
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-btn.active {
  background: var(--primary-color, #1e4d7b);
  border-color: var(--primary-color, #1e4d7b);
  color: #fff;
}

.custom-date {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-date input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
}

.date-separator {
  color: #94a3b8;
}

.content-row {
  display: flex;
  gap: 24px;
}

.left-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  flex: 1;
}

.selector-card,
.chart-type-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.data-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dimension-item {
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.dimension-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  background: #f8fafc;
}

.dimension-header:hover {
  background: #f1f5f9;
}

.dimension-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

.dimension-count {
  font-size: 12px;
  color: #94a3b8;
  background: #fff;
  padding: 2px 8px;
  border-radius: 10px;
}

.indicator-list {
  padding: 8px;
  transition: all 0.3s ease;
}

.indicator-list.collapsed {
  max-height: 0;
  overflow: hidden;
  padding: 0;
}

.indicator-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
}

.indicator-item:hover {
  background: #f8fafc;
}

.indicator-item input {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color, #1e4d7b);
}

.chart-type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.chart-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-type-btn:hover {
  background: #f1f5f9;
}

.chart-type-btn.active {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  border-color: var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
}

.chart-type-btn i {
  font-size: 20px;
}

.widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.widget-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.widget-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.widget-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.widget-close:hover {
  color: #ef4444;
}

.widget-body {
  min-height: 150px;
}

.number-card {
  text-align: center;
  padding: 20px;
}

.card-value {
  font-size: 40px;
  font-weight: 700;
  color: var(--primary-color, #1e4d7b);
}

.card-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 8px;
}

.card-trend {
  display: inline-block;
  margin-top: 8px;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 12px;
}

.card-trend.up {
  background: color-mix(in srgb, #10b981 15%, transparent);
  color: #10b981;
}

.card-trend.down {
  background: color-mix(in srgb, #ef4444 15%, transparent);
  color: #ef4444;
}

.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 140px;
  padding: 10px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.bar-fill {
  width: 30px;
  min-height: 10px;
  border-radius: 6px 6px 0 0;
  transition: height 0.5s ease;
}

.bar-label {
  font-size: 11px;
  color: #94a3b8;
}

.pie-chart {
  display: flex;
  align-items: center;
  gap: 20px;
}

.pie-svg {
  width: 100px;
  height: 100px;
}

.pie-legend {
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-label {
  flex: 1;
  font-size: 12px;
  color: #475569;
}

.legend-value {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.line-chart {
  padding: 10px;
}

.line-svg {
  width: 100%;
  height: 100px;
}

.line-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.line-label {
  font-size: 11px;
  color: #94a3b8;
}

.ring-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.ring-svg {
  width: 120px;
  height: 120px;
  transform: rotate(-90deg);
}

.ring-center {
  position: absolute;
  text-align: center;
}

.ring-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color, #1e4d7b);
}

.ring-label {
  font-size: 12px;
  color: #94a3b8;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ranking-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.ranking-number.top {
  background: var(--primary-color, #1e4d7b);
  color: #fff;
}

.ranking-info {
  flex: 1;
}

.ranking-name {
  font-size: 13px;
  color: #475569;
  margin-bottom: 4px;
  display: block;
}

.ranking-bar {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.ranking-fill {
  height: 100%;
  background: var(--primary-color, #1e4d7b);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.ranking-value {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.heatmap-calendar {
  padding: 10px;
}

.heatmap-months {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 10px;
  color: #94a3b8;
}

.heatmap-weekdays {
  display: flex;
  justify-content: space-between;
  width: 40px;
  font-size: 10px;
  color: #94a3b8;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: repeat(52, 1fr);
  gap: 2px;
  margin-left: 40px;
  margin-top: -20px;
}

.heatmap-cell {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.heatmap-cell.level-0 {
  background: #f1f5f9;
}

.heatmap-cell.level-1 {
  background: #bfdbfe;
}

.heatmap-cell.level-2 {
  background: #60a5fa;
}

.heatmap-cell.level-3 {
  background: #2563eb;
}

.heatmap-cell.level-4 {
  background: #1d4ed8;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  font-size: 10px;
  color: #94a3b8;
}

.legend-cells {
  display: flex;
  gap: 3px;
}

.legend-cells .cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #94a3b8;
  gap: 12px;
}

.empty-state i {
  font-size: 48px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: #334155;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 12px;
}

.export-option input {
  width: 18px;
  height: 18px;
}

.export-option label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel {
  padding: 10px 20px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
}

.btn-confirm {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
}

@media (max-width: 900px) {
  .content-row {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
  }

  .widget-grid {
    grid-template-columns: 1fr;
  }
}
</style>