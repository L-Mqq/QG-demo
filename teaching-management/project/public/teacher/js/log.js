// 查看日志功能
async function viewLogs() {
  const logModal = document.getElementById('logModal');
  const logList = document.getElementById('logList');
  const cancelLog = document.getElementById('cancelLog');

  // 显示弹框
  logModal.classList.add('show');

  // 清空日志列表
  logList.innerHTML = '';
  try {
    const result = await apiRequest('/api/logs');
    if (result.code === 200) {
      const logs = result.data.list;  // 存到全局变量

      //渲染日志列表
      logs.forEach(log => {
        const time = new Date(log.created_at).toLocaleString();
        const li = document.createElement('li');
        li.className = 'log-item';
        li.innerHTML = `
      <div class="log-time">${time}</div>
      <div class="log-content">
        <div class="log-action">${log.operation_type}</div>
        <div class="log-user">操作人：${log.username}</div>
        <div class="log-details">${log.operation_content}</div>
      </div>
    `;
        logList.appendChild(li);
      });
    } else {
      logList.innerHTML = '<li>获取日志失败</li>';
    }
  } catch (error) {
    console.error('获取失败:', error);
    logList.innerHTML = '<li>获取日志失败</li>';
  }

  // 关闭弹框
  cancelLog.addEventListener('click', () => {
    logModal.classList.remove('show');
  });

  // 点击弹框外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === logModal) {
      logModal.classList.remove('show');
    }
  });
}

// 绑定查看日志按钮事件
document.addEventListener('DOMContentLoaded', () => {
  const logBtn = document.getElementById('logBtn');
  if (logBtn) {
    logBtn.addEventListener('click', viewLogs);
  }
});