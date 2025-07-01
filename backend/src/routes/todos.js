import express from 'express';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// 获取当前用户所有 todo
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('获取 todos 失败:', err);
    res.status(500).json({ error: '获取待办事项失败' });
  }
});

// 新增 todo
router.post('/', auth, async (req, res) => {
  const { content, priority = 'low', date = '', address = '' } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: '内容不能为空' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO todos (user_id, content, priority, date, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, content, priority, date, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('新增 todo 失败:', err);
    res.status(500).json({ error: '新增待办事项失败' });
  }
});

// 删除 todo（只能删自己的）
router.delete('/:id', auth, async (req, res) => {
  const todoId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
      [todoId, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: '未找到该待办事项或无权限' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('删除 todo 失败:', err);
    res.status(500).json({ error: '删除待办事项失败' });
  }
});

// 更新 todo（只能改自己的）
router.put('/:id', auth, async (req, res) => {
  const todoId = req.params.id;
  const { content, priority, date, address } = req.body;
  try {
    const fields = [];
    const values = [];
    let idx = 1;
    if (content !== undefined) { fields.push(`content = $${idx++}`); values.push(content); }
    if (priority !== undefined) { fields.push(`priority = $${idx++}`); values.push(priority); }
    if (date !== undefined) { fields.push(`date = $${idx++}`); values.push(date); }
    if (address !== undefined) { fields.push(`address = $${idx++}`); values.push(address); }
    if (fields.length === 0) return res.status(400).json({ error: '无可更新字段' });
    values.push(todoId, req.user.id);
    const sql = `UPDATE todos SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`;
    const result = await pool.query(sql, values);
    if (result.rowCount === 0) return res.status(404).json({ error: '未找到该待办事项或无权限' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('更新 todo 失败:', err);
    res.status(500).json({ error: '更新待办事项失败' });
  }
});

export default router; 