import jwt from 'jsonwebtoken';
import pool from '../db.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).send({ error: '未提供令牌，禁止访问。' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const { rows } = await pool.query('SELECT id, username, avatar_url FROM users WHERE id = $1', [decoded.id]);
    
    if (rows.length === 0) {
      // 虽然不太可能发生（因为注册/登录时已验证），但作为安全措施保留
      return res.status(401).send({ error: '令牌有效但用户不存在。' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    // 这个 catch 块现在能捕获所有错误，包括 jwt.verify 的失败
    console.error('!!! 身份验证中间件发生严重错误 !!!');
    console.error('错误对象:', error);
    console.error('---------------------------------');
    res.status(401).send({ error: '身份验证失败，请重新登录。' });
  }
};

export default auth; 