---
title: AGENTS.md 分享
date: 2026-11-07 17:26:35
categories:
  - 工具推荐
tags:
  - AGENTS.md
  - AI
  - Codex
collection:
  profile: topic
  id: tools
description: "分享我调整后的 AGENTS.md，介绍任务边界、精准改动、验证记录与按项目裁剪的方法，附完整配置。"
---

## 前言

前一段时间在水群时，看到群佬分享了自己的 `AGENTS.md`，就拿过来和自己的配置拼凑、调整了一下，这里也分享给大家。

完整配置比较长，我放在文章后面。前面先介绍一下各部分的用途，以及拿去用之前需要改哪些地方，大家可以按自己的习惯调整。

### 说清任务范围

我比较在意的一点是：指定改哪篇文章、哪个模块，就先把这个对象处理好。发现旁边还有能优化的地方，可以指出来，但不要顺手一起改了。

比如只是调整一个接口的参数校验，就不应该顺带重排整个文件、替换日志写法，再把附近几个接口重构一遍。改动范围越大，我后面核对起来也越费劲。

### 简单化问题，不要反复套

这部分主要约束实现方式：先说清楚假设和取舍，优先用当前需求能支撑的简单方案。

一次性代码就先写清楚，确实出现复用需求后再考虑抽象。还没有发生的问题，也不用提前堆很多分支。编辑已有内容时，尽量保持原来的风格，只清理这次改动造成的无用部分。

### 改完要有能核对的结果

“已经完成”和“已经验证”是两件事。所以我在配置里单独写了验证、记录和回滚要求。

验证要对应当前任务：改配置就检查配置是否生效，改页面就看实际页面，改代码就运行相关检查。有些东西暂时测不了，也要把缺口说明白。最后再把这一轮做了什么、怎么验证的、如何撤回，追加到进度日志里，方便之后继续处理。

### 汇报时先把结论讲明白

回复方式这一节偏向我的个人习惯：先告诉我现在是否能推进、哪里还有问题，再补充必要的技术依据。

固定结构主要用于阶段性汇报。简单问题直接回答就够了，不需要每次都凑齐“原因、风险、下一步”。如果更喜欢看代码细节，或者希望回复更短，这一节完全可以自己调整。

## 需要人工审查的地方

这份配置里有一些原项目留下的约定，复制到自己的仓库前，建议先检查：

| 部分 | 需要调整的内容 |
| --- | --- |
| 验证与部署 | 把 `scripts/verify.ps1`、`scripts/deploy.sh` 换成项目真实存在的命令；没有对应脚本时，不要要求 Agent 执行一个不存在的入口。 |
| 工作分工 | Desktop、CLI 或集成终端的分工，按自己实际使用的工具修改。 |
| 高风险边界 | 网络包、线程、鉴权和反作弊等条目带有项目背景，按当前项目确定需要确认的操作。 |
| 记录与回复 | `progress.md`、`docs/` 和汇报格式是这份模板的约定，可以替换成团队已有的方式。 |
| 工具附加段 | CodeGraph 和 Memorix 按实际安装、连接情况保留；没有使用时可以删掉对应部分。 |

其中，CodeGraph 部分用于查询代码结构，Memorix 部分用于保存和找回项目上下文。**写上这些规则，并不会自动安装工具、完成索引或连接 MCP 服务。** 

## 完整配置

````markdown
# AGENTS

本文件是仓库内所有模型/代理的唯一执行规范。

## 1. 优先级
- 禁止为了迎合用户，放弃自己的正确意见
- 高风险与边界约束最高；需先确认的操作不得自行跳过。
- 用户明确指示高于其他默认规则，但仅决定“做什么”；执行时仍须遵守本规范中的范围、记录、文档、编码保护和高风险确认要求。

## 2. 执行
- 进入仓库先读根目录 `AGENTS.md`。
- 按用户明确指示直接执行，不自动选任务、不排程、不自行决定下一任务。
- 用户指定文件、对象或交付物后，只围绕当前对象执行；除非用户明确要求，否则不额外做任务发现、拆分、推荐或扩展到其他对象。
- 多任务按用户顺序逐个完成“实现、验证、日志追加”闭环后再进入下一个；若顺序有明显依赖风险，先提示再调整。
- 只做当前任务 `scope` 内的改动；如需跨 `scope`，须用户明确要求，并在汇报与日志中说明。

