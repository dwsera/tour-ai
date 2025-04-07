![image](https://github.com/user-attachments/assets/da181c63-45a8-421d-b666-ddc16f46f556)# **Tour-AI** 

是一个智能旅游规划和推荐系统，旨在通过人工智能技术为用户提供个性化的旅游体验。项目通过解析小红书分享链接，提取旅游相关内容（如景点、行程安排等），并结合 OCR 和自然语言处理技术，生成结构化的行程计划。用户可以保存、查看和管理自己的行程，同时通过 AI 推荐获得更优的旅行建议。Tour-AI 致力于简化旅行规划流程，让用户更轻松地探索世界。

# 使用技术

- **前端:**

  - **NextJS (React)**: 用于构建整个前端应用，支持服务器端渲染。
  - **TailwindCSS**: 用于快速构建响应式和现代化的 UI。
  - **TypeScript**: 提供静态类型检查，提升开发体验和代码质量。
  - **Radix UI**: 用于构建无障碍、可访问的 UI 组件库（如头像、复选框、对话框、滚动区域等）。
  - **Framer Motion**: 用于实现动画效果。
  - **Lucide React**: 用于使用矢量图标。
  - **React-Leaflet**: 用于集成 Leaflet 地图组件。
  - **React Markdown**: 用于渲染 Markdown 内容。
  - **React Masonry CSS**: 用于实现瀑布流布局。

  **后端:**

  - **NextJS (API routes)**: 用于构建后端 API。
  - **Prisma**: 用于数据库 ORM，支持与数据库（如 MySQL）进行交互。
  - **MySQL2**: 用于与 MySQL 数据库进行连接和操作。
  - **bcryptjs**: 用于加密和验证密码。
  - **NextAuth**: 用于实现身份验证和会话管理。
  - **Node-fetch**: 用于发起 HTTP 请求。
  - **Node-cache**: 用于缓存数据。
  - **Resend**: 用于处理邮件发送。
  - **tidb cloud**:数据库

# 功能

## 0.登录

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/image-20250407210836236.png?raw=true)

![image-20250407210848860](https://github.com/dwsera/project_01/blob/main/image-20250407210848860.png?raw=true)

## 1.输入地址获取景点推荐

![image-20250407205402499](https://raw.githubusercontent.com/dwsera/project_01/refs/heads/main/image-20250407205402499.png)

![image-20250407205717018](https://github.com/dwsera/project_01/blob/main/image-20250407205717018.png?raw=true)

## 2.点击地图获取景点推荐

![image-20250407205512260](https://github.com/dwsera/project_01/blob/main/image-20250407205512260.png?raw=true)

## 3.AI

![image-20250407205615710](https://github.com/dwsera/project_01/blob/main/image-20250407205615710.png?raw=true)

## 4.小红书链接解析

![image-20250407205636770](C:\Users\zheng\AppData\Roaming\Typora\typora-user-images\image-20250407205636770.png)

![image-20250407205815256](https://github.com/dwsera/project_01/blob/main/image-20250407205815256.png?raw=true)

## 5.我的行程

![image-20250407205908911](https://github.com/dwsera/project_01/blob/main/image-20250407205908911.png?raw=true)

# 注意

1. 因为部署在了vercel，所以**限制了访问速度**，有时候接口可能请求失败.

   网页版响应速度较慢，请耐心等待**不要多次点击**。

   体验地址：[tour-ai-azure.vercel.app](https://tour-ai-azure.vercel.app/)

# 运行

下载依赖：`npm install`

开发环境运行：`npm run dev`

注意：`.env`文件，请补全后运行。

# 免责申明

本项目是由个人开发的，并且仅供学习、研究和非商业用途。我并不对本软件的任何使用、结果或影响承担责任。
