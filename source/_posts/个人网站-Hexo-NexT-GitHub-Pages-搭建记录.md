---
title: 从零开始搭建 Hexo + NexT + GitHub Pages 博客
date: 2025-10-20 12:00:00
categories:
  - 技术笔记
  - 博客搭建
tags:
  - Hexo
  - NexT
  - GitHub Pages
---

# 🚀 前言

作为一名计算机科学与技术专业的大二学生，我决定用一套完全免费的方式搭建属于自己的个人博客。  
最终我选择了 **Hexo + NexT + GitHub Pages** 的组合，简单、美观、自动化。

---

# 🧰 一、环境准备

系统：Windows 10  
需要安装：
- Node.js（推荐 v20+）
- Git
- Hexo CLI

安装命令：
```bash
npm install -g hexo-cli
```



# 🏗️ 二、初始化博客

在安装好 Node.js 与 Git 之后，使用 Hexo CLI 初始化你的博客项目：

```bash
hexo init my-blog
cd my-blog
npm install
````

Hexo 会自动创建一个包含基本结构的文件夹：

```
my-blog/
├─ _config.yml          # 主配置文件
├─ package.json         # npm 依赖配置
├─ scaffolds/           # 模板文件
├─ source/              # 存放文章和页面
│  └─ _posts/           # 博文存放处
└─ themes/              # 主题目录
```

初始化完成后，可以运行以下命令预览网站：

```bash
hexo server
```

在浏览器中访问 [http://localhost:4000](http://localhost:4000)，
就能看到 Hexo 的默认页面啦 🎉


# 🎨 三、更换 NexT 主题

我选择了社区维护最好的主题 —— **NexT**。

进入博客目录，克隆 NexT：

```bash
git clone https://github.com/next-theme/hexo-theme-next themes/next
````

修改博客根目录下的 `_config.yml`，
找到：

```yaml
theme: landscape
```

改为：

```yaml
theme: next
```

然后运行：

```bash
hexo clean && hexo g && hexo s
```

再次打开 [http://localhost:4000](http://localhost:4000)，
你就能看到 NexT 的简洁界面了 ✨


# 🧭 四、配置导航栏与页面

NexT 的导航菜单配置在 `themes/next/_config.yml` 中，  
找到：

```yaml
menu:
  home: / || fa fa-home
  archives: /archives/ || fa fa-archive
````

修改为：

```yaml
menu:
  home: / || fa fa-home
  categories: /categories/ || fa fa-th
  tags: /tags/ || fa fa-tags
  about: /about/ || fa fa-user
```

然后创建对应页面：

```bash
hexo new page "categories"
hexo new page "tags"
hexo new page "about"
```

编辑这些文件：

**`source/categories/index.md`**

```yaml
---
title: 分类
type: categories
---
```

**`source/tags/index.md`**

```yaml
---
title: 标签
type: tags
---
```

**`source/about/index.md`**

```yaml
---
title: 关于我
---
👋 你好，我是 DarkYellowCat，一名计算机科学与技术专业学生，热爱编程与技术分享。
```

重新生成：

```bash
hexo clean && hexo g && hexo s
```

刷新页面，你的导航栏就会出现“主页 / 分类 / 标签 / 关于我”四个菜单 


# ⚙️ 五、部署到 GitHub Pages

为了实现自动部署，我使用了 **GitHub Actions**。

1️⃣ 在 `.github/workflows/` 下创建一个文件：  
`deploy.yml`

2️⃣ 填入以下内容：

```yaml
name: Deploy Hexo to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout source
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm install

    - name: Generate static files
      run: npx hexo generate

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v4
      with:
        personal_token: ${{ secrets.DEPLOY_TOKEN }}
        external_repository: darkyellowcat/darkyellowcat.github.io
        publish_branch: main
        publish_dir: ./public
````

3️⃣ 推送到 GitHub：

```bash
git add .
git commit -m "Add deploy workflow"
git push origin main
```

GitHub Actions 会自动构建并部署。
几分钟后访问：

👉 **[https://darkyellowcat.github.io](https://darkyellowcat.github.io)**

你就能看到网站成功上线 🚀


# ✅ 六、总结

至此，你已经完成了：
- Hexo 初始化与 NexT 安装  
- 导航栏与页面配置  
- GitHub Actions 自动化部署  
  
Hexo 的结构清晰、NexT 的样式优雅、GitHub Pages 免费托管，  
这套组合非常适合学生和个人开发者！