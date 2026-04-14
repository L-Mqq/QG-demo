require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
const path = require('path');


const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/users', require('./routes/users'));



// 静态文件资源响应
app.use(express.static(path.join(__dirname, 'public')));

// 测试路由
app.get('/', (req, res) => {
  res.send('教学管理系统 API 运行中');
});

// 启动服务器
app.listen(config.port, () => {
  console.log(`🚀 服务器运行在 http://localhost:${config.port}`);
  console.log(`📋 登录接口: http://localhost:${config.port}/api/auth/login`);
});