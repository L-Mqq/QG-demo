// 获取用户信息 渲染用户名
const user = JSON.parse(localStorage.getItem('user'));
document.querySelector('.user-name').innerHTML = user.name;
console.log(user)
const classId = user.classId
// console.log(classId)


//渲染左上角的班级名称
function renderClass(class_id) {
  apiRequest('/api/classes').then(data => {
    console.log(data.data)
    data.data.forEach(item => {
      if (item.id === class_id) {
        document.querySelector('.readonly').innerHTMLinnerHTML = item.name
      }
    })
  })
}
renderClass(classId)

//渲染筛选条件的学科
function renderSubjectList() {
  apiRequest('/api/scores').then(data => {
    // console.log(data.data);
    const subjectList = data.data
    //获取每一个对象中的科目，不可重复
    const subjectSet = [...new Set(subjectList.map(item => item.subject))];
    // console.log(subjectSet)
    const str = subjectSet.map(item => {
      return `
      <option value="${item}">${item}</option>
      `
    }).join('');
    document.querySelector('#subject').innerHTML = ` <option value="">请选择学科</option>${str}`
    document.querySelector('#subjectMid').innerHTML = ` <option value="">请选择学科</option>${str}`
    document.querySelector('#subjectMobile').innerHTML = ` <option value="">请选择学科</option>${str}`
  });
}
renderSubjectList()



// 渲染筛选条件的姓名/学号
function renderStudentName(class_id) {
  apiRequest('/api/users').then(data => {
    const classUserList = data.data.filter(item => item.class_id === class_id && item.role === 'student')
    console.log(classUserList)
    // 渲染姓名/学号
    const NameStr = classUserList.map(item => {
      return `
      <option value="${item.id}">${item.name}</option>
      `
    }).join('');
    document.querySelector('#studentName').innerHTML = ` <option value="">请选择姓名</option>${NameStr}`
    document.querySelector('#studentNameMid').innerHTML = ` <option value="">请选择姓名</option>${NameStr}`
    document.querySelector('#studentNameMobile').innerHTML = ` <option value="">请选择姓名</option>${NameStr}`
  });
}
renderStudentName(classId)


function renderStudentId(class_id) {
  apiRequest('/api/users').then(data => {
    const classUserList = data.data.filter(item => item.class_id === class_id && item.role === 'student')
    console.log(classUserList)
    // 渲染学号
    const IdStr = classUserList.map(item => {
      return `
      <option value="${item.id}">${item.id}</option>
      `
    }).join('');
    document.querySelector('#studentId').innerHTML = ` <option value="">请选择学号</option>${IdStr}`
    document.querySelector('#studentIdMid').innerHTML = ` <option value="">请选择学号</option>${IdStr}`
    document.querySelector('#studentIdMobile').innerHTML = ` <option value="">请选择学号</option>${IdStr}`
  });
}
renderStudentId(classId)


