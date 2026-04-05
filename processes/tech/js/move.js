const leftAs = document.querySelectorAll('.left-content ul li a')
let dragId = 0

// 被拖拽元素的事件  刚开始拖拽时记录数据 并添加样式
leftAs.forEach(a => {
  a.addEventListener('dragstart', (e) => {
    dragId = +a.dataset.id
    // 样式切换
    leftCon.querySelector('.active').classList.remove('active')
    a.classList.add('active')
    a.classList.add('origin')
  })
})


// 空元素的反应
// 进入父元素 触发 -> 进入子元素样式已存在的话保持 -> 离开子元素保持 -> 离开父元素样式清除
let isEmpty = 0
let leaveTimer = null

// 在目标元素内移动时，添加样式
centerCon.addEventListener('dragover', (e) => {
  // 必须设置，允许放置在目标元素上
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
  // 清除离开定时器
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
  if (isEmpty === 0) {
    centerCon.classList.add('empty')
    isEmpty = 1
  }
})


// 离开放置区域时，清除样式
centerCon.addEventListener('dragleave', (e) => {
  e.preventDefault()
  // 延迟检查鼠标是否真的离开了父元素 ，如果在50ms内又进入父元素，那样式就不清除，
  // dragOver之后，定时器清空，等待下一次离开父元素再执行。
  leaveTimer = setTimeout(() => {
    if (!centerCon.contains(e.relatedTarget)) {
      centerCon.classList.remove('empty')
      isEmpty = 0
    }
  }, 50)
})

//拖拽结束(写在被拖拽元素上的事件！) 清理样式
leftCon.addEventListener('dragend', (e) => {
  let a = e.target.closest('a')
  if (a) {
    a.classList.remove('origin')
  }
  //拖拽结束时，定时器也要清空
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
  // 移除样式
  centerCon.classList.remove('empty')
  isEmpty = 0
})

// 在目标区域释放时，渲染对应点的数据。
centerCon.addEventListener('drop', (e) => {
  e.preventDefault()
  // 给被拖拽元素添加样式
  renderCenter(dragId)
})





// 中间到右边拖拽
const centerAs = document.querySelectorAll('.center-content ul li a')
const rightBody = document.querySelector('.right-content')
let centerParent = 0
let centerNum = 0

centerAs.forEach(a => {
  a.addEventListener('dragstart', (e) => {
    centerParent = +a.dataset.parent
    centerNum = +a.dataset.num

    // 样式切换
    centerCon.querySelector('.active').classList.remove('active')
    a.classList.add('active')
    a.classList.add('origin')
  })
})



// 空元素的反应
let isEmptyRight = 0
let leaveTimerRight = null

//进入父元素
rightBody.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
  // 清除离开定时器
  if (leaveTimerRight) {
    clearTimeout(leaveTimerRight)
    leaveTimerRight = null
  }
  if (isEmptyRight === 0) {
    rightBody.classList.add('empty')
    isEmptyRight = 1
  }
})

//离开父元素
rightBody.addEventListener('dragleave', (e) => {
  e.preventDefault()
  leaveTimerRight = setTimeout(() => {
    if (!rightBody.contains(e.relatedTarget)) {
      rightBody.classList.remove('empty')
      isEmptyRight = 0
    }
  }, 50)
})

//拖拽结束
centerCon.addEventListener('dragend', (e) => {
  let a = e.target.closest('a')
  if (a) {
    a.classList.remove('origin')
  }
  if (leaveTimerRight) {
    clearTimeout(leaveTimerRight)
    leaveTimerRight = null
  }
  rightBody.classList.remove('empty')
  isEmptyRight = 0
})

//拖拽释放
rightBody.addEventListener('drop', (e) => {
  e.preventDefault()
  renderRight(centerParent, centerNum)
})
