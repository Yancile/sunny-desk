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

  const { page = 1, limit = 10, username = '', role = '' } = req.query;
  const pageNum = parseInt(page);
  const pageSize = parseInt(limit);

  let filteredUsers = getUsers();
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

  res.status(200).json({
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page: pageNum,
      limit: pageSize
    }
  });
};
