// scripts/migrate-passwords.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// console.log('=== 环境变量检查 ===');
// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '已设置' : '未设置');
// console.log('DB_NAME:', process.env.DB_NAME);
// console.log('===================');

const bcrypt = require('bcryptjs');
const db = require('../models/db');

async function migratePasswords() {
  console.log('========== 开始密码迁移 ==========\n');

  try {
    // 2. 查询所有用户
    const [users] = await db.query(
      'SELECT id, username, password, role, name, class_id FROM users'
    );

    console.log(`\n 找到 ${users.length} 个用户\n`);

    let encryptedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // 3. 检查是否已经是 bcrypt 格式
      if (user.password && user.password.startsWith('$2')) {
        console.log(`⏭跳过: ${user.username} (已是加密格式)`);
        skippedCount++;
        continue;
      }

      // 4. 加密密码
      console.log(` 加密用户: ${user.username} (ID: ${user.id})`);
      console.log(`   原密码(明文): ${user.password}`);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      console.log(`   新密码(加密): ${hashedPassword.substring(0, 30)}...`);

      // 5. 更新数据库
      await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );

      encryptedCount++;
      console.log(`  更新成功\n`);
    }

    console.log('========== 迁移完成 ==========');
    console.log(`总计用户: ${users.length}`);
    console.log(` 已加密: ${encryptedCount}`);
    console.log(` 已跳过: ${skippedCount}`);

  } catch (err) {
    console.error('\n迁移失败:', err.message);
    process.exit(1);
  }
  process.exit(0);
}


// 运行迁移
migratePasswords();