# AGENTS.md

本文件定义本项目的协作规范、设计原则与实施约束。所有参与开发的人或代理，在修改任何代码前，都必须先阅读并遵守本文件。

## 1. Documentation First

### Mandatory Rule

任何代码修改前，必须先更新对应文档。

适用情境包括：

- 新增页面、功能、API、资料模型
- 调整路由路径
- 变更环境变量
- 修改权限规则
- 调整 Google Maps 整合方式
- 更改验证规则、错误格式或响应结构

最低要求如下：

- 功能变更先更新 `README.md`
- 架构或模块分层调整先更新 `docs/achitecture.md`
- Google Maps 相关变更同步更新 `docs/google-maps-setup.md`
- 协作流程或结构规范改变时更新 `AGENTS.md`

## 2. Project Goals

本项目是一个结合 Google Maps 的徒步路线记录 App，核心目标如下：

- 用户可登录后记录徒步路线、里程、完成日期与心得
- 地图需支援载入、缩放、拖拽、搜寻地点与地点标记
- 以 RESTful API 维护 `auth`、`events`、`locations`、`posts`
- 强制实施身份验证、密码哈希、权限控制与输入验证

## 3. Architecture Principles

### 3.1 Frontend

前端必须模块化，避免把页面、地图逻辑、状态管理与 API 调用混在一起。

职责边界：

- `pages/`: 页面组合与页面级流程
- `components/`: 可复用 UI 元件
- `hooks/`: 可复用逻辑，尤其是地图、请求状态、表单行为
- `context/`: 全局状态，例如 auth
- `services/`: Axios 实例与 API 调用封装
- `types/`: 型别、DTO、响应格式
- `utils/`: 纯函数与格式转换

规则：

- 相同逻辑必须统一提取，不可在多个页面重复复制
- 页面组件不应直接写复杂请求流程或地图细节
- 地图相关逻辑应集中在 hooks、services 或专门模块中

### 3.2 Backend

后端必须采用分层设计，禁止将业务逻辑直接塞进路由。

职责边界：

- `routes/`: URL 与 middleware 装配
- `controllers/`: request / response 转换
- `services/`: 业务规则与流程
- `repositories/`: 资料库查询与写入
- `validators/`: schema 与欄位验证
- `middlewares/`: auth、error handling、logging、permission checks

规则：

- route handler 应保持精简
- 权限与验证逻辑必须可复用
- 数据库逻辑集中管理，不可散落在各层

## 4. API Rules

### 4.1 Route Naming

必须采用 RESTful 风格：

- `/auth/register`
- `/auth/login`
- `/auth/logout`
- `/auth/me`
- `/api/events`
- `/api/locations`
- `/api/posts`

### 4.2 Response Contract

所有 API 应使用一致的 JSON 响应结构：

- 成功响应包含 `success`, `message`, `data`
- 列表响应可加上 `meta`
- 错误响应包含 `success`, `message`，必要时附上 `errors`

### 4.3 Query Parameters

列表查询参数应尽量统一，优先使用：

- `q`
- `category`
- `radius`
- `lat`
- `lng`
- `from`
- `to`
- `page`
- `limit`

## 5. Security Rules

必须遵守以下安全要求：

- 账号使用 `email + password`
- 密码必须使用 `bcrypt` 或 `argon2` 哈希储存
- 登录必须使用 JWT
- 任何写入型操作都必须验证当前用户身份
- 用户只能修改或删除自己的资料
- 不可将 API key、JWT secret、数据库密码写死在代码中
- 所有敏感配置都必须来自 `.env`

## 6. Validation Rules

以下验证不可省略：

- email 格式验证
- password 长度验证
- 必填栏位验证
- 纬经度数值范围验证
- 日期格式验证
- 时间区间合理性验证
- category 枚举验证

建议错误码使用：

- `400` 请求格式错误
- `401` 未认证
- `403` 无权限
- `404` 找不到资源
- `422` 验证失败
- `500` 服务器异常

## 7. Environment Variable Policy

必须同时维护：

- 前端 `.env`
- 前端 `.env.example`
- 后端 `.env`
- 后端 `.env.example`

规则：

- `.env` 不可提交
- `.env.example` 必须提交
- 新增环境变量时，README 与相关文档必须同步更新

## 8. Documentation Directory Rules

`docs/` 文件夹专门用于项目文档。

必须维护的核心文件：

- `docs/achitecture.md`: 本项目架构主文档
- `docs/google-maps-setup.md`: Google Maps API 开通与整合说明

规则：

- 架构、模块边界、资料流、前后端职责变动时，先更新 `docs/achitecture.md`
- Google Maps API 使用方式、启用项目、key 限制、监控方式变动时，先更新 `docs/google-maps-setup.md`
- 不要把架构说明散落在多个无关文件，优先汇总在 `docs/achitecture.md`

## 9. Google Maps Rules

Google Maps 整合必须满足以下要求：

- 使用 `Google Maps JavaScript API` 处理地图载入与互动
- 至少整合一项 Google Maps 服务，默认使用 `Directions API`
- 必须考虑 API key 限制与 Billing
- 必须设计 requests monitor，记录调用量、成功率、失败率、延迟与 quota 风险
- 相关说明必须同步维护在 `docs/google-maps-setup.md`

## 10. Development Order

本项目开发顺序固定如下：

1. 先完成前端页面与 mock data 版本，确认路线导览与页面互动。
2. 再完成后端、数据库、Auth、验证与权限控制。
3. 最后用 Axios 将前端与后端整合。

不得跳过前端假资料阶段直接硬接后端，也不得在权限与验证未完成前视为后端完成。

## 11. Testing and Acceptance

每个阶段都必须有可观察的验收结果。

### Frontend Stage

- 主要页面可操作
- 导览正确
- 假资料能驱动画面与流程

### Backend Stage

- 可用 `curl` 或 `.http` 测试所有关键 API
- Auth、权限、验证、错误码可验证

### Integration Stage

- 登录后完整流程可运行
- 前端 Axios 请求与后端响应一致
- 使用者只能操作自己的资料

## 12. Change Management

当出现以下变更时，必须同步更新文档后才可改代码：

- 新资源类型
- 新 API 路由
- 字段变动
- Google Maps 新服务整合
- 认证或权限策略变更
- 环境变量增减
- 目录结构大幅调整

## 13. Definition of Done

功能完成前，至少需满足：

- 文档已更新
- 结构符合模块化原则
- API 命名与响应格式一致
- 验证与权限规则已定义并实现
- 环境变量与敏感资讯处理正确
- 有对应的阶段验收方式
