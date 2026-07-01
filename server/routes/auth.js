const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const userData = require('../data/users');

const SECRET_KEY = 'self-manage-system-secret-key-2024';

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
  }

  const user = userData.getUserByUsername(username);

  if (!user || user.password !== password) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }

  if (user.status === 0) {
    return res.status(401).json({ code: 401, message: '该用户已被禁用' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: '24h' }
  );

  const { password: _, ...userInfo } = user;
  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token,
      userInfo
    }
  });
});

module.exports = router;
