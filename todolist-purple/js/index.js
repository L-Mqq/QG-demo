// 添加图书
const listPut = document.querySelector('.list-put')
const addBtn = document.querySelector('.add-btn')
const listCon = document.querySelector('.list-con ul')
const filter = document.querySelector('.right .filter')
const batchBtn = document.querySelector('.right .batch')
const right = document.querySelector('.right')
const exportBtn = document.querySelector('.export')



// 收集用户输入 → 存入对象数组 → 存储到本地
let arr = JSON.parse(localStorage.getItem('list')) || []

//渲染函数
function render(arr) {
  const listStr = arr.map(item => {
    return `
           <li data-id="${item.id}" data-done="${item.done}">
            <div class="fin-round">
              <div class="front">
                <img src="./images/finish.svg" alt="">
              </div>
              <div class="back"></div>
            </div>
            <div class="con">
              <span class="plan">${item.plan}</span>
            </div>
            <div class="del-btn">
              <div class="del-icon">
                <img src="./images/del.svg" alt="">
              </div>
              <div class="del-back"></div>
            </div>
          </li>
    `
  }
  ).join('')
  document.querySelector('.list-con ul').innerHTML = listStr
}
// 渲染list项到全部
function renderAll() {
  //先筛选list 再map 不然的话map有可能返回undefined
  const activeList = arr.filter(item => item.status === 'active')
  render(activeList)

  //筛选那些未完成且展示在页面中的list
  const nontfinishNum = arr.filter(item => item.done === false && item.status === 'active').length
  document.querySelector('.list-total .not-finish').innerHTML = nontfinishNum
}
renderAll()
//渲染正在进行的函数
function renderOngoing() {
  const ongoningList = arr.filter(item => item.done === false && item.status === 'active')
  render(ongoningList)
}

//渲染已完成的函数
function renderFinished() {
  const finishedList = arr.filter(item => item.done === true && (item.status === 'completed' || item.status === 'active'))
  render(finishedList)
}

//渲染回收站的函数
function renderDelete() {
  const deleteList = arr.filter(item => item.status === 'delete')
  render(deleteList)
}


// 新增list项
addBtn.addEventListener('click', e => {
  e.preventDefault()
  console.log(listPut.value)
  const obj = {
    id: arr.length + 1,
    plan: listPut.value,
    done: false,
    status: 'active'
  }
  arr.unshift(obj)
  console.log(arr)
  localStorage.setItem('list', JSON.stringify(arr))
  renderAll()

  // 清空输入框
  listPut.value = ''
})

// 完成任务的渲染
listCon.addEventListener('click', e => {
  const li = e.target.closest('li')
  if (li) {
    console.log(li.dataset.id)
    const id = +li.dataset.id
    // const index = arr.findIndex(item => item.id === id)
    // console.log(index)
    const index = arr.length - id
    console.log(index)
    //修改样式
    document.querySelector(`.list-con ul li[data-id = "${id}"]`).classList.toggle('done')
    //修改状态
    arr[index].done = !arr[index].done
    localStorage.setItem('list', JSON.stringify(arr))
    renderAll()
  }
})

//删除list
listCon.addEventListener('click', e => {
  const del = e.target.closest('.del-btn')
  if (del) {
    const li = e.target.closest('li')
    const id = +li.dataset.id
    //寻找索引号
    const index = arr.length - id
    //修改状态
    arr[index].status = 'delete'
    localStorage.setItem('list', JSON.stringify(arr))
    renderAll()
  }
})

//鼠标经过背景颜色改变
filter.addEventListener('mouseover', e => {
  const li = e.target.closest('li')
  if (li) {
    li.style.backgroundColor = ' #D6C2F0'
  }
})
filter.addEventListener('mouseout', e => {
  const li = e.target.closest('li')
  if (li) {
    li.style.backgroundColor = ''
  }
})

