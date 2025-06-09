# 后端服务

## 启动

1. 安装依赖

```bash
npm install
```

2. 启动服务

```bash
npm start
```

默认端口：3001

## 数据库初始化

请在PostgreSQL中执行以下SQL语句创建用户表：

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
```

> 默认数据库连接配置在 `src/db.js`，如有需要请修改用户名、密码、数据库名。 