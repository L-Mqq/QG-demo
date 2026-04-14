// 点击登录时执行的函数
async function login() {
  // 获取用户名和密码
  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;
  const currentMsg = document.querySelector('#currentMsg');

  // 清空之前的样式和文字
  currentMsg.textContent = '';
  currentMsg.classList.remove('success', 'error');

  // 发送登录请求
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    console.log(result)

    let role = result.data.user.role
    // console.log(result.data.user)

    if (result.code === 200) {
      // ========== 保存 Token 和用户信息 ==========
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      // 根据角色跳转
      if (role === 'admin') {
        console.log('登录成功，跳转至管理员页面');
        currentMsg.textContent = '登录成功，跳转至管理员页面';
        currentMsg.classList.add('success');
        setTimeout(() => {
          location.href = '/admin/admin.html';
        }, 1000);
      } else if (role === 'teacher') {
        currentMsg.textContent = '登录成功，跳转至班主任页面';
        currentMsg.classList.add('success');
        setTimeout(() => {
          location.href = '/teacher/teacher.html';
        }, 1000);
      } else {
        currentMsg.textContent = '登录成功，跳转至学生页面';
        currentMsg.classList.add('success');
        setTimeout(() => {
          location.href = '/student/student.html';
        }, 1000);
      }
    } else {
      currentMsg.classList.add('error');
      currentMsg.textContent = result.message;
    }
  } catch (err) {
    currentMsg.classList.add('error');
    currentMsg.textContent = '登录失败，用户名或密码错误';
  }
}
