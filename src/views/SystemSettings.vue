<template>
  <div class="system-settings" :style="themeStyle">
    <div class="settings-card">
      <div class="card-header">
        <i class="layui-icon layui-icon-theme"></i>
        <span>主题颜色设置</span>
      </div>
      <div class="card-body">
        <div class="theme-presets">
          <div class="preset-grid">
            <div class="preset-item" @click="applyTheme('deepsea')" :class="{ active: currentTheme === 'deepsea' }">
              <div class="preset-preview">
                <div class="preview-main deepsea"></div>
                <div class="preview-accent deepsea-accent"></div>
              </div>
              <span>深海蓝系</span>
            </div>
            <div class="preset-item" @click="applyTheme('teallake')" :class="{ active: currentTheme === 'teallake' }">
              <div class="preset-preview">
                <div class="preview-main teallake"></div>
                <div class="preview-accent teallake-accent"></div>
              </div>
              <span>青蓝湖色</span>
            </div>
            <div class="preset-item" @click="applyTheme('lilac')" :class="{ active: currentTheme === 'lilac' }">
              <div class="preset-preview">
                <div class="preview-main lilac"></div>
                <div class="preview-accent lilac-accent"></div>
              </div>
              <span>灰紫丁香</span>
            </div>
            <div class="preset-item" @click="applyTheme('rosebean')" :class="{ active: currentTheme === 'rosebean' }">
              <div class="preset-preview">
                <div class="preview-main rosebean"></div>
                <div class="preview-accent rosebean-accent"></div>
              </div>
              <span>豆沙玫瑰</span>
            </div>
            <div class="preset-item" @click="applyTheme('brickred')" :class="{ active: currentTheme === 'brickred' }">
              <div class="preset-preview">
                <div class="preview-main brickred"></div>
                <div class="preview-accent brickred-accent"></div>
              </div>
              <span>砖红暖棕</span>
            </div>
            <div class="preset-item" @click="applyTheme('neutralgray')"
              :class="{ active: currentTheme === 'neutralgray' }">
              <div class="preset-preview">
                <div class="preview-main neutralgray"></div>
                <div class="preview-accent neutralgray-accent"></div>
              </div>
              <span>中性灰蓝</span>
            </div>
            <div class="preset-item" @click="applyTheme('olivegreen')"
              :class="{ active: currentTheme === 'olivegreen' }">
              <div class="preset-preview">
                <div class="preview-main olivegreen"></div>
                <div class="preview-accent olivegreen-accent"></div>
              </div>
              <span>橄榄黄绿</span>
            </div>
            <div class="preset-item" @click="applyTheme('warmgold')" :class="{ active: currentTheme === 'warmgold' }">
              <div class="preset-preview">
                <div class="preview-main warmgold"></div>
                <div class="preview-accent warmgold-accent"></div>
              </div>
              <span>暖橙金棕</span>
            </div>
          </div>
        </div>

        <div class="color-sections">
          <div class="color-section">
            <div class="section-header">
              <i class="layui-icon layui-icon-paint"></i>
              <span>主色调</span>
            </div>
            <div class="color-grid">
              <div class="color-item">
                <label>主色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.primary" class="color-picker" />
                  <input type="text" v-model="colors.primary" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>主色浅</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.primaryLight" class="color-picker" />
                  <input type="text" v-model="colors.primaryLight" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>主色深</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.primaryDark" class="color-picker" />
                  <input type="text" v-model="colors.primaryDark" class="layui-input color-text" />
                </div>
              </div>
            </div>
          </div>

          <div class="color-section">
            <div class="section-header">
              <i class="layui-icon layui-icon-menu"></i>
              <span>导航栏颜色</span>
            </div>
            <div class="color-grid">
              <div class="color-item">
                <label>背景色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.sidebarBg" class="color-picker" />
                  <input type="text" v-model="colors.sidebarBg" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>文字颜色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.sidebarText" class="color-picker" />
                  <input type="text" v-model="colors.sidebarText" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>悬停颜色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.sidebarHover" class="color-picker" />
                  <input type="text" v-model="colors.sidebarHover" class="layui-input color-text" />
                </div>
              </div>
            </div>
          </div>

          <div class="color-section">
            <div class="section-header">
              <i class="layui-icon layui-icon-app"></i>
              <span>辅助颜色</span>
            </div>
            <div class="color-grid">
              <div class="color-item">
                <label>成功色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.success" class="color-picker" />
                  <input type="text" v-model="colors.success" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>警告色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.warning" class="color-picker" />
                  <input type="text" v-model="colors.warning" class="layui-input color-text" />
                </div>
              </div>
              <div class="color-item">
                <label>危险色</label>
                <div class="color-input-group">
                  <input type="color" v-model="colors.danger" class="color-picker" />
                  <input type="text" v-model="colors.danger" class="layui-input color-text" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-section">
          <div class="preview-title">
            <i class="layui-icon layui-icon-eye"></i>
            <span>实时预览</span>
          </div>
          <div class="preview-card" :style="previewStyle">
            <div class="preview-header">
              <div class="preview-logo"></div>
              <span>系统管理</span>
            </div>
            <div class="preview-nav">
              <div class="nav-item active">首页</div>
              <div class="nav-item">个人信息</div>
              <div class="nav-item">用户管理</div>
              <div class="nav-item">系统设置</div>
            </div>
            <div class="preview-footer">
              <button class="preview-btn">退出登录</button>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <button class="layui-btn save-btn" :style="{ background: colors.primary }" @click="saveSettings">保存设置</button>
        <button class="layui-btn reset-btn" @click="resetSettings">恢复默认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { layer } from '@layui/layui-vue'

