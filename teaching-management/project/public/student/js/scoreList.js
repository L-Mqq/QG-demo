// 渲染特定学生的成绩
async function renderScoreAndDetail(class_id, student_id, studentScoreList, filterSubject = null) {
  // 同时请求三个接口，等待全部完成  如果单个请求的话是异步，请求完页面已经渲染完成，导致数据不一致
  const [usersRes, classRes, scoreRes] = await Promise.all([
    apiRequest('/api/users'),
    apiRequest('/api/classes'),
    apiRequest('/api/scores')
  ]);

  const classList = classRes.data
  const userList = usersRes.data;
  //获取这个班级的所有成绩
  let classScoreList = scoreRes.data.filter(item => item.class_id === class_id)
  if (filterSubject) {
    classScoreList = classScoreList.filter(item => item.subject === filterSubject);
  }

  // console.log(classScoreList)

  //求平均分，最高分，最低分，及格率
  const avgScore = classScoreList.reduce((acc, cur) => acc + cur.score, 0) / classScoreList.length;
  const maxScore = classScoreList.reduce((max, cur) => {
    if (cur.score > max) {
      max = cur.score;
    }
    return max;
  }, 0);
  const minScore = classScoreList.reduce((min, cur) => {
    if (cur.score < min) {
      min = cur.score;
    }
    return min;
  }, 100);
  const passRate = classScoreList.filter(item => item.score >= 60).length / classScoreList.length * 100;
  document.querySelector('#avgScore').innerHTML = avgScore.toFixed(1);
  document.querySelector('#maxScore').innerHTML = maxScore;
  document.querySelector('#minScore').innerHTML = minScore;
  document.querySelector('#passRate').innerHTML = passRate.toFixed(1) + '%';


  //判断成绩列表是否为空
  if (!studentScoreList || studentScoreList.length === 0) {
    // 显示暂无数据
    document.querySelector('#scoreTable').innerHTML = '<tr><td colspan="5">暂无数据</td></tr>';
    document.querySelector('#avgScore').innerHTML = '0';
    document.querySelector('#maxScore').innerHTML = '0';
    document.querySelector('#minScore').innerHTML = '0';
    document.querySelector('#passRate').innerHTML = '0%';
    return;
  }


  // 3. 获取各科目的统计 
  const subjects = [...new Set(studentScoreList.map(item => item.subject))];
  const subjectStats = {};

  for (const subject of subjects) {
    const subjectScores = classScoreList.filter(item => item.subject === subject);
    if (subjectScores.length > 0) {
      subjectStats[subject] = {
        avgScore: (subjectScores.reduce((acc, cur) => acc + cur.score, 0) / subjectScores.length).toFixed(1),
        maxScore: Math.max(...subjectScores.map(item => item.score)),
        minScore: Math.min(...subjectScores.map(item => item.score)),
        passRate: (subjectScores.filter(item => item.score >= 60).length / subjectScores.length * 100).toFixed(1) + '%'
      };
    }
  }

  // 计算特定科目中特定学生的排名
  function getStudentRank(classScoreList, subject, student_id) {
    // 获取该科目所有成绩
    const subjectScores = classScoreList.filter(item => item.subject === subject);
    // 总人数
    const totalCount = subjectScores.length;

    // 按分数降序排序
    const sorted = [...subjectScores].sort((a, b) => b.score - a.score);
    // 查找学生排名（索引从0开始，所以+1）
    const rank = sorted.findIndex(item => item.student_id === student_id) + 1;

    return { rank, total: totalCount };
  }


  const str = studentScoreList.map(item => {
    const createTime = item.updated_at.split('T')[0].slice(5)
    const rank = getStudentRank(classScoreList, item.subject, student_id)
    const stats = subjectStats[item.subject];
    return `
            <tr>
              <td>${createTime}</td>
              <td>${item.subject}</td>
              <td>${item.score}</td>
              <td>${stats.avgScore}</td>
              <td>${rank.rank}/${rank.total}</td>
            </tr>
    `
  }).join('');
  document.querySelector('#scoreTable').innerHTML = str;

}
// 渲染学生的成绩列表
async function renderScoreList(class_id, student_id) {
  const scoresRes = await apiRequest('/api/scores');
  const scoreList = scoresRes.data || [];
  //筛选学生自己的成绩列表
  const studentScoreList = scoreList.filter(item => item.student_id === student_id)
  console.log(studentScoreList)
  renderScoreAndDetail(class_id, student_id, studentScoreList, null);
}
renderScoreList(classId, studentId)