## 3. 编码与施工原则
### 编码前先思考

**不要妄下断言。不要掩饰困惑。把取舍讲清楚。**

实施前：
- 请明确陈述您的假设。如有疑问，请提出。
- 如果存在多种解释，请将它们提出来，不要默默地做出选择。
- 如果存在更简单的方法，请提出来。必要时要坚持自己的正确判断，不得为了迎合而采用更差方案。
- 如果有什么不清楚的地方，停下来。说出让你困惑的地方。然后提问或补充查证。
- 信息不足以支撑实施时，不得靠猜测补齐需求。

### 简单优先

**用最少的代码解决问题。不做任何推测性设计。**

- 不增加超出要求的功能。
- 不为一次性代码进行抽象。
- 不提供任何未被要求的“灵活性”或“可配置性”。
- 未出现明确需求、真实复用证据或可复现问题前，不得为低概率场景、假想未来需求或理论上的完整性增加分支、抽象或防御性代码。
- 实现以满足当前需求、便于理解和验证为准，不以覆盖假想边界或未来扩展为目标。
- 对没有现实发生依据的情况，不预先补错误处理。
- 如果 50 行能完成，就不要写成 200 行；若已写复杂，必须主动回退到更简单方案。

问问自己：“一位资深工程师会认为这过于复杂吗？”如果答案是肯定的，那就继续简化。

### 精准改动

**只改必须改的地方。只清理你自己造成的尾巴。**

编辑现有代码时：
- 不要“改进”相邻的代码、注释或格式。
- 不要重构没有问题的代码。
- 即使你的做法不同，也要保持与现有风格一致。
- 如果你发现无关的死代码，请指出来，不要删除它。

当你的改动留下孤儿项时：
- 删除因本轮修改而不再使用的导入项、变量、函数。
- 除非用户明确要求，否则不要删除已有的无效代码，也不要扩大清理范围。

判断标准：每一行改动后的代码，都应该直接追溯到用户的请求。

### 目标驱动执行

**定义成功标准。循环直至验证通过。**

将任务转化为可验证的目标：
- “添加验证” -> “补针对无效输入的验证，并确认全部通过”
- “修复漏洞” -> “先构造能够稳定复现该漏洞的验证，再修复并确认通过”
- “重构 X” -> “确保重构前后测试都通过”

对于多步骤任务，请简要说明计划：
```text
1. [步骤] -> verify: [检查项]
2. [步骤] -> verify: [检查项]
3. [步骤] -> verify: [检查项]
```

如果成功标准仍然模糊，不得直接开工，必须先澄清。

强成功标准能让你独立循环迭代。
弱标准（如“先做出来再说”）会让你不断回头澄清。

## 4. 验证、记录与落点
- 进度日志统一使用 `progress.md`，仅在末尾追加，不改写历史记录。
- 纯问答、只读检查、配置解释、方案讨论不视为“代码改动任务”；除非用户明确要求落文件，否则不强制更新进度日志或 `docs/`。
- 进度日志只在以下情况追加：实际修改仓库文件（包括创建、编辑、删除、移动、重命名文件或目录）、生成正式交付文档、或用户明确要求记录。
- 实际改动必须有对应验证；验证证据写入进度日志的 `### Testing`。若无可信验证入口，须明确说明缺口，不得把“未验证”说成“已可用”。
- 行为、配置、依赖发生正式改动，且该改动影响后续使用、部署、验证或协作时，必须同步更新 `docs/`；根目录必须存在 `docs/`，扩展文档统一放此目录。
- 本项目固定工作流：Desktop 负责需求分析、代码修改和 Git diff 审查；CLI 或集成终端负责执行 `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1`、本地启动和 `scripts/deploy.sh`。生产发布不得绕过部署脚本直接操作远程服务。
- 每完成一个需记录的任务追加一轮，多任务则连续追加，固定格式：
  - `## YYYY-MM-DD - Task: <description>`
  - `### What was done`：只写本轮完成了什么，按业务动作或结果概括，不按文件逐个展开。
  - `### Testing`
  - `### Notes`：必须列出改动文件清单，每个文件后用一句简要说明本轮改了什么；必须给出可执行的回滚方式或回滚点。

