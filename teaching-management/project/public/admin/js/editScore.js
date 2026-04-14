//编辑成绩弹框控制
const editScoreModal = document.getElementById('editScoreModal');
const cancelEditBtn = document.getElementById('cancelEdit');
const confirmEditBtn = document.getElementById('confirmEdit');

//隐藏编辑成绩弹框
function hideEditScoreModal() {
  editScoreModal.classList.remove('show');
  // 清空提示信息
  document.querySelector('.editScores-score-message').innerHTML = '';
  document.querySelector('.editScores-score-message').classList.remove('error');
  document.querySelector('.editScores-score-message').classList.remove('success');
}

//取消编辑成绩
cancelEditBtn.addEventListener('click', hideEditScoreModal);

//点击弹框外部关闭弹框
editScoreModal.addEventListener('click', (e) => {
  if (e.target === editScoreModal) {
    hideEditScoreModal()
  }
})

//确认修改成绩
confirmEditBtn.addEventListener('click', async () => {
  const scoreValue = +document.getElementById('editScoreValue').value;
  // 验证输入
  if (!scoreValue) {
    document.querySelector('.editScores-score-message').classList.add('error');
    return;
  } else if (scoreValue < 0 || scoreValue > 100) {
    document.querySelector('.editScores-score-message').innerHTML = '请输入0到100之间的成绩值';
    document.querySelector('.editScores-score-message').classList.add('error');
    return;
  } else if (scoreValue === originalScore) {
    document.querySelector('.editScores-score-message').innerHTML = '成绩没有变化，无需修改';
    document.querySelector('.editScores-score-message').classList.add('error');
    return;
  } else {
    document.querySelector('.editScores-score-message').classList.remove('error');
  }

  // 发送修改请求
  apiRequest(`/api/scores/${scoreId}`, {
    method: 'PUT',
    body: JSON.stringify({
      score: parseFloat(scoreValue)
    })
  }).then(data => {
    if (data.code === 200) {
      document.querySelector('.editScores-score-message').innerHTML = '成绩修改成功';
      document.querySelector('.editScores-score-message').classList.add('success');
      document.querySelector('.editScores-score-message').classList.remove('error');
      // 刷新成绩列表
      renderScoreList();
    }
  });

  // 更新时间
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const formattedTime = `${month}-${day}`;
  document.getElementById('editUpdateTime').textContent = formattedTime;

  // 隐藏弹框
  setTimeout(() => {
    hideEditScoreModal();
  }, 1000);
});
