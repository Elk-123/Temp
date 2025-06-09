import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = express.Router()
const JWT_SECRET = 'your_jwt_secret' // 建议放到环境变量

// 注册
router.post('/register', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: '邮箱和密码必填' })
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (userCheck.rows.length > 0) return res.status(409).json({ message: '邮箱已注册' })
    const hash = await bcrypt.hash(password, 10)
    await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hash])
    res.json({ message: '注册成功' })
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

// 登录
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: '邮箱和密码必填' })
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (userRes.rows.length === 0) return res.status(401).json({ message: '用户不存在' })
    const user = userRes.rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: '密码错误' })
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token })
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router 