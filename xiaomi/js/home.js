const children = document.querySelectorAll('.home-nav .children')
const homeNavLi = document.querySelectorAll('.home-nav>ul>li')
const homeConTImg = document.querySelector('.home-con-t a img')
const indicators = document.querySelectorAll('.home-con-t .indicators ul li')
const lbtLeft = document.querySelector('.lbtLeft')
const lbtRight = document.querySelector('.lbtRight')
const homeConT = document.querySelector('.home-con-t')

// 悬浮到右边盒子 左侧的bg保持不变
children.forEach((item, index) => {
  item.addEventListener('mouseenter', (e) => {
    homeNavLi[index].classList.add('active')
  })
  item.addEventListener('mouseleave', (e) => {
    homeNavLi[index].classList.remove('active')
  })
})

//轮播图
let picData = [{ url: './images/lbt1.jpg' }, { url: './images/lbt2.webp' }, { url: './images/lbt3.webp' }, { url: './images/lbt4.webp' }, { url: './images/lbt5.webp' }, { url: './images/lbt6.webp' }]
let i = 0

//  右按钮
lbtRight.addEventListener('click', (e) => {
  i++
  if (i === 6) {
    i = 0
  }
  homeConTImg.src = picData[i].url
  // 切换指示器
  indicators.forEach((item) => {
    item.classList.remove('active')
  })
  indicators[i].classList.add('active')
})

//  左按钮
lbtLeft.addEventListener('click', (e) => {
  i--
  if (i === -1) {
    i = 5
  }
  homeConTImg.src = picData[i].url
  // 切换指示器
  indicators.forEach((item) => {
    item.classList.remove('active')
  })
  indicators[i].classList.add('active')
})

// 自动播放
let timer = null
timer = setInterval(() => {
  lbtRight.click()
}, 2000)

// 悬停停止自动播放
homeConT.addEventListener('mouseenter', (e) => {
  clearInterval(timer)
})
homeConT.addEventListener('mouseleave', (e) => {
  timer = setInterval(() => {
    lbtRight.click()
  }, 2000)
})

// 点击圆点
indicators.forEach(item => {
  item.addEventListener('click', e => {
    console.log(item.dataset.num)
    i = item.dataset.num
    homeConTImg.src = picData[i].url
    // 切换指示器
    indicators.forEach((item) => {
      item.classList.remove('active')
    })
    indicators[i].classList.add('active')
  })
})