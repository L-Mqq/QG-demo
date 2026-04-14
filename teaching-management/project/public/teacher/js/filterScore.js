//筛选成绩
// 选择姓名渲染对应的学号
document.querySelector('#studentName').addEventListener('change', () => {
  const studentName = +document.querySelector('#studentName').value
  // console.log(studentName)
  if (studentName !== 0) {
    document.querySelector('#studentId').value = studentName
  } else {
    renderStudentId(classId)
  }
})
//选择学号渲染姓名
document.querySelector('#studentId').addEventListener('change', () => {
  const studentId = +document.querySelector('#studentId').value
  // console.log(studentId)
  if (studentId !== 0) {
    document.querySelector('#studentName').value = studentId
  } else {
    renderStudentName(classId)
  }
})
// 筛选成绩
document.querySelector('.compact button').addEventListener('click', async () => {
  // console.log('筛选成绩')
  const subject = document.querySelector('#subject').value
  const studentId = +document.querySelector('#studentId').value || 0//number
  const studentName = +document.querySelector('#studentName').value || 0  //number

  // 合并学号（两个输入框，取非0的那个）
  const targetStudentId = studentId !== 0 ? studentId : studentName;

  // console.log('筛选条件:', { subject, studentId, studentName, targetStudentId });

  const scoresRes = await apiRequest('/api/scores');
  const scoreList = scoresRes.data || [];
  //筛选本班学生
  const classScoreList = scoreList.filter(item => item.class_id === classId)
  // console.log(subject, studentId, studentName)
  let filterScoreList = []

  // 只选择科目筛选成绩
  if (subject !== '' && targetStudentId === 0) {
    filterScoreList = classScoreList.filter(item => item.subject === subject)
  }
  //选择姓名学号筛选成绩
  if (targetStudentId !== 0 && subject === '') {
    filterScoreList = classScoreList.filter(item => item.student_id === +targetStudentId)
  }

  if (subject !== '' && targetStudentId !== 0) {
    filterScoreList = classScoreList.filter(item => item.subject === subject && item.student_id === +targetStudentId)
  }

  if (subject === '' && targetStudentId === 0) {
    filterScoreList = classScoreList
  }
  renderScoreAndDetail(classId, filterScoreList)
})
