---
title: MySQL登录时密码没错却无法登录
date: 2025-10-23 12:00:00
categories:
  - 踩坑
tags:
  - MySQL
  - 踩坑
  - 数据库
---

# 前言

网上关于“MySQL密码正确却无法登录”的解决方案很多，比如跳过权限验证、重置 root 密码、检查插件认证方式等。但在我遇到的问题中，这些方法都不适用——因为**根本不是密码错了，而是连错了实例**。  
这里记录一下我的“乌龙”经历，希望能帮到踩了同样坑的朋友。

# 正文

## 情况描述

我在本地安装并配置好 MySQL 后，成功设置了 root 密码，并正常使用了一段时间。  
但第二天再次尝试登录时，执行：

```bash
mysql -u root -p
```
却出现
```bash
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
```

于是按照网上的教程重置了密码，登录就成功了，我便没有深究。

然而，当我为了修改数据库默认编码（utf8mb4）而编辑 my.ini 文件并重启 MySQL 后，发现之前创建的数据库和表全都不见了！

## 病因分析
经过反复排查，终于发现问题根源：

我之前退出 MySQL 客户端时，直接关闭了命令行窗口，没有输入 exit 或 \q 正常退出。
第二天执行 mysql -u root -p 时，系统自动启动了一个新的、干净的 MySQL 实例（或连接到了另一个实例），而这个实例的 root 用户密码是空的（或默认值），和我之前配置的实例不是同一个！ 

更具体地说：

我本地可能同时存在两个 MySQL 服务

## 解决办法
### ✅ 1. 确认当前连接的是哪个 MySQL 实例

登录后执行：
```bash
SHOW VARIABLES LIKE 'datadir';
```

查看数据目录。对比你之前配置的 my.ini 中的 datadir 路径是否一致。

### ✅ 2. 检查 MySQL 服务状态

在 Windows 上：
```bash
sc query mysql
# 或
net start
```

看是否有多个 MySQL 服务在运行（如 MySQL80、MySQL 等）。

在 Linux/macOS 上：
```bash
ps aux | grep mysqld
```

### ✅ 3. 确保只启动一个 MySQL 服务

停止所有 MySQL 进程(把不是你需要的服务删除了)，然后手动启动你配置过的那个实例：

Windows（以管理员身份）
```bash
net stop MySQL80
mysqld --defaults-file="C:\path\to\my.ini"
```

### ✅ 4. 使用明确的连接方式

如果你有多个实例，建议通过指定端口或 socket 连接：
```bash
mysql -u root -p -P 3306 --protocol=tcp
```

### ✅ 5. 避免“直接关窗口”

虽然直接关闭命令行通常不会导致数据丢失，
但养成输入 exit 退出的习惯，有助于你更清楚当前会话状态。

# bb
如果所有方法试过之后都不好用，重装可以解决你的一切烦恼(认真)