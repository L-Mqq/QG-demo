let allNotices = []
// 渲染通知列表
async function renderNoticeList() {
  const noticeClass = document.getElementById('noticeClass');
  // 获取通知列表
  const data = await apiRequest('/api/notices');
  const noticeList = data.data.list;

  console.log(noticeList)

  allNotices = noticeList;
  // 检查是否有通知
  if (noticeList.length === 0) {
    document.querySelector('#noticeList').innerHTML = '<li class="no-dataices">暂无通知</li>'
    return
  }

  // 获取班级列表
  const classData = await apiRequest('/api/classes');
  const classList = classData.data;

  // 渲染通知列表
  const str = noticeList.map((item, index) => {
    // console.log('item.class_id:', item.class_id, '类型:', typeof item.class_id);
    // console.log('转换后的数字:', +item.class_id);
    // console.log('班级列表中的ID:', classList.map(c => c.id));
    const time = new Date(item.updated_at).toLocaleString()
    //获取班级名称
    let className = '';
    if (item.class_id === null) {
      className = '全校通知';
    } else {
      className = classList.find(c => c.id === +item.class_id)?.name || `全校通知`;
    }

    return `
      <li class="unread" data-index="${index}"> 
          <div class="notice-content">
            <span class="notice-title">${item.title}</span>
            <div class="notice-meta">
              <span class="notice-class">班级：${className}</span>
              <span class="notice-author">发布者：${item.teacher_name}</span>
            </div>
          </div>
          <span class="notice-time">${time}</span>
        </li>
      `
  }).join('');
  document.querySelector('#noticeList').innerHTML = str
}
// 初始化渲染通知列表
renderNoticeList()



