// models/db.js
const mysql = require('mysql2');
const config = require('../config');

// 创建连接池
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10
}).promise();

// 测试连接
async function testConnection() {
  try {
    const [result] = await pool.query('SELECT 1');
    console.log('✅ 数据库连接成功');
  } catch (err) {
    console.error('❌ 数据库连接失败:', err.message);
  }
}

testConnection();

module.exports = pool;