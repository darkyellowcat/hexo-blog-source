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
