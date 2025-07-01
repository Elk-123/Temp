import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// 解决ES Module中没有 __dirname 的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

// 确保 uploads 目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 文件大小限制
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const isMimeTypeValid = filetypes.test(file.mimetype);
    const isExtNameValid = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (isMimeTypeValid && isExtNameValid) {
      return cb(null, true);
    }
    cb(new Error('错误：只支持上传图片文件！'));
  }
});

// GET /api/profile - 获取当前用户信息
router.get('/', auth, (req, res) => {
  res.send(req.user);
});

// PUT /api/profile - 禁止修改用户名
router.put('/', auth, async (req, res) => {
  if (req.body.username) {
    return res.status(403).send({ error: '不允许修改用户名' });
  }
  // 这里可以保留头像等其他字段的更新逻辑（如有）
  res.status(400).send({ error: '无可更新内容' });
});

// POST /api/profile/avatar - 上传头像
router.post('/avatar', auth, (req, res) => {
  upload.single('avatar')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).send({ error: `Multer 错误: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).send({ error: err.message });
    }

    // Everything went fine.
    if (!req.file) {
      return res.status(400).send({ error: '请选择一个文件上传。' });
    }
    
    const avatarUrl = `/uploads/${req.file.filename}`;
    pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, username, avatar_url',
      [avatarUrl, req.user.id]
    )
    .then(result => res.send(result.rows[0]))
    .catch(dbError => {
      console.error(dbError);
      res.status(500).send({ error: '更新头像失败。' });
    });
  });
});

export default router; 