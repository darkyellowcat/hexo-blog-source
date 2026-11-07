---
name: DarkYellowCat
description: 以文章与学习为先的技术博客，记录 Java 后端、AI 工具与开源实践。
colors:
  dyc-paper: "#f7f6f2"
  dyc-surface: "#fffefa"
  dyc-ink: "#2c302e"
  dyc-muted: "#686b63"
  dyc-line: "#e3e2da"
  dyc-amber: "#f3c568"
  dyc-link: "#855600"
  featured-surface: "#f7edcf"
  featured-border: "#ebd8a4"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "43px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-.035em"
  body:
    fontFamily: 'system-ui, "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "17px"
    lineHeight: 1.8
  headline:
    fontSize: "21px"
    fontWeight: 650
    letterSpacing: "-.02em"
  title:
    fontSize: "17px"
    fontWeight: 650
    lineHeight: 1.55
  label:
    fontSize: "14px"
    fontWeight: 600
  code:
    fontFamily: 'Consolas, "SFMono-Regular", Menlo, monospace'
    fontSize: "0.875rem"
rounded:
  card-large: "16px"
  card: "12px"
  card-small: "8px"
spacing:
  inline-gap: "8px"
  section-heading-gap: "12px"
  featured-gap: "14px"
  intro-gap: "24px"
  topic-column-gap: "32px"
  section-bottom: "40px"
components:
  intro-link:
    typography: "{typography.label}"
  featured-card:
    backgroundColor: "{colors.dyc-surface}"
    textColor: "{colors.dyc-ink}"
    rounded: "{rounded.card}"
    padding: "22px 20px 18px"
  featured-card-first:
    backgroundColor: "{colors.featured-surface}"
    textColor: "{colors.dyc-ink}"
    rounded: "{rounded.card}"
  topic-row:
    padding: "18px 0"
  read-link:
    textColor: "{colors.dyc-link}"
  cat-mark:
    width: "112px"
    height: "112px"
---

# Design System: DarkYellowCat

## Overview

**Creative North Star: "文章与学习为先"**

已批准方向是以文章和学习路径为核心的个人技术博客：暖浅中性色、炭灰文字、琥珀点缀，以原创矢量猫建立身份。英文姓名使用自托管 Manrope 700，中文正文使用系统字体；阅读结构和内容可达性优先。

首页依次呈现个人介绍、3 篇精选、4 个专题、6 篇最近文章；完整文章列表位于 `/blog/`，每页 10 篇。此处保留已批准方向，不另建根目录产品文档。

**Key Characteristics:**

- 暖浅底色、清晰文字层级与细分隔线。
- 原创琥珀猫标识与克制的英文姓名展示。
- 专题入口与文章列表服务连续阅读。

提取依据：`source/assets/site.css`、`_config.stellar.yml`、`scripts/home.js`、`source/assets/brand/cat.svg`（2026-11-07）。当前源码优先于 `.impeccable/review` 的旧截图；本次为源码文档核对，截图由主任务刷新。前置 tokens 为实际使用值，扩展元数据与组件片段见 `../.impeccable/design.json`。

## Colors

### Primary

琥珀色 `dyc-amber` 用于猫标识，深琥珀 `dyc-link` 用于链接、交互强调和键盘焦点。首篇精选使用 `featured-surface` 与 `featured-border`，形成轻量阅读入口。

### Neutral

`dyc-paper` 是页面底色，`dyc-surface` 是普通精选卡片底色；`dyc-ink` 承载主要文字，`dyc-muted` 承载摘要、时间和辅助信息，`dyc-line` 分隔列表与区域。

主题固定为 light。Stellar 配置中的 primary（`#946000`）、accent（`#bf8420`）保留为主题输入；站点 CSS 将 `--theme` 与 `--link` 映射到 `dyc-link`，不要把配置输入当作所有组件的最终颜色。

## Typography

Manrope 仅以 700 字重从 `/assets/fonts/manrope.ttf` 加载，使用 `font-display: swap`，用于首页英文姓名。中文正文沿用系统字体栈；根字号为 16px，文章正文采用 frontmatter 的 body 角色。

首页介绍中文标题为 34px / 650 / 1.4；栏目标题使用 headline，精选标题使用 title。首页正文为 16px / 1.7；最近文章标题为 21px / 600 / 1.5，摘要为 14px / 1.8。时间与数量使用等宽数字。

