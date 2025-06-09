import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  user: 'postgres', // 修改为你的数据库用户名
  host: 'localhost',
  database: 'testdb', // 修改为你的数据库名
  password: 'postgres', // 修改为你的数据库密码
  port: 5432,
})

export default pool 