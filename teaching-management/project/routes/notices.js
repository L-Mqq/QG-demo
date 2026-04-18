const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken } = require('../middleware/auth');
const { addLog } = require('../utils/logger');

// 1. 发布通知
router.post('/', verifyToken, async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;
  let { class_id, title, content } = req.body;

  // 权限检查
  if (userRole !== 'teacher' && userRole !== 'admin') {
    return res.status(403).json({ code: 403, message: '权限不足' });
  }
  // 校验参数
  if (!title) {
    return res.status(400).json({ code: 400, message: '标题不能为空' });
  }

  // 管理员
  if (userRole === 'admin' && !class_id) {
    // 全校通知，class_id 设为 NULL
    try {
      const [result] = await db.query(
        'INSERT INTO notices (class_id, teacher_id, title, content) VALUES (NULL, ?, ?, ?)',
        [userId, title, content || '']
      );
      // 记录日志
      await addLog(req, '发布通知', `发布全校通知：${title}`);
      return res.json({ code: 200, message: '全校通知发布成功', data: { id: result.insertId } });
    } catch (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
  }
  // 班主任
  if (userRole === 'teacher' && !class_id) {
    return res.status(400).json({ code: 400, message: '请选择班级' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO notices (class_id, teacher_id, title, content) VALUES (?, ?, ?, ?)',
      [class_id, userId, title, content || '']
    );

    // 记录日志
    await addLog(req, '发布通知', `发布通知：${title}`);

    res.json({ code: 200, message: '通知发布成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 2. 获取通知列表
router.get('/', verifyToken, async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user.id;
  const userClassId = req.user.classId;
  const { page = 1, pageSize = 20 } = req.query;
  const offset = (page - 1) * pageSize;

  try {
    let sql = `
      SELECT 
        n.*, 
        u.name as teacher_name,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT CASE WHEN nr.is_read = 1 THEN s.id END) as read_count
      FROM notices n
      LEFT JOIN users u ON n.teacher_id = u.id
      LEFT JOIN users s ON s.class_id = n.class_id AND s.role = 'student'
      LEFT JOIN notice_reads nr ON n.id = nr.notice_id AND nr.student_id = s.id
      WHERE 1=1
    `;
    let params = [];

    //
    if (userRole === 'teacher') {
      sql += ' AND (n.teacher_id = ? OR n.class_id = ? OR n.class_id IS NULL)';
      params.push(userId, userClassId);
    }


    sql += ' GROUP BY n.id ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const [rows] = await db.query(sql, params);

    const list = rows.map(row => ({
      ...row,
      unread_count: (row.total_students || 0) - (row.read_count || 0)
    }));

    let countSql = 'SELECT COUNT(*) as total FROM notices n WHERE 1=1';
    let countParams = [];

    if (userRole === 'teacher') {
      //count 也要加全校通知
      countSql += ' AND (n.teacher_id = ? OR n.class_id = ? OR n.class_id IS NULL)';
      countParams.push(userId, userClassId);
    }
    const [countResult] = await db.query(countSql, countParams);

    res.json({
      code: 200,
      data: {
        list,
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 3.学生标记已读  传入的是通知的id
router.post('/:id/read', verifyToken, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ code: 403, message: '权限不足' });
  }

  //获取通知ID和学生ID
  const noticeId = req.params.id;
  const studentId = req.user.id;

  try {
    await db.query(
      `INSERT INTO notice_reads (notice_id, student_id, is_read, read_at) 
             VALUES (?, ?, 1, NOW()) 
             ON DUPLICATE KEY UPDATE is_read = 1, read_at = NOW()`,
      [noticeId, studentId]
    );

    //记录日志
    await addLog(req, '标记已读', `标记已读通知：${noticeId}`);

    res.json({ code: 200, message: '已标记为已读' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 4. 学生获取已读通知列表
router.get('/student', verifyToken, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ code: 403, message: '权限不足' });
  }

  const studentId = req.user.id;
  const classId = req.user.classId;
  const { page = 1, pageSize = 20 } = req.query;
  const offset = (page - 1) * pageSize;

  try {
    const sql = `
            SELECT 
                n.*,
                u.name as teacher_name,
                CASE WHEN nr.is_read = 1 THEN 1 ELSE 0 END as is_read
            FROM notices n
            LEFT JOIN users u ON n.teacher_id = u.id
            LEFT JOIN notice_reads nr ON n.id = nr.notice_id AND nr.student_id = ?
            WHERE n.class_id = ? OR n.class_id IS NULL
            ORDER BY n.created_at DESC
            LIMIT ? OFFSET ?
        `;

    const [rows] = await db.query(sql, [studentId, classId, parseInt(pageSize), offset]);

    // 查询总数
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM notices WHERE class_id = ? OR class_id IS NULL',
      [classId]
    );

    res.json({
      code: 200,
      data: {
        list: rows,
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});


// 5.删除通知 通知的id
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;


  try {
    // 获取教师id
    const [notices] = await db.query('SELECT * FROM notices WHERE id = ?', [id]);

    if (notices.length === 0) {
      return res.status(404).json({ code: 404, message: '通知不存在' });
    }

    const notice = notices[0];

    // 权限验证  只有管理员或发布者可以删除 教师只能删除自己发布的通知
    if (req.user.role !== 'admin' && req.user.id !== notice.teacher_id) {
      return res.status(403).json({ code: 403, message: '没有权限删除此通知' });
    }

    // 先删除阅读记录
    await db.query('DELETE FROM notice_reads WHERE notice_id = ?', [id]);
    // 再删除通知
    const [result] = await db.query('DELETE FROM notices WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '通知不存在' });
    }

    // 记录日志
    await addLog(req, '删除通知', `删除通知：${id}`);

    res.json({ code: 200, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 6.编辑通知
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, class_id } = req.body;

  try {
    // 1. 查询通知是否存在
    const [notices] = await db.query('SELECT * FROM notices WHERE id = ?', [id]);

    if (notices.length === 0) {
      return res.status(404).json({ code: 404, message: '通知不存在' });
    }

    const notice = notices[0];

    // 2. 权限验证：只有管理员或发布者可以编辑
    if (req.user.role !== 'admin' && req.user.id !== notice.teacher_id) {
      return res.status(403).json({ code: 403, message: '没有权限编辑此通知' });
    }

    // 3. 验证必填字段 
    if (!title || !content) {
      return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
    }

    // 4. 更新通知
    const [result] = await db.query(
      'UPDATE notices SET title = ?, content = ?, class_id = ?, updated_at = NOW() WHERE id = ?',
      [title, content, class_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '通知不存在' });
    }

    // 5. 记录日志
    await addLog(req, '编辑通知', `编辑通知：${id}`);

    res.json({
      code: 200,
      message: '编辑成功',
      data: { id, title, content, class_id }
    });

  } catch (err) {
    console.error('编辑通知错误:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router