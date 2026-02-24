---
title: 修复 MyBatis-Plus 在 Spring Boot 3 下的 IllegalArgumentException
date: 2026-02-23 16:31:26
categories:
  - 踩坑
tags:
  - Spring Boot
  - MyBatis-Plus
  - 依赖冲突
---

## 背景

在将项目升级到 **Spring Boot 3.2.x + Java 17** 后，项目在启动阶段直接退出，没有
`Exception in thread "main"` 或 `Caused by`，导致问题难以定位。

最初怀疑过：
- Knife4j / Swagger
- Hutool 工具类
- 枚举定义
- 配置文件错误

但检查后发现都不是原因。

---

## 报错信息

开启 `DEBUG` 日志后，启动过程中出现如下关键信息：

```text
Creating MapperFactoryBean with name 'userMapper'
...
Exception encountered during context initialization - cancelling refresh attempt:
java.lang.IllegalArgumentException:
Invalid value type for attribute 'factoryBeanObjectType': java.lang.String
```

随后 Spring 容器初始化被中断，程序直接退出。

这个异常没有堆栈向下追踪信息。

## 排查过程

### 1. 确认异常类型

程序属于：

* **启动阶段直接退出（exit）**
* 而不是卡死或运行时报错

说明问题发生在 **Spring 容器初始化早期阶段**。

---

### 2. 锁定异常位置

从日志可以确认异常发生在：

```text
MapperFactoryBean 创建阶段
```

并且与 **MyBatis Mapper 扫描** 直接相关。

---

### 3. 检查依赖树

执行命令：

```bash
mvn dependency:tree | findstr mybatis
```

输出如下：

```text
com.baomidou:mybatis-plus-boot-starter:3.5.9
└── org.mybatis:mybatis-spring:2.1.2
```

这里发现了一个关键问题：

> **mybatis-spring 2.1.2 是为 Spring 5 设计的**
>
> **而 Spring Boot 3 使用的是 Spring Framework 6**

---

### 4. 问题本质

Spring Framework 6 对 `FactoryBean` 的类型推断规则进行了严格校验：

*  不再接受 `String` 类型的 `factoryBeanObjectType`
*  必须是 `Class<?>`

而 `mybatis-spring 2.x` 内部仍使用旧方式注册 Bean 元数据，导致 Spring 6 直接抛出：

```text
Invalid value type for attribute 'factoryBeanObjectType'
```

由于这是 **容器元数据校验失败**，并非运行期异常，因此不会有常见的 `Caused by` 堆栈。

---

## 解决方案

### 1. 排除不兼容的 mybatis-spring

在 `mybatis-plus-boot-starter` 中排除旧依赖：

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.9</version>
    <exclusions>
        <exclusion>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis-spring</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

---

### 2. 手动引入 Spring 6 兼容版本

```xml
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-spring</artifactId>
    <version>3.0.3</version>
</dependency>
```

---

### 3. 清理并重新构建

```bash
mvn clean
```

然后在 IDEA 中重新刷新 Maven 依赖。

---

### 4. 验证修复结果

再次执行：

```bash
mvn dependency:tree | findstr mybatis-spring
```

确认只存在：

```text
org.mybatis:mybatis-spring:3.0.3
```

项目即可正常启动。

---

## 总结

这次问题的几个特点：

* 无 `Caused by`
* 无 `main` 线程异常
* 代码本身正确
* 只在 **Spring Boot 3 + MyBatis** 组合下触发
*  **依赖版本与 Spring 6 不兼容**

经验教训：

> **升级到 Spring Boot 3 后，所有底层框架都必须确认是否已支持 Spring Framework 6**

尤其是：

* MyBatis / MyBatis-Plus
* Swagger / Knife4j
* Spring Security 相关组件

否则非常容易踩到这种“启动即退出”的隐蔽问题。