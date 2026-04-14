const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken } = require('../middleware/auth');

// 获取所有班级
router.get('/', verifyToken, async (req, res) => {
  // res.send('获取所有班级');
  try {
    const [classes] = await db.query('SELECT * FROM classes');
    res.json({
      code: 200,
      message: '获取班级成功',
      data: classes
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

//新增班级
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '您没有权限新增班级' });
  }
  const { name, teacher_id } = req.body;
  try {
    const [result] = await db.query('INSERT INTO classes (name, teacher_id) VALUES (?, ?)', [name, teacher_id || null]);
    res.json({
      code: 201,
      message: '班级新增成功',
      data: {
        id: result.insertId,
        name: name,
        teacher_id: teacher_id || null,
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

//删除班级
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '您没有权限删除班级' });
  }
  const { id } = req.params;
  try {

    //检查班级是否存在
    const [classInfo] = await db.query('SELECT * FROM classes WHERE id = ?', [id]);

    if (classInfo.length === 0) {
      return res.status(404).json({ code: 404, message: '班级不存在' });
    }

    const deletedClass = classInfo[0];

    //修改教师班级为null
    await db.query(
      'UPDATE users SET class_id = NULL WHERE class_id = ? AND role = "teacher"',
      [id]
    );

    //删除班级
    await db.query('DELETE FROM classes WHERE id = ?', [id]);
    res.json({
      code: 200,
      message: '班级删除成功',
      data: {
        id,
        name: deletedClass.name,
        teacher_id: deletedClass.teacher_id || null,
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});



// 更新班级教师绑定



module.exports = router