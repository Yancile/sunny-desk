const { getUserById, updateUser } = require('../_utils/users');
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

  const id = parseInt(req.query.id);
  const { status } = req.body;
  const user = getUserById(id);

  if (!user) {
    return res.status(404).json({ code: 404, message: '用户不存在' });
  }

  updateUser(id, { status });
  res.status(200).json({ code: 200, message: '状态更新成功' });
};
