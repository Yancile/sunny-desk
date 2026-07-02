const { getUserById, getUserByUsername, updateUser, bcrypt } = require('../_utils/users');
const { authenticateToken } = require('../_utils/auth');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const auth = authenticateToken(req);
    if (!auth.valid) {
      return res.status(401).json({ code: 401, message: auth.error });
    }

    const user = getUserById(auth.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    const { password: _, ...userInfo } = user;
    res.status(200).json({ code: 200, message: '获取成功', data: userInfo });
  } else if (req.method === 'PUT') {
    const auth = authenticateToken(req);
    if (!auth.valid) {
      return res.status(401).json({ code: 401, message: auth.error });
    }

    const { username, email, phone, avatar, oldPassword, newPassword } = req.body;
    const user = getUserById(auth.user.id);

    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    if (username) {
      const existingUser = getUserByUsername(username);
      if (existingUser && existingUser.id !== auth.user.id) {
        return res.status(400).json({ code: 400, message: '用户名已存在' });
      }
    }

    const updateData = {
      username: username || user.username,
      email: email !== undefined ? email : user.email,
      phone: phone !== undefined ? phone : user.phone,
      avatar: avatar !== undefined ? avatar : user.avatar
    };

    if (oldPassword && newPassword) {
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return res.status(400).json({ code: 400, message: '旧密码不正确' });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = updateUser(auth.user.id, updateData);

    const { password: _, ...userInfo } = updatedUser;
    res.status(200).json({ code: 200, message: '修改成功', data: userInfo });
  } else {
    return res.status(405).json({ code: 405, message: 'Method Not Allowed' });
  }
};
