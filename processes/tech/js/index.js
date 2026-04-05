// console.log(dataList[0].center)
const leftCon = document.querySelector('.left-content ul')
const rightCon = document.querySelector('.right-content ul')
const centerCon = document.querySelector('.center-content ul')
// 获取数据
let dataArr = JSON.parse(localStorage.getItem('dataList'))
//如果第一次没有数据，就直接利用已有数据
if (!dataArr) {
  dataArr = dataList
  localStorage.setItem('dataList', JSON.stringify(dataArr))
}


//渲染中间的函数
function renderCenter(id) {
  const process = dataArr.find(item => item.id === id)
  if (!process) return
  const center = process.craft
  // 如果数组为空，就直接返回
  if (!center || center.length === 0) return

  centerCon.innerHTML = center.map((item, index) => {
    return `
      <li><a href="javascript:;" draggable="true" data-num="${item.num}" data-parent="${id}" ${index === 0 ? 'class="active"' : ''}>${item.name}</a></li>
      `
  }).join('')
  document.querySelector('#addCraftBtn').dataset.parent = id
  // 删除当前工艺
  document.querySelector('#center-del-Craft-Btn').dataset.parent = id
  if (center.length > 0) {
    document.querySelector('#center-del-Craft-Btn').dataset.num = center[0].num
  }
}
renderCenter(1)


//渲染右边的函数
function renderRight(id, num) {
  //边界情况处理
  if (!id || !num) return
  const process = dataArr.find(item => item.id === id)
  if (!process) return
  const craft = process.craft.find(item => item.num === num)
  // right有可能找不到，所以要判断一下
  if (!craft) return
  rightCon.innerHTML = craft.step.map((item, index) => {
    return `
           <li>
            <div class="item">
              <div class="con" data-index="${index + 1}" data-id="${id}" data-num="${num}">${index + 1}.${item}</div>
              <div class="del" data-index="${index + 1}" data-id="${id}" data-num="${num}">
                <button>删除</button>
              </div>
            </div>
          </li>
      `
  }).join('')
  document.querySelector('.right-header-title p').innerHTML = craft.name
  // 删除当前工艺
  document.querySelector('#center-del-Craft-Btn').dataset.num = num
  // 新增工序
  document.querySelector('#right-add-Step-Btn').dataset.parent = id
  document.querySelector('#right-add-Step-Btn').dataset.num = num
  // 清空工序
  document.querySelector('#clear-Step-Btn').dataset.num = num
  document.querySelector('#clear-Step-Btn').dataset.parent = id
}
renderRight(1, 1)


// 左边渲染中间列表
leftCon.addEventListener('click', (e) => {
  const a = e.target.closest('a')
  if (a) {
    // console.log(e.target.dataset.id)
    const id = +a.dataset.id
    // console.log(id)
    //样式切换
    leftCon.querySelector('.active').classList.remove('active')
    a.classList.add('active')
    //渲染中间列表
    renderCenter(id)
  }
})


//中间渲染右边列表
centerCon.addEventListener('click', (e) => {
  const a = e.target.closest('a')
  if (a) {
    let num = +a.dataset.num
    let parent = +a.dataset.parent
    // console.log(parent, num)
    //样式切换
    const active = centerCon.querySelector('.active')
    if (active) {
      active.classList.remove('active')
    }
    a.classList.add('active')

    //渲染右边列表
    renderRight(parent, num)
  }
})








// 新建工艺
const addBtn = document.querySelector('.center-header-button button')
addBtn.addEventListener('click', () => {
  document.querySelector('.layer').style.display = 'flex'
})
// 取消
document.querySelector('.add-craft-footer .cancel-btn').addEventListener('click', () => {
  document.querySelector('.layer').style.display = 'none'
})
// 新增
document.querySelector('.add-craft-footer .add-btn').addEventListener('click', (e) => {
  e.preventDefault()
  const value = document.querySelector('.add-craft-content input').value
  // console.log(value)
  if (value === '') {
    document.querySelector('.add-craft-content p.error').style.opacity = 1
    return
  } else {
    let parent = +document.querySelector('#addCraftBtn').dataset.parent
    //num的计算有问题 如果用数组长度会重复，所以要从数组中取最大值+1
    const craftObj = {
      num: Math.max(...dataArr[parent - 1].craft.map(item => item.num)) + 1,
      name: value,
      step: []
    }
    dataArr[parent - 1].craft.push(craftObj)
    localStorage.setItem('dataList', JSON.stringify(dataArr))

    renderCenter(parent)
    renderRight(parent, craftObj.num)
    document.querySelector('.add-craft-content input').value = ''
    document.querySelector('.layer').style.display = 'none'
    centerCon.querySelector('.active').classList.remove('active')
    centerCon.querySelector(`a[data-num="${craftObj.num}"]`).classList.add('active')
  }
})




