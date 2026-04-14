//新增成绩弹框控制
const addScoreModal = document.getElementById('addScoreModal');
const addScoreBtn = document.querySelector('.score-panel .btn-primary');
const cancelAddScoreBtn = document.getElementById('cancelAddScore');
const confirmAddScoreBtn = document.getElementById('confirmAddScore');

//显示新增成绩弹框
addScoreBtn.addEventListener('click', () => {
  addScoreModal.classList.add('show');
});

//隐藏新增成绩弹框
function hideAddScoreModal() {
  addScoreModal.classList.remove('show');
  // 清空弹框中的输入
  document.getElementById('scoreClass').value = '';
  document.getElementById('scoreStudentId').value = '';
  document.getElementById('scoreSubject').value = '';
  document.getElementById('scoreValue').value = '';
  // 清空提示信息
  document.querySelector('.addScores-score-message').innerHTML = '';
  document.querySelector('.addScores-score-message').classList.remove('success');
}
//取消新增成绩
cancelAddScoreBtn.addEventListener('click', hideAddScoreModal);

//点击弹框外部关闭弹框
addScoreModal.addEventListener('click', (e) => {
  if (e.target === addScoreModal) {
    hideAddScoreModal();
  }
});

// 页面加载时绑定事件
document.getElementById('scoreClass').addEventListener('change', function (e) {
  const scoreClass = e.target.value;
  console.log(scoreClass)
  if (!scoreClass || scoreClass === '') {
    // 未选择班级，清空学生下拉框
    document.querySelector('#scoreStudentId').innerHTML = '<option value="">请先选择班级</option>';
    return;
  }

  // 根据所选班级渲染学生列表
  apiRequest('/api/users').then(data => {
    const userList = data.data.filter(item => item.role === 'student');

    // 打印检查
    console.log('userList:', userList);
    console.log('userList 类型:', typeof userList);
    console.log('是否是数组:', Array.isArray(userList));
    console.log('userList.length:', userList?.length);

    if (userList.find(item => item.class_id === +scoreClass) === undefined) {
      document.querySelector('#scoreStudentId').innerHTML = '<option value="">暂无学生</option>';
      // 确定新增按钮禁用
      confirmAddScoreBtn.disabled = true;
      return;
    }
    // 获取role为学生且班级id为scoreClass的学生的名字
    const str = userList.filter(item => item.class_id === +scoreClass).map(item =>
      `<option value="${item.id}">${item.name}</option>`
    ).join('');

    document.querySelector('#scoreStudentId').innerHTML = `<option value="">请选择学生</option>${str}`;
    // 确定新增按钮启用
    confirmAddScoreBtn.disabled = false;
  }).catch(error => {
    console.error('加载学生列表失败:', error);
    document.querySelector('#scoreStudentId').innerHTML = '<option value="">加载失败</option>';
  });
});


//确认新增成绩 
confirmAddScoreBtn.addEventListener('click', async () => {
  const scoreClass = document.getElementById('scoreClass').value
  const studentId = document.getElementById('scoreStudentId').value
  const subject = document.getElementById('scoreSubject').value;
  const scoreValue = document.getElementById('scoreValue').value;
  // 验证输入是否为空
  if (!scoreClass) {
    document.querySelector('.addScores-class-message').classList.add('error');
    //返回再次判断
    return
  } else {
    document.querySelector('.addScores-class-message').classList.remove('error')
  }
  if (!studentId) {
    document.querySelector('.addScores-studentId-message').classList.add('error');
    return
  } else {
    document.querySelector('.addScores-studentId-message').classList.remove('error');
  }
  if (!subject) {
    document.querySelector('.addScores-subject-message').classList.add('error');
    return
  } else {
    document.querySelector('.addScores-subject-message').classList.remove('error');
  }
  if (!scoreValue) {
    document.querySelector('.addScores-score-message').innerHTML = '请输入成绩值';
    document.querySelector('.addScores-score-message').classList.add('error');
    return
  } else if (scoreValue < 0 || scoreValue > 100) {
    document.querySelector('.addScores-score-message').innerHTML = '请输入0到100之间的成绩值';
    document.querySelector('.addScores-score-message').classList.add('error');
    return
  } else {
    document.querySelector('.addScores-score-message').classList.remove('error');
  }


  // 获取班级ID
  const classesRes = await apiRequest('/api/classes');
  const classList = classesRes.data;
  const selectedClass = classList.find(cls => cls.id === +scoreClass);
  console.log(selectedClass);

  // 获取所有成绩
  const scoresRes = await apiRequest('/api/scores');
  const allScores = scoresRes.data || [];

  // 查找是否已有该学生该科目的成绩
  const existingScore = allScores.find(item =>
    item.student_id === parseInt(studentId) &&
    item.subject === subject
  )

  if (existingScore) {
    document.querySelector('.addScores-score-message').innerHTML = '该学生该科目的成绩已存在';
    document.querySelector('.addScores-score-message').classList.add('error');
    return;
  } else {
    // 清空提示信息
    document.querySelector('.addScores-score-message').innerHTML = '';
    document.querySelector('.addScores-score-message').classList.remove('error');
    document.querySelector('.addScores-score-message').classList.remove('success');
  }


  // 新增成绩
  const response = await apiRequest('/api/scores', {
    method: 'POST',
    body: JSON.stringify({
      class_id: selectedClass.id,
      student_id: studentId,
      subject: subject,
      score: parseFloat(scoreValue)
    })
  });

  if (response.code === 201) {
    // console.log('新增成绩成功');
    document.querySelector('.addScores-score-message').innerHTML = '成绩新增成功';
    document.querySelector('.addScores-score-message').classList.add('success');
    // 刷新成绩列表
    renderScoreList();
    // 隐藏弹框
    setTimeout(() => {
      hideAddScoreModal();
    }, 1000);
  } else {
    console.error('新增成绩失败:', response.message);
  }
});