const appStore = useAppStore()

const currentTheme = ref(appStore.currentTheme)

const colors = reactive({
  primary: appStore.primary,
  primaryLight: appStore.primaryLight,
  primaryDark: appStore.primaryDark,
  success: appStore.success,
  warning: appStore.warning,
  danger: appStore.danger,
  sidebarBg: appStore.sidebarBg,
  sidebarText: appStore.sidebarText,
  sidebarHover: appStore.sidebarHover,
})

const settings = reactive({
  systemName: '自我管理系统',
  version: '1.0.0',
  copyright: 'Copyright 2024',
})

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
  '--success-color': appStore.success,
  '--danger-color': appStore.danger,
  '--text-primary': appStore.textPrimary,
  '--text-secondary': appStore.textSecondary,
  '--text-muted': appStore.textMuted,
  '--surface-tint': appStore.surfaceTint,
}))

const previewStyle = computed(() => ({
  '--preview-bg': colors.sidebarBg,
  '--preview-text': colors.sidebarText,
  '--preview-hover': colors.sidebarHover,
  '--preview-primary': colors.primary,
  '--preview-gradient': `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
}))

const applyTheme = (theme) => {
  currentTheme.value = theme
  appStore.setTheme(theme)
  Object.keys(appStore).forEach(key => {
    if (colors.hasOwnProperty(key)) {
      colors[key] = appStore[key]
    }
  })
}

const saveSettings = () => {
  Object.keys(colors).forEach(key => {
    if (appStore.hasOwnProperty(key)) {
      appStore[key] = colors[key]
    }
  })
  appStore.currentTheme = 'custom'
  layer.msg('设置已保存', { icon: 6 })
}

const resetSettings = () => {
  appStore.resetColors()
  currentTheme.value = appStore.currentTheme
  Object.keys(appStore).forEach(key => {
    if (colors.hasOwnProperty(key)) {
      colors[key] = appStore[key]
    }
  })
  layer.msg('已恢复默认设置', { icon: 6 })
}
</script>

<style scoped>
.system-settings {
  padding: 24px;
}

.settings-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: var(--surface-tint, #f8fafc);
  border-bottom: 1px solid var(--surface-tint, #f1f5f9);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
}

.card-header i {
  font-size: 18px;
  color: var(--primary-color, #1e4d7b);
}

.card-body {
  padding: 28px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: 20px 24px;
  border-top: 1px solid var(--surface-tint, #f1f5f9);
  background: var(--surface-tint, #f8fafc);
}

.theme-presets {
  margin-bottom: 28px;
}

.preset-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  margin-bottom: 18px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 14px;
}

.preset-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 14px;
  border: 2px solid var(--surface-tint, #e2e8f0);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.preset-item:hover {
  border-color: var(--text-muted, #cbd5e1);
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.preset-item.active {
  border-color: var(--primary-color, #1e4d7b);
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 5%, white);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #1e4d7b) 10%, transparent);
}

.preset-preview {
  display: flex;
  gap: 6px;
  width: 80px;
  height: 40px;
}

.preview-main {
  flex: 1;
  border-radius: 6px 0 0 6px;
}

.preview-accent {
  width: 24px;
  border-radius: 0 6px 6px 0;
}

.preview-main.deepsea {
  background: #0a1929;
}

.preview-accent.deepsea-accent {
  background: #1e4d7b;
}

.preview-main.teallake {
  background: #064e3b;
}

.preview-accent.teallake-accent {
  background: #0d9488;
}

.preview-main.lilac {
  background: #3b0764;
}

.preview-accent.lilac-accent {
  background: #8b5cf6;
}

.preview-main.rosebean {
  background: #6b2a25;
}

.preview-accent.rosebean-accent {
  background: #d4756a;
}

.preview-main.brickred {
  background: #451a03;
}

.preview-accent.brickred-accent {
  background: #b45309;
}

.preview-main.neutralgray {
  background: #1e293b;
}

.preview-accent.neutralgray-accent {
  background: #64748b;
}

.preview-main.olivegreen {
  background: #1a2e05;
}

.preview-accent.olivegreen-accent {
  background: #65a30d;
}

.preview-main.warmgold {
  background: #431407;
}

.preview-accent.warmgold-accent {
  background: #ea580c;
}

.preset-item span {
  font-size: 13px;
  color: var(--text-muted, #666);
  font-weight: 500;
}

.color-sections {
  margin-bottom: 28px;
}

.color-section {
  margin-bottom: 24px;
}

.color-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--surface-tint, #f1f5f9);
}

.section-header i {
  font-size: 16px;
  color: var(--primary-color, #1e4d7b);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.color-item label {
  font-size: 13px;
  color: var(--text-secondary, #64748b);
  font-weight: 500;
}

.color-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-picker {
  width: 44px;
  height: 38px;
  padding: 2px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-picker:hover {
  border-color: var(--primary-color, #1e4d7b);
}

.color-text {
  flex: 1;
  max-width: 140px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  font-size: 13px;
  font-family: monospace;
  transition: all 0.2s ease;
}

.color-text:focus {
  border-color: var(--primary-color, #1e4d7b);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #1e4d7b) 8%, transparent);
}

.preview-section {
  padding-top: 24px;
  border-top: 1px solid var(--surface-tint, #f1f5f9);
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  margin-bottom: 18px;
}

.preview-title i {
  font-size: 16px;
  color: var(--primary-color, #1e4d7b);
}

.preview-card {
  width: 200px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--preview-gradient, linear-gradient(135deg, #1e4d7b 0%, #3d7ab5 100%));
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.preview-logo {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.preview-nav {
  padding: 8px 0;
}

.nav-item {
  padding: 10px 16px;
  font-size: 13px;
  color: var(--preview-text, #475569);
  cursor: pointer;
  transition: background 0.2s;
}

.nav-item:hover {
  background: var(--preview-hover, #f1f5f9);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-left: 3px solid var(--preview-primary, #1e4d7b);
}

.preview-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-btn {
  width: 100%;
  padding: 10px;
  background: color-mix(in srgb, var(--danger-color, #f87171) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--danger-color, #f87171) 30%, transparent);
  border-radius: 10px;
  color: var(--danger-color, #f87171);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn:hover {
  background: color-mix(in srgb, var(--danger-color, #f87171) 25%, transparent);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.form-item label {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
}

.form-item input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-item input:focus {
  border-color: var(--primary-color, #1e4d7b);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #1e4d7b) 8%, transparent);
}

.form-item input[readonly] {
  background: var(--surface-tint, #fafafa);
  color: var(--text-muted, #999);
}

.save-btn {
  border: none;
  color: #fff;
  height: 38px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.save-btn:hover {
  opacity: 0.9;
}

.reset-btn {
  background: #fff;
  border: 1px solid var(--surface-tint, #d9d9d9);
  color: var(--text-secondary, #333);
  height: 38px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
}

.reset-btn:hover {
  background: var(--surface-tint, #f5f5f5);
}
</style>
