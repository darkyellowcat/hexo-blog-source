## 2026-09-03 - Task: 编写冗余机械臂神经动力学精读与文献调研博客

### What was done

- 基于课程资料完成一篇 Snap-Layer MMPC 精读博客，讲清问题背景、ZNDE 推导、五层约束、PND 求解、实验结果与局限。
- 基于其余 15 篇论文完成一篇文献调研博客，按建模、在线求解、预测与数据驱动、多任务控制四条路线梳理研究进展。
- 对 16 篇引用逐一核验本地 PDF 的题名、作者、出处、摘要和可用 DOI，生成引用审计与 BibTeX 清单，并纠正课程材料中的元数据和实验参数误差。

### Testing

- `npm run build`：通过；Hexo 8.0.0 成功生成 117 个页面，两篇新博客页面均已生成。
- 生成 HTML 检查：通过；标题、中文编码、表格、代码块和 DOI 链接均正常，未发现 Unicode 替换字符或未渲染 Markdown 围栏。
- 引用完整性检查：通过；调研博客包含 15 条参考文献，精读博客包含 1 条参考文献，BibTeX 包含 16 个唯一条目，必填字段与花括号结构完整。
- `git diff --check`：通过，未发现空白错误。
- 仓库不存在 `scripts\verify.ps1`，无法执行固定验证脚本；本轮使用仓库现有的 Hexo 构建命令替代。

### Notes

- `source/_posts/论文精读-从五层约束看Snap-Layer-MMPC.md`：新增单篇论文精读博客。
- `source/_posts/文献调研-面向冗余机械臂规划控制的神经动力学模型.md`：新增 15 篇论文调研博客。
- `docs/robotics-literature-reference-audit.md`：记录引用来源、核验结论及课程材料中的纠正项。
- `docs/robotics-literature-refs.bib`：保存两篇博客涉及的 16 条已核验 BibTeX 条目。
- `progress.md`：追加本轮施工与验证记录。
- 回滚方式（保留本日志作为审计记录）：在仓库根目录执行 `Remove-Item -LiteralPath '.\source\_posts\论文精读-从五层约束看Snap-Layer-MMPC.md','.\source\_posts\文献调研-面向冗余机械臂规划控制的神经动力学模型.md','.\docs\robotics-literature-reference-audit.md','.\docs\robotics-literature-refs.bib'`；如 `docs` 目录因此为空，再执行 `Remove-Item -LiteralPath '.\docs'`。

## 2026-09-09 - Task: 完善《深入理解 AI Agent》一二章博客
### What was done

- 对照 `bojieli/ai-agent-book` 当前第一、二章，补充第一篇中的“模型即 Agent”、三种学习更新路径、Harness 工程公式及工作流/自主 Agent 选型要点。
- 补充第二篇开头的上下文能力边界，以及提示注入防护、Agent 状态栏、上下文压缩和子 Agent 隔离等书中缺失主题。
- 保留原有章节结构、个人阅读判断和示例，仅追加必要的概念摘要。

### Testing

- `npm run build`：通过；Hexo 8.0.0 成功生成 126 个页面，两篇目标博客页面均正常生成。
- `git diff --check`：通过，未发现空白错误。
- UTF-8 内容检查：通过；两篇目标文章未发现 Unicode 替换字符。

### Notes

- `source/_posts/《深入理解-AI-Agent》笔记-1-AI-Agent-入门.md`：补充模型即 Agent、学习机制、Harness 和编排模式内容。
- `source/_posts/《深入理解-AI-Agent》笔记-2-上下文工程.md`：补充上下文背景、提示注入、状态栏和压缩策略内容。
- `progress.md`：追加本轮施工与验证记录。
- 回滚方式：在仓库根目录执行 `git restore -- 'source/_posts/《深入理解-AI-Agent》笔记-1-AI-Agent-入门.md' 'source/_posts/《深入理解-AI-Agent》笔记-2-上下文工程.md'`；如需连同日志回滚，再对 `progress.md` 执行同样命令（会移除本轮未提交修改）。

## 2026-09-09 - Task: AI Agent 博客字面校正与复验
### What was done