文章段落间距为 `1.1em 0`，不缩进。文章图片保持比例；表格字号为 `.9em`。响应字号见 Layout。

## Layout

Stellar 提供左侧导航、主阅读区及按页面启用的右侧目录；文章和专题启用目录，首页与普通页面不配置右侧组件。导航顺序为首页、文章、专题、归档、关于。

首页内边距为 `10px 16px 32px`；介绍采用左右排列。精选默认三列，专题默认两列；最近文章按时间倒序，以分隔线组织。首页摘要最多两行，原生文章列表摘要最多三行。

| 条件 | 当前源码行为 |
| --- | --- |
| ≤1180px | 浮动 dock 改为顶部横栏：顶部两侧贴边、高 56px、内边距 `8px 16px`、仅底部分隔线，无圆角、阴影或背景模糊。导航在前、目录在后，按钮最小宽 76px、高 40px。带 `rightbar` 区域的页面为 body 预留 56px 顶部空间；锚点滚动预留 80px。 |
| ≤1100px | 精选变单列，间距 10px、卡片内边距 `18px 20px`；英文姓名缩为 36px；猫图为 88px，外框圆角 24px。 |
| ≤768px | 所有页面 body 均预留 56px 顶部空间。文章横幅中的面包屑与阅读时间纵向排列，间距 4px；面包屑可换行，末项允许长词断行，其余链接保持不换行。 |
| ≤667px | 文章正文降为 16px；首页内边距 `4px 20px 20px`；介绍中文标题 25px、英文姓名 27px；猫图 64px、外框圆角 18px；专题变单列；栏目与最近文章标题 19px，栏目间距 30px。 |

宽屏默认锚点滚动预留 28px。以上断点按 CSS 的级联共同生效，不把 1180px 的右侧栏条件扩大成所有页面。

## Elevation & Depth

主要依靠暖色底面、细边框与留白区分层级。自定义首页卡片没有新增阴影；紧凑顶栏明确移除阴影和背景模糊。Stellar 关闭 reveal、卡片 spotlight 与 tilt。减少动态效果偏好下，首页动画与过渡关闭，滚动行为恢复 auto；没有提取额外动画时长。

## Shapes

卡片圆角遵循 frontmatter 的三档值，文章图片与引用块使用 card-small。原创猫 SVG 的画布为 `80 × 80`，琥珀底板自身圆角为 22，炭灰猫形配琥珀五官；首页图片另有响应式圆角，旋转为 `-5deg`。

## Components

- **介绍链接：** 文字与箭头横排，下划分隔线，关于我与 GitHub 两个入口；不包装成实心主按钮。
- **精选卡片：** 整卡链接，标题、摘要、底部类别与箭头。首卡暖琥珀底；悬停边框变为 `#b9a16f`。首页链接的通用 hover 规则使卡片悬停背景透明，标题仍保持炭灰。
- **专题行：** 标题、说明、文章数量和箭头，以底部分隔线组织；4 个专题对应 java、algorithms、tools、opensource。
- **文章行：** 日期、分类、标题、摘要与“阅读全文”；首页显示 6 篇，完整列表每页 10 篇。原生文章列表不显示标签。
- **导航与搜索：** 沿用 Stellar 原生导航和 local 搜索；紧凑顶栏显式显示“导航”“目录”文字。未从指定源码中提取独立输入框或标签皮肤。
- **焦点与阅读：** 键盘焦点使用 2px 深琥珀轮廓、4px 偏移；长阅读推荐链接允许断行。文章图片支持 lightbox，阅读时间开启。

## Do's and Don'ts

### Do:

- **Do** 保留文章、专题与连续阅读的优先级。
- **Do** 使用原创猫、自托管 Manrope 700 和中文系统字体。
- **Do** 保留紧凑顶栏的 56px 页面预留及可见键盘焦点。
- **Do** 以当前源码核实响应式行为，再使用刷新后的截图检查视觉结果。

### Don't:

- **Don't** 将旧浮动 dock 或旧截图作为当前布局依据。
- **Don't** 将琥珀标识色直接替代深色正文与链接色。
- **Don't** 添加源码未定义的色阶、阴影或动画 token。
