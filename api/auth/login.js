const { getUserByUsername, bcrypt } = require('../_utils/users');
const { generateToken } = require('../_utils/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 405, message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
  }

  const user = getUserByUsername(username);

  if (!user) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }

  if (user.status === 0) {
    return res.status(401).json({ code: 401, message: '该用户已被禁用' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }

  const token = generateToken(user);

  const { password: _, ...userInfo } = user;
  res.status(200).json({
    code: 200,
    message: '登录成功',
    data: {
      token,
      userInfo
    }
  });
};
