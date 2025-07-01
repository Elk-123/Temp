import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'

// 注册
router.post('/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空。' })
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    )
    res.status(201).json({ message: '注册成功', user: result.rows[0] })
  } catch (err) {
    if (err.code === '23505') { // 唯一性冲突
      return res.status(409).json({ message: '用户名已存在。' })
    }
    res.status(500).json({ message: '服务器错误' })
  }
})

// 登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  console.log(`[LOGIN] - 收到登录请求: user='${username}'`)
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空。' })
  }
  try {
    console.log('[LOGIN] - 步骤 1: 查询数据库')
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    console.log('[LOGIN] - 步骤 2: 检查用户是否存在')
    if (userResult.rows.length === 0) {
      console.log(`[LOGIN] - 用户 '${username}' 不存在`)
      return res.status(401).json({ message: '用户名或密码错误。' })
    }
    const user = userResult.rows[0]
    console.log('[LOGIN] - 步骤 3: 比较密码')
    const isMatch = await bcrypt.compare(password, user.password)
    console.log('[LOGIN] - 步骤 4: 检查密码是否匹配')
    if (!isMatch) {
      console.log(`[LOGIN] - 用户 '${username}' 密码错误`)
      return res.status(401).json({ message: '用户名或密码错误。' })
    }
    console.log('[LOGIN] - 步骤 5: 生成JWT令牌')
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' })
    console.log('[LOGIN] - 步骤 6: 发送响应')
    res.json({ token, user: { id: user.id, username: user.username, avatar_url: user.avatar_url } })
  } catch (err) {
    console.error('!!! 登录路由崩溃 !!!')
    console.error('错误详情:', err)
    res.status(500).json({ message: '服务器内部错误' })
  }
})

export default router