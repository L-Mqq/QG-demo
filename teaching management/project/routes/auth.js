const express = require('express');
const router = express.Router();
// 引入认证控制器
const authController = require('../controllers/authController');
// 引入认证中间件
const { verifyToken } = require('../middleware/auth');

// 登录路由
router.post('/login', authController.login);

// router.get('/verify', verifyToken);

module.exports = router;