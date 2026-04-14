
// 仅用于前端演示：点击“标记已读”后切换样式
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (!btn.classList.contains('btn-small')) return;
  const li = btn.closest('li');
  if (!li) return;

  li.classList.remove('unread');
  btn.replaceWith(Object.assign(document.createElement('span'), { className: 'read-tag', textContent: '已读' }));
});

//初始渲染数据

// 获取用户信息 渲染用户名
const user = JSON.parse(localStorage.getItem('user'));
document.querySelector('.user-name').innerHTML = user.name;
document.querySelector('#studentId').innerHTML = user.id;
document.querySelector('#userName').innerHTML = user.name;

const classId = user.classId;
const studentId = user.id;

console.log(user);


//渲染左上角的班级名称
function renderClass(class_id) {
  apiRequest('/api/classes').then(data => {
    console.log(data.data)
    data.data.forEach(item => {
      if (item.id === class_id) {
        document.querySelector('#classId').innerHTML = item.name
      }
    })
  })
}
renderClass(classId)


// 渲染科目
function renderSubject(student_id) {
  apiRequest('/api/scores').then(data => {
    console.log(data.data)
    const studentScoreList = data.data.filter(item => item.student_id === student_id)
    const subjectList = studentScoreList.map(item => item.subject)
    const str = subjectList.map(item => {
      return `
       <option value="${item}">${item}</option>
      `
    }).join('')
    document.querySelector('#subject').innerHTML = `<option value="">请选择科目</option>${str}</select>`

  })
}
renderSubject(studentId)






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