// 发布通知功能
function publishNotice(noticeData) {
  const publishNoticeModal = document.getElementById('publishNoticeModal');
  const noticeClass = document.getElementById('noticeClass');
  const noticeTitle = document.getElementById('noticeTitle');
  const noticeContent = document.getElementById('noticeContent');
  const confirmPublish = document.getElementById('confirmPublish');
  const cancelPublish = document.getElementById('cancelPublish');
  const noticeClassMessage = document.querySelector('.notice-class-message');
  const noticeTitleMessage = document.querySelector('.notice-title-message');
  const noticeContentMessage = document.querySelector('.notice-content-message');

  // 显示弹框
  publishNoticeModal.classList.add('show');

  // 清空表单
  noticeClass.value = '';
  noticeTitle.value = '';
  noticeContent.value = '';

  confirmPublish.textContent = '发布';
  // 发布通知（使用 onclick 避免重复绑定）
  confirmPublish.onclick = () => {
    const classId = noticeClass.value;
    const title = noticeTitle.value.trim();
    const content = noticeContent.value.trim();

    // console.log('发布通知 - classId:', classId, 'classId === "all":', classId === 'all', '最终值:', classId === 'all' ? null : classId);

    //通知对象
    if (!classId) {
      noticeClassMessage.classList.add('error');
      noticeClassMessage.innerHTML = '请选择目标班级';
      setTimeout(() => {
        noticeClassMessage.classList.remove('error');
        noticeClassMessage.innerHTML = '';
      }, 3000);
      return;
    }
    //通知标题
    if (!title) {
      noticeTitleMessage.classList.add('error');
      noticeTitleMessage.innerHTML = '请输入通知标题';
      setTimeout(() => {
        noticeTitleMessage.classList.remove('error');
        noticeTitleMessage.innerHTML = '';
      }, 3000);
      return;
    }
    //通知内容
    if (!content) {
      noticeContentMessage.classList.add('error');
      noticeContentMessage.innerHTML = '请输入通知内容';
      setTimeout(() => {
        noticeContentMessage.classList.remove('error');
        noticeContentMessage.innerHTML = '';
      }, 3000);
      return;
    }

    try {
      apiRequest('/api/notices', {
        method: 'POST',
        body: JSON.stringify({
          class_id: classId === 'all' ? null : classId,
          title: title,
          content: content
        })
      }).then(data => {
        if (data.code === 200) {
          if (noticeData) {
            noticeContentMessage.classList.add('success');
            noticeContentMessage.innerHTML = '发布成功';
          }
          setTimeout(() => {
            noticeContentMessage.classList.remove('success');
            noticeContentMessage.innerHTML = '';
            publishNoticeModal.classList.remove('show');
          }, 1000);

          // 刷新通知列表
          renderNoticeList();
        } else {
          noticeContentMessage.classList.add('error');
          noticeContentMessage.innerHTML = '操作失败';
          setTimeout(() => {
            noticeContentMessage.classList.remove('error');
            noticeContentMessage.innerHTML = '';
          }, 3000);
        }
      })
    } catch (err) {
      console.error('操作通知失败:', err);
      noticeContentMessage.classList.add('error');
      noticeContentMessage.innerHTML = '操作失败，请稍后重试';
      setTimeout(() => {
        noticeContentMessage.classList.remove('error');
        noticeContentMessage.innerHTML = '';
      }, 3000);
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
// 发布按钮点击时调用
document.querySelector('#publishNoticeBtn').addEventListener('click', publishNotice);




// 查看通知弹窗
async function viewNotice(noticeData) {
  const viewNoticeModal = document.getElementById('viewNoticeModal');
  const viewNoticeTitle = document.getElementById('viewNoticeTitle');
  const viewNoticeTime = document.getElementById('viewNoticeTime');
  const viewNoticeClass = document.getElementById('viewNoticeClass');
  const viewNoticeAuthor = document.getElementById('viewNoticeAuthor');
  const viewNoticeContent = document.getElementById('viewNoticeContent');
  const closeNotice = document.getElementById('closeNotice');
  const deleteNotice = document.getElementById('deleteNotice');
  const editNotice = document.getElementById('editNotice');


  const classList = await apiRequest('/api/classes');
  const classListData = classList.data;

  // 获取班级名称
  let className = '';
  if (noticeData.class_id === null) {
    className = '全部班级';
  } else {
    className = classListData.find(item => item.id === noticeData.class_id).name;
  }

  // 弹窗内容
  viewNoticeTitle.textContent = noticeData.title;
  viewNoticeTime.textContent = new Date(noticeData.updated_at).toLocaleString();
  viewNoticeClass.textContent = className;
  viewNoticeAuthor.textContent = noticeData.teacher_name;
  viewNoticeContent.textContent = noticeData.content;

  // 显示弹框
  viewNoticeModal.classList.add('show');

  // 获取当前用户信息
  const user = JSON.parse(localStorage.getItem('user'));
  const currentUserId = user?.id;

  // 显示/隐藏删除和编辑按钮
  if (currentUserId === noticeData.teacher_id) {
    deleteNotice.style.display = 'block';
    editNotice.style.display = 'block';
  } else {
    deleteNotice.style.display = 'none';
    editNotice.style.display = 'none';
  }

  // 关闭弹框（使用 onclick 避免重复绑定）
  closeNotice.onclick = () => {
    viewNoticeModal.classList.remove('show');
  };

  // 点击弹框外部关闭（使用 onclick 避免重复绑定）
  viewNoticeModal.onclick = (e) => {
    if (e.target === viewNoticeModal) {
      viewNoticeModal.classList.remove('show');
    }
  };

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
  const targetClass = noticeData.class_id || 'all';
  console.log(targetClass)
  // 渲染班级名称
  document.getElementById('noticeClass').value = targetClass || '全部班级';



  // 填充表单数据
  noticeTitle.value = noticeData.title;
  noticeContent.value = noticeData.content;

  confirmPublish.textContent = '编辑';
  // 重新绑定发布按钮事件（编辑模式）
  confirmPublish.onclick = async () => {
    const classId = noticeClass.value;
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
          class_id: classId === 'all' ? null : classId
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
//删除通知
async function delNotices(noticeData) {
  const viewNoticeModal = document.getElementById('viewNoticeModal');

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
// 查看通知点击事件处理
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


