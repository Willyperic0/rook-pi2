import express from 'express'
import { Server } from 'socket.io'
import {createServer} from 'node:http'
import logger from 'morgan'
const port = process.env["PORT"] ?? 3000;
const app = express()
const server = createServer(app)
const io = new Server(server)
io.on('connection', (socket) => {
  console.log('a user has connected')
  socket.on('disconnect',()=>{
    console.log('a user has disconnected')
  })
  socket.on('chat message', (msg) => {
     io.emit('chat message',msg)
  })
})
app.get('/', (_req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`)
})
app.use(logger('dev'))