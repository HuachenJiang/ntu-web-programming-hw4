# Project Achitecture

本文档记录本项目当前的真实架构、模块职责、资料流与运行约定。Google Maps 的开通与 key 管理说明统一维护在 [google-maps-setup.md](./google-maps-setup.md)。

## 1. System Overview

HikeLog Maps 是一个结合 Google Maps 的徒步记录 App，当前系统目标如下：

- 使用者可注册、登录、登出，并以 `email + password` 进行身份验证
- 登录后可建立、读取、编辑自己的徒步记录
- 地图页使用 `Google Maps JavaScript API` 与 `Directions API` 规划真实路线
- 后端以 `Express + Prisma + PostgreSQL` 提供 RESTful API、JWT、验证与权限控制

系统分为三层：

- Frontend: `React + TypeScript + Vite + React Router + Material UI`
- Backend: `Node.js + Express + TypeScript + Prisma + JWT`
- Database: `PostgreSQL`

## 2. Repository Structure

```text
.
├── AGENTS.md
├── README.md
├── docs/
│   ├── achitecture.md
│   └── google-maps-setup.md
├── frontend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── types/
│       └── utils/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── utils/
│       └── validators/
└── start_all_server.sh
```

## 3. Frontend Architecture

前端负责页面呈现、地图互动、表单输入、认证状态与 API 串接。当前运行模式只有一套：页面统一调用真实 backend API，登录、地图规划与记录管理全部走同一套真实资料流。

模块职责如下：

- `pages/`: 页面级流程，例如首页、登录页、地图页、记录列表、详情与编辑页
- `components/`: 可复用 UI 元件，例如导航、地图容器、路线面板、记录表单
- `hooks/`: 封装地图加载、路线规划与筛选等可复用行为
- `context/`: 维护全域认证状态与登录恢复逻辑
- `services/`: API 请求封装与本地 auth storage
- `types/`: 前端 domain model、API response 与 DTO 型别
- `utils/`: 日期、距离、表单与常数工具

前端原则：

- 页面组件不直接写复杂请求逻辑
- 认证与记录资料统一经由 `services/` 调用 backend
- 地图功能只支持真实 Google Maps 流程
- 若缺少 `VITE_GOOGLE_MAPS_API_KEY` 或地图服务失败，`/map` 页面直接进入不可操作状态，不允许保存记录

## 4. Backend Architecture

后端负责认证、权限、验证、业务逻辑、数据库存取与错误处理。

模块职责如下：

- `routes/`: URL 与 middleware 组合
- `controllers/`: request / response 转换与统一 JSON 回传
- `services/`: 业务逻辑、owner 检查与跨资源规则
- `repositories/`: Prisma 查询与写入封装
- `validators/`: Zod schema、params 与 query 验证
- `middlewares/`: JWT 验证、404 与 error handling
- `config/`: 环境变量与 Prisma client

后端原则：

- 路由只负责转发，不直接承载业务逻辑
- 写入型操作必须经过认证与 owner 权限验证
- 成功与错误响应格式统一
- 所有 secret、数据库连线与 server-side key 都来自 `.env`

## 5. Domain Model

核心资源如下：

- `users`
- `locations`
- `events`
- `posts`

关键建模约定：

- 所有业务资源保留 `ownerId`
- `events` 以 `locationId` 关联 `locations`
- `events.routePlan` 以 JSON 保存起点、终点、途经点、里程与时间
- API 回传 `event` 时展开包含 `location`，以贴近前端 `HikeRecord`
- `users.email` 为唯一值

## 6. API Architecture

认证路由：

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

资源路由：

- `/api/events`
- `/api/locations`
- `/api/posts`

设计约定：

- 使用 RESTful 风格
- 列表查询优先支援 `q`, `category`, `radius`, `lat`, `lng`, `from`, `to`, `page`, `limit`
- Auth 成功响应固定为 `data: { user, token }`
- 写入型 API 必须经过 JWT 与 owner 权限验证

## 7. Runtime and Environment

环境变量如下：

### Frontend

```dotenv
VITE_GOOGLE_MAPS_API_KEY=
VITE_API_BASE_URL=http://localhost:3000
```

### Backend

```dotenv
PORT=3000
DATABASE_URL=postgresql://<system-user>@localhost:5432/hikelog_maps?schema=public
JWT_SECRET=
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:4321,http://127.0.0.1:4321
GOOGLE_MAPS_API_KEY=
```

运行约定：

- 项目日常启动唯一入口是根目录的 `./start_all_server.sh`
- 本机需先安装 `postgresql@16`
- 脚本负责启动 PostgreSQL 服务、建库、Prisma generate、migration、backend 与 frontend
- 不再保留“backend 缺失时跳过启动”的兼容行为

## 8. Google Maps Policy

Google Maps 在本项目中只支持真实线上流程：

- 浏览器端从 `frontend/.env` 读取 `VITE_GOOGLE_MAPS_API_KEY`
- 使用 `Google Maps JavaScript API` 处理地图载入与互动
- 使用 `Directions API` 规划步行路线
- 地图页只有在成功取得真实 `routePlan` 时才允许保存记录

统一规则如下：

- 应用可以打开，但若 `VITE_GOOGLE_MAPS_API_KEY` 缺失，`/map` 页面不可操作
- 若 Maps JavaScript API 加载失败，`/map` 页面不可操作
- 若 Directions 请求失败，页面保留错误讯息，且不允许保存记录

## 9. Data Flow

主要资料流如下：

1. 使用者在前端注册或登录
2. 前端取得 `token` 后写入本地 auth storage
3. 前端访问 `/auth/me` 恢复登录态
4. 地图页调用 Google Maps 生成真实路线摘要
5. 前端将记录表单与 `routePlan` 提交到 `/api/events`
6. 后端完成验证、权限检查与资料写入
7. 记录列表、详情与编辑页统一从 backend 读取或更新资料

## 10. Change Rule

以下变动必须先更新本文件再改代码：

- 模块分层调整
- 核心资源增减
- API 响应契约改变
- 认证策略改变
- Google Maps 行为改变
- 启动流程或环境变量策略改变
