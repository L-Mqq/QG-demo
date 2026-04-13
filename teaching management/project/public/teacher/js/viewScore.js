//查看成绩弹框控制
const viewScoreModal = document.getElementById('viewScoreModal');
const cancelViewBtn = document.getElementById('cancelView');

//隐藏查看成绩弹框
function hideViewScoreModal() {
  viewScoreModal.classList.remove('show');
}

//取消查看成绩
cancelViewBtn.addEventListener('click', hideViewScoreModal);

//点击弹框外部关闭弹框
viewScoreModal.addEventListener('click', (e) => {
  if (e.target === viewScoreModal) {
    hideViewScoreModal();
  }
});

let originalScore = 0;
let scoreId = 0;
// 监听成绩表格的父容器
document.querySelector('#scoreList').addEventListener('click', (e) => {
  // 1. 判断点击的是"查看"或"编辑"链接
  const link = e.target.closest('a[href="javascript:;"][data-score-id]');

  if (link) {
    e.preventDefault();

    // 判断是查看还是编辑（根据链接文字）
    const linkText = link.textContent.trim();
    scoreId = link.dataset.scoreId;

    if (linkText === '查看') {

      // 获取当前行数据
      const row = link.closest('tr');
      const cells = row.querySelectorAll('td');

      // 填充弹框
      document.getElementById('viewClass').textContent = cells[0].textContent;
      document.getElementById('viewStudentId').textContent = cells[1].textContent;
      document.getElementById('viewStudentName').textContent = cells[2].textContent;
      document.getElementById('viewSubject').textContent = cells[3].textContent;
      document.getElementById('viewScore').textContent = cells[4].textContent;
      document.getElementById('viewUpdateTime').textContent = cells[5].textContent;

      // 显示弹框
      viewScoreModal.classList.add('show');
    } else if (linkText === '编辑') {

      // 打开编辑弹框
      const row = link.closest('tr');
      const cells = row.querySelectorAll('td');
      // 保存原始成绩
      originalScore = +cells[4].textContent;
      // 填充弹框数据
      document.getElementById('editClass').textContent = cells[0].textContent;
      document.getElementById('editStudentId').textContent = cells[1].textContent;
      document.getElementById('editStudentName').textContent = cells[2].textContent;
      document.getElementById('editSubject').textContent = cells[3].textContent;
      document.getElementById('editScoreInput').value = cells[4].textContent;
      document.getElementById('editUpdateTime').textContent = cells[5].textContent;

      // 显示弹框
      editScoreModal.classList.add('show');
    }
  }
});
