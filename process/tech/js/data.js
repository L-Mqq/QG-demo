const dataList = [
  {
    id: 1,
    process: '原料切割',
    craft: [
      { num: 1, name: '原料切割-工艺1', step: ['切割', '打磨'] },
      { num: 2, name: '原料切割-工艺2', step: ['切割', '抛光'] },
      { num: 3, name: '原料切割-工艺3', step: ['切割', '清洗'] },
      { num: 4, name: '原料切割-工艺4', step: ['切割', '检验'] },
    ]
  },
  {
    id: 2,
    process: '精加工',
    craft: [
      { num: 1, name: '精加工-工艺1', step: ['精车', '精磨'] },
      { num: 2, name: '精加工-工艺2', step: ['精铣', '抛光'] },
      { num: 3, name: '精加工-工艺3', step: ['精钻', '研磨'] },
      { num: 4, name: '精加工-工艺4', step: ['精钻', '清洗'] },
    ]
  },
  {
    id: 3,
    process: '粗加工',
    craft: [
      { num: 1, name: '粗加工-工艺1', step: ['粗车', '粗铣'] },
      { num: 2, name: '粗加工-工艺2', step: ['粗刨', '粗磨'] },
      { num: 3, name: '粗加工-工艺3', step: ['粗钻', '粗钻'] }
    ]
  },
  {
    id: 4,
    process: '表面处理',
    craft: [
      { num: 1, name: '表面处理-工艺1', step: ['粗车', '粗铣'] },
      { num: 2, name: '表面处理-工艺2', step: ['粗刨', '粗磨'] },
      { num: 3, name: '表面处理-工艺3', step: ['粗钻', '粗钻'] }
    ]
  },
  {
    id: 5,
    process: '组装',
    craft: [
      { num: 1, name: '组装-工艺1', step: ['粗车', '粗铣'] },
      { num: 2, name: '组装-工艺2', step: ['粗刨', '粗磨'] },
      { num: 3, name: '组装-工艺3', step: ['粗钻', '粗钻'] }
    ]
  },
]

// localStorage.setItem('dataList', JSON.stringify(dataList))