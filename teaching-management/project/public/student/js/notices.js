// ！！还要判断班级是否是当前班级，不是当前班级的不渲染
let allNotices = [];

async function renderNoticeList() {
  apiRequest('/api/notices/student').then(data => {
    // console.log(data.data)
    // console.log(data.data.list)
    const noticeList = data.data.list
    allNotices = noticeList;

    //判断是否为空
    if (noticeList.length === 0) {
      document.querySelector('.notice-list').innerHTML = `
        <li class="notice-item">
          <span class="notice-title">暂无通知</span>
        </li>
      `;
      return;
    }

    // 渲染通知列表
    const str = noticeList.map((item, index) => {
      const time = new Date(item.created_at).toLocaleString();
      return `
        <li class="${item.is_read == 1 ? '' : 'unread'}">
          <div class="notice-main">
            <span class="notice-title">${item.title}</span>
            <span class="notice-time">${time}</span>
          </div>
          <button class="btn btn-small" data-index="${index}">查看通知</button>   
        </li>
     `;
    }).join('');
    //上面查看通知渲染的是此数组的索引 方便后面进行获取通知数据
    document.querySelector('.notice-list').innerHTML = str;

  }).catch(err => {
    console.error('请求失败:', err);
  });
}
renderNoticeList()

//渲染特定通知弹窗
function viewNotice(noticeData) {
  const viewNoticeModal = document.getElementById('viewNoticeModal');
  const noticeTitle = document.getElementById('noticeTitle');
  const noticeTime = document.getElementById('noticeTime');
  const noticeAuthor = document.getElementById('noticeAuthor');
  const noticeContent = document.getElementById('noticeContent');
  const closeNotice = document.getElementById('closeNotice');

  // 显示弹框
  viewNoticeModal.classList.add('show');

  // 通知内容渲染
  noticeTitle.textContent = noticeData.title;
  noticeTime.textContent = new Date(noticeData.created_at).toLocaleString();
  noticeAuthor.textContent = noticeData.teacher_name || '未知发布者';
  noticeContent.textContent = noticeData.content;

  // 关闭弹框
  closeNotice.addEventListener('click', () => {
    viewNoticeModal.classList.remove('show');
  });

  // 点击弹框外部关闭
  window.addEventListener('click', (e) => {
    if (e.target === viewNoticeModal) {
      viewNoticeModal.classList.remove('show');
    }
  });
}

// 绑定查看通知按钮事件
document.querySelector('.notice-list').addEventListener('click', async (e) => {
  if (e.target.tagName === 'BUTTON') {
    const noticeId = e.target.getAttribute('data-index');
    if (noticeId !== null) {
      //通知id 学生id
      const noticeData = allNotices[noticeId];
      const studentId = user.id;
      try {
        // 标记已读
        await apiRequest(`/api/notices/${noticeData.id}/read`, {
          method: 'POST',
          body: JSON.stringify({
            student_id: studentId
          })
        }).then(data => {
          if (data.code === 200) {
            // 刷新通知列表
            renderNoticeList();
          }
        });
      } catch (err) {
        console.error('请求失败:', err);
      }
      //后端标记为已读之后，出现弹窗显示通知内容
      viewNotice(noticeData);
    }
  }
});