// 删除当前工艺
let delParent = 0
let delNum = 0
document.querySelector('.center-bottom-delBtn').addEventListener('click', (e) => {
  document.querySelector('.del-Craft-layer').style.display = 'flex'
  //索引并不连续，动态获取
  const DelCraft = centerCon.querySelector('.active')
  if (!DelCraft) return
  delParent = +DelCraft.dataset.parent
  delNum = +DelCraft.dataset.num
})
document.querySelector('.del-craft-footer .cancel-Craft-btn').addEventListener('click', () => {
  document.querySelector('.del-Craft-layer').style.display = 'none'
})
document.querySelector('.del-craft-footer .del-Craft-btn').addEventListener('click', () => {
  //删除当前工艺 索引错误 通过find方法删除 delNum不连续，索引会出错
  // dataArr[delParent - 1].craft.splice(delNum - 1, 1)
  // 找到要删除的工艺
  const CraftIndex = dataArr[delParent - 1].craft.findIndex(item => item.num === delNum)
  // 找到后删除
  if (CraftIndex !== -1) {
    dataArr[delParent - 1].craft.splice(CraftIndex, 1)
  }

  localStorage.setItem('dataList', JSON.stringify(dataArr))
  renderCenter(delParent)
  //删除后数组长度改变！
  if (dataArr[delParent - 1].craft.length > 0) {
    renderRight(delParent, dataArr[delParent - 1].craft[0].num)
  } else {
    rightCon.innerHTML = ''
  }
  document.querySelector('.del-Craft-layer').style.display = 'none'
})





// 新增工序
document.querySelector('#right-add-Step-Btn').addEventListener('click', () => {
  document.querySelector('.add-Step-layer').style.display = 'flex'
})
document.querySelector('.add-Step-footer .cancel-Step-btn').addEventListener('click', () => {
  document.querySelector('.add-Step-layer').style.display = 'none'
})
document.querySelector('.add-Step-footer .add-Step-btn').addEventListener('click', (e) => {
  e.preventDefault()
  const value = document.querySelector('.add-Step-content input').value
  // console.log(value)
  if (value === '') {
    document.querySelector('.add-Step-content p.error').style.opacity = 1
    return
  } else {
    //动态获取当前选中的工艺索引，删除工艺后索引会改变 并不连续。
    let parent = +document.querySelector('#right-add-Step-Btn').dataset.parent
    let num = +document.querySelector('#right-add-Step-Btn').dataset.num
    // 找到当前选中的工艺索引 找到对应的对象来添加Step
    const CraftIndex = dataArr[parent - 1].craft.findIndex(item => item.num === num)
    if (CraftIndex !== -1) {
      dataArr[parent - 1].craft[CraftIndex].step.push(value)
    }
    localStorage.setItem('dataList', JSON.stringify(dataArr))
    renderRight(parent, num)
    document.querySelector('.add-Step-content input').value = ''
    document.querySelector('.add-Step-layer').style.display = 'none'
  }
})



// 清空工序
let clearNum = 0
let clearParent = 0
document.querySelector('.right-header-btn .delete-btn  button').addEventListener('click', (e) => {
  document.querySelector('.clear-Step-layer').style.display = 'flex'
  clearNum = +e.target.dataset.num
  clearParent = +e.target.dataset.parent
  console.log(clearNum, clearParent)
})
document.querySelector('.clear-Step-footer .cancel-Step-btn').addEventListener('click', () => {
  document.querySelector('.clear-Step-layer').style.display = 'none'
})
document.querySelector('.clear-Step-footer .clear-Step-btn').addEventListener('click', () => {
  //清空工序
  dataArr[clearParent - 1].craft[clearNum - 1].step = []
  localStorage.setItem('dataList', JSON.stringify(dataArr))
  renderRight(clearParent, clearNum)
  document.querySelector('.clear-Step-layer').style.display = 'none'
})


// 删除特定的工序
let stepIndex = 0
let stepId = 0
let stepNum = 0
document.querySelector('.right-content').addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    // console.log(e.target.parentNode)
    document.querySelector('.del-Step-layer').style.display = 'flex'
    stepIndex = +e.target.parentNode.dataset.index
    stepId = +e.target.parentNode.dataset.id
    stepNum = +e.target.parentNode.dataset.num
  }
})
document.querySelector('.del-Step-footer .cancel-Step-btn').addEventListener('click', () => {
  document.querySelector('.del-Step-layer').style.display = 'none'
})
document.querySelector('.del-Step-footer .del-Step-btn').addEventListener('click', () => {
  dataArr[stepId - 1].craft[stepNum - 1].step.splice(stepIndex - 1, 1)
  localStorage.setItem('dataList', JSON.stringify(dataArr))
  renderRight(stepId, stepNum)
  document.querySelector('.del-Step-layer').style.display = 'none'
})