- 修正第一篇中“科学观点为”“在一本书在”“持久化3”三处明显笔误，未改变原有观点或结构。

### Testing

- `npm run build`：通过；增量构建成功生成两篇目标博客页面。
- `git diff --check`：通过，未发现空白错误。

### Notes

- `source/_posts/《深入理解-AI-Agent》笔记-1-AI-Agent-入门.md`：修正三处字面表述。
- `progress.md`：追加本轮校正与复验记录。
- 回滚方式：在仓库根目录执行 `git restore -- 'source/_posts/《深入理解-AI-Agent》笔记-1-AI-Agent-入门.md'`；如需连同日志回滚，再对 `progress.md` 执行同样命令（会移除本轮未提交修改）。

## 2026-09-09 - Task: 检查 AI Agent 两篇博客图片显示
### What was done

- 核对两篇博客的 Markdown 图片引用、文章资源目录和 Hexo 生成页面。
- 修正第二篇博客将实际文件 `skill.png` 错写为 `skills.png` 的引用问题。

### Testing

- 本地 Hexo 页面检查：第一篇 3 张正文图片、第二篇 2 张正文图片请求均返回 HTTP 200。
- 浏览器图片加载检查：5 张正文图片均 `complete=true` 且 `naturalWidth > 0`，确认可正常加载显示。
- `npm run build`：通过；两篇目标博客页面正常生成。
- `git diff --check`：通过，未发现空白错误。

### Notes

- `source/_posts/《深入理解-AI-Agent》笔记-2-上下文工程.md`：将图片引用改为实际存在的 `skill.png`。
- `progress.md`：追加图片检查、修复与验证记录。
- 回滚方式：在仓库根目录执行 `git restore -- 'source/_posts/《深入理解-AI-Agent》笔记-2-上下文工程.md'`；如需连同日志回滚，再对 `progress.md` 执行同样命令（会移除本轮未提交修改）。

## 2026-09-09 - Task: 修复 AI Agent 博客非预期换行
### What was done

- 将 Hexo Marked 渲染配置的 `breaks` 改为 `false`，使 Markdown 普通软换行不再生成页面强制换行。
- 修正第一篇原有的 `## ## Agent = Model + Harness` 标题格式。
- 新增 Markdown 换行约定文档，说明需要强制换行时的写法。

### Testing

- `npx hexo clean` + `npm run build`：通过；完整站点成功生成 192 个文件。
- 浏览器页面检查：两篇目标页面正文段落中的强制 `<br>` 数量均为 0；第一篇标题显示为 `Agent = Model + Harness`。
- `git diff --check`：通过，未发现空白错误。

### Notes

- `_config.yml`：关闭 Marked 的普通换行强制渲染。
- `source/_posts/《深入理解-AI-Agent》笔记-1-AI-Agent-入门.md`：修正 Harness 标题格式。
- `docs/markdown-rendering.md`：记录 Markdown 软换行和强制换行约定。
- `progress.md`：追加本轮施工与验证记录。
- 回滚方式：在仓库根目录执行 `git restore -- '_config.yml' 'source/_posts/《深入理解-AI-Agent》笔记-1-AI-Agent-入门.md' 'docs/markdown-rendering.md'`；如需连同日志回滚，再对 `progress.md` 执行同样命令（会移除本轮未提交修改）。

## 2026-09-09 - Task: 修复博客非预期换行
### What was done

- 关闭 Hexo Marked 的普通软换行强制渲染，避免源码自动折行在页面中变成句中断行。
- 修正第一篇博客原有的重复 Markdown 标题标记。
- 增加 Markdown 换行约定说明。

### Testing

- `npx hexo clean` + `npm run build`：通过；完整站点成功生成 192 个文件。
- 浏览器检查：两篇目标页面正文段落均未生成非预期 `<br>`，标题显示正常。
- `git diff --check`：通过，未发现空白错误。

### Notes

