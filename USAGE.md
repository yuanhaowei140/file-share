# 🚀 ShareFile - 文件共享系统使用指南

## 系统架构

```
前端 (React + TypeScript + Vite)  <--->  后端 (Java Spring Boot)
   :5173                               :8080
```

## 快速开始

### 前置要求

- **Node.js** >= 16.x (前端)
- **Java** >= 11 (后端)
- **Maven** >= 3.6 (后端构建)

### 1️⃣ 运行后端服务

```bash
# 进入后端目录
cd backend

# 编译项目
mvn clean package

# 运行服务
mvn spring-boot:run

# 或者直接运行 jar 包
java -jar target/file-share-server-1.0.0.jar
```

后端服务将运行在 `http://localhost:8080`

**重要**: 确保后端服务已启动，前端才能正常工作

### 2️⃣ 运行前端应用

打开新的终端窗口：

```bash
# 确保在项目根目录
cd /Users/yhw/Documents/测试项目

# 安装依赖（如果还未安装）
npm install

# 开发模式启动
npm run dev
```

前端应用将运行在 `http://localhost:5173`

### 3️⃣ 访问应用

在浏览器打开: **http://localhost:5173**

## 功能说明

### 📤 上传文件

1. 点击左侧侧边栏的上传区域
2. 选择一个或多个文件
3. 文件将上传到服务器，自动生成分享链接

### 🔗 分享文件

1. 点击文件卡片进入详情页
2. 可以看到文件的：
   - 二维码（用于分享）
   - 分享链接
   - 文件信息（大小、上传时间、过期时间等）
   - 下载统计

### 📥 下载文件

- 在文件卡片上点击下载图标，或
- 在详情页点击"下载文件"按钮
- 文件将下载到本地，下载次数自动更新

### 🗑️ 删除文件

- 在文件卡片上点击删除图标，或
- 在详情页点击"删除文件"按钮

## 后端 API 文档

### 基础 URL
```
http://localhost:8080/api/files
```

### 上传文件
```
POST /upload
Content-Type: multipart/form-data

参数:
- file: 文件 (必需)
- expiryDays: 过期天数 (可选，默认7天)
- description: 文件描述 (可选)

响应:
{
  "id": "file-id",
  "fileName": "example.pdf",
  "fileSize": 1024000,
  "uploadTime": "2025-11-28T10:30:00",
  "shareUrl": "http://localhost:8080/api/files/xxx/download",
  "expiryTime": "2025-12-05T10:30:00",
  "downloadCount": 0,
  "description": ""
}
```

### 获取文件列表
```
GET /list

响应: 返回所有未过期文件的数组
```

### 下载文件
```
GET /{fileId}/download

响应: 文件的二进制内容
```

### 删除文件
```
DELETE /{fileId}

响应: 204 No Content (成功)
```

## 数据库

项目使用 **H2 数据库**（内嵌式，无需配置）

- **数据文件位置**: `./data/fileshare.db`
- **H2 控制台**: http://localhost:8080/h2-console

### H2 控制台访问

1. 打开 http://localhost:8080/h2-console
2. JDBC URL: `jdbc:h2:file:./data/fileshare`
3. 用户名: `sa`
4. 密码: (留空)
5. 点击 Connect

## 配置说明

### 前端配置

修改 `src/App.tsx` 中的 API 地址：

```typescript
const API_BASE_URL = 'http://localhost:8080/api'
```

### 后端配置

编辑 `backend/src/main/resources/application.properties`:

```properties
# 文件上传大小限制
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB

# 服务器端口
server.port=8080

# CORS 允许的来源
# 在 FileShareApplication.java 中配置
```

## 文件存储

上传的文件直接存储在 H2 数据库中的 `LONGBLOB` 字段。

### 管理文件存储

在 H2 控制台执行 SQL：

```sql
-- 查看所有文件
SELECT id, file_name, file_size, upload_time, expiry_time, download_count 
FROM share_files;

-- 删除过期文件
DELETE FROM share_files WHERE expiry_time < NOW();

-- 查看文件统计
SELECT COUNT(*) as total_files, SUM(file_size) as total_size 
FROM share_files WHERE expiry_time > NOW();
```

## 故障排除

## 在同一局域网中访问（开发时）

如果希望在局域网中其他设备访问开发服务器（例如手机或另一台电脑），请按下面步骤操作：

1. 在 `vite.config.ts` 中已将 dev server 绑定到所有网口 (`host: true`)。你也可以通过命令行启动时添加 `--host`：

```bash
# 在项目根目录
npm run dev -- --host
```

2. 确认前端和后端使用可被局域网访问的主机地址：
- 前端（浏览器）访问地址示例： `http://<你的机器局域网IP>:5173`。
- 后端 API 地址如果前端运行在另一台机器上，需把 `src/App.tsx` 中的 `API_BASE_URL` 修改为 `http://<你的机器局域网IP>:8080/api`，否则前端会尝试访问 `localhost:8080`（只在本机有效）。

3. 如何查本机局域网 IP（macOS 示例）：

```bash
# Wi-Fi 接口（常见）
ipconfig getifaddr en0

# 或者查看所有接口
ifconfig
```

4. 防火墙：确保运行服务的机器没有阻止 5173（前端）和 8080（后端）端口的入站连接。

5. CORS：后端默认已启用跨源访问。如遇到跨域问题，检查浏览器控制台和后端日志。

示例：假设开发机器 IP 为 `192.168.1.42`，则在局域网其它设备打开：

```
http://192.168.1.42:5173
```

并确保 `API_BASE_URL` 在前端指向 `http://192.168.1.42:8080/api`（如果前端在其他设备上访问后端）。


### 问题 1: 前端连接不上后端
- 确保后端服务已启动在 8080 端口
- 检查防火墙设置
- 在浏览器控制台查看网络错误

### 问题 2: 上传文件失败
- 检查文件大小是否超过限制 (100MB)
- 确保磁盘空间充足
- 查看后端日志

### 问题 3: 下载文件时404
- 确认文件未过期
- 检查文件ID是否正确
- 查看后端日志

## 打包部署

### 前端部署

```bash
# 构建生产版本
npm run build

# 输出到 dist/ 目录
# 可以上传到 Nginx、Apache 或任何静态文件服务器
```

### 后端部署

```bash
# 构建 jar 包
cd backend
mvn clean package -DskipTests

# jar 包位置: target/file-share-server-1.0.0.jar

# 运行 jar
java -jar file-share-server-1.0.0.jar
```

## 技术栈

### 前端
- React 18
- TypeScript
- Vite 4
- Lucide React (图标)
- qrcode.react (二维码)

### 后端
- Spring Boot 2.7
- Spring Data JPA
- H2 Database
- Maven 3

## 许可证

MIT

## 联系方式

如有问题或建议，欢迎反馈！

---

祝使用愉快！🎉

---

