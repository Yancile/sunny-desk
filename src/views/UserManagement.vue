<template>
  <div class="user-management" :style="themeStyle">
    <div class="toolbar">
      <div class="search-group">
        <div class="search-input-wrapper">
          <input type="text" v-model="searchUsername" placeholder="搜索用户名" class="layui-input search-input" />
        </div>
        <button class="layui-btn search-btn" @click="handleSearch">搜索</button>
      </div>
      <div class="filter-group">
        <select v-model="userTypeFilter" class="layui-input filter-select" @change="handleSearch">
          <option value="">用户类型筛选</option>
          <option value="admin">管理员</option>
          <option value="student">学生</option>
          <option value="teacher">教师</option>
        </select>
      </div>
      <button class="layui-btn add-btn" @click="openAddDialog">
        <i class="layui-icon layui-icon-add-circle"></i>
        新增用户
      </button>
    </div>

    <div class="user-table-container">
      <div class="table-header">
        <span class="table-title">用户列表</span>
        <span class="table-count">共 {{ total }} 条记录</span>
      </div>
      <div class="table-wrapper">
        <table class="layui-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>密码</th>
              <th>角色</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="table-row">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.password || '-' }}</td>
              <td>
                <span class="role-tag" :class="user.role">
                  {{ user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '教师' : '学生' }}
                </span>
              </td>
              <td>
                <button class="status-toggle" :class="user.status === 1 ? 'active' : 'inactive'"
                  @click="toggleUserStatus(user)">
                  <span class="toggle-track">
                    <span class="toggle-thumb"></span>
                  </span>
                  <span class="toggle-text">{{ user.status === 1 ? '启用' : '禁用' }}</span>
                </button>
              </td>
              <td>{{ user.createTime }}</td>
              <td class="actions">
                <button class="layui-btn layui-btn-xs edit-btn" @click="openEditDialog(user)">
                  <i class="layui-icon layui-icon-edit"></i>
                  编辑
                </button>
                <button class="layui-btn layui-btn-xs delete-btn" @click="deleteUser(user.id)">
                  <i class="layui-icon layui-icon-delete"></i>
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="users.length === 0" class="empty-state">
        <i class="layui-icon layui-icon-empty"></i>
        <span>还没有用户？点击新增用户添加第一位用户吧！</span>
      </div>
      <div v-if="total > 0" class="pagination">
        <button class="layui-btn layui-btn-xs" :disabled="currentPage === 1" @click="prevPage">
          <i class="layui-icon layui-icon-left"></i>
          上一页
        </button>
        <div class="page-numbers">
          <span v-for="page in visiblePages" :key="page" class="page-number" :class="{ active: currentPage === page }"
            @click="goToPage(page)">
            {{ page }}
          </span>
        </div>
        <button class="layui-btn layui-btn-xs" :disabled="currentPage === totalPages" @click="nextPage">
          下一页
          <i class="layui-icon layui-icon-right"></i>
        </button>
        <div class="page-info">
          <span>共 {{ totalPages }} 页</span>
          <span>每页</span>
          <select v-model="pageSize" class="layui-input page-size-select" @change="fetchUsers">
            <option :value="5">5条</option>
            <option :value="10">10条</option>
            <option :value="20">20条</option>
          </select>
          <span>当前第 {{ currentPage }} 页</span>
        </div>
      </div>
    </div>

    <div class="layui-layer" v-show="dialogVisible">
      <div class="dialog-mask" @click="closeDialog"></div>
      <div class="dialog-box">
        <div class="dialog-header">
          <span class="dialog-title">{{ isEdit ? '编辑用户' : '新增用户' }}</span>
          <button class="dialog-close" @click="closeDialog">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <form class="layui-form dialog-form">
          <div class="layui-form-item">
            <label class="layui-form-label">用户名</label>
            <div class="layui-input-block">
              <input type="text" v-model="form.username" placeholder="请输入用户名" class="layui-input" />
            </div>
          </div>
          <div class="layui-form-item">
            <label class="layui-form-label">密码</label>
            <div class="layui-input-block">
              <input type="password" v-model="form.password" placeholder="请输入密码" class="layui-input" />
              <span v-if="isEdit" class="form-tip">不填则保持原密码</span>
            </div>
          </div>
          <div class="layui-form-item">
            <label class="layui-form-label">角色</label>
            <div class="layui-input-block">
              <select v-model="form.role" class="layui-input">
                <option value="student">学生</option>
                <option value="teacher">教师</option>
                <option value="admin">管理员</option>
              </select>
            </div>
          </div>
        </form>
        <div class="dialog-footer">
          <button class="layui-btn cancel-btn" @click="closeDialog">取消</button>
          <button class="layui-btn submit-btn" @click="submitForm">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="confirm-modal" @click.self="showDeleteConfirm = false">
      <div class="confirm-dialog">
        <div class="confirm-header">
          <span class="confirm-title">提示</span>
          <button class="confirm-close" @click="showDeleteConfirm = false">
            <i class="layui-icon layui-icon-close"></i>
          </button>
        </div>
        <div class="confirm-body">
          <i class="layui-icon layui-icon-tips confirm-icon"></i>
          <span>确定要删除该用户吗？</span>
        </div>
        <div class="confirm-footer">
          <button class="layui-btn cancel-btn" @click="showDeleteConfirm = false">取消</button>
          <button class="layui-btn confirm-btn" @click="confirmDelete">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { getUserList, addUser, updateUser, updateUserStatus, deleteUser as deleteUserApi } from '../api/user'
