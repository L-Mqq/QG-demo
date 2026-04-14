document.querySelector('#unbindSubmit').addEventListener('click', async () => {
  const classId = document.querySelector('#classSelect').value;

  if (classId === '') {
    document.querySelector('.del-class-message').innerHTML = '请选择班级';
    document.querySelector('.del-class-message').classList.remove('success');
    document.querySelector('.del-class-message').classList.add('error');
    return;
  }

  try {
    // 获取所有教师和班级信息
    const [usersRes, classesRes] = await Promise.all([
      apiRequest('/api/users'),
      apiRequest('/api/classes')
    ]);

    // 筛选出当前没有绑定班级的教师
    const unboundTeachers = usersRes.data.filter(user =>
      user.role === 'teacher' && !user.class_id
    );

    // 获取当前班级的教师ID
    const currentClass = classesRes.data.find(cls => cls.id == classId);
    const currentTeacherId = currentClass?.teacher_id;

    // 获取当前班级的班主任信息
    let currentTeacherName = '';
    if (currentTeacherId) {
      const currentTeacher = usersRes.data.find(t => t.id == currentTeacherId);
      currentTeacherName = currentTeacher?.name || '';
    }

    // 渲染教师列表到下拉框
    const unbindTeacherSelect = document.querySelector('#unbindTeacherSelect');
    unbindTeacherSelect.innerHTML = `<option value="">无教师${currentTeacherName ? '（当前班主任：' + currentTeacherName + '）' : ''}</option>`;

    unboundTeachers.forEach(teacher => {
      const option = document.createElement('option');
      option.value = teacher.id;
      option.textContent = teacher.name;
      unbindTeacherSelect.appendChild(option);
    });

    // 如果当前班级有班主任，也加入到下拉框中（用于切换）
    if (currentTeacherId) {
      const currentTeacherOption = document.createElement('option');
      currentTeacherOption.value = currentTeacherId;
      currentTeacherOption.textContent = currentTeacherName + '（当前班主任）';
      currentTeacherOption.selected = true;
      unbindTeacherSelect.appendChild(currentTeacherOption);
    }

    // 清空提示信息
    document.querySelector('.unbind-teacher-message').innerHTML = '';
    document.querySelector('.unbind-teacher-message').classList.remove('error', 'success');

    // 显示弹框
    document.querySelector('#unbindTeacherModal').classList.add('show');
  } catch (error) {
    console.error('获取教师列表失败:', error);
  }
});

// 取消解绑按钮点击事件
document.querySelector('#cancelUnbind').addEventListener('click', () => {
  document.querySelector('#unbindTeacherModal').classList.remove('show');
});

// 确认更换按钮点击事件
document.querySelector('#confirmUnbind').addEventListener('click', async () => {
  const classId = document.querySelector('#classSelect').value;
  const newTeacherId = document.querySelector('#unbindTeacherSelect').value;

  try {
    // 更新班级的教师绑定
    const response = await apiRequest(`/api/classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify({
        teacher_id: newTeacherId || null
      })
    });

    if (response.code === 200) {
      document.querySelector('.unbind-teacher-message').innerHTML = newTeacherId ? '教师更换成功' : '教师解绑成功';
      document.querySelector('.unbind-teacher-message').classList.add('success');
      document.querySelector('.unbind-teacher-message').classList.remove('error');

      // 刷新班级列表和教师列表
      if (typeof renderClassList === 'function') {
        renderClassList();
      }
      if (typeof renderTeacherList === 'function') {
        renderTeacherList();
      }

      // 关闭弹框
      setTimeout(() => {
        document.querySelector('#unbindTeacherModal').classList.remove('show');
      }, 1500);
    } else {
      document.querySelector('.unbind-teacher-message').innerHTML = '操作失败';
      document.querySelector('.unbind-teacher-message').classList.add('error');
    }
  } catch (error) {
    console.error('更换教师失败:', error);
    document.querySelector('.unbind-teacher-message').innerHTML = '操作失败';
    document.querySelector('.unbind-teacher-message').classList.add('error');
  }
});

// 点击弹框外关闭弹框
document.querySelector('#unbindTeacherModal').addEventListener('click', (e) => {
  if (e.target === document.querySelector('#unbindTeacherModal')) {
    document.querySelector('#unbindTeacherModal').classList.remove('show');
  }
});