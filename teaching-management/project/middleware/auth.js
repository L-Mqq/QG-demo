const jwt = require('jsonwebtoken');
const config = require('../config');

// 生成JWT
// 包含用户ID、用户名、角色、班级ID
function generateToken(user) {
  return jwt.sign(
    //用户数据 
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      classId: user.class_id
    },
    // 加密字符串
    config.jwtSecret,
    // 有效期
    { expiresIn: '7d' }
  );
}

// 验证JWT
function verifyToken(req, res, next) {
  // 检查是否存在Authorization头
  const token = req.headers.authorization;
  // 如果不存在，返回401错误
  if (!token) {
    return res.status(401).json({ code: 401, message: '未登录' });
  }
  // 验证Token是否有效。 如果有效，将解码后的用户信息挂载到req.user
  try {
    //以便于后面请求时对身份的验证
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT验证失败:', err);
    return res.status(401).json({ code: 401, message: 'Token无效' });
  }
}

// 检查用户角色
function checkRole(...roles) {
  // 检查用户是否在指定角色列表中
  return (req, res, next) => {
    // 如果不在，返回403错误
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }
    // 如果在，继续执行下一个中间件
    next();
  };
}

// 导出中间件  生成JWT 验证JWT 检查用户角色
module.exports = { generateToken, verifyToken, checkRole };