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
