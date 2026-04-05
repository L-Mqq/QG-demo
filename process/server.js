const http = require('http')
const fs = require('fs')
const path = require('path')
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
}

const server = http.createServer((req, res) => {
  // 判断请求方法
  if (req.method !== 'GET') {
    res.end('请求方法错误')
    return
  }
  //获取路径
  const url = new URL(req.url, 'http://localhost')
  let { pathname } = url
  if (pathname === '/') {
    pathname = '/index.html'
  }
  //拼接路径
  const filePath = path.join(__dirname, '/tech', pathname)
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // console.log(err)
      res.setHeader('content-type', 'text/html;charset=utf-8')
      res.statusCode = 404
      res.end('<h1>404 Not Found</h1>')
      return
    }
    // 获取扩展名
    const ext = path.extname(filePath)
    const type = mimeTypes[ext]
    // 判断能不能获取到扩展名
    if (type) {
      res.setHeader('content-type', `${type};charset=utf-8`)
    } else {
      //下载
      res.setHeader('content-type', 'application/octet-stream')
    }
    res.end(data)
  })

})




server.listen(3000, () => {
  console.log('go...')
})