- `_config.yml`：设置 `marked.breaks: false`。
- `source/_posts/《深入理解-AI-Agent》笔记-1-AI-Agent-入门.md`：修正 `Agent = Model + Harness` 标题。
- `docs/markdown-rendering.md`：记录软换行与强制换行约定。
- `progress.md`：追加本轮施工与验证记录。
- 回滚方式：在仓库根目录执行 `git restore -- '_config.yml' 'source/_posts/《深入理解-AI-Agent》笔记-1-AI-Agent-入门.md' 'docs/markdown-rendering.md'`；如需连同日志回滚，再对 `progress.md` 执行同样命令（会移除本轮未提交修改）。

## 2026-09-29 - Task: 整理 HTTP 请求与响应旧笔记

### What was done

- 将旧笔记中的请求、响应与状态码内容重新组织为一篇博客，纠正 GET 请求体、HTTP/3 传输及请求行术语等表述。

### Testing

- npm run build：通过，生成目标文章页面。
- 检查生成 HTML：标题、正文及 HTTP 代码块存在；源码围栏成对，未发现 Unicode 替换字符。
- git diff --check：通过。
- 仓库不存在 scripts\verify.ps1，无法执行固定验证脚本，本轮使用 Hexo 构建验证。

### Notes

- source/_posts/HTTP请求与响应怎么组成.md：新增核对后的 HTTP 请求与响应文章。
- progress.md：追加本轮内容与验证记录。
- 回滚方式：在博客仓库根目录执行 Remove-Item -LiteralPath '.\source\_posts\HTTP请求与响应怎么组成.md'；日志为追加记录，如需撤销，删除本轮新增的对应日志段落。

## 2026-09-29 - Task: 整理 Java 文件与字节流旧笔记

### What was done

- 合并路径、输入流和输出流素材，形成文件复制主线，修正必须先创建 File 对象及所有输出流都自动缓冲等旧表述。

### Testing

- npm run build：通过，生成目标文章页面；标题和代码块渲染正常。
- 提取文中完整 Java 示例，用 javac 编译并运行；中文 UTF-8 输入与复制结果的文件哈希一致。
- 源码围栏成对，未发现 Unicode 替换字符；git diff --check 通过。
- 仓库不存在 scripts\verify.ps1，使用现有 Hexo 构建命令验证。

### Notes

- source/_posts/Java文件与字节流入门.md：新增核对后的文件与字节流文章。
- progress.md：追加本轮内容与验证记录。
- 回滚方式：在博客仓库根目录执行 Remove-Item -LiteralPath '.\source\_posts\Java文件与字节流入门.md'；如需撤销日志，删除本轮新增的对应段落。

## 2026-09-29 - Task: 整理 Java 二维数组复制旧笔记

### What was done

- 核对 CS61B 原练习出处，重新编写示例，解释外层数组复制、行引用共享与逐行复制的差别。

### Testing

- npm run build：通过，生成目标文章页面；标题和代码块渲染正常。
- 提取文中 Java 示例，用 javac 编译并运行；输出为 20、20、99、false、true、false，与文章一致。
- 源码围栏成对，未发现 Unicode 替换字符；git diff --check 通过。
- 仓库不存在 scripts\verify.ps1，使用现有 Hexo 构建命令验证。

### Notes

- source/_posts/Java二维数组复制-共享行与复制元素.md：新增重新编写并注明练习来源的文章。
- progress.md：追加本轮内容与验证记录。
- 回滚方式：在博客仓库根目录执行 Remove-Item -LiteralPath '.\source\_posts\Java二维数组复制-共享行与复制元素.md'；如需撤销日志，删除本轮新增的对应段落。

## 2026-09-29 - Task: 整理 Java 接口与抽象类旧笔记

### What was done

- 合并两份接口笔记，以调用契约和共享实现为主线，纠正接口只能有抽象方法的过时表述。

### Testing

- npm run build：通过，生成目标文章页面；标题和代码块渲染正常。
- 提取文中 Java 示例，用 javac 编译并运行；输出 [notice] Hello，与文章一致。
- 源码围栏成对，未发现 Unicode 替换字符；git diff --check 通过。
- 仓库不存在 scripts\verify.ps1，使用现有 Hexo 构建命令验证。

### Notes

- source/_posts/Java接口与抽象类怎么选.md：新增接口和抽象类的整理文章。
- progress.md：追加本轮内容与验证记录。
- 回滚方式：在博客仓库根目录执行 Remove-Item -LiteralPath '.\source\_posts\Java接口与抽象类怎么选.md'；如需撤销日志，删除本轮新增的对应段落。

