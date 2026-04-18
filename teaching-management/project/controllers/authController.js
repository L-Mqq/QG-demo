const db = require('../models/db');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

//// 登录控制器
// 接收用户名和密码
// 验证用户名和密码
// 生成JWT并返回
async function login(req, res) {
  const { username, password } = req.body;

  console.log('=== 登录调试信息 ===');
  console.log('接收到的用户名:', username);
  console.log('接收到的密码:', password);


  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    // 检查用户名是否存在
    if (users.length === 0) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    const user = users[0];

    // console.log('数据库中的密码:', user.password);
    // console.log('密码长度:', user.PASSWORD ? user.password.length : 0);
    // console.log('密码是否匹配:', password === user.password);
    // console.log('密码类型比较:', typeof password, typeof user.password);

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成JWT
    const token = generateToken(user);

    // 返回登录成功响应
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          classId: user.class_id
        }
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

// 导出控制器
module.exports = { login };