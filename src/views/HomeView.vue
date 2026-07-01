<template>
  <div class="home-page" :style="themeStyle">
    <div class="welcome-section">
      <div class="welcome-card">
        <div class="welcome-icon">
          <i class="layui-icon layui-icon-face-smile"></i>
        </div>
        <div class="welcome-content">
          <div class="welcome-title">欢迎，{{ userStore.userInfo.username || '用户' }}！</div>
          <div class="welcome-desc">今天是 {{ currentDate }}，祝您工作愉快</div>
        </div>
      </div>
    </div>

    <div class="weather-section">
      <div class="weather-card">
        <div class="weather-icon-wrap">
          <i class="layui-icon layui-icon-cloud"></i>
        </div>
        <div class="weather-main">
          <span class="weather-city">{{ weather.city || '未知城市' }}</span>
          <span class="weather-temp">{{ weather.temp || '--' }}°C</span>
          <span class="weather-desc">{{ weather.description || '暂无数据' }}</span>
        </div>
        <div class="weather-details">
          <div class="weather-detail">
            <span class="detail-label">最高</span>
            <span class="detail-value">{{ weather.maxTemp || '--' }}°</span>
          </div>
          <div class="weather-detail">
            <span class="detail-label">最低</span>
            <span class="detail-value">{{ weather.minTemp || '--' }}°</span>
          </div>
          <div class="weather-detail">
            <span class="detail-label">湿度</span>
            <span class="detail-value">{{ weather.humidity || '--' }}%</span>
          </div>
          <div class="weather-detail">
            <span class="detail-label">风速</span>
            <span class="detail-value">{{ weather.wind || '--' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isAdmin" class="quick-stats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon blue">
            <i class="layui-icon layui-icon-group"></i>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ totalUsers }}</div>
            <div class="stat-name">总用户数</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon green">
            <i class="layui-icon layui-icon-user"></i>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ adminCount }}</div>
            <div class="stat-name">管理员</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon orange">
            <i class="layui-icon layui-icon-user"></i>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ studentCount }}</div>
            <div class="stat-name">学生用户</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon purple">
            <i class="layui-icon layui-icon-user"></i>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ teacherCount }}</div>
            <div class="stat-name">教师用户</div>
          </div>
        </div>
      </div>
    </div>

    <div class="recent-section">
      <div class="section-title">快捷操作</div>
      <div class="quick-actions">
        <div v-if="isAdmin" class="action-card" @click="goTo('/user-management')">
          <div class="action-icon">
            <i class="layui-icon layui-icon-user"></i>
          </div>
          <div class="action-text">用户管理</div>
        </div>
        <div class="action-card" @click="goTo('/profile')">
          <div class="action-icon">
            <i class="layui-icon layui-icon-username"></i>
          </div>
          <div class="action-text">个人信息</div>
        </div>
        <div class="action-card" @click="goTo('/system-settings')">
          <div class="action-icon">
            <i class="layui-icon layui-icon-set"></i>
          </div>
          <div class="action-text">系统设置</div>
        </div>
        <div v-if="isAdmin" class="action-card" @click="goTo('/statistics')">
          <div class="action-icon">
            <i class="layui-icon layui-icon-chart"></i>
          </div>
          <div class="action-text">统计报表</div>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <div class="section-title">系统提示</div>
      <div class="tips-card">
        <div class="tip-item">
          <i class="layui-icon layui-icon-tips"></i>
          <span>请定期修改密码以保证账户安全</span>
        </div>
        <div class="tip-item">
          <i class="layui-icon layui-icon-tips"></i>
          <span>管理员可以查看和管理所有用户信息</span>
        </div>
        <div class="tip-item">
          <i class="layui-icon layui-icon-tips"></i>
          <span>系统设置中可以自定义导航栏颜色</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { useAppStore } from '@/stores/modules/app'
import { getStatistics } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const totalUsers = ref(0)
const adminCount = ref(0)
const studentCount = ref(0)
const teacherCount = ref(0)
const weather = ref({
  temp: '',
  maxTemp: '',
  minTemp: '',
  description: '',
  city: '北京',
  humidity: '',
  wind: ''
})

const isAdmin = computed(() => userStore.userInfo.role === 'admin')

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
  '--primary-dark': appStore.primaryDark,
  '--success-color': appStore.success,
  '--warning-color': appStore.warning,
  '--danger-color': appStore.danger,
  '--text-primary': appStore.textPrimary,
  '--text-secondary': appStore.textSecondary,
  '--text-muted': appStore.textMuted,
  '--surface-tint': appStore.surfaceTint,
  '--accent-color': appStore.accent,
}))

const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[now.getDay()]
  return `${year}年${month}月${day}日 ${weekDay}`
})

const goTo = (path) => {
  router.push(path)
}

