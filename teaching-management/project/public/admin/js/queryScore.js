//实时更新学号列表
document.getElementById('class').addEventListener('change', async function (e) {
  const classId = +e.target.value;
  console.log(classId, '类型:', typeof classId);   //string 

  //获取所有学生
  const userRes = await apiRequest('/api/users');
  const userList = userRes.data || [];

  if (classId === 0) {
    renderStudentIdList()
    return
  }
  if (userList.filter(user => user.role === 'student' && user.class_id === +classId).length === 0) {
    document.querySelector('#studentId').innerHTML = '<option value="">暂无学生</option>'
    return
  }
  // 渲染班级内的学生学号列表
  const str = userList.filter(user => user.role === 'student' && user.class_id === +classId).map(item => {
    return `
        <option value="${item.id}">${item.id}</option>
    `
  }).join('');
  // console.log(str)
  document.querySelector('#studentId').innerHTML = `<option value="">请选择学号</option>${str}`;
})

//根据查询条件来渲染成绩列表
document.querySelector('#queryBtn').addEventListener('click', async () => {
  // console.log('查询')
  // 获取班级id
  const classId = +document.querySelector('#class').value || 0
  // 获取科目
  const subject = document.querySelector('#subject').value || ''
  // 获取学号
  const studentId = document.querySelector('#studentId').value || ''

  //获取所有成绩
  const scoresRes = await apiRequest('/api/scores');
  let scoreList = scoresRes.data || [];

  //获取所有学生
  const userRes = await apiRequest('/api/users');
  const userList = userRes.data || []

  //只选择班级，不选择科目和学号时，查询所有成绩
  if (classId !== 0 && subject === '' && studentId === '') {
    //根据班级id查询成绩
    scoreList = scoreList.filter(item => item.class_id === +classId)
  }
  //只选择科目，不选择班级和学号时，查询所有成绩
  if (subject !== '' && studentId === '' && classId === 0) {
    //根据科目查询成绩
    scoreList = scoreList.filter(item => item.subject === subject)
  }
  //只选择学号，不选择班级和科目时，查询所有成绩
  //这种情况和选择班级和学号一样
  if ((classId === 0 && subject === '' && studentId !== '') || (classId !== 0 && subject === '' && studentId !== '')) {
    //根据学号查询成绩
    scoreList = scoreList.filter(item => item.student_id === +studentId)
  }

  //选择班级和科目
  if (classId !== 0 && subject !== '' && studentId === '') {
    //根据班级id和科目查询成绩
    scoreList = scoreList.filter(item => item.class_id === +classId && item.subject === subject)
  }
  // 选择学号和科目
  if (classId === 0 && subject !== '' && studentId !== '') {
    //根据学号查询成绩
    scoreList = scoreList.filter(item => item.student_id === +studentId && item.subject === subject)
  }
  // 选择班级、科目和学号
  if (classId !== 0 && subject !== '' && studentId !== '') {
    // 根据班级id、科目和学号查询成绩
    scoreList = scoreList.filter(item => item.class_id === +classId && item.subject === subject && item.student_id === +studentId);
  }
  renderScoreAndDetail(scoreList)
})