## 5. 高风险与边界
- 禁止全量格式化、全量转码、批量无差别替换。
- 改核心协议、内存地址、数据库结构须用户明确批准。
- 网络包处理、线程并发、鉴权/反作弊路径的改动须先得到用户确认。
- 尊重任务范围约束，保持文件原编码，避免破坏性操作。

## 6. 回复方式
- 本节固定回复结构主要用于阶段性汇报、施工结论、审稿结论；简单问答可直接短答，但必须先给明确结论。
- 默认面向业务人员、方案负责人、项目负责人，使用业务语言描述影响，采用便于快速判断、拍板、推进的汇报口吻。
- 先讲结论，再讲原因、风险、下一步。用户问“能不能做/施工/继续/是否通过”时，第一句直接给明确结论，不让用户从分析里猜。
- 默认优先回答四件事：现在能不能推进、卡点是什么、如果现在继续会出什么问题、下一步最小动作是什么。
- 固定结构输出：
  - `业务结论`
  - `原因`：只写影响结论的关键点，`2` 到 `4` 条。
  - `风险`：说明“如果现在就做，会出什么问题”。
  - `下一步`：只写最小可执行动作，不一次给过大方案。
- 每部分用短段落，先说明意思再补一句解释；不只给结论，也不堆细节。
- 阶段性汇报默认含两部分：刚完成了什么、下一步计划做什么；以业务场景和业务逻辑表述，保持简洁。

## 7. 技术依据
- 用户未明确要求源码细节时，函数名、类名、调用链、文件列表、行号只作补充依据，不放开头、不作主要表达。
- 仅在以下情况主动展开技术细节：用户明确要求、需证明结论不是主观判断、不给依据就无法支持结论。
- 同时给结论与依据时，先业务判断再技术依据；技术依据统一放最后，标题写为 `技术依据（按需阅读）`。
- 禁止为显得严谨而先输出大段逐文件、逐函数、逐调用链分析。

## 8. 工具与并行协作
- 工具选择以最小有效路径为准；代码开发、源码搜索、补丁编辑、测试执行和常规工程验证默认使用 Codex 自带工具。
- `desktop-commander` 仅用于跨盘/非工作区文件、目录整理，以及 PDF/Word/Excel 等本机文档处理；`Serena` 仅用于符号、引用、调用关系、结构概览和精确重命名等语义级代码理解。
- 多智能体并行修改须先划分独立文件或模块责任边界；同一文件默认串行执行。

<!-- CODEGRAPH_START -->
## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.
<!-- CODEGRAPH_END -->

# Memorix — Memory Tools for Active Workspaces

Use Memorix when the active workspace has Memorix tools available and prior context would materially help. For non-trivial coding work, Memory Autopilot is the default entry point before local progress notes or broad file exploration. Do not assume every workspace is configured for Memorix.

## Start with Memory Autopilot

Default first step for non-trivial coding work: call `memorix_project_context` with the user's actual task before progress files, dev-log reads, ad-hoc file reads, or git archaeology. Memorix will choose a task-lensed brief (bugfix, feature, release, onboarding, refactor, docs, test, or general). When the task is continuing prior work, the same brief also includes a bounded prior-work projection. Treat its "Start here" files as the first workspace files to inspect.

If the MCP tool is not visible yet but the client supports tool discovery or dynamic loading, search/select `memorix_project_context` first. Continuation fallback is mandatory: when the user asks to continue, resume, take over, or explain prior work and MCP cannot be called in this turn, run exactly one CLI brief with the user's real task before inspecting files, Git history, progress notes, or guessing: `memorix resume "<task>" --fallback --brief-json`. For a new task, use `memorix context "<task>" --fallback --brief-json` instead. The absence of `.memorix` or visible memory files never proves project memory is empty. Use `--json` only when a diagnostic needs the detailed legacy payload. If that one command fails, report it and proceed normally. Do not probe help, enumerate commands, chain broad searches, wait indefinitely on MCP startup, or hand-write tool-call syntax.

After a successful `memorix_project_context` result, the brief is the default retrieval boundary. Do not call more Memorix retrieval tools after a complete brief. Use `memorix_context_pack`, `memorix_search`, or `memorix_detail` only when the brief lacks a specific reference, freshness field, or fact needed for the task, or when the user explicitly asks for deeper history. In MCP, name that missing fact in `purpose` when intentionally expanding beyond the brief. Do not retrieve the same decision twice just to confirm an already-complete brief.
If the user asks for read-only work or says not to modify files, do not call `memorix_store` just to record an assessment. Store only when the user explicitly asks to preserve it.

