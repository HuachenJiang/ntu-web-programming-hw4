# Google Maps API 开通与整合说明

本文档说明如何为本项目开通 Google Maps Platform，并以 `Google Maps JavaScript API` 和 `Directions API` 支援地图显示、地点互动、徒步路线与里程计算。

## 1. 本项目需要的 Google Maps 能力

### Required

- `Maps JavaScript API`: 地图载入、缩放、拖拽、标记、互动
- `Directions API`: 路线规划、距离计算、步行路线建议

### Optional / Conditional

- `Places API`: 搜寻地点、地点建议、Place ID
- `Geocoding API`: 地址与经纬度互转；当前前端路线表单会先解析使用者输入的文字地址，因此此项目现阶段也需要启用

本项目默认优先整合 `Directions API`，因为它最贴近徒步路线与里程纪录需求。

## 2. Before You Start

开通前请准备：

- 一个 Google 帐号
- 一个可启用 Billing 的 Google Cloud project
- 前端与后端的 `.env` 文件规划

官方入口：

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Get Started with Google Maps Platform](https://developers.google.com/maps/get-started)

## 3. 建立 Google Cloud Project 与 Billing

1. 前往 [Google Cloud Console](https://console.cloud.google.com/).
2. 建立新的 project，建议名称如 `hikelog-maps-app`.
3. 为该 project 启用 Billing。
4. 确认后续所有 Maps 相关 API 都启用在同一个 project 下。

注意：

- 若未启用 Billing，很多 Google Maps Platform 功能无法正常使用。
- 即使仍在免费额度内，也通常需要先绑定 Billing 才能启用服务。

## 4. 启用 API

前往 Google Cloud Console 的 `APIs & Services`，启用以下 API：

### 基础必开

- `Maps JavaScript API`
- `Directions API`

### 当前实现追加必开

- `Geocoding API`

### 选开

- `Places API`

补充说明：

- 目前前端路线页面会先调用 `google.maps.Geocoder` 解析起点与终点，再调用 `DirectionsService` 生成步行路线，所以 `Geocoding API` 不是可选项。
- 只有在未来改成直接提交经纬度或 place ID 给 Directions 时，才有机会移除 geocoding 依赖。

参考文件：

- [Maps JavaScript API Overview](https://developers.google.com/maps/documentation/javascript/overview)
- [Directions Service](https://developers.google.com/maps/documentation/javascript/directions)
- [Places API Overview](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Geocoding API Overview](https://developers.google.com/maps/documentation/geocoding/overview)

## 5. 建立 API Key

1. 进入 `APIs & Services` -> `Credentials`
2. 选择 `Create credentials`
3. 建立 `API key`
4. 立即为 key 加上限制，不要使用无限制的测试 key 长期开发

## 6. API Key 限制建议

Google Maps key 至少应做两层限制：应用限制与 API 限制。

### 6.1 Frontend Key

给 React + Vite 前端使用的 key 建议：

- Application restriction: `HTTP referrers (web sites)`
- Allowed referrers:
  - `http://localhost:4321/*`
  - `http://127.0.0.1:4321/*`
  - 未来正式站点网域
- API restrictions:
  - `Maps JavaScript API`
  - `Directions API`
  - `Geocoding API`
  - 若有地点搜寻建议，再加入 `Places API`

### 6.2 Backend Key

若后端未来需要直接调用 Google Maps web services，可另外建立 server key：

- Application restriction: `IP addresses`
- API restrictions: 只开放后端实际使用的 API

这样可以避免把可用于 server-to-server 的 key 暴露在前端环境中。

官方建议：

- [API Security Best Practices](https://developers.google.com/maps/api-security-best-practices)

## 7. 本项目建议的环境变量

### Frontend `.env`

```dotenv
VITE_GOOGLE_MAPS_API_KEY=
VITE_API_BASE_URL=http://localhost:3000
```

### Backend `.env`

```dotenv
PORT=3000
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:4321,http://127.0.0.1:4321
GOOGLE_MAPS_API_KEY=
```

规则：

- `.env` 不提交到版本控制
- `.env.example` 提交并保留变量名称
- 不要把 key 或 secret 写进源码
- 第一阶段就先建立 `frontend/.env`、`frontend/.env.example`、`backend/.env`、`backend/.env.example`
- `VITE_GOOGLE_MAPS_API_KEY` 供浏览器端载入 Maps JavaScript API，并用于当前前端触发 Directions 与 Geocoder 相关请求
- `GOOGLE_MAPS_API_KEY` 先预留空位，后端未来真的需要直连 Google 服务时再填写
- 当前实现不需要额外新增 `VITE_GOOGLE_GEOCODING_API_KEY` 之类的环境变量空位

### 推荐的 `.env.example` 内容

前端：

```dotenv
VITE_GOOGLE_MAPS_API_KEY=
VITE_API_BASE_URL=http://localhost:3000
```

后端：

```dotenv
PORT=3000
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:4321,http://127.0.0.1:4321
GOOGLE_MAPS_API_KEY=
```

## 8. 前端如何载入 Google Maps JavaScript API

本项目前端采用 React + TypeScript + Vite，建议地图载入逻辑集中在独立 hook 或 service，而不是散落在页面元件中。

推荐做法：

- 在地图专用 hook 或 service 中统一载入 Google Maps JavaScript API
- 地图元件只负责画面与互动，不直接处理所有脚本初始化细节
- 载入成功后再建立 map instance、marker、directions renderer 等对象

可选策略：

- 直接在 HTML 中使用 script tag 载入 Maps JavaScript API
- 使用 Google 提供的 JavaScript loader 套件管理动态载入

对 React 项目而言，第二种方式通常更容易控制重复载入与错误处理。

### 8.1 Phase 1 Frontend Loader Strategy

phase1 前端原型建议采用以下做法：

- 在 `hooks/` 中建立 `useGoogleMapsLoader`
- 统一读取 `VITE_GOOGLE_MAPS_API_KEY`
- 由 hook 负责脚本加载状态、重复加载保护与错误回传
- 页面组件只消费 `isLoaded`、`loadError` 与 `google.maps` 相关实例
- 地图无法载入时，保留降级 UI，不要让整页白屏
- 当前路线生成流程同时依赖 `Geocoder` 与 `DirectionsService`，任一服务权限不足都应视为配置错误并直接回报

建议同时建立 `useRoutePlanner` 或等价模块，统一管理：

- 起点与终点输入
- `DirectionsService` 步行路线请求
- 距离与预计时间摘要
- 路线请求错误处理
- 后续 request monitor 埋点入口

## 9. Directions 在本项目中的用途

本项目默认使用 `Directions API` 处理徒步路线相关需求。

### 9.1 建议流程

1. 使用者在地图上选择起点与终点。
2. 视需求加入途经点。
3. 将模式设为步行。
4. 调用 Directions 服务取得路线结果。
5. 从回传结果读取总距离、预计时间、路径 polyline。
6. 复用同一份 Directions 结果显示在地图上，不要为了渲染再次重发同路线请求。
7. 将路线摘要与纪录资料保存到后端。

### 9.2 建议保存的数据

至少建议保存：

- `origin`
- `destination`
- `waypoints`
- `distanceKm`
- `durationMinutes`
- `completedDate`
- `routeSummary`
- `overviewPolyline` 或其他可重建路线的资料

### 9.3 与业务资料的关系

建议将 Directions 结果整合到 `events`：

- 一个 `event` 表示一次徒步活动
- `location` 可作为起点、终点或兴趣点
- `post` 用于记录心得
- `item` 可记录装备、清单或附属资料

## 10. Places 与 Geocoding 的扩充位置

若后续需要更完整地点体验，可扩充：

### Places API

适合：

- 地点搜寻框
- 自动完成建议
- 取得 place ID、名称、地址、营业资讯等

### Geocoding API

适合：

- 将地址转为经纬度
- 将经纬度转为可读地址

当前实现已经依赖 `Geocoding API` 解析起终点文字地址；`Places API` 仍属于可选扩充能力。

## 11. Monitoring Google Maps Requests

作业要求需要监控 Google Maps request，建议至少追踪以下项目：

| Metric | Description |
| --- | --- |
| `service` | Maps JS / Directions / Places / Geocoding |
| `timestamp` | 请求时间 |
| `userId` | 发起请求的用户 |
| `status` | success / error |
| `latencyMs` | 响应时间 |
| `errorCode` | Google API 或应用层错误码 |
| `dailyCount` | 当日累计请求量 |
| `quotaRisk` | 是否接近上限 |

建议监控方式：

- 前端记录地图加载失败、Directions 请求失败、地点搜寻失败等事件
- 前端应同步累计当日调用量、成功率、失败率、平均延迟，并在接近自订阈值时标记 `quotaRisk`
- 后端若有代理 Google 请求，应集中记录日志
- 可在 Google Cloud Console 观察 API 使用量、错误率与配额消耗
- 若未来需要更完整监控，可接入 Cloud Monitoring 与告警机制

参考：

- [Monitoring Google Maps Platform APIs](https://developers.google.com/maps/monitoring-and-metrics/overview)

## 12. 配额、费用与风险控制

Google Maps Platform 为计费服务，必须注意：

- 不同 API 的计价方式不同
- 开发与展示环境都应监控用量
- 避免前端重复发出无意义请求，同一路线规划结果应尽量复用
- 搜寻输入框应加入 debounce
- 同一路线重算应考虑快取或明确触发条件
- key 必须限制来源，防止被盗用造成费用异常

## 13. 常见错误排查

### 地图不显示

优先检查：

- API key 是否正确
- `Maps JavaScript API` 是否已启用
- 浏览器 key 的 HTTP referrer 是否允许当前来源
- Billing 是否启用

### Directions 请求失败

优先检查：

- `Directions API` 是否已启用
- 请求参数是否完整
- 起点终点是否有效
- 是否超过 quota
- key 是否限制了错误的 API

### 本地开发可用，部署后失败

优先检查：

- 正式站点网域是否加入 HTTP referrer 白名单
- `.env` 是否正确注入部署环境
- 是否误用本地 key 于正式环境

## 14. 本地开发注意事项

- 浏览器用的 API key 只放在前端 `.env`
- 若后端也要访问 Google 服务，请使用独立 server key
- 不要把 key 写在 Git 版本库、截图或作业说明中
- `.env.example` 只保留变量名称，不放真实值

## 15. Recommended Implementation Notes

为了与本项目整体架构一致，建议后续实现遵守以下原则：

- 地图脚本加载逻辑独立抽出
- Directions 请求逻辑独立封装
- 地图 UI 与业务表单分离
- Google 请求错误统一进入前端与后端的错误处理流程
- Google Maps 相关配置与 key 一律经由环境变量提供

## 16. Official References

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Maps JavaScript API Overview](https://developers.google.com/maps/documentation/javascript/overview)
- [Directions Service](https://developers.google.com/maps/documentation/javascript/directions)
- [API Security Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Monitoring and Metrics Overview](https://developers.google.com/maps/monitoring-and-metrics/overview)
