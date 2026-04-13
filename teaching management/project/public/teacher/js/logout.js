// 退出登录确认弹框控制
const logoutConfirmModal = document.getElementById('logoutConfirmModal');
const confirmLogoutBtn = document.getElementById('confirmLogout');
const cancelLogoutBtn = document.getElementById('cancelLogout');

// 显示退出登录确认弹框
function showLogoutConfirm() {
  logoutConfirmModal.classList.add('show');
}

// 隐藏退出登录确认弹框
function hideLogoutConfirm() {
  logoutConfirmModal.classList.remove('show');
}

// 取消退出登录
cancelLogoutBtn.addEventListener('click', hideLogoutConfirm);

// 点击弹框外部关闭弹框
logoutConfirmModal.addEventListener('click', (e) => {
  if (e.target === logoutConfirmModal) {
    hideLogoutConfirm();
  }
});

// 确认退出登录
confirmLogoutBtn.addEventListener('click', logout);

//退出登录
function logout() {
  // 清除本地存储中的token和用户信息
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // 显示退出登录成功消息
  document.querySelector('.logout-message').classList.add('success');
  document.querySelector('.logout-message').innerHTML = '退出登录成功';
  setTimeout(() => {
    document.querySelector('.logout-message').classList.remove('success');
    location.href = '../login/login.html';
  }, 1000);
}

// 为退出登录按钮添加点击事件
const logoutBtn = document.querySelector('.btn-logout');
logoutBtn.addEventListener('click', showLogoutConfirm);
