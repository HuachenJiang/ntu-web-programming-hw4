# HikeLog Maps

一个结合 Google Maps 的徒步记录 App 规划文件。使用者登录后，可以在地图上搜寻地点、标记徒步路线与里程、记录完成日期与心得，并管理自己的路线资料。本文档用于指导课程作业的开发顺序、目录结构、API 设计与验收方式。

## 1. Project Overview

### 1.1 Core Goal

本项目要完成一个以地图为核心的徒步记录平台，重点能力如下：

- 用户可注册、登录、登出，并以 email + password 进行身份验证。
- 登录后才能新增、修改、删除地图资料与个人记录。
- 地图需支援载入、缩放、拖拽、地点搜寻、地点标记。
- 可记录徒步路线、里程、完成日期、心得与相关地点资讯。
- 用户只能修改或删除自己建立的资料。

### 1.2 Suggested User Flow

1. 使用者注册或登录。
2. 进入地图页，搜寻地点或选择起点/终点。
3. 调用 Google Maps Directions 服务计算路线与距离。
4. 填写标题、描述、日期、分类、心得等栏位并保存。
5. 在个人记录页查看、筛选、编辑、删除自己的徒步资料。

## 2. Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Frontend Routing | React Router |
| HTTP Client | Axios |
| UI Framework | Material UI |
| Map SDK | Google Maps JavaScript API |
| Google Service | Directions API 为主，可扩充 Places / Geocoding |
| Backend | Node.js + Express + TypeScript |
| API Style | RESTful API |
| Database | PostgreSQL |
| Auth | JWT |
| Password Hashing | bcrypt 或 argon2 |

## 3. Functional Scope

### 3.1 Auth

- 注册 `POST /auth/register`
- 登录 `POST /auth/login`
- 登出 `POST /auth/logout`
- 取得当前用户 `GET /auth/me`

### 3.2 Map and Route Features

- 载入 Google 地图
- 地图缩放与拖拽
- 搜寻地点
- 标记地点
- 绘制徒步路线
- 读取路线总距离与建议路径
- 储存路线与相关心得

### 3.3 Resource CRUD

- `locations`: 地点资料
- `events`: 徒步事件或路线记录
- `posts`: 心得、游记、贴文
- `items`: 可扩充的清单型资料，例如装备、检查项、附件元数据

## 4. Recommended Architecture

### 4.1 Frontend Modules

前端应以功能分层与复用为目标，避免把地图逻辑、认证逻辑、API 调用与页面渲染全部写在单一页面。

```text
frontend/
  src/
    app/
    assets/
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

建议职责如下：

- `components/`: 可复用 UI 元件，如地图容器、表单区块、卡片、对话框
- `context/`: AuthContext、ThemeContext 等全域状态
- `hooks/`: 地图加载、表单验证、分页、权限检查等逻辑
- `pages/`: Route page、Login page、Record detail page 等页面层
- `services/`: Axios instance、auth API、events API、locations API
- `types/`: DTO、API response、domain model 型别定义
- `utils/`: 日期、距离、表单转换、地图 helper

### 4.2 Backend Modules

后端应采用 Express 分层结构，避免 route 直接处理所有 SQL 与业务逻辑。

```text
backend/
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

建议职责如下：

- `routes/`: 只负责 URL 与 middleware 组合
- `controllers/`: 解析 request / response
- `services/`: 核心业务逻辑，如 auth、route saving、ownership check
- `repositories/`: 资料库读写
- `validators/`: 请求栏位验证与 schema
- `middlewares/`: JWT 验证、错误处理、权限检查、请求日志

## 5. Frontend Page Plan

第一阶段先完成页面、导航与互动，不接真实后端，先使用假资料与 mock data。

| Page | Purpose | Phase 1 Acceptance |
| --- | --- | --- |
| `/` | 首页，说明 app 价值与入口 | 可导览到登录、地图、记录列表 |
| `/login` | 登录页 | 表单可输入、可显示验证错误 |
| `/register` | 注册页 | 表单可输入、可显示 email/password 验证 |
| `/map` | 地图主页面 | 地图区域、地点搜寻、路线面板、表单区块可操作 |
| `/records` | 我的路线或记录列表 | 能显示假资料并支援筛选或搜寻 |
| `/records/:id` | 单笔详情页 | 可查看路线、日期、心得、地点等资料 |
| `/records/:id/edit` | 编辑页 | 可载入假资料并完成编辑流程 |

## 6. RESTful API Design

### 6.1 Auth Routes

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | 注册新用户 |
| `POST` | `/auth/login` | 登录并取得 JWT |
| `POST` | `/auth/logout` | 登出，前后端一并清除登录状态 |
| `GET` | `/auth/me` | 取得当前登录者资料 |

