const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken } = require('../middleware/auth');
const { addLog } = require('../utils/logger');

// 获取所有成绩
router.get('/', verifyToken, async (req, res) => {
  try {
    const [scores] = await db.query('SELECT * FROM scores');
    res.json({
      code: 200,
      message: '获取所有成绩成功',
      data: scores
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});


// 添加成绩
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ code: 403, message: '您没有权限添加成绩' });
  }
  try {
    const { class_id, student_id, subject, score } = req.body;
    const [result] = await db.query('INSERT INTO scores (class_id, student_id, subject, score) VALUES (?, ?, ?, ?)', [class_id, student_id, subject, score]);

    // 记录日志
    await addLog(req, '新增成绩', `班级ID: ${class_id}, 学生ID: ${student_id}, 科目: ${subject}, 成绩: ${score}`);

    res.json({
      code: 201,
      message: '成绩添加成功',
      data: {
        id: result.insertId,
        class_id,
        student_id,
        subject,
        score
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});


// 删除成绩
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' || req.user.role !== 'teacher') {
    return res.status(403).json({ code: 403, message: '您没有权限删除成绩' });
  }
  try {
    const { id } = req.params;
    console.log(id);
    // 检查成绩是否存在 删除的成绩信息
    const [score] = await db.query('SELECT * FROM scores WHERE id = ?', [id]);

    if (score.length === 0) {
      return res.status(404).json({ code: 404, message: '成绩不存在' });
    }

    const deletedScore = score[0];


    await db.query('DELETE FROM scores WHERE id = ?', [id]);

    // 记录日志
    await addLog(req, '删除成绩', `成绩ID: ${id}, 班级ID: ${deletedScore.class_id}, 学生ID: ${deletedScore.student_id}, 科目: ${deletedScore.subject}`);
    res.json({
      code: 200,
      message: '成绩删除成功',
      data: deletedScore
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// 修改成绩
router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ code: 403, message: '您没有权限修改成绩' });
  }
  try {
    const { id } = req.params;
    const { score } = req.body;

    // 获取被修改的成绩信息
    const [oldScore] = await db.query('SELECT * FROM scores WHERE id = ?', [id]);
    if (oldScore.length === 0) {
      return res.status(404).json({ code: 404, message: '成绩不存在' });
    }
    const oldScoreData = oldScore[0];

    // 检查成绩是否已存在
    if (score === oldScoreData.score) {
      return res.status(400).json({ code: 400, message: '成绩未改变' });
    }
    await db.query('UPDATE scores SET score = ? WHERE id = ?', [score, id]);

    // 记录日志
    await addLog(req, '修改成绩', `成绩ID: ${id}, 班级ID: ${oldScoreData.class_id}, 学生ID: ${oldScoreData.student_id}, 科目: ${oldScoreData.subject}, 旧成绩: ${oldScoreData.score}, 新成绩: ${score}`);

    res.json({
      code: 200,
      message: '成绩修改成功',
      // 显示被修改的成绩的信息
      data: {
        id,
        score,
        class_id: oldScoreData.class_id,
        student_id: oldScoreData.student_id,
        subject: oldScoreData.subject,
        old_score: oldScoreData.score,
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});


//成绩的统计
router.get('/statistics', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' || req.user.role !== 'teacher') {
    return res.status(403).json({ code: 403, message: '您没有权限获取成绩统计' });
  }
  const { class_id, subject } = req.query;
  try {
    let sql = `
            SELECT 
                s.class_id,
                c.name as class_name,
                s.subject,
                COUNT(*) as total_count,
                ROUND(AVG(s.score), 1) as avg_score,
                MAX(s.score) as max_score,
                MIN(s.score) as min_score,
                SUM(CASE WHEN s.score >= 60 THEN 1 ELSE 0 END) as pass_count
            FROM scores s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE 1=1
        `;

    let params = [];

    if (class_id) {
      sql += ' AND s.class_id = ?';
      params.push(class_id);
    }

    if (subject) {
      sql += ' AND s.subject = ?';
      params.push(subject);
    }

    sql += ' GROUP BY s.class_id, s.subject ORDER BY s.class_id, s.subject';

    const [rows] = await db.query(sql, params);

    const result = rows.map(row => ({
      class_id: row.class_id,
      class_name: row.class_name,
      subject: row.subject,
      total_count: row.total_count,
      avg_score: row.avg_score || 0,
      max_score: row.max_score || 0,
      min_score: row.min_score || 0,
      pass_count: row.pass_count || 0,
      pass_rate: row.total_count > 0
        ? ((row.pass_count / row.total_count) * 100).toFixed(1) + '%'
        : '0%'
    }));

    res.json({
      code: 200,
      message: '获取成绩统计成功',
      data: result
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});



// 导出成绩（CSV格式）
router.get('/export', verifyToken, async (req, res) => {
  const { classId, subject, studentId, studentName } = req.query;

  //获取用户的角色和班级ID
  const userRole = req.user.role;
  const userClassId = req.user.classId;

  try {
    // 1. 构建查询SQL（关联学生姓名和班级名称）
    let sql = `
            SELECT 
                u.name as student_name,
                u.id as student_no,
                c.name as class_name,
                s.subject,
                s.score,
                s.updated_at
            FROM scores s
            LEFT JOIN users u ON s.student_id = u.id
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE 1=1
        `;
    let params = [];

    // 2. 添加筛选条件
    if (userRole === 'teacher') {
      sql += ' AND s.class_id = ?';
      params.push(userClassId);
    }


    if (classId && userRole === 'admin') {
      sql += ' AND s.class_id = ?';
      params.push(classId);
    }
    if (subject) {
      sql += ' AND s.subject = ?';
      params.push(subject);
    }
    if (studentId) {
      sql += ' AND u.id = ?';
      params.push(studentId);
    }
    if (studentName) {
      sql += ' AND u.name LIKE ?';
      params.push(`%${studentName}%`);
    }

    // 3. 执行查询
    const [rows] = await db.query(sql, params);

    // 4. 判断是否有数据
    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '没有找到符合条件的数据'
      });
    }

    // 5. 生成CSV内容
    const headers = ['学号', '学生姓名', '班级', '科目', '分数', '更新时间'];
    const csvRows = [headers];

    rows.forEach(row => {
      csvRows.push([
        row.student_id || '',
        row.student_name || '',
        row.class_name || '',
        row.subject || '',
        row.score || '',
        row.updated_at ? new Date(row.updated_at).toLocaleString() : ''
      ]);
    });

    // 6. 转换为CSV字符串
    const csvContent = csvRows.map(row => row.join(',')).join('\n');

    // 7. 添加BOM解决中文乱码
    const bom = '\uFEFF';

    // 8. 设置响应头（告诉浏览器下载文件）
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=scores_${Date.now()}.csv`);

    // 9. 发送文件
    res.send(bom + csvContent);

  } catch (err) {
    console.error('导出失败:', err);
    res.status(500).json({ code: 500, message: '导出失败：' + err.message });
  }
});


module.exports = router