---
title: claude/codex配置分享
date: 2026-05-25 19:18:24
categories:
  - 工具推荐
tags:
  - AI
  - Claude Code
  - Agent
---

# 前言

我个人在大学生活中的感受是：虽然有小部分人能勇争桥头，但大部分同学是与热门技术脱节的（无歧义）。我在计算机学院发现，很多同学对ai的使用还停留在和网页版豆包扯皮，更进一步的则是设法使用gpt或其他更好用的模型，有些人为了更好的体验会选择找代充开会员。但我认为，一方面，这些工具提供的生产力与我们专业的需要还是不够的。虽然体验起来可能觉得已经很强了，但和agent比起来差别太大了；另一方面，我不认为普通学生有场景用完会员的额度，相比之下，随用随买的token模式在我看来是更适合的（家庭条件好可以忽略）。

因此，我想要分享我对智能体的使用经验，希望能帮到同样想要尝试新技术的朋友。也希望大家能敢于尝试新事物，不要畏难（我帮助一位同学从头配置好了所有流程，但当我在命令行中唤出claude code时，他却觉得自己用不好命令行，主动放弃了，去找代充开网页端的会员）。

本文主要介绍三个方面：**cc-switch**（管理工具）、**skills**（技能插件）、**MCP**（模型上下文协议服务）。

---

# cc-switch

## 介绍

