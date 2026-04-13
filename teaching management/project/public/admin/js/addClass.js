//选择教师，实时渲染后面的教师数据
document.querySelector('#classSelect').addEventListener('change', async () => {
  const classId = document.querySelector('#classSelect').value   //''  123
  // console.log(className)

  const classList = await apiRequest('/api/classes');

  const teacherId = classList.data.find(cls => cls.id === +classId).teacher_id
  if (teacherId) {
    document.querySelector('#teacherSelect').value = teacherId
  } else {
    renderTeacherList()
  }
})

//新增班级
document.querySelector('.button-group .btn-primary').addEventListener('click', () => {
  // 显示新增班级弹框
  document.querySelector('.class-message').innerHTML = ''
  document.querySelector('.class-message').classList.remove('error')
  document.querySelector('.class-message').classList.remove('success')
  document.querySelector('.teacher-message').innerHTML = ''
  document.querySelector('.teacher-message').classList.remove('error')
  document.querySelector('.teacher-message').classList.remove('success')
  document.querySelector('#addClassModal').classList.add('show')
  renderTeacherList()
})


//实时验证教师是否已被绑定
document.querySelector('#addClassTeacher').addEventListener('change', async () => {
  const teacherId = +document.querySelector('#addClassTeacher').value;
  const teacherMessage = document.querySelector('.teacher-message');

  // 清空之前的消息
  teacherMessage.innerHTML = '';
  teacherMessage.classList.remove('error', 'success');

  // 如果没有选择教师，不验证
  if (!teacherId) {
    return;
  }

  // 获取班级列表，检查教师是否已被绑定
  const data = await apiRequest('/api/classes');
  const classList = data.data;

  if (classList.some(item => item.teacher_id === teacherId)) {
    teacherMessage.innerHTML = '教师已绑定班级';
    teacherMessage.classList.add('error');
  } else {
    teacherMessage.innerHTML = '';
    teacherMessage.classList.remove('error')
    teacherMessage.classList.add('success');
  }
});

document.querySelector('#addClassSubmit').addEventListener('click', () => {
  const addClass = document.querySelector('#addClass').value
  apiRequest('/api/classes').then(data => {
    const classList = data.data
    if (addClass === '') {
      document.querySelector('.class-message').innerHTML = '请输入班级名称';
      document.querySelector('.class-message').classList.add('error');
      return;
    } else {
      document.querySelector('.class-message').classList.remove('error')
      document.querySelector('.class-message').classList.remove('success')
    }
    //判断输入的格式对不对  英文的括号
    if (!addClass.match(/^高[一二三]\(\d+\)班$/)) {
      document.querySelector('.class-message').innerHTML = '请输入正确的班级名称';
      document.querySelector('.class-message').classList.add('error');
      return;
    } else {
      document.querySelector('.class-message').classList.remove('error')
      document.querySelector('.class-message').classList.remove('success')
    }
    //判断班级名称是否已存在
    if (classList.some(item => item.name === addClass)) {
      document.querySelector('.class-message').innerHTML = '班级已存在';
      document.querySelector('.class-message').classList.add('error');
      return;
    } else {
      document.querySelector('.class-message').classList.remove('error')
      document.querySelector('.class-message').classList.remove('success')
    }

    //判断教师是不是已经被绑定了
    const teacherId = +document.querySelector('#addClassTeacher').value || null
    if (teacherId && classList.some(item => item.teacher_id === teacherId)) {
      document.querySelector('.teacher-message').innerHTML = '教师已绑定班级';
      document.querySelector('.teacher-message').classList.add('error');
      return;
    }

    // console.log(document.querySelector('#addClassTeacher').innerHTML)
    //新增班级
    apiRequest('/api/classes', {
      method: 'POST',
      body: JSON.stringify({
        name: addClass,
        teacher_id: +document.querySelector('#addClassTeacher').value || null
      })
    }).then(data => {
      if (data.code === 201) {
        // console.log(data.data)
        const newClassId = data.data.id;
        if (teacherId) {
          apiRequest(`/api/users/${teacherId}`, {
            method: 'PUT',
            body: JSON.stringify({ class_id: newClassId })
          });
        }
        document.querySelector('.class-message').innerHTML = '新增班级成功'
        document.querySelector('.class-message').classList.remove('error')
        document.querySelector('.class-message').classList.remove('success')
        document.querySelector('.class-message').classList.add('success')
        document.querySelector('#addClass').value = ''
        document.querySelector('#teacherSelect').innerHTML = `<option value="">请选择教师</option>`
        //新增班级后，刷新班级列表
        renderClassList()
        setTimeout(() => {
          document.querySelector('#addClassModal').classList.remove('show')
        }, 1000)
      }
    })
  })
})

//取消新增班级
document.querySelector('#cancelAdd').addEventListener('click', () => {
  document.querySelector('#addClassModal').classList.remove('show')
})

//点击弹框外关闭弹框
document.querySelector('#addClassModal').addEventListener('click', (e) => {
  if (e.target === document.querySelector('#addClassModal')) {
    document.querySelector('#addClassModal').classList.remove('show')
  }
})