## 2026-09-29 - Task: 整理 Java equals 与 hashCode 旧笔记

### What was done

- 以集合查找示例重写相等与散列码契约，纠正默认散列码等于内存地址及普通散列码具备密码学抗碰撞性的错误表述。

### Testing

- npm run build：通过，生成目标文章页面；标题和代码块渲染正常。
- 提取文中 Java 示例，用 javac 编译并运行；输出 true、true，与文章一致。
- 源码围栏成对，未发现 Unicode 替换字符；git diff --check 通过。
- 仓库不存在 scripts\verify.ps1，使用现有 Hexo 构建命令验证。

### Notes

- source/_posts/Java-equals与hashCode为什么要一起重写.md：新增核对后的相等与散列码文章。
- progress.md：追加本轮内容与验证记录。
- 回滚方式：在博客仓库根目录执行 Remove-Item -LiteralPath '.\source\_posts\Java-equals与hashCode为什么要一起重写.md'；如需撤销日志，删除本轮新增的对应段落。

## 2026-11-07 - Task: 补完 magpie 个人体验分享

### What was done

- 保留更换工具的经历，补全路由、用量、隐私脱敏、跨 Agent 使用模型与订阅、方案切换及简短上手说明，延续第一人称和短段落表达。
- 对照官方资料说明功能默认值与限制，弱化缺少 PR 链接的归因，补充来源；为本篇建立独立配图引用，保留原始图片。

### Testing

- npm run build：通过，Hexo 正常生成目标文章页面和两张专属图片。
- 生成 HTML 检查：标题、10 个二级章节、5 个官方资料链接均存在；两张图片使用主题的 data-src 懒加载属性，引用路径对应的文件存在，替代文本完整。
- 专属图片与原图 SHA256 一致；正文没有 Unicode 替换字符和空代码块；原稿备份 SHA256 与施工前一致。
- 官网、快速上手、隐私、本地脱敏和意图路由页面均已取得 HTTP 200；正文功能依据以这些官方说明及用户截图为准，未把文档核对表述为软件功能实测。
- 仓库不存在 scripts/verify.ps1，使用现有 npm run build 验证；未执行发布。
- 原稿与当前稿差异已审查；Git 跟踪文件与未跟踪文章分别执行空白差异检查通过。

### Notes

- source/_posts/magpie-替换ccswitch的选择.md：原地补完文章，更新标题、分类、标签和图片说明，保留原日期与文件名。
- source/_posts/magpie-替换ccswitch的选择/routing.png：复制本篇路由截图，使用独立名称引用。
- source/_posts/magpie-替换ccswitch的选择/usage.png：复制本篇用量截图，使用独立名称引用。
- progress.md：仅在末尾追加本轮完成内容、验证证据和回滚方式。
- 原稿与原日志备份点：C:\Users\UserX\AppData\Local\Temp\blog-magpie-978d08f3d99942b894c45a613297082c；原稿 SHA256：CC00A4CBA39A66978163C2FA7B65E92872EFF828205115B65E47C1FC1CC9B488。
- 回滚方式：在仓库根目录执行以下 PowerShell 命令恢复原稿并移除本轮复制的图片；原始图片无需恢复，日志保留并另行追加回滚记录。临时目录备份应在系统清理前使用。

```powershell
Copy-Item -LiteralPath 'C:\Users\UserX\AppData\Local\Temp\blog-magpie-978d08f3d99942b894c45a613297082c\original.md' -Destination '.\source\_posts\magpie-替换ccswitch的选择.md' -Force
Remove-Item -LiteralPath '.\source\_posts\magpie-替换ccswitch的选择\routing.png', '.\source\_posts\magpie-替换ccswitch的选择\usage.png'
npm run build
```


## 2026-11-07 - Task: 迁移 Stellar 并重做技术博客界面

### What was done

