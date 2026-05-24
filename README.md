### 1. 创建环境变量文件
.env.development （开发环境）:

```
VITE_APP_TITLE=消防器材管理系统
VITE_API_BASE_URL=/api/v1
VITE_PROXY_TARGET=http://localhost:8080
```
.env.production （生产环境）:

```
VITE_APP_TITLE=消防器材管理系统
VITE_API_BASE_URL=/api/v1
```
### 2. 更新 vite.config.js
- 引入 loadEnv 加载环境变量
- 添加代理配置，将 /api 请求转发到后端服务：
  - target : 后端服务地址（从环境变量读取）
  - changeOrigin: true : 支持跨域
  - ws: true : 支持 WebSocket
### 3. 更新 request.js
- 将 baseURL 改为从环境变量读取： import.meta.env.VITE_API_BASE_URL
### 工作原理
开发环境下，前端发起的 /api/v1/xxx 请求会被 Vite 代理转发到 http://localhost:8080/api/v1/xxx ，从而避免浏览器跨域限制。生产环境下，建议通过后端配置 CORS 响应头或使用反向代理（如 Nginx）来处理跨域。
