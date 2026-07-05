<template>
  <div class="profile-page" :style="themeStyle">
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar">
            <i class="layui-icon layui-icon-user"></i>
          </div>
          <div class="avatar-info">
            <div class="username">{{ userStore.userInfo.username || '用户' }}</div>
            <div class="role">
              {{ userStore.userInfo.role === 'admin' ? '管理员' : userStore.userInfo.role === 'teacher' ? '教师' : '学生' }}
            </div>
          </div>
        </div>
      </div>

      <div class="profile-body">
        <div class="info-grid">
          <div class="info-item">
            <label>用户名</label>
            <span>{{ userStore.userInfo.username }}</span>
          </div>
          <div class="info-item">
            <label>角色</label>
            <span>{{ userStore.userInfo.role === 'admin' ? '管理员' : userStore.userInfo.role === 'teacher' ? '教师' : '学生'
            }}</span>
          </div>
          <div class="info-item">
            <label>用户ID</label>
            <span>{{ userStore.userInfo.id }}</span>
          </div>
          <div class="info-item">
            <label>创建时间</label>
            <span>{{ userStore.userInfo.createdAt || '2024-01-01' }}</span>
          </div>
        </div>
      </div>

      <div class="profile-footer">
        <button class="layui-btn edit-profile-btn" @click="openEditDialog">
          <i class="layui-icon layui-icon-edit"></i>
          编辑信息
        </button>
        <button class="layui-btn change-pwd-btn" @click="openChangePwdDialog">
          <i class="layui-icon layui-icon-key"></i>
          修改密码
        </button>
      </div>
    </div>

    <div class="layui-layer" v-show="editDialogVisible">
      <div class="dialog-mask" @click="closeEditDialog"></div>
      <div class="dialog-box">
        <div class="dialog-header">
          <span class="dialog-title">编辑个人信息</span>
          <button class="dialog-close" @click="closeEditDialog">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <form class="layui-form dialog-form">
          <div class="layui-form-item">
            <label class="layui-form-label">用户名</label>
            <div class="layui-input-block">
              <input type="text" v-model="editForm.username" placeholder="请输入用户名" class="layui-input" />
            </div>
          </div>
          <div class="layui-form-item">
            <label class="layui-form-label">角色</label>
            <div class="layui-input-block">
              <select v-model="editForm.role" class="layui-input" :disabled="true">
                <option value="student">学生</option>
                <option value="teacher">教师</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </div>
        </form>
        <div class="dialog-footer">
          <button class="layui-btn cancel-btn" @click="closeEditDialog">取消</button>
          <button class="layui-btn submit-btn" @click="submitEditForm">保存</button>
        </div>
      </div>
    </div>

    <div class="layui-layer" v-show="pwdDialogVisible">
      <div class="dialog-mask" @click="closePwdDialog"></div>
      <div class="dialog-box">
        <div class="dialog-header">
          <span class="dialog-title">修改密码</span>
          <button class="dialog-close" @click="closePwdDialog">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <form class="layui-form dialog-form">
          <div class="layui-form-item">
            <label class="layui-form-label">旧密码</label>
            <div class="layui-input-block">
              <input type="password" v-model="pwdForm.oldPassword" placeholder="请输入旧密码" class="layui-input" />
            </div>
          </div>
          <div class="layui-form-item">
            <label class="layui-form-label">新密码</label>
            <div class="layui-input-block">
              <input type="password" v-model="pwdForm.newPassword" placeholder="请输入新密码" class="layui-input" />
            </div>
          </div>
          <div class="layui-form-item">
            <label class="layui-form-label">确认密码</label>
            <div class="layui-input-block">
              <input type="password" v-model="pwdForm.confirmPassword" placeholder="请确认新密码" class="layui-input" />
            </div>
          </div>
        </form>
        <div class="dialog-footer">
          <button class="layui-btn cancel-btn" @click="closePwdDialog">取消</button>
          <button class="layui-btn submit-btn" @click="submitPwdForm">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import { useAppStore } from '@/stores/modules/app'
import { layer } from '@layui/layui-vue'
import { dataManager } from '@/utils/dataManager'

const userStore = useUserStore()
const appStore = useAppStore()

const editDialogVisible = ref(false)
const pwdDialogVisible = ref(false)

const themeStyle = computed(() => ({
  '--primary-color': appStore.primary,
  '--primary-light': appStore.primaryLight,
  '--text-primary': appStore.textPrimary,
  '--text-secondary': appStore.textSecondary,
  '--text-muted': appStore.textMuted,
  '--surface-tint': appStore.surfaceTint,
}))

