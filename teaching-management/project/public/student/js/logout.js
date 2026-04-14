// 退出登录确认弹框控制
const logoutConfirmModal = document.getElementById('logoutConfirmModal');
const confirmLogoutBtn = document.getElementById('confirmLogout');
const cancelLogoutBtn = document.getElementById('cancelLogout');
const logoutMessage = document.querySelector('.logout-message');

// 显示退出登录弹框
function showLogoutConfirmModal() {
  logoutConfirmModal.classList.add('show');
  // 清空之前的消息
  logoutMessage.classList.remove('show');
}

// 隐藏退出登录弹框
function hideLogoutConfirmModal() {
  logoutConfirmModal.classList.remove('show');
}

// 确认退出登录
confirmLogoutBtn.addEventListener('click', () => {
  // 显示退出登录成功消息
  logoutMessage.classList.add('show');

  // 延迟一秒后执行退出登录
  setTimeout(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = '/login/login.html';
  }, 1000);
});

// 取消退出登录
cancelLogoutBtn.addEventListener('click', hideLogoutConfirmModal);

// 点击弹框外关闭弹框
logoutConfirmModal.addEventListener('click', (e) => {
  if (e.target === logoutConfirmModal) {
    hideLogoutConfirmModal();
  }
});

// 修改退出登录按钮点击事件
document.querySelector('.btn-logout').addEventListener('click', showLogoutConfirmModal);