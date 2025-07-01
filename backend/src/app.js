import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRouter from './routes/auth.js'
import profileRouter from './routes/profile.js'
import todosRouter from './routes/todos.js'
import pool from './db.js'
// import morgan from 'morgan'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors())
app.use(express.json())

// 添加请求日志中间件
// app.use(morgan('dev'))

// 设置静态文件目录，用于提供上传的图片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/todos', todosRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`服务器启动在端口 ${PORT}`)
}) 