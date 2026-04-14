const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken } = require('../middleware/auth');

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



module.exports = router