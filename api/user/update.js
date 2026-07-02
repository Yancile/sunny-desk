const { getUserById, getUserByUsername, updateUser, bcrypt } = require('../_utils/users');
const { authenticateToken } = require('../_utils/auth');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ code: 405, message: 'Method Not Allowed' });
  }

  const auth = authenticateToken(req);
  if (!auth.valid) {
    return res.status(401).json({ code: 401, message: auth.error });
  }

  if (auth.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '无权限执行此操作' });
  }

  const { id, username, email, role, phone, password } = req.body;
  const existingUser = getUserById(id);

  if (!existingUser) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }

  if (username && getUserByUsername(username) && getUserByUsername(username).id !== id) {
    return res.status(400).json({ code: 400, message: '用户名已存在' });
  }

  const updateData = {
    username: username || existingUser.username,
    email: email !== undefined ? email : existingUser.email,
    role: role || existingUser.role,
    phone: phone !== undefined ? phone : existingUser.phone
  };

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = updateUser(id, updateData);

  const { password: _, ...userInfo } = updatedUser;
  res.status(200).json({ code: 200, message: '更新成功', data: userInfo });
};
