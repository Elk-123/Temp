import pkg from 'pg'
const { Pool } = pkg

console.log('正在创建数据库连接池...')

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'a6',
  password: process.env.DB_PASSWORD || 'Elk613891',
  port: process.env.DB_PORT || 5432,
})

pool.on('connect', () => {
  console.log('数据库连接成功！')
})

pool.on('error', (err) => {
  console.error('数据库连接池发生错误:', err)
})

export default pool 