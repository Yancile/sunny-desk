const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const userData = require('../data/users');

const SECRET_KEY = 'self-manage-system-secret-key-2024';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ code: 401, message: '未提供认证令牌' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ code: 403, message: '令牌无效或已过期' });
    }
    req.user = user;
    next();
  });
};

router.get('/list', authenticateToken, (req, res) => {
  const { page = 1, limit = 10, username = '', role = '' } = req.query;
  const pageNum = parseInt(page);
  const pageSize = parseInt(limit);

  let filteredUsers = userData.getUsers();
  if (username) {
    filteredUsers = filteredUsers.filter(u => u.username.includes(username));
  }
  if (role) {
    filteredUsers = filteredUsers.filter(u => u.role === role);
  }

  filteredUsers.sort((a, b) => b.id - a.id);

  const total = filteredUsers.length;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const list = filteredUsers.slice(start, end);

  res.json({
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page: pageNum,
      limit: pageSize
    }
  });
});

router.post('/add', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '无权限执行此操作' });
  }

  const { username, password, email, role, phone } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
  }

  if (userData.getUserByUsername(username)) {
    return res.status(400).json({ code: 400, message: '用户名已存在' });
  }

  const newUser = {
    id: userData.getNextId(),
    username,
    password,
    email: email || '',
    role: role || 'student',
    phone: phone || '',
    avatar: '',
    createTime: new Date().toISOString().split('T')[0],
    status: 1
  };

  userData.addUser(newUser);

  res.json({ code: 200, message: '添加成功', data: newUser });
});

router.put('/update', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '无权限执行此操作' });
  }

  const { id, username, email, role, phone, password } = req.body;
  const existingUser = userData.getUserById(id);

  if (!existingUser) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }

  if (username && userData.getUserByUsername(username) && userData.getUserByUsername(username).id !== id) {
    return res.status(400).json({ code: 400, message: '用户名已存在' });
  }

  const updateData = {
    username: username || existingUser.username,
    email: email !== undefined ? email : existingUser.email,
    role: role || existingUser.role,
    phone: phone !== undefined ? phone : existingUser.phone
  };

  if (password) {
    updateData.password = password;
  }

  const updatedUser = userData.updateUser(id, updateData);

  res.json({ code: 200, message: '更新成功', data: updatedUser });
});

router.delete('/delete/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '无权限执行此操作' });
  }

  const id = parseInt(req.params.id);
  const deletedUser = userData.deleteUser(id);

  if (!deletedUser) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }

  res.json({ code: 200, message: '删除成功' });
});

router.put('/status/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '无权限执行此操作' });
  }

  const id = parseInt(req.params.id);
  const { status } = req.body;
  const user = userData.getUserById(id);

  if (!user) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }

  userData.updateUser(id, { status });
  res.json({ code: 200, message: '状态更新成功' });
});

router.get('/statistics', authenticateToken, (req, res) => {
  const users = userData.getUsers();
  const total = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;

  res.json({
    code: 200,
    message: '获取成功',
    data: {
      total,
      adminCount,
      studentCount,
      teacherCount
    }
  });
});

router.get('/profile', authenticateToken, (req, res) => {
  const user = userData.getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }

  const { password: _, ...userInfo } = user;
  res.json({ code: 200, message: '获取成功', data: userInfo });
});

router.put('/profile', authenticateToken, (req, res) => {
  const { username, email, phone, avatar } = req.body;
  const user = userData.getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }

  // 检查用户名是否已被其他用户使用
  if (username) {
    const existingUser = userData.getUserByUsername(username);
    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(400).json({ code: 400, message: '用户名已存在' });
    }
  }

  const updatedUser = userData.updateUser(req.user.id, {
    username: username || user.username,
    email: email !== undefined ? email : user.email,
    phone: phone !== undefined ? phone : user.phone,
    avatar: avatar !== undefined ? avatar : user.avatar
  });

  const { password: _, ...userInfo } = updatedUser;
  res.json({ code: 200, message: '修改成功', data: userInfo });
});

// 修改密码
router.put('/change-password', authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = userData.getUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }

  // 验证旧密码
  if (user.password !== oldPassword) {
    return res.status(400).json({ code: 400, message: '旧密码不正确' });
  }

  // 更新密码
  userData.updateUser(req.user.id, { password: newPassword });

  res.json({ code: 200, message: '密码修改成功' });
});

module.exports = router;