### 6.2 Resource Routes

| Resource | Base Path | CRUD |
| --- | --- | --- |
| Events | `/api/events` | `GET/POST/GET:id/PATCH:id/DELETE:id` |
| Locations | `/api/locations` | `GET/POST/GET:id/PATCH:id/DELETE:id` |
| Posts | `/api/posts` | `GET/POST/GET:id/PATCH:id/DELETE:id` |
| Items | `/api/items` | `GET/POST/GET:id/PATCH:id/DELETE:id` |

建议补充的地图动作型接口：

- `GET /api/events/:id/route`
- `POST /api/locations/search`
- `POST /api/events/:id/recalculate-distance`

## 7. Common Data Fields

所有资源建议至少具备以下共用栏位：

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string / uuid | 主键 |
| `ownerId` | string / uuid | 资料拥有者 |
| `createdAt` | ISO datetime | 建立时间 |
| `updatedAt` | ISO datetime | 更新时间 |

### 7.1 Event

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | 必填，建议 1-100 字 |
| `description` | string | 可选，路线说明 |
| `category` | string | 例如 hiking / trail / walk |
| `startTime` | ISO datetime | 开始时间 |
| `endTime` | ISO datetime | 结束时间 |
| `completedDate` | ISO date | 完成日期 |
| `distanceKm` | number | 里程 |
| `durationMinutes` | number | 总耗时 |
| `status` | string | planned / completed / canceled |
| `locationId` | string | 关联地点 |

### 7.2 Location

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | 地点名称 |
| `description` | string | 地点说明 |
| `latitude` | number | 纬度 |
| `longitude` | number | 经度 |
| `address` | string | 地址 |
| `category` | string | trailhead / viewpoint / checkpoint |
| `placeId` | string | 可选，来自 Google Places |

### 7.3 Post

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | 心得标题 |
| `description` | string | 心得摘要或内文摘要 |
| `content` | string | 长文心得 |
| `eventId` | string | 关联徒步记录 |
| `completedDate` | ISO date | 完成日期 |

### 7.4 Item

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | 项目名称 |
| `description` | string | 项目说明 |
| `category` | string | gear / checklist / attachment |
| `status` | string | active / archived / done |
| `eventId` | string | 关联事件 |

## 8. Query Parameters

列表 API 建议统一支援以下查询参数：

| Query | Type | Purpose |
| --- | --- | --- |
| `q` | string | 关键字搜寻 |
| `category` | string | 分类筛选 |
| `radius` | number | 地图附近范围筛选 |
| `lat` | number | 中心点纬度 |
| `lng` | number | 中心点经度 |
| `from` | ISO date/datetime | 起始日期或时间 |
| `to` | ISO date/datetime | 结束日期或时间 |
| `page` | number | 页码 |
| `limit` | number | 每页数量 |
| `sortBy` | string | 排序字段 |
| `order` | `asc` / `desc` | 排序方向 |

范例：

```http
GET /api/events?q=yangmingshan&category=hiking&from=2026-01-01&to=2026-12-31
GET /api/locations?lat=25.0330&lng=121.5654&radius=5000
GET /api/posts?q=sunrise&category=trail
```

## 9. Response Format

建议所有 API 使用统一 JSON 格式，方便前后端整合。

### 9.1 Success Response

```json
{
  "success": true,
  "message": "Event fetched successfully",
  "data": {
    "id": "evt_123"
  }
}
```

### 9.2 List Response

```json
{
  "success": true,
  "message": "Events fetched successfully",
  "data": [
    {
      "id": "evt_123",
      "title": "Mt. Qixing East Peak"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### 9.3 Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 10. Auth, Authorization, Validation

### 10.1 Authentication

- 用户以 email + password 注册与登录。
- 密码必须使用 `bcrypt` 或 `argon2` 哈希后存入数据库。
- 登录成功后由后端签发 JWT。
- 前端可将 access token 保存在记忆体状态或安全的 storage 策略中，并在 Axios request interceptor 附带 `Authorization: Bearer <token>`。

### 10.2 Authorization

- 未登录用户不得进行地图资料与数据库资料的新增、修改、删除。
- 登录用户只能更新或删除自己建立的 `events`、`locations`、`posts`、`items`。
- 后端每个写入型接口都必须检查 `ownerId` 与当前 JWT 身份是否一致。

### 10.3 Validation Rules

建议最少验证规则如下：

- `email`: 必填，格式合法，注册时不可重复
- `password`: 必填，至少 8 字，可再加字母与数字组合规则
- `title/name`: 必填，长度限制
- `latitude`: 必填时必须介于 `-90` 到 `90`
- `longitude`: 必填时必须介于 `-180` 到 `180`
- `completedDate`: 必须为合法日期
- `startTime/endTime`: 若同时提供，`endTime` 不得早于 `startTime`
- `distanceKm`: 若由使用者输入，必须为非负数
- `category`: 若有限定分类，需检查枚举值

## 11. HTTP Status Code Rules

| Status | Usage |
| --- | --- |
| `400 Bad Request` | 请求格式错误、缺少必要参数 |
| `401 Unauthorized` | 未登录、JWT 无效或过期 |
| `403 Forbidden` | 已登录但无权访问或修改他人资料 |
| `404 Not Found` | 资源不存在 |
| `422 Unprocessable Entity` | 欄位验证失败、业务规则不成立 |
| `500 Internal Server Error` | 未预期的服务器错误 |

## 12. CORS and Environment Variables

### 12.1 Allowed Origins

后端需允许至少以下来源：

- `http://localhost:5173`
- `http://127.0.0.1:5173`