- 按已确认方向完成 Stellar 2.0.0 迁移，以暖浅灰、深灰和琥珀色建立统一视觉，新增原创猫标识。
- 首页改为简短介绍、三篇精选、四个专题与六篇最新文章；全部文章移到 /blog/，每页十篇，旧分页提供跳转。
- 为 41 篇文章建立四类专题目录与原生系列导航，补充必要摘要，保留全部 46 篇文章正文和原有日期 URL。
- 统一阅读排版，修复旧目录插件冲突、手机长标题溢出、悬浮导航遮挡与文章元信息挤压；保留搜索、图片放大、统计和许可说明。
- 完成维护和设计文档；未提交、推送或发布。

### Testing

- Node 22.19.0 / Hexo 8.1.2：npm run clean、npm run build 通过，干净构建生成 285 个文件；npx hexo stellar doctor 为 PASS。仓库无 scripts/verify.ps1，使用现有构建入口验证。
- npm ci --dry-run --ignore-scripts 通过，验证 package.json 与 npm 锁文件相容；未实际执行 Linux CI 或生产发布。
- 46 篇正文与迁移前 Git 基准逐字节相同；解析 Front Matter 后确认原有字段一致，仅增加 collection 和六篇文章的 description。75 条原文章/图片路径全部保留。
- Python Playwright + Chromium：主页三精选、六最新、四专题数量（20/8/11/2）、全部文章十篇分页、旧分页跳转、分类/标签/归档/关于页面均通过。
- 实测搜索 magpie、键盘 Enter 打开、Escape 关闭与焦点返回；手机导航到文章列表、文章目录锚点、图片灯箱均通过。检查期间无 JavaScript 异常、无本地资源 4xx/5xx。
- 首页及 magpie、算法代码、MySQL 表格、论文页面在 1440 / 768 / 390px 下无文档横向溢出；实际图片加载后截图。手机顶部预留 56px，专题入口中心未被遮挡，三个面包屑链接均保持单行。
- 独立视觉复核提出手机悬浮按钮遮挡、面包屑挤压；修复后定向复核返回 disposition: ship，P1/P2 均 resolved。该结论限于两项修复，不能替代全站无障碍或跨浏览器审计。
- git -c core.whitespace=cr-at-eol diff --check 通过，保留已有文件的 CRLF；Git diff 已审查，未修改文章正文。Impeccable context/detect 启动无响应，已中断，未把它们记为检查通过。
- 本地截图位于 .impeccable/review/；功能、元数据与手机复验脚本位于 C:/Users/UserX/AppData/Local/Temp/blog-stellar-check.py、blog-stellar-metadata-check.js、blog-stellar-final-mobile.py。

### Notes

