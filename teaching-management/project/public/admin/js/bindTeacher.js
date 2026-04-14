// 班级选择框变化事件
const classSelect = document.querySelector('#classSelect');
const teacherSelect = document.querySelector('#teacherSelect');
const bindTeacherMessage = document.querySelector('.bind-teacher-message');
const delClassMessage = document.querySelector('.del-class-message');


//教师下拉框变化事件
teacherSelect.addEventListener('change', async (e) => {
  const teacherId = e.target.value;
  const classId = classSelect.value;
  console.log(teacherId, classId);

  // // 清空提示信息
  delClassMessage.innerHTML = '';
  delClassMessage.classList.remove('error', 'success');
  bindTeacherMessage.innerHTML = '';
  bindTeacherMessage.classList.remove('error', 'success');

  if (!teacherId || !classId) {
    return;
  }

  try {
    // 检查教师是否已经绑定了其他班级
    const classesRes = await apiRequest('/api/classes');
    const isBound = classesRes.data.some(cls => cls.teacher_id == teacherId && cls.id != classId);

    if (isBound) {
      bindTeacherMessage.innerHTML = '该教师已绑定其他班级，无法绑定';
      bindTeacherMessage.classList.add('error');
      // 保存修改的按钮禁用
      document.querySelector('#saveSubmit').disabled = true;
      // 重置教师选择
      teacherSelect.value = '';
    } else {
      // 检查当前班级是否已有班主任
      //选择当前的班级信息
      const classInfo = classesRes.data.find(cls => cls.id == classId);
      //这个班级存在且已经有班主任
      if (classInfo && classInfo.teacher_id) {
        const usersRes = await apiRequest('/api/users');
        const teacher = usersRes.data.find(t => t.id == classInfo.teacher_id);
        bindTeacherMessage.innerHTML = `当前班级已有班主任：${teacher?.name || '未知'}`;
        bindTeacherMessage.classList.add('success');
        // 保存修改的按钮  禁用
        document.querySelector('#saveSubmit').disabled = true;
      } else {
        bindTeacherMessage.innerHTML = '教师可以绑定到该班级';
        bindTeacherMessage.classList.add('success');
        // 保存修改的按钮  启用
        document.querySelector('#saveSubmit').disabled = false;
      }
    }
  } catch (error) {
    console.error('检查教师绑定状态失败:', error);
    bindTeacherMessage.innerHTML = '检查教师绑定状态失败';
    bindTeacherMessage.classList.add('error');
  }
});

//选择班级之后 提示信息清空
classSelect.addEventListener('change', () => {
  bindTeacherMessage.innerHTML = '';
  bindTeacherMessage.classList.remove('error');
  bindTeacherMessage.classList.remove('success');
  // 重置保存修改按钮状态
  document.querySelector('#saveSubmit').disabled = false;
})


// 保存修改 按钮点击事件弹窗出现
const saveButton = document.querySelector('#saveSubmit');
saveButton.addEventListener('click', () => {
  const classId = +classSelect.value;
  const teacherId = +teacherSelect.value;
  console.log(classId, teacherId);
  if (classId === 0) {
    delClassMessage.innerHTML = '请选择班级';
    delClassMessage.classList.add('error');
    return;
  }

  // // 教师可以为空，用于解绑班主任
  // if (teacherId === 0) {
  //   bindTeacherMessage.innerHTML = '请选择教师';
  //   bindTeacherMessage.classList.add('error');
  //   return;
  // }

  // 显示确认保存修改弹框
  document.querySelector('#saveModal').classList.add('show');
});

// 确认保存按钮点击事件 确认绑定教师
document.querySelector('#confirmSave').addEventListener('click', async () => {
  const classId = +classSelect.value;
  const teacherId = +teacherSelect.value;

  try {
    // 如果选择了教师，检查教师是否已经绑定了其他班级
    if (teacherId !== 0) {
      const classesRes = await apiRequest('/api/classes');
      const isBound = classesRes.data.some(cls => cls.teacher_id == teacherId && cls.id != classId);

      if (isBound) {
        bindTeacherMessage.innerHTML = '该教师已绑定其他班级，无法绑定';
        bindTeacherMessage.classList.add('error');
        // 关闭弹框
        document.querySelector('#saveModal').classList.remove('show');
        return;
      }
    }

    // 更新班级的教师绑定
    const response = await apiRequest(`/api/users/${teacherId}`, {
      method: 'PUT',
      body: JSON.stringify({
        class_id: classId || null
      })
    });

    if (response.code === 200) {
      bindTeacherMessage.innerHTML = teacherId ? '教师绑定成功' : '教师解绑成功';
      bindTeacherMessage.classList.add('success');
      bindTeacherMessage.classList.remove('error');

      // 提示消息消失
      setTimeout(() => {
        bindTeacherMessage.innerHTML = '';
        bindTeacherMessage.classList.remove('success');
      }, 2000);
    } else {
      bindTeacherMessage.innerHTML = teacherId ? '教师绑定失败' : '教师解绑失败';
      bindTeacherMessage.classList.add('error');

      // 提示消息消失
      setTimeout(() => {
        bindTeacherMessage.innerHTML = '';
        bindTeacherMessage.classList.remove('error');
      }, 2000);
    }


    // 关闭弹框
    document.querySelector('#saveModal').classList.remove('show');
  } catch (error) {
    console.error('绑定教师失败:', error);
    bindTeacherMessage.innerHTML = '绑定教师失败';
    bindTeacherMessage.classList.add('error');
    // 关闭弹框
    document.querySelector('#saveModal').classList.remove('show');
  }
});



// 取消保存按钮点击事件
document.querySelector('#cancelSave').addEventListener('click', () => {
  // 关闭弹框
  document.querySelector('#saveModal').classList.remove('show');
});

// 点击弹框外关闭弹框
document.querySelector('#saveModal').addEventListener('click', (e) => {
  if (e.target === document.querySelector('#saveModal')) {
    document.querySelector('#saveModal').classList.remove('show');
  }
});


