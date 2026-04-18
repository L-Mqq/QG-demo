// 初始数据的渲染


// 获取用户信息 渲染用户名
const usermessage = JSON.parse(localStorage.getItem('user'));
document.querySelector('.user-name').innerHTML = usermessage.name;


//教师列表渲染
function renderTeacherList() {
  apiRequest('/api/users').then(data => {
    // console.log(data.data);
    const teacherList = data.data.filter(user => user.role === 'teacher');
    // console.log(teacherList);
    const str = teacherList.map(item => {
      return `
    <option value="${item.id}">${item.name}</option>
    `
    }).join('');
    document.querySelector('#teacherSelect').innerHTML = `<option value="">请选择教师</option>${str}`;
    document.querySelector('#addClassTeacher').innerHTML = `<option value="">请选择教师</option>${str}`;
  });
}
renderTeacherList()


//班级列表渲染
function renderClassList() {
  apiRequest('/api/classes').then(data => {
    // console.log(data.data);
    const classList = data.data
    const str = classList.map(item => {
      return `
      <option value="${item.id}">${item.name}</option>
      `
    }).join('');
    document.querySelector('#classSelect').innerHTML = `<option value="">请选择班级</option>${str}`;
    document.querySelector('#class').innerHTML = `<option value="">请选择班级</option>${str}`;
    document.querySelector('#classMid').innerHTML = `<option value="">请选择班级</option>${str}`;
    document.querySelector('#classMobile').innerHTML = `<option value="">请选择班级</option>${str}`;
    document.querySelector('#scoreClass').innerHTML = `<option value="">请选择班级</option>${str}`;
    document.querySelector('#noticeClass').innerHTML = `<option value="">请选择班级</option><option value="all">所有班级</option>${str}`;

  });
}
renderClassList()


// 科目渲染
function renderSubjectList() {
  apiRequest('/api/scores').then(data => {
    // console.log(data.data);
    const subjectList = data.data
    //获取每一个对象中的科目，不可重复
    const subjectSet = [...new Set(subjectList.map(item => item.subject))];
    // console.log(subjectSet)
    const str = subjectSet.map(item => {
      return `
      <option value="${item}">${item}</option>
      `
    }).join('');
    document.querySelector('#subject').innerHTML = `<option value="">请选择科目</option>${str}`;
    document.querySelector('#subjectMid').innerHTML = `<option value="">请选择科目</option>${str}`;
    document.querySelector('#subjectMobile').innerHTML = `<option value="">请选择科目</option>${str}`;
    document.querySelector('#scoreSubject').innerHTML = `<option value="">请选择科目</option>${str}`;

  });
}
renderSubjectList()


//学号渲染
function renderStudentIdList() {
  apiRequest('/api/users').then(data => {
    // console.log(data.data);
    const studentList = data.data.filter(user => user.role === 'student');
    // console.log(studentList)
    const str = studentList.map(item => {
      return `
      <option value="${item.id}">${item.id}</option>
      `
    }).join('');
    document.querySelector('#studentId').innerHTML = `<option value="">请选择学号</option>${str}`;
    document.querySelector('#studentIdMid').innerHTML = `<option value="">请选择学号</option>${str}`;
    document.querySelector('#studentIdMobile').innerHTML = `<option value="">请选择学号</option>${str}`;
  });
}
renderStudentIdList()


//初始渲染全部成绩
async function renderScoreAndDetail(scoreList) {
  // 同时请求三个接口，等待全部完成  如果单个请求的话是异步，请求完页面已经渲染完成，导致数据不一致
  const [classesRes, usersRes] = await Promise.all([
    apiRequest('/api/classes'),
    apiRequest('/api/users')
  ]);
  const classList = classesRes.data;
  const userList = usersRes.data;

  //判断成绩列表是否为空
  if (!scoreList || scoreList.length === 0) {
    // 显示暂无数据
    document.querySelector('#scoreTable').innerHTML = '<tr><td colspan="7">暂无数据</td></tr>';
    document.querySelector('#avgScore').innerHTML = '0';
    document.querySelector('#maxScore').innerHTML = '0';
    document.querySelector('#minScore').innerHTML = '0';
    document.querySelector('#passRate').innerHTML = '0%';
    return;
  }
  //成绩列表渲染
  const str = scoreList.map(item => {
    const className = classList.find(cls => cls.id === item.class_id).name
    const studentName = userList.find(user => user.id === item.student_id).name
    const createTime = item.updated_at.split('T')[0].slice(5)
    return `
          <tr>
            <td>${className}</td>
            <td>${item.student_id}</td>
            <td>${studentName}</td>
            <td>${item.subject}</td>
            <td>${item.score}</td>
            <td>${createTime}</td>
            <td><a href="javascript:;" data-score-id="${item.id}">查看</a> / <a href="javascript:;" data-score-id="${item.id}">编辑</a></td>
          </tr>
    `
  }).join('');
  document.querySelector('#scoreTable').innerHTML = str;
  //详细数据渲染
  // 获取平均分
  const avgScore = scoreList.reduce((total, cur) => total + cur.score, 0) / scoreList.length
  // 获取最高分
  const maxScore = scoreList.reduce((total, cur) => total > cur.score ? total : cur.score, 0)
  // 获取最低分
  const minScore = scoreList.reduce((total, cur) => total < cur.score ? total : cur.score, 100)
  // 获取及格率
  const passRate = scoreList.filter(item => item.score >= 60).length / scoreList.length * 100

  // 渲染平均分
  document.querySelector('#avgScore').innerHTML = avgScore.toFixed(2)
  // 渲染最高分
  document.querySelector('#maxScore').innerHTML = maxScore
  // 渲染最低分
  document.querySelector('#minScore').innerHTML = minScore
  // 渲染及格率
  document.querySelector('#passRate').innerHTML = passRate.toFixed(2) + '%'
}

async function renderScoreList() {
  const scoresRes = await apiRequest('/api/scores');
  const scoreList = scoresRes.data || [];

  renderScoreAndDetail(scoreList);
}
renderScoreList()




























