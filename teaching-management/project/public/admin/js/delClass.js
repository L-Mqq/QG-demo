//删除班级
let deleteClassId = null
let deleteClassName = null

//显示删除班级弹框
document.querySelector('.button-group .btn-class').addEventListener('click', () => {
  document.querySelector('.del-class-message').innerHTML = '';
  document.querySelector('.del-class-message').classList.remove('show');
  // 显示确认删除弹框
  deleteClassId = +document.querySelector('#classSelect').value
  deleteClassName = document.querySelector('#classSelect').options[document.querySelector('#classSelect').selectedIndex].text

  if (deleteClassId === 0) {
    document.querySelector('.del-class-message').innerHTML = '请选择班级';
    document.querySelector('.del-class-message').classList.add('show');
    return;
  }

  document.querySelector('.modal-body #className').innerHTML = deleteClassName
  document.querySelector('#deleteModal').classList.add('show')
});

//删除班级
document.querySelector('#confirmDelete').addEventListener('click', async () => {
  try {
    // 清空之前的警告消息
    document.querySelector('.warning-message').innerHTML = '';
    document.querySelector('.warning-message').classList.remove('err', 'suc');

    // 判断班级里还有没有学生 获取学生数据中的class_id
    const userRes = await apiRequest('/api/users');
    const studentList = userRes.data.filter(item => item.role === 'student');

    //判断班级里还有没有学生 要把deleteClassId转换为数字!
    if (studentList.some(item => item.class_id === deleteClassId)) {
      document.querySelector('.warning-message').innerHTML = '该班级还有学生，无法删除';
      document.querySelector('.warning-message').classList.add('err');
      return;
    }

    // 删除班级
    const response = await apiRequest(`/api/classes/${deleteClassId}`, {
      method: 'DELETE'
    });

    if (response.code === 200) {
      document.querySelector('.warning-message').innerHTML = '删除班级成功';
      document.querySelector('.warning-message').classList.add('suc');
      bindTeacherMessage.innerHTML = '';

      //删除班级后，刷新班级列表
      renderClassList();
      renderTeacherList();

      //移除删除班级弹框
      setTimeout(() => {
        document.querySelector('.warning-message').innerHTML = '';
        document.querySelector('.warning-message').classList.remove('err', 'suc');
        document.querySelector('#deleteModal').classList.remove('show');
        // 重置删除班级的ID和名称
        deleteClassId = null;
        deleteClassName = null;
      }, 1000);
    } else {
      document.querySelector('.warning-message').innerHTML = '删除班级失败，请重试';
      document.querySelector('.warning-message').classList.add('err');
    }
  } catch (error) {
    console.error('删除班级失败:', error);
    document.querySelector('.warning-message').innerHTML = '删除班级失败，请重试';
    document.querySelector('.warning-message').classList.add('err');
  }
});

//取消删除班级弹框
document.querySelector('#cancelDelete').addEventListener('click', () => {
  document.querySelector('#deleteModal').classList.remove('show');
  document.querySelector('.del-class-message').innerHTML = '';
  document.querySelector('.del-class-message').classList.remove('show');
  document.querySelector('.warning-message').innerHTML = '';
  document.querySelector('.warning-message').classList.remove('err', 'suc');
  // 重置删除班级的ID和名称
  deleteClassId = null;
  deleteClassName = null;
});

//点击弹框外关闭弹框
document.querySelector('#deleteModal').addEventListener('click', (e) => {
  if (e.target === document.querySelector('#deleteModal')) {
    document.querySelector('#deleteModal').classList.remove('show');
    document.querySelector('.warning-message').innerHTML = '';
    document.querySelector('.warning-message').classList.remove('err', 'suc');
    // 重置删除班级的ID和名称
    deleteClassId = null;
    deleteClassName = null;
  }
});