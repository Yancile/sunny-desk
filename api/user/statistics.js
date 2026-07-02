const { getUsers } = require('../_utils/users');
const { authenticateToken } = require('../_utils/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ code: 405, message: 'Method Not Allowed' });
  }

  const auth = authenticateToken(req);
  if (!auth.valid) {
    return res.status(401).json({ code: 401, message: auth.error });
  }

  const users = getUsers();
  const total = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;

  res.status(200).json({
    code: 200,
    message: '获取成功',
    data: {
      total,
      adminCount,
      studentCount,
      teacherCount
    }
  });
};