batchBtn.addEventListener('mouseover', e => {
  const li = e.target.closest('li')
  if (li) {
    li.style.backgroundColor = '#C2A5E0'
  }
})
batchBtn.addEventListener('mouseout', e => {
  const li = e.target.closest('li')
  if (li) {
    li.style.backgroundColor = ''
  }
})

exportBtn.addEventListener('mouseover', e => {
  const li = e.target.closest('li')
  if (li) {
    li.style.backgroundColor = ' #B89FDB'
  }
})

exportBtn.addEventListener('mouseout', e => {
  const li = e.target.closest('li')
  if (li) {
    li.style.backgroundColor = ''
  }
})




// 第一个筛选器
filter.addEventListener('click', e => {
  const li = e.target.closest('li')
  if (li) {
    const activeLi = filter.querySelector('li.active')
    if (li.classList.contains('all')) {
      if (activeLi) {
        activeLi.classList.remove('active')
      }
      li.classList.add('active')
      renderAll()
    } else if (li.classList.contains('ongoing')) {
      if (activeLi) {
        activeLi.classList.remove('active')
      }
      li.classList.add('active')
      renderOngoing()
    } else if (li.classList.contains('finished')) {
      if (activeLi) {
        activeLi.classList.remove('active')
      }
      li.classList.add('active')
      renderFinished()
    } else if (li.classList.contains('delete')) {
      if (activeLi) {
        activeLi.classList.remove('active')
      }
      li.classList.add('active')
      renderDelete()
    }
  }
})


//t弹框样式函数
function alertStyle(msg) {
  document.querySelector('.alert').style.display = 'flex'
  document.querySelector('.dialog-content .msg').innerHTML = msg
}

//第二个筛选器
const confirmBtn = document.querySelector('.dialog-btn.confirm')
const cancelBtn = document.querySelector('.dialog-btn.cancel')
batchBtn.addEventListener('click', e => {
  const li = e.target.closest('li')
  if (li) {
    if (li.classList.contains('finish--btn')) {
      alertStyle('确认一键勾选完成全部待办事项？')
      confirmBtn.addEventListener('click', () => {
        arr.forEach(item => item.done = true)
        localStorage.setItem('list', JSON.stringify(arr))
        renderAll()
        document.querySelector('.alert').style.display = 'none'
      })
      cancelBtn.addEventListener('click', () => {
        document.querySelector('.alert').style.display = 'none'
      })

    } else if (li.classList.contains('clearFinished--btn')) {
      alertStyle('确认一键清除全部已完成事项？')
      confirmBtn.addEventListener('click', e => {
        e.preventDefault()
        arr.forEach(item => {
          if (item.done === true && item.status === 'active') {
            item.status = 'completed'
          }
          localStorage.setItem('list', JSON.stringify(arr))
          renderAll()
          document.querySelector('.alert').style.display = 'none'
        })
      })
      cancelBtn.addEventListener('click', () => {
        document.querySelector('.alert').style.display = 'none'
      })
    } else if (li.classList.contains('clearAll--btn')) {
      alertStyle('确认一键清除全部吗？')
      confirmBtn.addEventListener('click', () => {
        arr.forEach(item => item.status = 'delete')
        localStorage.setItem('list', JSON.stringify(arr))
        renderAll()
        document.querySelector('.alert').style.display = 'none'
      })
      cancelBtn.addEventListener('click', () => {
        document.querySelector('.alert').style.display = 'none'
      })
    }
  }
})

//list左上角全部已完成按钮
const finishBtn = document.querySelector('.finish--btn')
finishBtn.addEventListener('click', () => {
  alertStyle('确认一键勾选完成全部待办事项？')
  confirmBtn.addEventListener('click', () => {
    arr.forEach(item => item.done = true)
    localStorage.setItem('list', JSON.stringify(arr))
    renderAll()
    document.querySelector('.alert').style.display = 'none'
  })
  cancelBtn.addEventListener('click', () => {
    document.querySelector('.alert').style.display = 'none'
  })
})


let angle = 1
setInterval(() => {
  angle = -angle
  document.querySelector('.clock .front').style.transform = `rotate(${angle * 45}deg)`
}, 600)






