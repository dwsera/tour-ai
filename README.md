**Tour-AI** 是一款智能旅游规划助手，利用人工智能技术为用户提供个性化的旅行体验。系统支持多种方式获取旅行灵感：输入目的地、在地图上选择城市，或解析小红书分享链接，快速提取旅游攻略。AI 智能生成结构化行程计划，推荐热门景点和必尝美食。用户可以保存和管理行程、记录旅行日记，并通过 AI 助手获取实时旅行建议。Tour-AI 致力于简化旅行规划流程，让每一次探索都轻松愉快。

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

## 0. 登录/注册

支持邮箱注册和登录，提供完整的用户认证系统。

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/1.png?raw=true)

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/2.png?raw=true)

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/3.png?raw=true)

## 1. 输入地址获取景点推荐

在首页输入城市名称，选择旅行天数和兴趣偏好，AI 为你智能生成个性化行程攻略。

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/4.png?raw=true)

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/5.png?raw=true)

## 2. 点击地图获取景点推荐

在创建行程页面，通过交互式地图选择目的地，AI 为你规划专属旅行路线。

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/6.png?raw=true)

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/7.png?raw=true)

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/8.png?raw=true)

## 3. AI 智能助手

专业的旅行 AI 助手，提供实时旅行咨询、景点推荐、美食建议等服务，支持流式对话。

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/10.png?raw=true)

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/9.png?raw=true)

## 4. 小红书链接解析

输入小红书分享链接，自动解析并提取旅游内容，快速获取他人分享的旅行攻略。

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/11.png?raw=true)

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/12.png?raw=true)

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/13.png?raw=true)

## 5. 我的行程

查看和管理所有保存的旅行行程，支持查看详细日程安排和景点信息。

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/19.png?raw=true)

## 6. 旅行日记

记录你的旅行故事，支持添加标题、内容、城市、日期和心情，打造专属旅行回忆录。

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/14.png?raw=true)

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/15.png?raw=true)

## 6. 定价方案

随时订阅解锁更多功能。

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/17.png?raw=true)

## 6. 联系我们

发送功能建议、商务合作还是技术反馈，提供支持。

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/18.png?raw=true)

## 7. 个人中心

管理个人资料，修改用户名、简介和密码，查看账户信息。

![image-20250407210836236](https://github.com/dwsera/project_01/blob/main/16.png?raw=true)



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
