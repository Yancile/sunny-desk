require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const allowedOrigins = NODE_ENV === 'production' 
  ? ['https://your-domain.com'] 
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: '个人后台管理系统 API 服务' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT} (${NODE_ENV})`);
});
