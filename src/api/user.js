import request from './axios'

// 登录
export const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

// 获取用户列表
export const getUserList = (params) => {
  return request({
    url: '/user/list',
    method: 'get',
    params,
  })
}

// 新增用户
export const addUser = (data) => {
  return request({
    url: '/user/add',
    method: 'post',
    data,
  })
}

// 更新用户
export const updateUser = (data) => {
  return request({
    url: '/user/update',
    method: 'put',
    data,
  })
}

// 删除用户
export const deleteUser = (id) => {
  return request({
    url: `/user/delete/${id}`,
    method: 'delete',
  })
}

// 修改用户状态
export const updateUserStatus = (id, status) => {
  return request({
    url: `/user/status/${id}`,
    method: 'put',
    data: { status },
  })
}

// 获取用户统计数据
export const getStatistics = () => {
  return request({
    url: '/user/statistics',
    method: 'get',
  })
}

// 获取个人资料
export const getProfile = () => {
  return request({
    url: '/user/profile',
    method: 'get',
  })
}

// 更新个人资料
export const updateProfile = (data) => {
  return request({
    url: '/user/profile',
    method: 'put',
    data,
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: '/user/change-password',
    method: 'put',
    data,
  })
}