[cc-switch](https://github.com/farion1231/cc-switch) 是一个跨平台的桌面端 All-in-One 管理工具，支持 Claude Code、Codex、OpenCode、Gemini CLI 等多种 AI 编程 CLI 工具的统一管理。它的核心价值在于：**你不再需要手动编辑各种 JSON、TOML 配置文件**，所有操作都可以在图形界面中完成。

简单来说，cc-switch 就是这些命令行 AI 工具的"控制面板"。

## 具体功能

### 配置智能体

cc-switch 支持对 Claude Code / Codex 的 API Provider 进行可视化配置和一键切换。你可以：

- 配置多个 API 提供商（官方 Anthropic、OpenRouter、各种中转站等）
- 一键切换当前使用的模型和 Provider
- 管理 API Key，避免手动修改环境变量

对于使用中转 API 的同学来说，这个功能非常实用——不用每次都去改配置文件。

### 下载并管理skills

cc-switch支持下载并管理skills
![alt text](image-2.png)
点击发现技能即可进入下载页面，它会自行在Github中查找对应的仓库，点击安装即可进行自动下载并配置。（有些skills无法使用cc-switch安装，点击安装左侧的查看即可跳转到GitHub下载，安装好后在cc-switch选择导入已有即可进行管理）

![alt text](image-3.png)

### 管理MCP

cc-switch 提供了 MCP Server 的可视化管理界面，可以方便地添加、启用、禁用各种 MCP 服务，不需要手动编辑 `settings.json`。

![alt text](image-1.png)

### 管理历史对话

cc-switch 可以浏览和搜索 Claude Code 的历史会话记录，方便你回顾之前的工作内容。

![alt text](image.png)

### 管理提示词

支持管理自定义的系统提示词（System Prompt），可以为不同项目或场景配置不同的提示词模板，实现快速切换。

---

# skills推荐

skills更多的是根据自己工作的方向进行配置，这里附带一份我自己的配置供参考。

注：有些skills用cc-switch无法下载，需要自己手动安装。而我发现Claude code在GitHub上的生态远好于codex，建议大家用Claude-code下载，然后在cc-switch中 Skills 管理 -》 导入已有 -》 勾选其他智能体。

## karpathy-guideline

**仓库地址**：[forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)

这是一个源自 Andrej Karpathy（前 Tesla AI 总监、OpenAI 联合创始人）对 LLM 编程陷阱观察的 CLAUDE.md 配置文件。它通过四条核心原则来约束 AI 的编码行为：

1. **先读再写**：修改代码前必须先阅读相关文件，理解上下文
2. **最小改动**：只做必要的修改，不要过度重构
3. **保持简单**：避免过度工程化，不引入不必要的抽象
4. **验证有效**：改完之后要验证代码能正常工作

简单来说，它让 AI 从一个"过度自信的初级程序员"变成一个"有纪律的工程师"。这个 skill 几乎是必装的，能显著减少 AI 写代码时的"幻觉"和过度修改问题。

## prompt-optimizer

**仓库地址**：[Hashaam101/prompt-optimizer](https://github.com/Hashaam101/prompt-optimizer)

这个 skill 有两种模式：

- **自动模式（auto）**：在你每次输入 prompt 时，它会在后台静默优化你的提示词，让 AI 更好地理解你的意图
- **手动模式（manual）**：通过 `/optimize` 命令，将你写的粗略 prompt 转化为结构化的、高质量的提示词

对于不太擅长写 prompt 的同学来说，这个 skill 能帮你把"帮我写个登录页面"这样模糊的需求，自动补充为包含技术栈、样式要求、错误处理等细节的完整指令。

## baoyu-format-markdown

**仓库地址**：[JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills)

这个 skill 用于将纯文本或格式混乱的 Markdown 文件整理为结构清晰、排版规范的格式。它会：

- 添加和规范化 frontmatter（标题、摘要等元信息）
- 规范标题层级
- 添加适当的加粗、列表、代码块
- 处理中英文之间的空格（CJK spacing）
- 保持原始内容不变，只优化格式

写博客、整理笔记的时候非常好用。输出文件为 `{filename}-formatted.md`。

## agent-browser

**仓库地址**：[vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)

这是 Vercel Labs 推出的浏览器自动化 CLI 工具，专为 AI Agent 设计。安装后，Claude Code 就能：

- 打开网页并导航
- 读取页面内容
- 填写表单、点击按钮
- 截图
- 执行端到端测试

它使用基于 ref（引用标记）的交互方式，比传统的 CSS 选择器更可靠。当你需要 AI 帮你查资料、测试网页、或者做一些需要浏览器的操作时，这个 skill 就派上用场了。

---

# MCP

注意：MCP与skills不同，它会占据上下文的大小，所以不建议同一时间开太多。MCP（Model Context Protocol）是 Anthropic 推出的开放标准，可以理解为"AI 的 USB-C 接口"——让 AI 能够标准化地连接各种外部工具和数据源。

## codegraph

**仓库地址**：[aStudioPlus/codegraph](https://marketplace.visualstudio.com/items?itemName=aStudioPlus.codegraph)

CodeGraph 会对你的代码库进行 AST（抽象语法树）解析，构建一个包含函数、类、导入关系、调用链的语义图谱。支持 37+ 种编程语言。

主要能力：
- **符号搜索**：快速定位函数/类的定义位置
- **调用链追踪**：查看谁调用了某个函数、某个函数又调用了谁
- **影响分析**：修改某个符号时，分析哪些代码会受影响
- **代码探索**：一次调用就能获取多个文件的相关源码，替代反复 grep + read 的低效循环

对于大型项目来说，codegraph 能让 AI 更快地理解代码结构，减少不必要的文件读取，节省上下文空间。

## GitHub MCP Server

**来源**：GitHub 官方维护

GitHub MCP Server 让 AI 能够直接与 GitHub 平台交互，提供 90+ 种工具，包括：

- 创建和管理 Issue、Pull Request
- 搜索代码和仓库
- 读取文件内容和提交历史
- 管理 Branch 和 Release
- 操作 GitHub Actions

配置方式：
```bash
claude mcp add github --scope user
```

对于日常开发来说，有了它你可以直接让 AI 帮你创建 PR、查看 Issue、搜索相关代码，不用再手动切换到浏览器操作。

## agentmemory

**仓库地址**：[kishan0725/AgentMemory](https://github.com/kishan0725/AgentMemory)

AI 编程工具的一个痛点是：每次新会话都会"失忆"。agentmemory 通过 MCP 协议为 AI 提供持久化记忆能力：

- **跨会话记忆**：上一次对话中做的决策、偏好设置，下次还能记住
- **项目上下文**：记住项目的架构决策、技术选型、编码规范
- **本地存储**：所有数据存在本地，不上传到云端，保护隐私

有了它，AI 不会每次都问你"这个项目用什么框架"、"你喜欢什么代码风格"这类重复问题。

---

# 总结

| 类型 | 工具 | 一句话描述 |
|------|------|-----------|
| 管理工具 | cc-switch | 图形化管理 Claude Code/Codex 的一切配置 |
| Skill | karpathy-guideline | 让 AI 写代码更有纪律 |
| Skill | prompt-optimizer | 自动优化你的提示词 |
| Skill | baoyu-format-markdown | 一键美化 Markdown 格式 |
| Skill | agent-browser | 让 AI 能操作浏览器 |
| MCP | codegraph | 代码语义图谱，加速代码理解 |
| MCP | GitHub MCP Server | 直接操作 GitHub |
| MCP | agentmemory | 跨会话持久记忆 |

这套配置的核心思路是：**用 cc-switch 降低配置门槛，用 skills 增强 AI 的行为质量，用 MCP 扩展 AI 的能力边界**。

如果你是刚接触 AI 编程工具的同学，建议按这个顺序来：先装 cc-switch 把环境配好，再装 karpathy-guideline 这个基础 skill，然后根据自己的需要逐步添加其他插件。不要一次性全装上——记住 MCP 会占上下文，按需开启就好。