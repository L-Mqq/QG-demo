const express = require('express');
const router = express.Router();
const db = require('../models/db');

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


//修改用户信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id } = req.body;
    await db.query('UPDATE users SET class_id = ? WHERE id = ?', [class_id, id]);

    const [updatedUser] = await db.query(
      'SELECT id, username, name, role, class_id, created_at FROM users WHERE id = ?',
      [id]
    );
    res.json({
      code: 200,
      message: '用户信息更新成功',
      data: updatedUser[0]
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});


module.exports = router;