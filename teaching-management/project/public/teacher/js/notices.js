let allNotices = []
//通知列表的渲染
async function renderNoticeList() {
  // 获取班级列表
  const classData = await apiRequest('/api/classes');
  const classList = classData.data;
  console.log(classList)


  apiRequest('/api/notices').then(data => {
    // console.log(data.data)
    console.log(data.data.list)
    const noticeList = data.data.list
    allNotices = noticeList
    if (noticeList.length === 0) {
      document.querySelector('.notice-list').innerHTML = `
        <li class="notice-item">
          <span class="notice-title">暂无通知</span>
        </li>
      `
      return
    }
    // 渲染通知列表
    const str = noticeList.map((item, index) => {
      // 确定班级显示文本
      let classText = ''
      if (item.class_id === null) {
        classText = '所有班级'
      }
      else {
        classText = classList.find(cls => cls.id === +item.class_id)?.name || '未知班级';
      }
      //已读人数和未读人数
      let msg = ''
      if (item.teacher_id !== 1) {
        msg = ` <span class="notice-stats"><span class="read">已读 ${item.read_count}</span> / <span class="unread-count">未读 ${item.unread_count}</span></span>`
      }
      else {
        msg = ''
      }
      return `
        <li class="notice-item" data-index="${index}" data-id="${item.id}">
          <div class="notice-content">
            <span class="notice-title">${item.title}</span>
            <div class="notice-meta-info">
              <span class="notice-class">班级：${classText}</span>
              <span class="notice-author">发布者：${item.teacher_name}</span>
            </div>
          </div>
          ${msg}
        </li>
      `
    }).join('');
    document.querySelector('.notice-list').innerHTML = str;
  })
}
renderNoticeList()



// 发布通知功能
async function publishNotice() {
  const publishNoticeModal = document.getElementById('publishNoticeModal');
  const noticeClass = document.getElementById('noticeClass');
  const noticeTitle = document.getElementById('noticeTitle');
  const noticeContent = document.getElementById('noticeContent');
  const confirmPublish = document.getElementById('confirmPublish');
  const cancelPublish = document.getElementById('cancelPublish');

  // 显示弹框
  publishNoticeModal.classList.add('show');

  // 渲染班级名称
  const result = await apiRequest('/api/classes');
  const classList = result.data;
  const classItem = classList.find(item => item.id === +classId);
  noticeClass.innerHTML = classItem?.name || '获取班级名称失败';


  // 清空表单
  noticeTitle.value = '';
  noticeContent.value = '';

  confirmPublish.textContent = '发布';
  // 发布通知（使用 onclick 避免重复绑定）
  confirmPublish.onclick = async () => {
    const title = noticeTitle.value.trim();
    const content = noticeContent.value.trim();

    if (!title) {
      document.querySelector('.notice-title-message').classList.add('error');
      document.querySelector('.notice-title-message').textContent = '请输入通知标题';
      setTimeout(() => {
        document.querySelector('.notice-title-message').classList.remove('error');
        document.querySelector('.notice-title-message').textContent = '';
      }, 3000);
      return;
    }

    if (!content) {
      document.querySelector('.notice-content-message').classList.add('error');
      document.querySelector('.notice-content-message').textContent = '请输入通知内容';
      setTimeout(() => {
        document.querySelector('.notice-content-message').classList.remove('error');
        document.querySelector('.notice-content-message').textContent = '';
      }, 3000);
      return;
    }

    try {
      const data = await apiRequest('/api/notices', {
        method: 'POST',
        body: JSON.stringify({
          class_id: classId,
          title: title,
          content: content
        })
      })


      if (data.code === 200) {
        document.querySelector('.notice-content-message').textContent = '发布成功';
        document.querySelector('.notice-content-message').classList.add('success');
        setTimeout(() => {
          document.querySelector('.notice-title-message').classList.remove('success');
          document.querySelector('.notice-title-message').textContent = '';
          document.querySelector('.notice-content-message').classList.remove('success');
          document.querySelector('.notice-content-message').textContent = '';
          noticeTitle.value = '';
          noticeContent.value = '';
          publishNoticeModal.classList.remove('show');
        }, 1000);
        // 刷新通知列表
        renderNoticeList();
      } else {
        const error = data.data
        document.querySelector('.notice-content-message').textContent = error.message || '发布失败';
        document.querySelector('.notice-content-message').classList.add('error');
        setTimeout(() => {
          document.querySelector('.notice-content-message').classList.remove('error');
          document.querySelector('.notice-content-message').textContent = '';
        }, 3000);
      }
    } catch (err) {
      console.error('发布通知失败:', err);
      alert('发布失败，请稍后重试');
    }
  };

  // 取消发布（使用 onclick 避免重复绑定）
  cancelPublish.onclick = () => {
    publishNoticeModal.classList.remove('show');
  };

  // 点击弹框外部关闭（使用 onclick 避免重复绑定）
  publishNoticeModal.onclick = (e) => {
    if (e.target === publishNoticeModal) {
      publishNoticeModal.classList.remove('show');
    }
  };
}
document.querySelector('#publishNoticeBtn').addEventListener('click', publishNotice);





