// 渲染对应班级学生的成绩
async function renderScoreAndDetail(class_id, classScoreList) {
  // 同时请求两个接口，等待全部完成  如果单个请求的话是异步，请求完页面已经渲染完成，导致数据不一致
  const [usersRes, classRes] = await Promise.all([
    apiRequest('/api/users'),
    apiRequest('/api/classes')
  ]);

  const classList = classRes.data
  const userList = usersRes.data;

  // console.log(userList)
  // console.log(classList)

  //判断成绩列表是否为空
  if (!classScoreList || classScoreList.length === 0) {
    // 显示暂无数据
    document.querySelector('#scoreList').innerHTML = '<tr><td colspan="7">暂无数据</td></tr>';
    document.querySelector('#avgScore').innerHTML = '0';
    document.querySelector('#maxScore').innerHTML = '0';
    document.querySelector('#minScore').innerHTML = '0';
    document.querySelector('#passRate').innerHTML = '0%';
    return;
  }


  const str = classScoreList.map(item => {
    const className = classList.find(cls => cls.id === class_id).name
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
  document.querySelector('#scoreList').innerHTML = str;

  // 获取平均分
  const avgScore = classScoreList.reduce((total, cur) => total + cur.score, 0) / classScoreList.length
  // 获取最高分
  const maxScore = classScoreList.reduce((total, cur) => total > cur.score ? total : cur.score, 0)
  // 获取最低分
  const minScore = classScoreList.reduce((total, cur) => total < cur.score ? total : cur.score, 100)
  // 获取及格率
  const passRate = classScoreList.filter(item => item.score >= 60).length / classScoreList.length * 100

  // 渲染平均分
  document.querySelector('#avgScore').innerHTML = avgScore.toFixed(2)
  // 渲染最高分
  document.querySelector('#maxScore').innerHTML = maxScore
  // 渲染最低分
  document.querySelector('#minScore').innerHTML = minScore
  // 渲染及格率
  document.querySelector('#passRate').innerHTML = passRate.toFixed(2) + '%'
}

async function renderScoreList(class_id) {
  const scoresRes = await apiRequest('/api/scores');
  const scoreList = scoresRes.data || [];
  //筛选本班学生
  const classScoreList = scoreList.filter(item => item.class_id === class_id)
  // console.log(classScoreList)

  renderScoreAndDetail(class_id, classScoreList);
}
renderScoreList(classId)

