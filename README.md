# HikeLog Maps

一个结合 Google Maps 的徒步记录 App。使用者登录后可以规划真实步行路线、建立徒步记录，并在个人记录页查看、编辑自己的资料。

## 1. Project Overview

核心能力如下：

- 用户注册、登录、登出与 JWT 身份验证
- Google Maps 地图载入、地点解析与步行路线规划
- Google Maps 请求监控，记录调用量、成功率、失败率、延迟与 quota 风险
- 徒步记录的新增、查询、编辑
- 统一的 RESTful API、验证、权限控制与 PostgreSQL 数据存储

## 2. Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Frontend Routing | React Router |
| UI Framework | Material UI |
| Map SDK | Google Maps JavaScript API |
| Google Service | Directions API |
| Backend | Node.js + Express + TypeScript + Prisma |
| API Style | RESTful API |
| Database | PostgreSQL |
| Auth | JWT |
| Password Hashing | bcrypt |

## 3. Core Routes

前端页面：

- `/`
- `/login`
- `/register`
- `/map`
- `/records`
- `/records/:id`
- `/records/:id/edit`

后端 API：

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `/api/events`
- `/api/locations`
- `/api/posts`

## 4. Runtime Rules

项目只保留一套运行模式：

- 前端统一调用真实 backend API
- 登录、地图规划、记录列表、详情与编辑全部走同一套真实资料流
- 地图路线规划会复用单次 Directions 结果，同时用于画面渲染与 routePlan 摘要写入
- `VITE_GOOGLE_MAPS_API_KEY` 为地图功能必需配置
- 应用可打开，但若地图 key 缺失或地图服务失败，`/map` 页面不可操作且不能保存记录

## 5. Local Prerequisites

开始前请先确认本机已经安装：

- Node.js
- npm
- Homebrew
- `postgresql@16`

项目默认使用本机 PostgreSQL：

- Host: `localhost`
- Port: `5432`
- Database: `hikelog_maps`

## 6. Local Run

项目日常启动唯一入口：

```bash
./start_all_server.sh
```

脚本负责：

- 检查前端、后端与 PostgreSQL 所需工具
- 生成缺失的 `.env`
- 自动补齐 `JWT_SECRET` 与默认 `DATABASE_URL`
- 启动 PostgreSQL 服务
- 自动创建 `hikelog_maps` 数据库
- 执行 Prisma generate 与 migration
- 启动 backend 与 frontend

启动成功后默认地址：

- Frontend: `http://localhost:4321`
- Backend: `http://localhost:3000`

## 7. Environment Variables

### Frontend `frontend/.env`

```dotenv
VITE_GOOGLE_MAPS_API_KEY=
VITE_API_BASE_URL=http://localhost:3000
```

### Backend `backend/.env`

```dotenv
PORT=3000
DATABASE_URL=postgresql://<system-user>@localhost:5432/hikelog_maps?schema=public
JWT_SECRET=
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:4321,http://127.0.0.1:4321
GOOGLE_MAPS_API_KEY=
```

说明：

- `VITE_GOOGLE_MAPS_API_KEY` 为地图页必需
- `VITE_API_BASE_URL` 指向本机 backend
- `JWT_SECRET` 为空时由启动脚本自动生成
- `DATABASE_URL` 为空时由启动脚本自动写入默认本机连接串

## 8. Data Model

核心资源如下：

- `users`
- `locations`
- `events`
- `posts`

关键约定：

- `events` 关联 `locations`
- `events.routePlan` 保存真实路线摘要
- `events` API 响应展开包含 `location`
- 所有业务资源都带 `ownerId`

## 9. Documentation

项目文档集中在 `docs/`：

- [docs/achitecture.md](./docs/achitecture.md): 当前系统架构、模块职责与运行约定
- [docs/google-maps-setup.md](./docs/google-maps-setup.md): Google Maps 开通与配置说明

任何架构、启动流程、环境变量、API 契约或地图策略的变动，都必须先更新文档再改代码。
