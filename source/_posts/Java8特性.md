---
title: '''Java8特性'''
date: 2025-12-16 13:47:43
categories:
  - 学习笔记
tags:
  - Java
---

> 本文总结 Java 8 中最常用、最核心的三项特性：Lambda 表达式、Stream API 与 Optional。内容以“已学过、快速回顾与查阅”为目标，侧重概念理解与典型用法。

---

## 目录导航

* [1. Lambda 表达式](#1lambda表达式)
* [2. Stream API](#2stream-api)
* [3. Optional](#3optional)

---

# 1.Lambda表达式

## 1.简介

Lambda 表达式是 Java 8 引入的一种匿名函数语法，用于简化只有一个抽象方法的接口（函数式接口）的实现方式。它本质上是一段可以被传递和执行的代码，使 Java 在一定程度上具备了函数式编程的特征。

在 Java 8 之前，若要实现接口通常需要使用匿名内部类，代码冗长且可读性较差。Lambda 表达式通过更简洁的语法，使“做什么”比“怎么写”更加直观。

## 2.作用

Lambda 表达式的主要作用包括：

1. 简化代码结构
   使用 Lambda 可以显著减少匿名内部类的样板代码，使核心逻辑更加突出。

2. 提高可读性
   在集合操作、事件回调等场景中，Lambda 能让代码更加贴近自然语言描述。

3. 支持函数式编程风格
   Lambda 是 Stream API、Optional 等特性的基础，使 Java 能以声明式方式处理数据。

## 3.使用

Stream 的典型使用流程为：

1. 获取 Stream
2. 中间操作（可选，可多次）
3. 终止操作

示例：

```java
List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);

int sum = list.stream()
        .filter(x -> x % 2 == 0)
        .map(x -> x * x)
        .reduce(0, Integer::sum);
```

常见中间操作：

* filter
* map
* sorted
* distinct

常见终止操作：

* forEach
* collect
* reduce
* count

需要注意：

* Stream 只能被消费一次
* Stream 操作是惰性执行的，只有遇到终止操作才会真正执行

## 4.示例

将传统集合遍历方式改写为 Stream 写法：

```java
List<String> names = Arrays.asList("Tom", "Jerry", "Alice", "Bob");
List<String> result = new ArrayList<>();

for (String name : names) {
    if (name.length() > 3) {
        result.add(name.toUpperCase());
    }
}
```

使用 Stream 改写后：

```java
List<String> result = names.stream()
        .filter(name -> name.length() > 3)
        .map(String::toUpperCase)
        .collect(Collectors.toList());
```

Stream 写法将“过滤—转换—收集”的数据处理流程清晰地表达出来，避免了显式的循环和临时变量。

[返回顶部](#目录导航)

---

# 2.Stream API

## 1.简介

Stream API 是 Java 8 提供的一套用于操作集合数据的全新抽象。Stream 并不是数据结构，而是一种对数据源（如集合、数组）的高层次操作视图。

Stream 强调“做什么”，而非“如何遍历”，通过链式调用的方式完成对数据的处理。

## 2.作用

Stream API 的主要作用包括：

1. 简化集合操作
   过滤、映射、排序、聚合等操作可以用一行链式代码完成。

2. 提高代码表达力
   使用 Stream 可以清晰表达数据处理流程，减少中间变量。

3. 支持并行处理
   通过 parallelStream()，可以较低成本地利用多核 CPU 提升性能。

## 3.使用

Stream 的典型使用流程为：

1. 获取 Stream
2. 中间操作（可选，可多次）
3. 终止操作

示例：

```
List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);

int sum = list.stream()
        .filter(x -> x % 2 == 0)
        .map(x -> x * x)
        .reduce(0, Integer::sum);
```

常见中间操作：

* filter
* map
* sorted
* distinct

常见终止操作：

* forEach
* collect
* reduce
* count

需要注意：

* Stream 只能被消费一次
* Stream 操作是惰性执行的，只有遇到终止操作才会真正执行

[返回顶部](#目录导航)

---

# 3.Optional

## 1.简介

Optional 是 Java 8 引入的一个容器类，用于显式表示“可能为空”的值。它的出现旨在减少空指针异常（NullPointerException），并引导开发者以更加安全的方式处理空值。

Optional 本身并不是为了解决所有 null 问题，而是作为一种 API 设计层面的约束和提示。

## 2.作用

Optional 的主要作用包括：

1. 减少空指针异常
   通过强制检查或处理空值，降低运行时错误风险。

2. 提高代码可读性
   方法返回 Optional，可以明确告诉调用者：返回值可能不存在。

3. 鼓励函数式写法
   Optional 与 Lambda 配合使用，可避免大量的 if-null 判断。

## 3.使用

创建 Optional 的常见方式：

```java
Optional<String> op1 = Optional.of("Java");
Optional<String> op2 = Optional.ofNullable(null);
Optional<String> op3 = Optional.empty();
```

常用方法示例：

1. 判断是否有值

```java
op1.isPresent();
```

2. 获取值（不推荐直接使用）

```java
op1.get();
```

3. 提供默认值

```java
String s = op2.orElse("default");
```

4. 使用 Lambda 处理

```java
op1.ifPresent(v -> System.out.println(v));
```

## 4.示例

将传统的空值判断代码改写为 Optional 写法：

```java
String value = getValue();
if (value != null) {
    System.out.println(value.length());
}
```

使用 Optional 改写后：

```java
Optional.ofNullable(getValue())
        .map(String::length)
        .ifPresent(System.out::println);
```

Optional 通过链式调用，将空值判断与业务逻辑合并，使代码更加紧凑且不易出错。

[返回顶部](#目录导航)
