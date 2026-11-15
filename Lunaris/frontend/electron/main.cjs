const { app, BrowserWindow, dialog } = require('electron')
const { createServer } = require('node:http')
const { createReadStream, existsSync, statSync } = require('node:fs')
const path = require('node:path')

const distDirectory = path.join(__dirname, '..', 'dist')
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function serveFile(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end()
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname)
  } catch {
    response.writeHead(400).end('Invalid URL')
    return
  }

  let filePath = path.resolve(distDirectory, `.${pathname}`)
  if (filePath !== distDirectory && !filePath.startsWith(`${distDirectory}${path.sep}`)) {
    response.writeHead(403).end('Forbidden')
    return
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html')
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    filePath = path.join(distDirectory, 'index.html')
  }

  if (!existsSync(filePath)) {
    response.writeHead(404).end('Not Found')
    return
  }

  response.setHeader('Content-Type', mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream')
  if (request.method === 'HEAD') {
    response.end()
    return
  }

  const stream = createReadStream(filePath)
  stream.on('error', (error) => {
    console.error('Unable to read app resource:', error)
    if (!response.headersSent) response.writeHead(500)
    response.end('Unable to read app resource')
  })
  stream.pipe(response)
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject)
      resolve(server.address().port)
    })
  })
}

async function openApp() {
  if (!existsSync(path.join(distDirectory, 'index.html'))) {
    throw new Error('No se encontró la aplicación compilada. Volvé a generar el instalador.')
  }

  const server = createServer(serveFile)
  const port = await listen(server)
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: 'LUNARIS',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  window.on('closed', () => {
    server.close()
  })
  await window.loadURL(`http://127.0.0.1:${port}`)
}

app.whenReady().then(openApp).catch((error) => {
  console.error('Unable to start Lunaris:', error)
  dialog.showErrorBox('No se pudo iniciar LUNARIS', error.message)
  app.quit()
})

app.on('window-all-closed', () => {
  app.quit()
})