- `.github/workflows/deploy.yml`：对齐 Node 22，并使用 npm ci 安装锁定依赖。
- `.gitignore`：忽略可重建的图片元数据和本地复核截图。
- `.impeccable/design.json`：保存与实际样式一致的机器可读设计令牌。
- `_config.stellar.yml`：配置导航、阅读布局、浅色琥珀主题、搜索、统计和版权。
- `_config.yml`：启用 Stellar、文章列表迁至 /blog/，更新站点简介和图标，移除旧目录插件配置。
- `docs/DESIGN.md`：记录已批准方向、实际令牌与响应式设计约束。
- `docs/stellar-maintenance.md`：记录内容编辑、构建预览、兼容处理及回滚方法。
- `package-lock.json`：锁定新增主题及其依赖，移除旧目录插件的依赖树。
- `package.json`：固定 Stellar 2.0.0，移除冲突的 hexo-toc，并同步 Hexo 实际版本。
- `progress.md`：仅追加本轮结果、验证证据、文件清单和回滚点。
- `scripts/home.js`：生成个人首页、专题目录与旧分页跳转，保留主题外壳及文章 URL。
- `source/_data/icons.yml`：补充与导航一致的首页 SVG 图标。
- `source/_data/topic/algorithms.yml`：定义专题名称、介绍、倒序排列及 120 字自动摘要。
- `source/_data/topic/java.yml`：定义专题名称、介绍、倒序排列及 120 字自动摘要。
- `source/_data/topic/opensource.yml`：定义专题名称、介绍、倒序排列及 120 字自动摘要。
- `source/_data/topic/tools.yml`：定义专题名称、介绍、倒序排列及 120 字自动摘要。
- `source/_data/widgets.yml`：提供分类、标签、GitHub 补充入口。
- `source/_posts/HTTP请求与响应怎么组成.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Java-equals与hashCode为什么要一起重写.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Java8特性.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Java二维数组复制-共享行与复制元素.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Java后端实习经历分享.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Java基础算法模板.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Java接口与抽象类怎么选.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Java文件与字节流入门.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Java框架.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Kestra-PR-分享-224-如何修正-MySQL-serverId-的缺省策略.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Kestra-PR-分享提交-fix-MySQL-让-Debezium-serverId-从必填变为可选.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/MYSQL字段类型优化.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Maven学习.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/MyBatis-Plus-SpringBoot3-Fix.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/MySQL密码错误解决方法.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/Redis.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/SpringSecurity.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/claude-codex配置分享.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/deepwiki.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/magpie-替换ccswitch的选择.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/mysql学习.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/omp连接gpt-plus-pro报错-403-unsupported-country-region-territory.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/weconnected项目.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/《SQL必知必会》学习随笔-加餐.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/《SQL必知必会》学习随笔-基础篇.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/《SQL必知必会》学习随笔-进阶篇.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/《深入理解-AI-Agent》笔记-1-AI-Agent-入门.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/《深入理解-AI-Agent》笔记-2-上下文工程.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/二叉树与递归.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/二叉树的最大深度.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/二叉树的遍历.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/位运算常用技巧.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/单调队列.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/吴恩达Agent智能体学习笔记.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/吴恩达agent-skills.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/天梯赛-L1-L2-题解（Java）.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/如何通过工具提高代码质量.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/微信小程序开发踩坑.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/沙箱Sandbox.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/生成头像.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/_posts/链表.md`：仅补充专题归属；有需要的文章增加摘要，正文、日期、分类、标签保持不变。
- `source/assets/brand/cat.svg`：新增原创琥珀色猫头像与 favicon。
- `source/assets/fonts/OFL.txt`：附带 Manrope 字体授权。
- `source/assets/fonts/manrope.ttf`：自托管英文站名使用的 Manrope 700 字体。
- `source/assets/site.css`：实现首页、专题、阅读样式与手机顶部导航，修复长标题和元信息布局。
- `source/categories/index.md`：使用 Stellar 支持的分类页面布局字段。
- `source/tags/index.md`：使用 Stellar 支持的标签页面布局字段。
- `yarn.lock`：同步主题迁移与目录插件移除后的依赖解析。
- .impeccable/review/：本地生成的桌面、平板、手机及交互截图，不纳入版本控制。
- npm 安装报告 20 个依赖审计问题（7 low / 2 moderate / 11 high），本轮未执行超出主题迁移范围的 audit fix；第三方统计接收端未实测，灯箱及懒加载仍依赖主题默认外部资源。
- 回滚点：b214bac928a72e8fa2aa50f439743285ea99744c。可执行 `git worktree add --detach D:\blog-before-stellar b214bac928a72e8fa2aa50f439743285ea99744c` 在新目录取回原版本，再运行 `npm ci`、`npm run clean`、`npm run build`；本轮未改变线上站点。正式撤销本轮时仅恢复上述文件并追加回滚记录，不覆盖后来新增内容。


## 2026-11-07 - Task: 核对 51.la 统计并准备提交

### What was done

- 对照迁移前 NexT body-end 注入与当前 Stellar body_end 注入，确认统计代码没有丢失；未修改统计实现。
- 核对本轮 65 个变更文件均属于已记录的 Stellar 改版范围，暂存以供提交；未创建提交、推送或发布。

### Testing

- 原配置和当前配置的 SDK 地址、id、ck（3OnjqyPOaoYCHllV）及 autoTrack: true 一致。
- 扫描全部生成 HTML：158 个正式页面各有一份 SDK 和初始化代码；4 个旧分页跳转页不额外统计，避免跳转重复计数。
- https://sdk.51.la/js-sdk-pro.min.js 请求返回 HTTP 200。
- Playwright 在首页、文章列表、专题、关于和文章详情使用 SDK 替身验证：先加载 SDK，再初始化，正确参数每页调用一次；阻断 SDK 时没有 LA 未定义异常。此验证未向统计服务发送真实访问事件，也未核验 51.la 后台入库。
- 检查脚本：C:/Users/UserX/AppData/Local/Temp/blog-51la-check.py。
- 暂存后以 git -c core.whitespace=cr-at-eol diff --cached --check 检查差异；生成页面、node_modules 和复核截图不纳入提交。

