---
title: 沙箱初步认识
date: 2025-11-13 12:00:00
categories:
  - 学习笔记
tags:
  - 沙箱
  - 安全
---

# 为什么要学沙箱
第一次接触这个概念是因为Python的期末大作业，老师让我们写一个python学习的平台。

我想到模仿[FreeCodecamp](https://www.freecodecamp.org/)，写一个可以通过程序二次运行python代码的平台。

之前也没有相关的经验，我便将自己的想法发给ai，让它告诉我需要用到什么，也就接触到了沙箱--用于防止别人在执行代码时对程序(或电脑)造成破坏。
# 概念
沙箱（Sandboxing）是一种用于隔离环境的技术。
# 用途
沙箱技术通常用于以下几类场景：

- **在线代码运行平台**：如 LeetCode、FreeCodeCamp、自建 OJ 系统
- **浏览器隔离**：Chrome 的每个 tab 页就是一个沙箱进程
- **移动端应用权限管理**：iOS、Android 对 App 的文件访问就是沙箱设计
- **恶意软件分析**：将样本放在沙箱中运行，观察行为
- **插件系统**：比如浏览器扩展、VSCode 插件，都不能直接访问用户系统
- **安全研究和渗透测试**有专门做沙箱业务的公司

这些场景的共同点就是：“**运行不可信代码**”，而沙箱的职责就是“**让它尽量跑得动，但伤不到我**”。

# 分类
根据隔离程度不同，可以粗略分成三类：

### 1. 语言级沙箱（最轻量）
依赖语言本身的机制进行限制。

- Python 的 `ast`、受控 namespace
- JavaScript 的 `vm2`
- Lua 沙箱化 runtime

优点：实现简单，启动快  
缺点：很容易被绕过，安全性弱

### 2. 系统级沙箱（中等级别）
依赖操作系统提供的隔离机制：

- Linux cgroups（限制资源）
- namespace（隔离进程、文件系统、网络）
- seccomp（限制系统调用）
- Docker / LXC（容器）

优点：安全性高、性能好  
缺点：实现较复杂，需要系统层面的支持

### 3. 虚拟化级沙箱（最高隔离）
原来我用过这么久沙箱...

- KVM
- QEMU
- Firecracker（AWS Lambda 用的）
- VirtualBox

优点：隔离性能好
缺点：启动慢、消耗资源大，不适合大量高频的代码执行

# 实现模板

## Java
java.lang.SecurityManager是Java的一个可插拔的安全策略执行器，用于在运行时对敏感操作（如文件读写、网络访问、反射调用、类加载等）进行权限检查。

当某段代码执行特权操作时，JVM 会调用 SecurityManager.checkXXX() 方法（如 checkRead, checkConnect, checkPermission 等），若未授权，则抛出 SecurityException。

虽然“安全管理员多年来一直不是保护客户端 Java 代码的主要手段，也很少用于保护服务器端代码，并且维护成本很高。”（官方回复），导致这个类在JDK17后被淘汰了，但作为新手去学习依旧足够了。
## Python
目前还在写(前文提到的)，先插个眼 

TODO

# 一些开源的沙盒项目
https://github.com/sandboxie-plus/Sandboxie Sandboxie 允许您创建几乎无限的沙箱并单独或同时运行它们，以将程序与主机隔离并相互隔离，同时还允许您在单个盒子中同时运行任意数量的程序。

https://github.com/alibaba/jvm-sandbox
JVM-SANDBOX（沙箱）实现了一种在不重启、不侵入目标JVM应用的AOP解决方案。


