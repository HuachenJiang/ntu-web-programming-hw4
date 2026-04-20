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
- 缺少 `.env` 时从 `.env.example` 建立样板
- 严格读取 `frontend/.env` 与 `backend/.env`，缺值或格式错误时直接停止
- 启动 PostgreSQL 服务
- 依据 `backend/.env` 中的 `DATABASE_URL` 建立本机 PostgreSQL 数据库
- 执行 Prisma generate 与 migration
- 启动前自动关闭本项目残留的 backend/frontend dev 进程
- 若 backend port、frontend dev port 或 API base URL 彼此不一致，则直接停止并提示冲突来源
- 启动 backend 与 frontend

启动成功后默认地址：

- Frontend: `http://localhost:4321`
- Backend: `http://localhost:3000`

严格模式说明：

- backend port 读取自 `backend/.env` 的 `PORT`
- frontend API base URL 读取自 `frontend/.env` 的 `VITE_API_BASE_URL`
- frontend dev server port 读取自 `frontend/vite.config.ts`
- 脚本不会再自动补 `JWT_SECRET`、`DATABASE_URL`、`VITE_API_BASE_URL`
- 若 `.env` 仍保留样板值、缺少必要栏位，或前后端 port 对不上，脚本会直接报错
- 脚本对本机 backend 的健康检查会强制绕过 shell 代理，避免 `http_proxy` / `https_proxy` 干扰本地启动流程

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
- `VITE_API_BASE_URL` 必须指向 `backend/.env` 中 `PORT` 对应的本机 backend
- `JWT_SECRET` 必须由开发者自行设定，启动脚本不会代填
- `DATABASE_URL` 必须由开发者自行设定，且需为本机 PostgreSQL 连接串
- `frontend/vite.config.ts` 的 dev server port 必须与 `backend/.env` 中 `CORS_ORIGINS` 保持一致

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

## 10. API Testing

后端验收请求集中在 `backend/requests.http`。

使用方式：

- 先确认 backend 已启动且 `http://localhost:3000/health` 可回 `200`
- 依序执行 `Register`、`Login`、`Create Location`、`Create Event`、`Create Post`
- 后续请求直接引用前面命名请求的响应资料，例如 `{{login.response.body.$.data.token}}`，不需要在请求 body 后额外定义 `@token` 或资源 id 变量

说明：

- 若使用 HTTP Client / REST Client 扩展执行 `.http` 文件，请确保每个请求 body 结束后不要追加非 JSON 内容
- `backend/requests.http` 已改为直接读取命名请求响应，避免变量声明被客户端误当成请求 body 一并送出