### Notes

- progress.md：仅追加本次统计核对结果和提交准备记录；历史内容保持原字节。
- 本轮未改动其他源码；暂存内容为上一任务列出的 65 个文件。
- 取消暂存可执行 git restore --staged -- .，工作区文件保留；改版回滚点仍为 b214bac928a72e8fa2aa50f439743285ea99744c。

- 暂存差异检查发现官方字体许可 OFL.txt 第 21 行自带一个行尾空格；为保持原始许可文本不改写，保留该文件。排除此第三方许可文件后，`git -c core.whitespace=cr-at-eol diff --cached --check -- . ":!source/assets/fonts/OFL.txt"` 通过，其余暂存内容无空白错误。


## 2026-11-08 - Task: 完善 AGENTS.md 分享文章并修复模板排版

### What was done

- 保留群友分享后结合个人习惯调整的开头，补齐 AGENTS.md 的用途、任务范围、简单实现、验证记录与回复方式说明。
- 说明脚本、工作分工、高风险约定和 CodeGraph / Memorix 附加段的项目背景，结合 OpenAI 官方文档说明 Codex 加载范围，避免泛化到所有工具。
- 保留完整原模板，将外层代码围栏改为四反引号，修复内部三反引号导致的代码块截断；补充摘要、分类、标签和 AI 与开发工具专题归属。
- 保留原标题、文件名和日期；未修改仓库执行规范、主题或其他文章，未提交或发布。

### Testing

- npm run build 通过，生成 2026/11/07/AGENTS-md-分享/index.html；保留原始日期和 URL。
- 完整模板与原稿提取内容 SHA256 相同；原稿备份 SHA256 验证通过。生成 HTML 中所有模板代码行与原模板文本一致，内部代码围栏、表格及 HTML 注释均作为代码展示。
- 生成页面恰有一个完整模板代码块、五个预期二级标题；无模板标题泄漏为文章 h1。首页、文章列表、工具推荐分类、AGENTS.md 标签和 tools 专题均存在文章入口。
- Python Playwright / Chromium 在 1440×1000 与 390×844 检查实际页面并截图，页面无横向溢出、无 JavaScript 异常；手机代码表格宽 356px、内容宽 7293px，设置 scrollLeft=100 后实际移动成功。
- 已查看桌面与手机的导语、完整模板截图，正文与代码区域正常；截图位于 .impeccable/review/agents-*-intro.png 和 agents-*-template.png，属于忽略的本地复核产物。
- 构建入口仍使用仓库现有 npm run build；仓库未提供 scripts/verify.ps1。验证脚本：C:/Users/UserX/AppData/Local/Temp/blog-agents-verify.py。

### Notes

- source/_posts/AGENTS-md-分享.md：补齐介绍、适用边界、分类摘要和专题信息，修复外层代码围栏，完整模板内容保持原字节。
- progress.md：仅追加本轮完成内容、验证证据及回滚信息，历史记录保持原字节。
- 原稿备份：`C:\Users\UserX\AppData\Local\Temp\blog-agents-original-51404ede76994bb6a50108b7f6f8d1b3.md`；SHA256：`9834afb0ed0335d735434c13b20814a5d948a417bae54049b06078d192e0c438`。
- 完整模板 SHA256：`1b51f9036433f3cd7a01ca55ff57986be86201716c22459deac0ec3bec39c2c7`。
- 回滚方式：在仓库根目录执行下列 PowerShell 命令恢复未跟踪的原稿；保留进度历史并另行追加回滚记录，备份需在临时目录清理前使用。

```powershell
Copy-Item -LiteralPath 'C:\Users\UserX\AppData\Local\Temp\blog-agents-original-51404ede76994bb6a50108b7f6f8d1b3.md' -Destination 'D:\blog\source\_posts\AGENTS-md-分享.md' -Force
npm run build
```
