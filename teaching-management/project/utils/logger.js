const db = require('../models/db');

async function addLog(req, operationType, operationContent) {
  try {
    await db.query(
      `INSERT INTO operation_logs (user_id, username, role, operation_type, operation_content) 
             VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, req.user.username, req.user.role, operationType, operationContent]
    );
  } catch (err) {
    console.error('记录日志失败:', err);
    console.error('=== addLog 错误 ===');
    console.error('错误信息:', err);
    console.error('SQL错误:', err.sqlMessage);
    console.error('================');
  }
}

module.exports = { addLog };