import { layer } from '@layui/layui-vue'

const appStore = useAppStore()
const searchUsername = ref('')
const userTypeFilter = ref('')
const dialogVisible = ref(false)
const showDeleteConfirm = ref(false)
const deleteUserId = ref(null)

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
const isEdit = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const users = ref([])

const form = reactive({
  id: null,
  username: '',
  password: '',
  role: 'student',
})

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  return pages
})

const fetchUsers = async () => {
  try {
    console.log('fetchUsers called, params:', {
      page: currentPage.value,
      limit: pageSize.value,
      username: searchUsername.value,
      role: userTypeFilter.value
    })
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    }
    if (searchUsername.value) {
      params.username = searchUsername.value
    }
    if (userTypeFilter.value) {
      params.role = userTypeFilter.value
    }
    const res = await getUserList(params)
    console.log('fetchUsers response:', res)
    users.value = res.data.list
    total.value = res.data.total
    console.log('users set to:', users.value, 'total:', total.value)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    layer.msg('获取用户列表失败', { icon: 5 })
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchUsers()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchUsers()
  }
}

const goToPage = (page) => {
  if (page !== '...') {
    currentPage.value = page
    fetchUsers()
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

const openAddDialog = () => {
  isEdit.value = false
  form.id = null
  form.username = ''
  form.password = ''
  form.role = 'student'
  dialogVisible.value = true
}

const openEditDialog = (user) => {
  isEdit.value = true
  form.id = user.id
  form.username = user.username
  form.password = ''
  form.role = user.role
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
}

const submitForm = async () => {
  if (!form.username) {
    layer.msg('请输入用户名', { icon: 5 })
    return
  }
  if (!isEdit.value && !form.password) {
    layer.msg('请输入密码', { icon: 5 })
    return
  }

  try {
    if (isEdit.value) {
      await updateUser(form)
      layer.msg('编辑成功', { icon: 6 })
    } else {
      await addUser(form)
      layer.msg('新增成功', { icon: 6 })
      currentPage.value = 1
      searchUsername.value = ''
      userTypeFilter.value = ''
    }
    await fetchUsers()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    closeDialog()
  }
}

const toggleUserStatus = async (user) => {
  const newStatus = user.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '启用' : '禁用'
  try {
    await updateUserStatus(user.id, newStatus)
    layer.msg(`${statusText}成功`, { icon: 6 })
    fetchUsers()
  } catch (error) {
    console.error('状态切换失败:', error)
  }
}

const deleteUser = (id) => {
  deleteUserId.value = id
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  try {
    await deleteUserApi(deleteUserId.value)
    layer.msg('删除成功', { icon: 6 })
    if (users.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
    await fetchUsers()
  } catch (error) {
    console.error('删除失败:', error)
  }
  showDeleteConfirm.value = false
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 24px;
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-group {
  display: flex;
  gap: 10px;
}

.search-input-wrapper {
  position: relative;
}

.search-input-wrapper i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted, #94a3b8);
  font-size: 16px;
}

.search-input {
  width: 260px;
  height: 42px;
  padding: 0 14px 0 40px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: var(--primary-color, #1e4d7b);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #1e4d7b) 8%, transparent);
}

.search-btn {
  height: 42px;
  padding: 0 24px;
  background: #fff;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-btn:hover {
  border-color: var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 3%, white);
}

.filter-select {
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  min-width: 160px;
  font-size: 14px;
  color: var(--text-secondary, #475569);
}

.add-btn {
  height: 42px;
  padding: 0 24px;
  background: linear-gradient(135deg, var(--success-color, #0d9488) 0%, color-mix(in srgb, var(--success-color, #0d9488) 70%, white) 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--success-color, #0d9488) 30%, transparent);
}

.user-table-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--surface-tint, #f1f5f9);
}

.table-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #334155);
}

.table-count {
  font-size: 13px;
  color: var(--text-muted, #94a3b8);
}

.table-wrapper {
  overflow-x: auto;
}

.layui-table {
  width: 100%;
  border-collapse: collapse;
}

.layui-table th,
.layui-table td {
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid var(--surface-tint, #f1f5f9);
  font-size: 14px;
}

.layui-table th {
  background: var(--surface-tint, #f8fafc);
  font-weight: 600;
  color: var(--text-secondary, #64748b);
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: var(--surface-tint, #f8fafc);
}

.role-tag {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.role-tag.admin {
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 12%, transparent);
  color: var(--primary-color, #1e4d7b);
}

.role-tag.student {
  background: color-mix(in srgb, var(--success-color, #0d9488) 12%, transparent);
  color: var(--success-color, #0d9488);
}

.role-tag.teacher {
  background: color-mix(in srgb, var(--warning-color, #fbbf24) 15%, transparent);
  color: var(--warning-color, #b45309);
}

.status-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.status-toggle:hover {
  background: var(--surface-tint, #f1f5f9);
}

.toggle-track {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--text-muted, #94a3b8) 30%, transparent);
  border: 1px solid var(--text-muted, #94a3b8);
  transition: all 0.3s ease;
}

.status-toggle.active .toggle-track {
  background: var(--success-color, #0d9488);
  border-color: var(--success-color, #0d9488);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.status-toggle.active .toggle-thumb {
  transform: translateX(20px);
}

.toggle-text {
  font-size: 13px;
  font-weight: 500;
}

.status-toggle.active .toggle-text {
  color: var(--success-color, #0d9488);
}

.status-toggle.inactive .toggle-text {
  color: var(--text-muted, #94a3b8);
}

.actions {
  display: flex;
  gap: 10px;
}

.edit-btn {
  background: #fff;
  border: 1px solid var(--surface-tint, #e2e8f0);
  color: var(--text-secondary, #475569);
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  border-color: var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
  background: color-mix(in srgb, var(--primary-color, #1e4d7b) 3%, white);
}

.delete-btn {
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--danger-color, #f87171) 30%, transparent);
  color: var(--danger-color, #f87171);
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: color-mix(in srgb, var(--danger-color, #f87171) 5%, transparent);
}



.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--text-muted, #94a3b8);
}

.empty-state i {
  font-size: 56px;
  margin-bottom: 16px;
}

.empty-state span {
  font-size: 15px;
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

.form-tip {
  display: block;
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
  margin-top: 8px;
}

.layui-input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  font-size: 14px;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 20px 24px;
  border-top: 1px solid var(--surface-tint, #f1f5f9);
  flex-wrap: wrap;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

.page-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary, #64748b);
  transition: all 0.3s ease;
}

.page-number:hover {
  border-color: var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
}

.page-number.active {
  background: linear-gradient(135deg, var(--primary-color, #1e4d7b) 0%, var(--primary-light, #3d7ab5) 100%);
  border-color: var(--primary-color, #1e4d7b);
  color: #fff;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 20px;
  font-size: 13px;
  color: var(--text-muted, #94a3b8);
}

.page-size-select {
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
  width: 80px;
  border-radius: 8px;
  border: 1px solid var(--surface-tint, #e2e8f0);
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination .layui-btn {
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid var(--surface-tint, #e2e8f0);
  background: #fff;
  color: var(--text-secondary, #64748b);
}

.pagination .layui-btn:hover:not(:disabled) {
  border-color: var(--primary-color, #1e4d7b);
  color: var(--primary-color, #1e4d7b);
}

.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  background: #fff;
  border-radius: 16px;
  width: 380px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  animation: dialogFadeIn 0.3s ease;
}

.confirm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.confirm-title {
  font-size: 17px;
  font-weight: 600;
  color: #334155;
}

.confirm-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  line-height: 1;
  transition: all 0.2s ease;
}

.confirm-close:hover {
  color: #64748b;
  background: #f1f5f9;
}

.confirm-body {
  padding: 36px 24px;
  text-align: center;
  font-size: 15px;
  color: #475569;
}

.confirm-icon {
  font-size: 36px;
  color: #fbbf24;
  margin-right: 12px;
}

.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f1f5f9;
}

.confirm-btn {
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

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--primary-color, #1e4d7b) 30%, transparent);
}
</style>