### 12.2 Environment Variable Policy

- `.env` 不可提交到版本控制
- `.env.example` 必须提交，提供必要变量名称与说明
- 前后端都要各自维护自己的 `.env` 与 `.env.example`

建议变量如下：

| Variable | Layer | Purpose |
| --- | --- | --- |
| `VITE_GOOGLE_MAPS_API_KEY` | Frontend | Google Maps JavaScript API key |
| `VITE_API_BASE_URL` | Frontend | 后端 API base URL |
| `PORT` | Backend | Express port |
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | Backend | JWT 过期时间 |
| `CORS_ORIGINS` | Backend | 允许的来源列表 |
| `GOOGLE_MAPS_API_KEY` | Backend | 如需后端调用 Google 服务时使用 |

## 13. Google Maps Integration Summary

地图部分以 `Google Maps JavaScript API` 为主，并以 `Directions API` 支援徒步路线与距离计算。

建议实现重点：

- 地图初始化后可自由载入、缩放、拖拽
- 提供地点搜寻与标记能力
- 使用 Directions 计算步行路线与总距离
- 将起点、终点、途经点与计算出的距离保存到后端

Google Maps 开通、API Key 限制、Billing、监控与本地开发注意事项，请见：

- [docs/google-maps-setup.md](./docs/google-maps-setup.md)

## 14. Monitoring Design for Google Maps Requests

本项目需设计 monitors 监控 Google Maps request，建议同时记录前端操作事件与后端整合日志。

建议监控指标：

- 请求服务名称，例如 Maps JS、Directions、Places、Geocoding
- 发起时间与用户 ID
- 请求是否成功
- HTTP 状态或 Google 服务错误码
- 响应时间
- 每日请求数量
- 失败比例
- 接近 quota 上限的风险提示

建议监控做法：

- 前端记录地图相关用户操作事件与错误讯息
- 后端集中记录对 Google API 的调用日志
- 将聚合结果送到监控平台或数据库报表
- 发生配额异常、认证失败、超时等情形时触发告警

## 15. Development Phases and Acceptance

### Phase 1: Frontend First with Fake Data

目标：

- 完成页面结构、导航、Material UI 介面、地图区域占位或基本互动
- 先使用 mock data 模拟事件、地点、心得

验收方式：

- 页面可正常切换与浏览
- 前端主要表单可操作
- 地图页面的面板、按钮、列表与详情互动正确
- React Router 路由导览正确

### Phase 2: Backend + Database + Auth

目标：

- 建立 Express + TypeScript + PostgreSQL
- 完成 `/auth` 与 `/api/*` 基础 CRUD
- 完成密码哈希、JWT、权限检查、验证与错误处理

验收方式：

- 可使用 `curl` 或 `.http` 文件测试注册、登录、查询、写入、更新、删除
- 错误码与错误讯息符合规范
- 无法修改其他用户资料

### Phase 3: Frontend Connects Backend

目标：

- 以前端 Axios 串接真实后端
- 将假资料替换为真实 API
- 完成完整的登录后地图记录流程

验收方式：

- 用户可登录后新增路线、查看记录、编辑自己的资料
- 前端状态与后端资料同步
- 完整流程从地图操作到数据保存可运作

## 16. Documentation Deliverables

本项目至少应维护以下文档：

- `README.md`: 项目总览、架构、API、开发流程
- `AGENTS.md`: 协作规范与实现约束
- `docs/google-maps-setup.md`: Google Maps 开通与配置说明

## 17. References

以下官方资源适合作为后续实现时的主要依据：

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Maps JavaScript API Overview](https://developers.google.com/maps/documentation/javascript/overview)
- [Directions Service](https://developers.google.com/maps/documentation/javascript/directions)
- [API Security Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Using API Keys](https://developers.google.com/maps/api-security-best-practices#restricting-api-keys)