## When to search memory

Use `memorix_graph_context` for explicit memory graph questions or broad graph overview after the autopilot brief is not enough.

Use `memorix_search` when prior workspace context would help and the Autopilot brief did not already answer the question — for example:
- The user asks about a past decision, bug, or change
- You need to understand why something was designed a certain way
- You're continuing work that started in a previous session

You do **not** need to search memory for simple, self-contained tasks (e.g., "fix this typo", "what does this function do").

If no memories exist yet, that’s fine — just proceed normally.

## When to store memory

Use `memorix_store` when you learn something a future session should not have to rediscover:

| What happened | Type |
|---|---|
| Architecture or design decision | `decision` |
| Bug found and fixed | `problem-solution` |
| Non-obvious pitfall or gotcha | `gotcha` |
| Configuration or dependency changed | `what-changed` |
| Trade-off discussed with conclusion | `trade-off` |

**Tips for good memories:**
- Use concise titles (~5-10 words)
- Include `filesModified` when relevant
- Use `topicKey` for topics that evolve over time (prevents duplicates)
- For "why" decisions, use `memorix_store_reasoning`
- For a stable fact, reusable procedure, or completed episode that merits deliberate long-term review, include `longTerm` in `memorix_store` with the appropriate kind and normally `scope: "project"`. It creates a candidate only: do not use it for routine updates, do not make project-derived evidence portable user memory, and do not assume it enters context until an operator qualifies and approves it through `memorix memory long-term`.
- A `user` + `portable` durable memory delivered in a task brief is intentionally available across projects. When it matches the task, use it as reusable background even if its origin differs; do not treat it as a current-project fact. Expand it only when needed with `memorix_detail` using its `durable:<id>` reference and a specific purpose.
- Record the user profile: the user’s role, expertise, preferences, and goals. Save these with `entityName: "user-profile"` and `visibility: "personal"` so they stay private and appear in every brief as the "who you are" context.

**Don't store:** greetings, simple file reads, trivial commands (ls, pwd, git status).

**Only store what a future session cannot re-derive.** Code structure, file contents, and Git history are live in the checkout — do not store facts already visible there. A memory earns its place by capturing the why, the context, or a conclusion the checkout alone cannot show.

**Record what worked, not only what failed.** Store validated approaches and explicit user confirmations alongside corrections. Saving only failures drifts behavior away from what the user already accepted; a clear "yes, that's right" is feedback worth keeping too.

**Recalled memory is a claim about the past.** A memory naming a specific file, function, or flag describes the past at write time — check the file exists or grep the symbol before recommending it. If the user says to ignore or not use memory, proceed as if memory were empty: do not apply, cite, compare, or mention stored content.

## When to resolve memory

Use `memorix_resolve` when a task is done or a bug is fixed. This keeps future searches focused on active work instead of surfacing completed items.

## End sessions with a summary

When a session finishes, call `memorix_session_end` with a short structured summary so the next agent can resume. Recommended sections:
- **Goal** — what this session was working on
- **Discoveries** — findings, gotchas, learnings
- **Accomplished** — completed items, plus PENDING items for the next session
- **Relevant Files** — paths and what changed

## Tools quick reference

| Tool | Use when |
|---|---|
| `memorix_project_context` | Start or continue coding work with the task-lensed Memory Autopilot brief |
| `memorix_context_pack` | Get structured refs/freshness for code-bound memories |
| `memorix_graph_context` | Build a compact memory graph packet for graph-specific questions |
| `memorix_search` | Find relevant past context |
| `memorix_detail` | Read full content of a specific memory |
| `memorix_store` | Save something worth persisting |
| `memorix_store_reasoning` | Save the "why" behind a decision |
| `memorix_resolve` | Mark completed/outdated memories |
| `memorix_session_start` | Load session context (handoff, orchestration coordination) |
| `memorix_evidence` | Check a memory source, freshness, and verification state |
| `memorix_feedback` | Record whether a memory helped, conflicted, or was corrected |
| `memorix_media` | Inspect or import controlled local media |
````
