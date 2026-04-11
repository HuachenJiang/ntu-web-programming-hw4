# Project Achitecture

本文档为本项目的架构主说明文件。`docs/` 文件夹专门用于存放项目文档，而本文件负责整理系统目标、模块分层、资料流、API 边界与开发阶段。Google Maps API 相关专门说明则放在同目录下的 [google-maps-setup.md](./google-maps-setup.md)。

## 1. System Overview

本项目是一个结合 Google Maps 的徒步记录 App，使用者登录后可以：

- 在地图上搜寻地点与标记位置
- 规划徒步路线并取得里程
- 记录完成日期与心得
- 管理自己的活动、地点、心得与其他项目资料

系统分为三个主要层次：

- Frontend: `React + TypeScript + Vite + React Router + Axios + Material UI`
- Backend: `Node.js + Express + TypeScript + RESTful API + JWT`
- Database: `PostgreSQL`

Google Maps 整合以 `Google Maps JavaScript API` 为主，并以 `Directions API` 支援路线与距离计算。

## 2. Documentation Structure

建议文档结构如下：

```text
docs/
  achitecture.md
  google-maps-setup.md
```

职责如下：

- `docs/achitecture.md`: 记录整体架构、模块职责、资料流、开发顺序
- `docs/google-maps-setup.md`: 记录 Google Cloud、Billing、API 启用、API key 限制与整合说明

第一阶段实际目录骨架建议同步建立为：

```text
.
├── .gitignore
├── docs/
├── frontend/
│   ├── .env
│   ├── .env.example
│   └── src/
│       ├── app/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── types/
│       └── utils/
└── backend/
    ├── .env
    ├── .env.example
    └── src/
        ├── config/
        ├── controllers/
        ├── middlewares/
        ├── repositories/
        ├── routes/
        ├── services/
        ├── types/
        ├── utils/
        └── validators/
```

## 3. Frontend Architecture

前端负责页面呈现、地图互动、表单输入、认证状态与 API 串接。

建议目录：

```text
frontend/
  .env
  .env.example
  src/
    app/
    components/
    context/
    hooks/
    layouts/
    pages/
    routes/
    services/
    types/
    utils/
```

模块职责：

- `pages/`: 页面级流程，例如首页、登录页、地图页、记录页
- `components/`: 可复用 UI 元件，例如地图容器、路线表单、记录卡片
- `hooks/`: 封装地图载入、Directions 调用、表单行为、认证状态
- `context/`: 管理全域状态，例如当前用户、token
- `services/`: Axios 实例与 API 封装
- `types/`: 前后端 DTO 与 domain model
- `utils/`: 日期、距离、地图资料转换等工具函数

前端原则：

- 页面层不直接塞入复杂地图逻辑
- API 调用集中在 `services/`
- 共用状态集中在 `context/`
- 可复用行为集中在 `hooks/`
- Google Maps browser key 统一从 `frontend/.env` 读取，不写死在源码

## 4. Backend Architecture

后端负责认证、权限、验证、业务逻辑、数据库存取与错误处理。

建议目录：

```text
backend/
  .env
  .env.example
  src/
    app.ts
    server.ts
    config/
    controllers/
    middlewares/
    repositories/
    routes/
    services/
    types/
    validators/
    utils/
```

模块职责：

- `routes/`: 路由定义
- `controllers/`: request / response handling
- `services/`: 业务逻辑与规则
- `repositories/`: PostgreSQL 读写
- `validators/`: 栏位与 schema 验证
- `middlewares/`: JWT 验证、权限检查、错误处理、日志

后端原则：

- 路由只负责转发，不直接写复杂业务逻辑
- 权限检查必须独立且可复用
- 资料库存取与业务逻辑分离
- 统一响应格式与错误码
- 所有 secret、数据库连线与 server-side Google key 统一从 `backend/.env` 读取

## 5. Domain Model

建议核心资源如下：

- `users`: 用户
- `events`: 徒步活动或路线记录
- `locations`: 地点资料
- `posts`: 心得或游记
- `items`: 装备、清单或其他附属项目

共通栏位建议：

- `id`
- `ownerId`
- `createdAt`
- `updatedAt`

常见业务栏位：

- `title` / `name`
- `description`
- `latitude`
- `longitude`
- `address`
- `category`
- `startTime`
- `endTime`
- `completedDate`

## 6. API Architecture

认证相关：

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

资源相关：

- `/api/events`
- `/api/locations`
- `/api/posts`
- `/api/items`

设计原则：

- 使用 RESTful 风格
- 列表查询优先支援 `q`, `category`, `radius`, `lat`, `lng`, `from`, `to`
- 成功与错误响应格式统一
- 写入型 API 必须经过认证与 owner 权限验证

## 7. Auth and Security

安全要求：

- 账号使用 `email + password`
- 密码使用 `bcrypt` 或 `argon2` 哈希
- 登录后由后端签发 JWT
- 用户只能修改或删除自己的资料
- `.env` 不提交，`.env.example` 必提交

验证重点：

- email 格式
- password 长度
- 经纬度数值范围
- 日期与时间格式
- 必填栏位检查

环境变量骨架建议：

### Frontend

```dotenv
VITE_GOOGLE_MAPS_API_KEY=
VITE_API_BASE_URL=http://localhost:3000
```

### Backend

```dotenv
PORT=3000
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
GOOGLE_MAPS_API_KEY=
```

规则：

- `.env` 仅供本机开发使用，不提交
- `.env.example` 必须存在并与 `.env` 的变量名称保持同步
- 前端使用 `VITE_GOOGLE_MAPS_API_KEY`
- 后端预留 `GOOGLE_MAPS_API_KEY` 给未来 server-to-server 调用

## 8. Google Maps Integration

Google Maps 在本项目中的角色如下：

- `Maps JavaScript API`: 地图显示与互动
- `Directions API`: 徒步路线与里程计算
- `Places API`: 可选，用于地点搜寻
- `Geocoding API`: 可选，用于地址转换

建议资料流：

1. 用户进入地图页。
2. 前端加载 Google Maps JavaScript API。
3. 用户选择起点、终点或搜寻地点。
4. 前端调用 Directions 取得步行路线与距离。
5. 用户填写标题、日期、心得等表单。
6. 前端通过 Axios 将资料写入后端。
7. 后端完成验证、权限检查并保存到 PostgreSQL。

Google Maps API 的开通、Billing、API key 限制与监控细节，统一维护于：

- [google-maps-setup.md](./google-maps-setup.md)

## 9. Monitoring Architecture

Google Maps request monitors 建议分为两层：

- 前端：记录地图加载、路线计算、地点搜寻的成功与失败
- 后端：记录与 Google 服务相关的代理请求、错误码、响应时间与统计

建议追踪：

- 服务名称
- 请求时间
- 用户 ID
- 成功或失败
- 响应时间
- 错误码
- 每日请求量
- quota 风险

## 10. Development Phases

### Phase 1

先完成前端页面与 mock data，确认地图页、记录页、登录页与路由导览正确。

### Phase 2

实现后端、数据库、Auth、验证、权限控制，并以 `curl` 或 `.http` 验证 API。

### Phase 3

用 Axios 将前端接上后端，完成从登录、地图操作到资料保存的完整流程。

## 11. Architecture Change Rule

若未来发生以下变动，必须优先更新本文件：

- 模块分层调整
- 新增或删除核心资源
- 认证方案改变
- Google Maps 整合策略改变
- API 命名或响应结构调整
- 开发阶段与职责分工调整