const editForm = reactive({
  username: '',
  role: 'student',
})

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const openEditDialog = () => {
  editForm.username = userStore.userInfo.username || ''
  editForm.role = userStore.userInfo.role || 'student'
  editDialogVisible.value = true
}

const closeEditDialog = () => {
  editDialogVisible.value = false
}

const submitEditForm = () => {
  if (!editForm.username) {
    layer.msg('请输入用户名', { icon: 5 })
    return
  }

  try {
    const success = dataManager.users.updateProfile(userStore.userInfo.id, {
      username: editForm.username,
    })
    if (success) {
      userStore.userInfo.username = editForm.username
      layer.msg('修改成功', { icon: 6 })
      closeEditDialog()
    } else {
      layer.msg('修改失败，请重试', { icon: 5 })
    }
  } catch (error) {
    console.error('修改失败:', error)
    layer.msg('修改失败，请重试', { icon: 5 })
  }
}

const openChangePwdDialog = () => {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdDialogVisible.value = true
}

const closePwdDialog = () => {
  pwdDialogVisible.value = false
}

const submitPwdForm = () => {
  if (!pwdForm.oldPassword) {
    layer.msg('请输入旧密码', { icon: 5 })
    return
  }
  if (!pwdForm.newPassword) {
    layer.msg('请输入新密码', { icon: 5 })
    return
  }
  if (!pwdForm.confirmPassword) {
    layer.msg('请确认新密码', { icon: 5 })
    return
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    layer.msg('两次输入的密码不一致', { icon: 5 })
    return
  }

  try {
    const result = dataManager.users.changePassword(
      userStore.userInfo.id,
      pwdForm.oldPassword,
      pwdForm.newPassword
    )
    if (result.success) {
      layer.msg('密码修改成功', { icon: 6 })
      closePwdDialog()
    } else {
      layer.msg(result.message || '密码修改失败，请检查旧密码是否正确', { icon: 5 })
    }
  } catch (error) {
    console.error('密码修改失败:', error)
    layer.msg('密码修改失败，请检查旧密码是否正确', { icon: 5 })
  }
}
</script>

<style scoped>
.profile-page {
  padding: 24px;
}

.profile-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  padding: 36px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar {
  width: 88px;
  height: 88px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
  color: #fff;
  backdrop-filter: blur(8px);
}

.avatar-info {
  color: #fff;
}

.username {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 10px;
}

.role {
  font-size: 15px;
  opacity: 0.9;
}

.profile-body {
  padding: 28px 36px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  background: var(--surface-tint, #f8fafc);
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.info-item:hover {
  background: var(--surface-tint, #f1f5f9);
}

.info-item label {
  font-size: 14px;
  color: var(--text-secondary, #64748b);
}

.info-item span {
  font-size: 14px;
  color: var(--text-primary, #334155);
  font-weight: 600;
}

.profile-footer {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: 24px 36px;
  border-top: 1px solid var(--surface-tint, #f1f5f9);
}

.edit-profile-btn {
  background: #fff;
  border: 1px solid var(--surface-tint, #e2e8f0);
  color: var(--text-secondary, #475569);
  height: 42px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.edit-profile-btn:hover {
  border-color: var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 3%, white);
}

.change-pwd-btn {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  border: none;
  color: #fff;
  height: 42px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.change-pwd-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 16px;
  width: 440px;
  z-index: 1001;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  animation: dialogFadeIn 0.3s ease;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -45%);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--surface-tint, #f1f5f9);
}

.dialog-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #334155);
}

.dialog-close {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.dialog-close:hover {
  color: var(--text-secondary, #64748b);
  background: var(--surface-tint, #f1f5f9);
}

.dialog-form {
  padding: 24px;
}

.layui-form-item {
  margin-bottom: 20px;
}

.layui-form-label {
  width: 80px;
  padding: 11px 15px;
  font-size: 14px;
  color: var(--text-secondary, #64748b);
}

.layui-input-block {
  margin-left: 95px;
}

.layui-input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
}

.layui-input:focus {
  border-color: var(--primary-color, #1e4d7b);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #1e4d7b) 8%, transparent);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--surface-tint, #f1f5f9);
}

.cancel-btn {
  background: #fff;
  border: 1px solid var(--surface-tint, #e2e8f0);
  color: var(--text-secondary, #475569);
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: var(--surface-tint, #f8fafc);
  border-color: var(--text-muted, #cbd5e1);
}

.submit-btn {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  border: none;
  color: #fff;
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>