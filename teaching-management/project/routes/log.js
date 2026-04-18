const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken } = require('../middleware/auth');
const { addLog } = require('../utils/logger');

// 获取操作日志
router.get('/', verifyToken, async (req, res) => {
  // 只有教务主任可以查看日志
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ code: 403, message: '权限不足' });
  }

  const { page = 1, pageSize = 20, type, startDate, endDate, all } = req.query;
  const offset = (page - 1) * pageSize;

  try {
    let sql = 'SELECT * FROM operation_logs WHERE 1=1';
    let params = [];

    // 筛选条件
    //如果是教师的话 只能查看自己的日志
    if (req.user.role === 'teacher') {
      sql += ' AND user_id = ?';
      params.push(req.user.id);
    }

    if (type) {
      sql += ' AND operation_type LIKE ?';
      params.push(`%${type}%`);
    }
    if (startDate) {
      sql += ' AND created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND created_at <= ?';
      params.push(endDate + ' 23:59:59');
    }

    // 查询总数
    const [countResult] = await db.query(
      sql.replace('SELECT *', 'SELECT COUNT(*) as total'),
      params
    );
    const total = countResult[0].total;

    // 请求全部参数时，返回所有日志
    if (all === 'true') {
      sql += ' ORDER BY created_at DESC';
      const [allRows] = await db.query(sql, params);

      return res.json({
        code: 200,
        data: {
          list: allRows,
          total: allRows.length,
          all: true
        }
      });
    }


    // 查询数据（按时间倒序）
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const [rows] = await db.query(sql, params);

    res.json({
      code: 200,
      data: {
        list: rows,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;




