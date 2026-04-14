
// 查询特定的科目
async function renderSubjectScoreList(class_id, student_id, subject) {
  const scoresRes = await apiRequest('/api/scores');
  const scoreList = scoresRes.data || [];
  //筛选学生自己的成绩列表
  const studentScoreList = scoreList.filter(item => item.student_id === student_id && item.subject === subject)
  console.log(studentScoreList)
  renderScoreAndDetail(class_id, student_id, studentScoreList, subject)
}

document.querySelector('.search-btn').addEventListener('click', () => {
  const subject = document.querySelector('#subject').value;
  console.log(subject)
  if (subject === '') {
    renderScoreList(classId, studentId)
    return;
  }
  renderSubjectScoreList(classId, studentId, subject)

})