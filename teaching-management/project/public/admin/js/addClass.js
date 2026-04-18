// 选择班级，实时渲染后面的教师数据
document.querySelector('#classSelect').addEventListener('change', async () => {
  try {
    const classId = document.querySelector('#classSelect').value;

    // 如果没有选择班级，直接返回
    if (!classId) {
      renderTeacherList();  // 清空或重置教师选择
      return;
    }

    const classList = await apiRequest('/api/classes');
    const selectedClass = classList.data.find(cls => cls.id === +classId);

    if (selectedClass && selectedClass.teacher_id) {
      document.querySelector('#teacherSelect').value = selectedClass.teacher_id;
    } else {
      renderTeacherList();
    }
  } catch (error) {
    console.error('获取班级信息失败:', error);
  }
});

// 新增班级
document.querySelector('#addClassBtn').addEventListener('click', () => {
  // 显示新增班级弹框
  document.querySelector('#addClass').value = '';
  document.querySelector('#addClassTeacher').value = '';
  document.querySelector('.class-message').innerHTML = '';
  document.querySelector('.class-message').classList.remove('error', 'success');
  document.querySelector('.teacher-message').innerHTML = '';
  document.querySelector('.teacher-message').classList.remove('error', 'success');
  document.querySelector('#addClassModal').classList.add('show');
  document.querySelector('#addClassSubmit').disabled = false;
  renderTeacherList();
});

// 实时验证教师是否已被绑定
document.querySelector('#addClassTeacher').addEventListener('change', async () => {
  try {
    const teacherId = +document.querySelector('#addClassTeacher').value;
    const teacherMessage = document.querySelector('.teacher-message');

    // 清空之前的消息
    teacherMessage.innerHTML = '';
    teacherMessage.classList.remove('error', 'success');

    // 如果没有选择教师，不验证
    if (!teacherId) {
      document.querySelector('#addClassSubmit').disabled = false;
      return;
    }

    // 获取班级列表，检查教师是否已被绑定
    const data = await apiRequest('/api/classes');
    const classList = data.data;

    if (classList.some(item => item.teacher_id === teacherId)) {
      teacherMessage.innerHTML = '教师已绑定班级';
      teacherMessage.classList.add('error');
      // 保存修改的按钮禁用
      document.querySelector('#addClassSubmit').disabled = true;
    } else {
      teacherMessage.innerHTML = '';
      teacherMessage.classList.remove('error');
      document.querySelector('#addClassSubmit').disabled = false;
    }
  } catch (error) {
    console.error('验证教师绑定状态失败:', error);
  }
});

// 新增班级
document.querySelector('#addClassSubmit').addEventListener('click', async () => {
  try {
    const addClass = document.querySelector('#addClass').value;
    const teacherId = +document.querySelector('#addClassTeacher').value || null;
    const classMessage = document.querySelector('.class-message');
    const teacherMessage = document.querySelector('.teacher-message');

    // 清空之前的消息
    classMessage.innerHTML = '';
    classMessage.classList.remove('error', 'success');
    teacherMessage.innerHTML = '';
    teacherMessage.classList.remove('error', 'success');

    // 验证班级名称
    if (addClass === '') {
      classMessage.innerHTML = '请输入班级名称';
      classMessage.classList.add('error');
      return;
    }

    // 验证班级名称格式
    if (!addClass.match(/^高[一二三]\(\d+\)班$/)) {
      classMessage.innerHTML = '请输入正确的班级名称';
      classMessage.classList.add('error');
      return;
    }

    // 获取班级列表
    const data = await apiRequest('/api/classes');
    const classList = data.data;

    // 验证班级名称是否已存在
    if (classList.some(item => item.name === addClass)) {
      classMessage.innerHTML = '班级已存在';
      classMessage.classList.add('error');
      return;
    }

    // 验证教师是否已被绑定
    if (teacherId && classList.some(item => item.teacher_id === teacherId)) {
      teacherMessage.innerHTML = '教师已绑定班级';
      teacherMessage.classList.add('error');
      return;
    }

    // 新增班级
    const response = await apiRequest('/api/classes', {
      method: 'POST',
      body: JSON.stringify({
        name: addClass,
        teacher_id: teacherId
      })
    });

    if (response.code === 201) {
      const newClassId = response.data.id;

      // 如果选择了教师，更新教师的班级ID
      if (teacherId) {
        try {
          await apiRequest(`/api/users/${teacherId}`, {
            method: 'PUT',
            body: JSON.stringify({ class_id: newClassId })
          });
        } catch (error) {
          console.error('更新教师班级失败:', error);
          // 继续执行，不影响班级创建
        }
      }

      // 显示成功消息
      classMessage.innerHTML = '新增班级成功';
      classMessage.classList.add('success');

      // 清空表单
      document.querySelector('#addClass').value = '';
      document.querySelector('#addClassTeacher').value = '';

      // 刷新班级列表
      renderClassList();

      // 关闭弹框
      setTimeout(() => {
        document.querySelector('#addClassModal').classList.remove('show');
      }, 1000);
    } else {
      classMessage.innerHTML = '新增班级失败，请重试';
      classMessage.classList.add('error');
    }
  } catch (error) {
    console.error('新增班级失败:', error);
    document.querySelector('.class-message').innerHTML = '新增班级失败，请重试';
    document.querySelector('.class-message').classList.add('error');
  }
});

// 取消新增班级
document.querySelector('#cancelAdd').addEventListener('click', () => {
  document.querySelector('.class-message').innerHTML = '';
  document.querySelector('.class-message').classList.remove('error', 'success');
  document.querySelector('.teacher-message').innerHTML = '';
  document.querySelector('.teacher-message').classList.remove('error', 'success');
  document.querySelector('#addClassModal').classList.remove('show');
});

// 点击弹框外关闭弹框
document.querySelector('#addClassModal').addEventListener('click', (e) => {
  if (e.target === document.querySelector('#addClassModal')) {
    document.querySelector('.class-message').innerHTML = '';
    document.querySelector('.class-message').classList.remove('error', 'success');
    document.querySelector('.teacher-message').innerHTML = '';
    document.querySelector('.teacher-message').classList.remove('error', 'success');
    document.querySelector('#addClassModal').classList.remove('show');
  }
});