// 删除通知
async function delNotices(noticeData) {
  const viewNoticeModal = document.getElementById('viewNoticeModal');
  // console.log('noticeData:', noticeData);
  // console.log('noticeData.id:', noticeData?.id);

  try {
    const data = await apiRequest(`/api/notices/${noticeData.id}`, {
      method: 'DELETE'
    });

    if (data.code === 200) {
      document.querySelector('.notices-msg').textContent = '删除成功';
      document.querySelector('.notices-msg').classList.add('success');
      setTimeout(() => {
        document.querySelector('.notices-msg').classList.remove('success');
        document.querySelector('.notices-msg').textContent = '';
        viewNoticeModal.classList.remove('show');
      }, 1000);
      // 刷新通知列表
      renderNoticeList();
    } else {
      const error = data.data
      document.querySelector('.notices-msg').textContent = error.message || '删除失败';
      document.querySelector('.notices-msg').classList.add('error');
      setTimeout(() => {
        document.querySelector('.notices-msg').classList.remove('error');
        document.querySelector('.notices-msg').textContent = '';
      }, 1000);
    }
  } catch (err) {
    console.error('删除通知失败:', err);
    // alert('删除失败，请稍后重试');
  }

}
// 编辑通知
function editNotices(noticeData) {
  const viewNoticeModal = document.getElementById('viewNoticeModal');
  // console.log('noticeData:', noticeData);
  // console.log('noticeData.id:', noticeData?.id);

  // 关闭查看弹窗
  viewNoticeModal.classList.remove('show');

  // 打开发布通知弹窗并填充数据，用来编辑通知
  const publishNoticeModal = document.getElementById('publishNoticeModal');
  const noticeTitle = document.getElementById('noticeTitle');
  const noticeContent = document.getElementById('noticeContent');
  const confirmPublish = document.getElementById('confirmPublish');
  const cancelPublish = document.getElementById('cancelPublish');


  // 显示弹框
  publishNoticeModal.classList.add('show');

  // 渲染班级名称
  apiRequest('/api/classes').then(result => {
    const classList = result.data;
    const classItem = classList.find(item => item.id === +classId);
    document.getElementById('noticeClass').innerHTML = classItem?.name || '获取班级名称失败';
  });

  // 填充表单数据
  noticeTitle.value = noticeData.title;
  noticeContent.value = noticeData.content;

  confirmPublish.textContent = '编辑';
  // 重新绑定发布按钮事件（编辑模式）
  confirmPublish.onclick = async () => {
    const title = noticeTitle.value.trim();
    const content = noticeContent.value.trim();

    if (!title) {
      document.querySelector('.notice-title-message').classList.add('error');
      document.querySelector('.notice-title-message').textContent = '请输入通知标题';
      setTimeout(() => {
        document.querySelector('.notice-title-message').classList.remove('error');
        document.querySelector('.notice-title-message').textContent = '';
      }, 3000);
      return;
    }

    if (!content) {
      document.querySelector('.notice-content-message').classList.add('error');
      document.querySelector('.notice-content-message').textContent = '请输入通知内容';
      setTimeout(() => {
        document.querySelector('.notice-content-message').classList.remove('error');
        document.querySelector('.notice-content-message').textContent = '';
      }, 3000);
      return;
    }

    try {
      const data = await apiRequest(`/api/notices/${noticeData.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: title,
          content: content,
          class_id: classId || null
        })
      });

      if (data.code === 200) {
        document.querySelector('.notice-content-message').textContent = '编辑成功';
        document.querySelector('.notice-content-message').classList.add('success');
        setTimeout(() => {
          document.querySelector('.notice-title-message').classList.remove('success');
          document.querySelector('.notice-title-message').textContent = '';
          document.querySelector('.notice-content-message').classList.remove('success');
          document.querySelector('.notice-content-message').textContent = '';
          noticeTitle.value = '';
          noticeContent.value = '';
          publishNoticeModal.classList.remove('show');
        }, 1000);
        // 刷新通知列表
        renderNoticeList();
      } else {
        const error = data.data
        document.querySelector('.notice-content-message').textContent = error.message || '编辑失败';
        document.querySelector('.notice-content-message').classList.add('error');
        setTimeout(() => {
          document.querySelector('.notice-content-message').classList.remove('error');
          document.querySelector('.notice-content-message').textContent = '';
        }, 3000);
      }
    } catch (err) {
      console.error('编辑通知失败:', err);
      // alert('编辑失败，请稍后重试');
    }
  }
  // 取消发布（使用 onclick 避免重复绑定）
  cancelPublish.onclick = () => {
    publishNoticeModal.classList.remove('show');
  };

  // 点击弹框外部关闭（使用 onclick 避免重复绑定）
  publishNoticeModal.onclick = (e) => {
    if (e.target === publishNoticeModal) {
      publishNoticeModal.classList.remove('show');
    }
  };
}
// 查看通知
function viewNotice(noticeData) {
  const viewNoticeModal = document.getElementById('viewNoticeModal');
  const viewNoticeTitle = document.getElementById('viewNoticeTitle');
  const viewNoticeTime = document.getElementById('viewNoticeTime');
  const viewNoticeAuthor = document.getElementById('viewNoticeAuthor');
  const viewNoticeContent = document.getElementById('viewNoticeContent');
  const closeNotice = document.getElementById('closeNotice');
  const deleteNotice = document.getElementById('deleteNotice');
  const editNotice = document.getElementById('editNotice');

  // 渲染详细内容
  viewNoticeTitle.textContent = noticeData.title;
  viewNoticeTime.textContent = new Date(noticeData.updated_at).toLocaleString();
  viewNoticeAuthor.textContent = noticeData.teacher_name;
  viewNoticeContent.textContent = noticeData.content;

  // 出现弹窗
  viewNoticeModal.classList.add('show');

  //获取教师id
  const user = JSON.parse(localStorage.getItem('user'));
  const currentTeacherId = user?.id;

  // 删除通知（使用标志变量防止重复删除）
  let isDeleting = false;
  deleteNotice.onclick = () => {
    if (isDeleting) return;
    isDeleting = true;
    delNotices(noticeData);
    setTimeout(() => {
      isDeleting = false;
    }, 1000);
  };

  // 编辑通知
  editNotice.onclick = () => {
    editNotices(noticeData);
  };

  // 判断教师身份 删除和编辑按钮显示隐藏状态
  if (currentTeacherId === noticeData.teacher_id) {
    deleteNotice.style.display = 'block';
    editNotice.style.display = 'block';
  } else {
    deleteNotice.style.display = 'none';
    editNotice.style.display = 'none';
  }

  // 取消发布（使用 onclick 避免重复绑定）
  closeNotice.onclick = () => {
    viewNoticeModal.classList.remove('show');
  };

  // 点击弹框外部关闭（使用 onclick 避免重复绑定）
  viewNoticeModal.onclick = (e) => {
    if (e.target === viewNoticeModal) {
      viewNoticeModal.classList.remove('show');
    }
  };
}
// 绑定发布通知按钮事件
document.querySelector('.notice-list').addEventListener('click', async (e) => {
  const li = e.target.closest('li');
  if (li) {
    const noticeId = li.getAttribute('data-index');
    if (noticeId !== null) {
      //通知id
      const noticeData = allNotices[noticeId];
      // 查看通知弹窗
      viewNotice(noticeData);
    }
  }
});
