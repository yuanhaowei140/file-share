# ShareFile - 文件分享系统

一个简洁优雅的文件分享应用，支持文件上传、下载、分享链接生成、二维码扫描等功能。

## 功能特性

✨ **核心功能**
- 📁 文件上传和管理
- 📥 文件下载
- 🔗 分享链接生成
- 📱 二维码分享
- 💾 二维码下载
- ⏰ 文件过期管理（默认 7 天）
- 📊 下载统计

🎨 **用户体验**
- 响应式设计（PC 和手机适配）
- 优雅的梯度背景设计
- 实时文件列表展示
- 一键复制分享链接
- 智能缓存防止机制

🛠️ **技术特点**
- React 18 + TypeScript
- Vite 快速开发和构建
- Spring Boot 后端服务
- H2 数据库存储
- CORS 跨域配置

## 快速开始

### 前置条件
- Node.js 16+
- Maven 3.6+
- Java 17+

### 安装和运行

#### 1. 启动后端服务

```bash
cd backend
export JAVA_HOME=$(/usr/libexec/java_home)
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动

#### 2. 启动前端开发服务器

```bash
npm install
npm run dev
```

前端服务将在 `http://localhost:5173` 启动（或其他可用端口）

访问 `http://localhost:5173` 或 `http://{YOUR_IP}:5173`

## 项目结构

```
file-share/
├── src/                          # 前端源代码
│   ├── App.tsx                   # 主应用组件
│   ├── App.css                   # 应用样式
│   ├── config.ts                 # 配置文件
│   ├── main.tsx                  # 应用入口
│   └── assets/                   # 静态资源
├── backend/                      # 后端 Java 项目
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/sharefile/
│   │   │   │       ├── FileShareApplication.java
│   │   │   │       ├── controller/
│   │   │   │       ├── service/
│   │   │   │       ├── entity/
│   │   │   │       └── repository/
│   │   │   └── resources/
│   │   │       └── application.properties
│   └── pom.xml
├── public/                       # 公开资源
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## API 接口

### 文件接口

#### 上传文件
```
POST /api/files/upload
Content-Type: multipart/form-data

参数:
- file: 文件
- expiryDays: 过期天数 (可选，默认7)
- description: 文件描述 (可选)

响应:
{
  "id": "uuid",
  "fileName": "example.pdf",
  "fileSize": 1024,
  "uploadTime": "2025-11-28T10:00:00",
  "shareUrl": "uuid",
  "expiryTime": "2025-12-05T10:00:00",
  "downloadCount": 0,
  "description": ""
}
```

#### 获取文件列表
```
GET /api/files/list

响应: 文件数组
```

#### 获取文件信息
```
GET /api/files/{id}/info

响应: 单个文件对象
```

#### 下载文件
```
GET /api/files/{id}/download

返回: 文件二进制数据
```

#### 删除文件
```
DELETE /api/files/{id}

响应: 成功/失败信息
```

## 配置说明

### 前端配置 (src/config.ts)
```typescript
export const API_BASE_URL = '/api'           // API 基础地址
export const SHARE_HASH_PREFIX = '/file'     // 分享页面路由前缀
```

### 后端配置 (backend/src/main/resources/application.properties)
```properties
server.port=8080
spring.datasource.url=jdbc:h2:./data/fileshare
spring.jpa.hibernate.ddl-auto=update
```

### CORS 配置
后端已配置 CORS，支持以下源的请求：
- `http://localhost:5173`
- `http://localhost:3000`
- `http://{YOUR_IP}:5173`

如需修改，编辑 `backend/src/main/java/com/sharefile/FileShareApplication.java`

## 分享链接使用

### 生成分享链接
1. 上传文件后，点击文件卡片查看详情
2. 在详情页点击"复制链接"按钮
3. 分享链接格式: `http://{host}:{port}#/file/{fileId}&_t={timestamp}`

### 二维码分享
1. 在文件详情页扫描二维码
2. 或点击"下载二维码"保存 PNG 图片
3. 他人扫描二维码或点击分享链接即可下载文件

### 链接特性
- ✅ 使用 hash 路由，无需服务器端路由配置
- ✅ 时间戳防缓存机制
- ✅ 支持任意 IP 和域名访问
- ✅ 自动生成二维码

## 文件过期管理

- 默认文件过期时间：7 天
- 过期文件自动删除（需要定期清理任务）
- 可在上传时指定自定义过期天数

## 浏览器兼容性

- ✅ Chrome/Edge (最新版本)
- ✅ Firefox (最新版本)
- ✅ Safari (最新版本)
- ✅ 移动浏览器

## 常见问题

### 1. 复制链接失败
**解决方案**: 应用支持两种复制方式
- 优先使用 Clipboard API（现代浏览器）
- 备用 execCommand 方式（旧浏览器）

### 2. 跨域错误
**检查**: 确保后端 CORS 配置中包含当前访问地址

### 3. 文件上传失败
**检查**:
- 后端服务是否运行
- 磁盘空间是否充足
- 文件大小是否超过限制

### 4. 分享链接无法打开
**检查**:
- 文件是否已过期
- 前端服务是否正在运行
- 浏览器是否支持 hash 路由

## 开发说明

### 本地开发

```bash
# 前端热重载开发
npm run dev

# 后端调试
cd backend
mvn spring-boot:run

# 前端构建
npm run build

# 后端打包
cd backend
mvn clean package
```

### 数据库

项目使用 H2 数据库，数据存储在 `./data/fileshare.mv.db`

重置数据库：删除 `data` 文件夹，重启应用

### 生产部署

```bash
# 前端构建
npm run build

# 后端打包
cd backend
mvn clean package

# 运行后端 JAR
java -jar backend/target/file-share-server-1.0.0.jar
```

## 更新日志

### v1.0.0 (2025-11-28)
- ✅ 核心功能完成
- ✅ 响应式设计
- ✅ 二维码分享
- ✅ 文件过期管理
- ✅ 复制链接功能
- ✅ 下载统计

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交 Issue 或 PR

---

**最后更新**: 2025-11-28
**版本**: 1.0.0