const fetchStatistics = async () => {
  try {
    const res = await getStatistics()
    totalUsers.value = res.data.total
    adminCount.value = res.data.adminCount
    studentCount.value = res.data.studentCount
    teacherCount.value = res.data.teacherCount
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const weatherDescriptions = {
  'clear': '晴朗',
  'partly-cloudy': '多云',
  'cloudy': '阴天',
  'overcast': '阴',
  'light-rain': '小雨',
  'moderate-rain': '中雨',
  'heavy-rain': '大雨',
  'light-snow': '小雪',
  'moderate-snow': '中雪',
  'heavy-snow': '大雪',
  'fog': '雾',
  'thunder': '雷阵雨'
}

const getWeatherDesc = (code) => {
  const descMap = {
    0: '晴朗',
    1: '晴',
    2: '多云',
    3: '阴',
    45: '雾',
    48: '雾',
    51: '小雨',
    53: '小雨',
    55: '小雨',
    56: '冻雨',
    57: '冻雨',
    61: '中雨',
    63: '中雨',
    65: '大雨',
    66: '冻雨',
    67: '冻雨',
    71: '小雪',
    73: '小雪',
    75: '大雪',
    77: '雪',
    80: '阵雨',
    81: '阵雨',
    82: '暴雨',
    95: '雷阵雨',
    96: '雷阵雨',
    99: '雷阵雨'
  }
  return descMap[code] || '未知'
}

const fetchWeather = async () => {
  const latitude = 29.5630
  const longitude = 106.5516
  const city = '重庆'

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Shanghai`)
    const data = await response.json()
    if (data.current && data.daily) {
      weather.value = {
        temp: Math.round(data.current.temperature_2m),
        maxTemp: Math.round(data.daily.temperature_2m_max[0]),
        minTemp: Math.round(data.daily.temperature_2m_min[0]),
        description: getWeatherDesc(data.current.weather_code),
        city: city,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m + 'm/s'
      }
    }
  } catch (error) {
    console.error('获取天气数据失败:', error)
    weather.value = {
      temp: '25',
      maxTemp: '32',
      minTemp: '18',
      description: '晴朗',
      city: city,
      humidity: '45',
      wind: '3m/s'
    }
  }
}

onMounted(() => {
  fetchWeather()
  if (isAdmin.value) {
    fetchStatistics()
  }
})
</script>

<style scoped>
.home-page {
  padding: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary, #475569);
}

.welcome-section {
  margin-bottom: 24px;
}

.weather-section {
  margin-bottom: 24px;
}

.weather-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.weather-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
}

.weather-icon-wrap {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent), color-mix(in srgb, var(--primary-light, #3d7ab5) 20%, transparent));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--primary-color, #1e4d7b);
}

.weather-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.weather-city {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color, #1e4d7b);
  padding: 4px 12px;
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
  border-radius: 20px;
}

.weather-temp {
  font-size: 40px;
  font-weight: 300;
  color: var(--text-primary, #334155);
  letter-spacing: -1px;
}

.weather-desc {
  font-size: 15px;
  color: var(--text-secondary, #64748b);
}

.weather-details {
  display: flex;
  gap: 28px;
}

.weather-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
}

.detail-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
}

.welcome-card {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  border-radius: 16px;
  padding: 36px;
  display: flex;
  align-items: center;
  gap: 28px;
  color: #fff;
  box-shadow: 0 8px 28px color-mix(in srgb, var(--primary-color, #1e4d7b) 25%, transparent);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.welcome-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

.welcome-icon {
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  backdrop-filter: blur(8px);
}

.welcome-content {
  flex: 1;
}

.welcome-title {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 10px;
}

.welcome-desc {
  font-size: 15px;
  opacity: 0.85;
}

.quick-stats {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.stat-item {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
}

.stat-icon.blue {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, var(--success-color, #0d9488) 0%, color-mix(in srgb, var(--success-color, #0d9488) 70%, white) 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, var(--warning-color, #fbbf24) 0%, color-mix(in srgb, var(--warning-color, #fbbf24) 70%, white) 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, var(--primary-dark, #6d28d9) 0%, var(--primary-color, #8b5cf6) 100%);
}

.stat-info {
  flex: 1;
}

.stat-num {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary, #334155);
}

.stat-name {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
}

.recent-section {
  margin-bottom: 24px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.action-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

.action-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color, #1e4d7b) 15%, transparent), color-mix(in srgb, var(--primary-light, #3d7ab5) 25%, transparent));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--primary-color, #1e4d7b);
}

.action-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
}

.tips-section {
  margin-bottom: 24px;
}

.tips-card {
  background: linear-gradient(135deg, var(--surface-tint, #fffbeb) 0%, color-mix(in srgb, var(--surface-tint, #fffbeb) 80%, white) 100%);
  border: 1px solid color-mix(in srgb, var(--primary-color, #1e4d7b) 20%, transparent);
  border-radius: 16px;
  padding: 24px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  font-size: 14px;
  color: var(--text-primary, #92400e);
}

.tip-item i {
  font-size: 18px;
}

@media (max-width: 1200px) {

  .stats-grid,
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {

  .stats-grid,
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .weather-card {
    flex-direction: column;
    text-align: center;
  }

  .weather-details {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>