const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken } = require('../middleware/auth');
const { addLog } = require('../utils/logger');

router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users');
    // console.log('查询成功，数量:', users.length);
    res.json({
      code: 200,
      message: '获取所有用户成功',
      data: users
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});


//修改教师信息 班级信息 绑定按钮
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id } = req.body;

    const [user] = await db.query('SELECT role, class_id FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    const isTeacher = user[0].role === 'teacher';

    // 如果是教师且有新班级，设置新班级的 teacher_id
    if (isTeacher && class_id) {
      await db.query('UPDATE classes SET teacher_id = ? WHERE id = ?', [id, class_id]);
      // 记录日志
      await addLog(req, '绑定班主任', `教师ID: ${id} 绑定到班级: ${class_id}`);
    }

    await db.query('UPDATE users SET class_id = ? WHERE id = ?', [class_id, id]);

    // 记录日志
    await addLog(req, '修改教师信息', `教师ID: ${id}, 新班级ID: ${class_id}`);

    const [updatedUser] = await db.query(
      'SELECT id, username, name, role, class_id, created_at FROM users WHERE id = ?',
      [id]
    );
    res.json({
      code: 200,
      message: '教师与班级信息更新成功',
      data: updatedUser[0]
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});


module.exports = router;