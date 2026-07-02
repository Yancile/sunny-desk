const { addUser, getUserByUsername, getNextId, bcrypt } = require('../_utils/users');
const { authenticateToken } = require('../_utils/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 405, message: 'Method Not Allowed' });
  }

  const auth = authenticateToken(req);
  if (!auth.valid) {
    return res.status(401).json({ code: 401, message: auth.error });
  }

  if (auth.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '无权限执行此操作' });
  }

  const { username, password, email, role, phone } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
  }

  if (getUserByUsername(username)) {
    return res.status(400).json({ code: 400, message: '用户名已存在' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: getNextId(),
    username,
    password: hashedPassword,
    email: email || '',
    role: role || 'student',
    phone: phone || '',
    avatar: '',
    createTime: new Date().toISOString().split('T')[0],
    status: 1
  };

  addUser(newUser);

  const { password: _, ...userInfo } = newUser;
  res.status(200).json({ code: 200, message: '添加成功', data: userInfo });
};
