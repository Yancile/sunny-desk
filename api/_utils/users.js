const bcrypt = require('bcryptjs');

const users = [
  { id: 1, username: 'admin', password: '$2b$10$1BMOuXLspXHZGug648BVF.WLoYhCRrrd4WfiG2OcDBl66K73ANkLi', role: 'admin', email: 'admin@example.com', avatar: '', phone: '13800138000', createTime: '2024-01-01', status: 1 },
  { id: 2, username: 'student1', password: '$2b$10$158MPvqDv2lLJGLgSsAVs.1Cf36jaCTsNUY4aYmXMB.cjkHSw2RJy', role: 'student', email: 'student1@example.com', avatar: '', phone: '13800138001', createTime: '2024-01-02', status: 1 },
  { id: 3, username: 'student2', password: '$2b$10$37TlilXUxgyND7p15Jeus.DYRbiAdigM7BV5UHwyBlcwq9Fy7SR3K', role: 'student', email: 'student2@example.com', avatar: '', phone: '13800138002', createTime: '2024-01-03', status: 0 },
  { id: 4, username: 'student3', password: '$2b$10$o2BbTC7cUNVTVJs1qHqn1e5DanGHWyhReyIP1FAkpoIHb0rukUgcm', role: 'student', email: 'student3@example.com', avatar: '', phone: '13800138003', createTime: '2024-01-04', status: 1 },
  { id: 5, username: 'student4', password: '$2b$10$v8MZCyg9lhAKN3XePqqkBe/8klWkwZp/qKqRLAcSM8tV84IedA42S', role: 'student', email: 'student4@example.com', avatar: '', phone: '13800138004', createTime: '2024-01-05', status: 1 },
  { id: 6, username: 'student5', password: '$2b$10$J/SFcsKjDTt2zjsIpiVrL.99f.OMlTr3o.IMoD9m/Cx.oxcmCkq5G', role: 'student', email: 'student5@example.com', avatar: '', phone: '13800138005', createTime: '2024-01-06', status: 0 },
  { id: 7, username: 'teacher1', password: '$2b$10$fxjI/jUvzVDzocIyDQamH.YHz6wKCOBT1F7KzhtaAmHRlVk/mGiMC', role: 'teacher', email: 'teacher1@example.com', avatar: '', phone: '13800138006', createTime: '2024-01-07', status: 1 },
  { id: 8, username: 'student6', password: '$2b$10$TCSpjeQfHDoeJx/W0NuNEuJ4kdNvwh9oYrPl1Ym3vyh8e7SN1/KYi', role: 'student', email: 'student6@example.com', avatar: '', phone: '13800138007', createTime: '2024-01-08', status: 1 },
  { id: 9, username: 'student7', password: '$2b$10$up3TKwb/17oEitfefi59Te4u15m/GZuh5Te7YKP5tSc4pfnsdvehO', role: 'student', email: 'student7@example.com', avatar: '', phone: '13800138008', createTime: '2024-01-09', status: 1 },
  { id: 10, username: 'student8', password: '$2b$10$HsXxhoeWIKrItFO7utjPme7HttKONz8UCfxLRNLech0e1Wz7eHiyu', role: 'student', email: 'student8@example.com', avatar: '', phone: '13800138009', createTime: '2024-01-10', status: 0 },
  { id: 11, username: 'teacher2', password: '$2b$10$9nVDyq8kQKMI6M2QgCPQl.DGprEQI/RXQRTR9pMGb7UkcwpcMeQNW', role: 'teacher', email: 'teacher2@example.com', avatar: '', phone: '13800138010', createTime: '2024-01-11', status: 1 },
  { id: 12, username: 'student9', password: '$2b$10$3LDnH0wNEtZrePIP5XzHzO13MRC.BMT4PD7fnZQZLF9dSqZDb4lOK', role: 'student', email: 'student9@example.com', avatar: '', phone: '13800138011', createTime: '2024-01-12', status: 1 }
];

module.exports = {
  getUsers: () => users,
  addUser: (user) => { users.push(user); },
  getUserById: (id) => users.find(u => u.id === id),
  getUserByUsername: (username) => users.find(u => u.username === username),
  updateUser: (id, data) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      return users[index];
    }
    return null;
  },
  deleteUser: (id) => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      return users.splice(index, 1)[0];
    }
    return null;
  },
  getNextId: () => users.length + 1,
  bcrypt
};
