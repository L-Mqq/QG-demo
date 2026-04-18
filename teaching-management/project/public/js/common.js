//每次请求时，都添加token  
function apiRequest(url, option = {}) {
  const token = localStorage.getItem('token')

  return fetch(url, {
    //添加的请求方法，参数等
    ...option,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  }).then(res => {
    //相应的是fetch对象，需要调用json方法方法获取数据
    if (res.status === 401) {
      // Token 过期，跳转登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      location.href = '/login/login.html';
      throw new Error('请重新登录');
    }
    //返回后端对应接口提供的数据
    return res.json();
  })
}


//退出登录
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = '/login/login.html';
}
