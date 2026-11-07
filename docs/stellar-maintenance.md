# Stellar 博客维护

本轮把 NexT Gemini 迁移到固定版本 Stellar 2.0.0，保留文章正文、日期、分类、标签与 `/:year/:month/:day/:title/` 永久链接。使用 Node.js 22；本地验证版本为 22.19.0、Hexo 8.1.2。

## 安装、构建和预览

```powershell
npm ci
npm run clean
npm run build
npm run server -- --port 4001
```

打开 <http://localhost:4001/>。切换主题后务必先 `clean`，否则 Hexo 数据库和 `public/css/main.css`、`public/js/utils.js` 可能残留旧主题内容。普通文章编辑可直接构建。

仓库目前没有 `scripts/verify.ps1` 和 `scripts/deploy.sh`，验证入口是 `npm run build` 与 `npx hexo stellar doctor`。现有 GitHub Actions 在推送 `main` 后自动发布，现已使用 Node 22 和 `npm ci`。本轮未提交、推送或发布；生产发布须另行按项目要求确认流程，不在本地预览步骤中执行。

## 页面与内容组织

| 地址 | 内容 |
| --- | --- |
| `/` | 个人介绍、三篇精选、四个专题、最近六篇文章 |
| `/blog/` | 全部文章，每页十篇 |
| `/topic/` | 专题目录 |
| `/topic/java/` | Java 后端 |
| `/topic/algorithms/` | 算法基础 |
| `/topic/tools/` | AI 与开发工具 |
| `/topic/opensource/` | 开源实践 |
| `/archives/`、`/categories/`、`/tags/`、`/about/` | 保留的内容入口 |
| `/page/2/` 等旧分页 | HTML 跳转到相应 `/blog/page/2/`，不是服务器 301 |

首页和专题目录由 `scripts/home.js` 生成。它通过 Hexo `theme.setView` 注册一个只输出目录内容的 `directory.ejs`，继续复用 Stellar 外层布局；替换原生 `index_topic` 生成器，因为原生专题入口直接进入系列文章，不提供独立目录页。专题文章自身继续使用 Stellar 的系列导航和目录。

首页三篇精选在生成器的 `featured` 中按 slug 指定；修改精选时保留真实 slug，构建会检查文章存在。最近文章和专题数量从文章模型自动计算，不手填数字。

加入专题只需在文章 Front Matter 添加：

```yaml
collection:
  profile: topic
  id: java
description: "用一两句话说明文章解决的问题。"
```

`id` 可选 `java`、`algorithms`、`tools`、`opensource`。专题名称、介绍和排序在 `source/_data/topic/`；`listing.excerpt_length: 120` 控制主题文章列表的自动摘要。无需为未归入这四类的文章强行分组，它们仍显示在全部文章及原有分类中。当前 46 篇文章中 41 篇归入专题，数量为 20 / 8 / 11 / 2。

摘要优先用 `description` 或 `<!-- more -->` 前的导语；首页和专题目录自动摘要会去掉代码块，以免首页出现行号与代码片段。正文无需为页面展示而改写。

## 外观与资源

- `_config.stellar.yml`：导航、侧栏、原生搜索、阅读布局、浅色配色、51.la 统计与许可说明。
- `source/assets/site.css`：配色、首页与目录布局、字体、手机适配和长标题换行。
- `source/assets/brand/cat.svg`：本站原创矢量猫标识，供侧栏、首页和 favicon 共同使用。
- `source/assets/fonts/manrope.ttf`：自托管 Manrope 700，仅用于英文站名；授权见相邻 `OFL.txt`。中文正文使用系统字体。
- `source/_data/icons.yml`、`widgets.yml`：首页图标和分类、标签、GitHub 补充入口。
- `docs/DESIGN.md`：实际样式的设计约束与令牌。

不修改 `node_modules/hexo-theme-stellar`。NexT 配置和依赖保留，便于查阅与回退。删除了 `hexo-toc` 依赖及其配置：它会把标题 id 移到子元素，破坏 Stellar 目录链接；目录现在由主题原生生成。文章 URL 不变，历史标题片段锚点未作为本次兼容承诺。

51.la 初始化保留，脚本被浏览器拦截或加载失败时跳过初始化。统计接收端数据没有实测。图片灯箱与懒加载仍使用主题默认外部资源，离线环境不保证这些增强功能；基础文章和自托管品牌资源不依赖字体 CDN。

`source/_data/caches/images_metadata.json` 是可重建的图片元数据缓存；`.impeccable/review/` 是本地截图与复核证据，均不提交。

## 验证与回滚

迁移前基准：`b214bac928a72e8fa2aa50f439743285ea99744c`。

要取回迁移前版本进行对照，可在目标目录尚不存在时运行以下命令；它保留当前工作区：

```powershell
git worktree add --detach D:\blog-before-stellar b214bac928a72e8fa2aa50f439743285ea99744c
Set-Location D:\blog-before-stellar
npm ci
npm run clean
npm run build
npm run server -- --port 4002
```

若正式采用回滚，应以该基准恢复本轮变更并追加 `progress.md` 回滚记录；不得直接覆盖后来新增的文章。本轮没有修改线上站点，无需远程回滚。

本轮验证证据在 `progress.md` 对应任务的 `Testing`。后续主题升级至少检查：首页精选和摘要、专题数量、旧分页、站内搜索、键盘关闭与焦点返回、手机菜单、文章目录、图片灯箱，以及长代码/表格在手机端的横向滚动范围。
