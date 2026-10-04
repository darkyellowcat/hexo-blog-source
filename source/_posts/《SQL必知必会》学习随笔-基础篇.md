---
title: 《SQL必知必会》学习随笔-基础篇：SQL 基础与 MySQL 执行流程
date: 2026-07-17 12:00:28
categories:
  - 学习笔记
tags:
  - SQL
  - MySQL
  - 数据库
---

# 前言

在这里推荐一下 [my-geektime](https://github.com/zkep/my-geektime)，里面收录了不少开发类学习资料，我一般把它当作在线阅读索引使用。

[《SQL 必知必会》专栏地址](https://uaxe.github.io/geektime-docs/%E5%90%8E%E7%AB%AF-%E6%9E%B6%E6%9E%84/SQL%E5%BF%85%E7%9F%A5%E5%BF%85%E4%BC%9A/SQL%E5%BF%85%E7%9F%A5%E5%BF%85%E4%BC%9A/)

作者将课程分成了四个模块：

- **基础篇**：以 NBA 球队、球员数据和游戏数据为案例，讲解 SQL 基础语法；
- **进阶篇**：从执行效率出发，分析常见的 SQL 性能问题；
- **高级篇**：介绍不同关系型数据库管理系统中的 SQL 使用场景；
- **实战篇**：把前面的内容用于数据清洗、数据集成和分析项目。

这篇文章按照作者的思路整理基础篇，但我会重新调整顺序，省略一部分太基础的语法，并补上我自己查资料后对原笔记的修正。如有漏误，欢迎指正。

{% asset_img sql-query-pipeline.png SQL查询执行流程 %}

# SQL 基本概念

## SQL 语言的常见分类

学习资料中通常会把 SQL 按功能分成下面几类：

| 分类 | 英文 | 主要用途 | 常见语句 |
| --- | --- | --- | --- |
| DDL | Data Definition Language | 定义数据库对象 | `CREATE`、`ALTER`、`DROP` |
| DML | Data Manipulation Language | 新增、修改和删除数据 | `INSERT`、`UPDATE`、`DELETE` |
| DQL | Data Query Language | 查询数据 | `SELECT` |
| DCL | Data Control Language | 权限与安全控制 | `GRANT`、`REVOKE` |
| TCL | Transaction Control Language | 控制事务 | `COMMIT`、`ROLLBACK`、`SAVEPOINT` |

不同资料的分类方式可能略有差异，例如有些资料会把 `SELECT` 也归入广义的 DML。这类分类主要是为了学习方便，不必太纠结边界。

## 大小写与命名风格

SQL 关键字通常不区分大小写，但为了可读性，我习惯：

- 表名、表别名、字段名和字段别名使用小写；
- SQL 关键字和内置函数使用大写；
- 字符串使用单引号包裹。

```sql
SELECT name, hp_max
FROM heros
WHERE role_main = '战士';
```

这是一种代码风格，不是所有数据库都强制要求。标识符是否区分大小写，还会受到数据库类型、操作系统和是否使用引号等因素影响，所以团队最好统一规范。

## 关系型数据库与 NoSQL

关系型数据库建立在关系模型之上，使用表、行、列和约束来组织数据，常见产品包括 MySQL、PostgreSQL、Oracle 和 SQL Server。

NoSQL 一般指非关系型数据库，常见类型包括：

- 键值数据库；
- 文档数据库；
- 列族数据库；
- 图数据库；
- 搜索与分析引擎。

它们不是简单的“先进”和“落后”关系。关系型数据库擅长事务、约束和复杂查询，NoSQL 往往针对特定访问模式、扩展方式或数据结构进行优化。实际选型还是要看业务需求。

# MySQL 中一条 SQL 如何执行

MySQL 采用客户端/服务器架构。客户端建立连接并发送 SQL，服务器完成解析、优化和执行，存储引擎负责真正读取或写入数据。

为了便于理解，可以把一次查询粗略分成下面几步：

1. **连接与权限上下文**：建立连接、认证用户，并准备会话环境；
2. **解析与语义检查**：检查语法，识别表、字段和表达式；
3. **查询优化**：选择表连接顺序、访问方式和可用索引；
4. **执行**：执行器调用存储引擎接口读取数据；
5. **返回结果**：将结果集发送给客户端。

需要修正原笔记中的一点：MySQL 5.7 还保留查询缓存，但默认关闭；MySQL 8.0 已经移除了查询缓存。因此在 MySQL 8.0 的执行流程中，不应该再把“查询缓存”作为固定步骤。

优化器给出的执行计划不一定永远最优，因为它依赖统计信息和成本估算。遇到慢查询时，应该使用 `EXPLAIN` 或 `EXPLAIN ANALYZE` 检查实际访问方式，而不是只凭 SQL 表面判断。

# SELECT 的书写顺序与逻辑顺序

## 书写顺序

常见查询的书写顺序如下：

```sql
SELECT ...
FROM ...
JOIN ... ON ...
WHERE ...
GROUP BY ...
HAVING ...
ORDER BY ...
LIMIT ...;
```

## 逻辑处理顺序

从理解查询的角度，可以近似记成：

```text
FROM / JOIN
-> WHERE
-> GROUP BY
-> HAVING
-> SELECT
-> DISTINCT
-> ORDER BY
-> LIMIT
```

这个顺序主要帮助我们理解为什么：

- `WHERE` 中通常不能直接使用当前层 `SELECT` 定义的别名；
- `HAVING` 可以过滤聚合后的分组；
- `ORDER BY` 通常可以使用 `SELECT` 中的别名。

它不是 MySQL 源码中每一步的机械执行顺序。优化器可能重写查询，只要最终语义保持一致。

# 常见查询细节

## 为什么生产代码不推荐随手写 SELECT *

`SELECT *` 在临时查看数据时很方便，但在正式查询中有几个问题：

- 读取不需要的列，增加网络传输和对象映射开销；
- 表结构新增字段后，接口返回可能悄悄发生变化；
- 无法直接看出查询真正依赖哪些字段；
- 在部分场景下不利于使用覆盖索引。

因此业务代码中最好明确列名：

```sql
SELECT id, name, hp_max
FROM heros
WHERE role_main = '战士';
```

## 常见函数分类

内置函数可以粗略分为：

- 数值函数；
- 字符串函数；
- 日期与时间函数；
- 类型转换函数；
- 聚合函数；
- 窗口函数。

不同数据库的函数名和行为可能不同，特别是日期处理、字符串拼接和类型转换，迁移数据库时要重点检查。

## WHERE 与 HAVING 的区别

`WHERE` 在分组和聚合之前过滤数据行，`HAVING` 在分组之后过滤分组结果。

```sql
SELECT role_main, COUNT(*) AS hero_count
FROM heros
WHERE hp_max > 5000
GROUP BY role_main
HAVING COUNT(*) >= 3;
```

能放进 `WHERE` 的普通条件通常应该尽量提前过滤，以减少后续需要参与分组的数据量。

## IN 与 EXISTS 怎么选

常见写法如下：

```sql
SELECT *
FROM a
WHERE a.cc IN (SELECT b.cc FROM b);
```

```sql
SELECT *
FROM a
WHERE EXISTS (
    SELECT 1
    FROM b
    WHERE b.cc = a.cc
);
```

原笔记使用“外表大就用 `IN`，外表小就用 `EXISTS`”来判断，这个经验过于绝对。现代优化器可能把两种写法改写成相近的半连接计划，实际性能还取决于索引、数据分布、空值、选择性和数据库版本。

更稳妥的做法是：

1. 先保证写法表达正确语义；
2. 给关联列建立合适索引；
3. 使用 `EXPLAIN ANALYZE` 对真实数据进行比较。

另外，`NOT IN` 遇到 `NULL` 时容易产生不符合直觉的结果。需要排除不存在的数据时，我通常更倾向于明确处理空值，或使用 `NOT EXISTS`。

# 视图

视图可以理解为保存下来的查询。普通视图通常不单独保存查询结果，而是在使用时基于底层表执行对应 SQL。

它的常见作用包括：

1. **简化查询**：把复杂连接和计算封装起来；
2. **复用逻辑**：让多个调用方使用同一套查询定义；
3. **控制暴露字段**：只向特定用户开放允许访问的列；
4. **兼容接口**：底层表变化时，通过视图保持上层查询相对稳定。

视图是否可更新取决于数据库和视图定义。包含聚合、分组、`DISTINCT`、集合运算或复杂连接的视图通常不能直接更新，不能简单认为“所有视图都只读”或“所有单表视图都可写”。

# 存储过程

存储过程是保存在数据库服务器中的一组 SQL 和流程控制语句。创建后可以像调用函数一样执行。

下面用 MySQL 存储过程计算从 1 到 `n` 的累加值：

```sql
DELIMITER //

CREATE PROCEDURE add_num(IN n INT)
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE total INT DEFAULT 0;

    WHILE i <= n DO
        SET total = total + i;
        SET i = i + 1;
    END WHILE;

    SELECT total;
END //

DELIMITER ;
```

MySQL 存储过程常见参数类型：

| 参数类型 | 作用 |
| --- | --- |
| `IN` | 向存储过程传入参数 |
| `OUT` | 把存储过程中的结果返回给调用方 |
| `INOUT` | 同时作为输入和输出参数 |

存储过程的优点是靠近数据、便于封装固定数据库逻辑；缺点是数据库方言差异大、调试和版本管理不如应用代码方便，也容易把业务逻辑过度集中到数据库中。

因此它并不是“高并发一定不能用”，而是需要结合团队维护能力、数据库压力、部署方式和扩展需求判断。

# 游标

SQL 更擅长面向集合处理，游标则允许逐行读取查询结果。它适合确实需要逐条处理的场景，但如果能用一条集合 SQL 完成，通常不要优先写游标。

下面是 MySQL 存储过程中的一个示例，用游标累计所有英雄的最大生命值：

```sql
DELIMITER //

CREATE PROCEDURE calc_hp_sum()
BEGIN
    DECLARE done BOOLEAN DEFAULT FALSE;
    DECLARE hp INT;
    DECLARE hp_sum BIGINT DEFAULT 0;

    DECLARE cur_hero CURSOR FOR
        SELECT hp_max FROM heros;

    DECLARE CONTINUE HANDLER FOR NOT FOUND
        SET done = TRUE;

    OPEN cur_hero;

    read_loop: LOOP
        FETCH cur_hero INTO hp;

        IF done THEN
            LEAVE read_loop;
        END IF;

        SET hp_sum = hp_sum + hp;
    END LOOP;

    CLOSE cur_hero;
    SELECT hp_sum;
END //

DELIMITER ;
```

原笔记中写了 `DEALLOCATE cursor_name`，这不是 MySQL 存储过程游标的语法。MySQL 游标使用 `DECLARE`、`OPEN`、`FETCH` 和 `CLOSE`，并且只能在存储程序中声明。

# 数据库设计：原则不是越少越好

原文提到了“三少一多”，但如果直接记成“表越少越好、字段越少越好、外键越多越好”，很容易走向另一个极端。

我现在更愿意把数据库设计理解成下面几条平衡原则。

## 一个表尽量表达一个清晰主题

表不是越少越好。把用户、订单、商品全部塞进一张大表，虽然表少了，但会产生大量重复数据和更新异常。

合理拆表的目标是让实体和关系清晰，同时避免为了“看起来规范”而拆出大量没有实际价值的小表。

## 字段需要保持原子性和明确含义

字段也不是越少越好。应该避免把多个含义塞进一个字符串字段，也要谨慎保存能够稳定计算出的重复数据。

但在读取压力大、计算成本高的场景中，适度冗余又可能是合理优化。关键是明确一致性如何维护。

## 主键要稳定，联合主键不要滥用

主键应当唯一、非空并尽量稳定。联合主键不是错误，但字段过多会让外键引用、索引和应用代码变复杂。

## 外键约束要结合架构选择

外键能保证引用完整性，但也会增加写入和迁移时的约束。在单体系统或数据一致性要求高的系统中，外键很有价值；在分库分表或跨服务场景中，关系可能需要由应用和审计机制维护。

# 多表连接：优先使用显式 JOIN

旧式写法常把多张表放在 `FROM` 中，再在 `WHERE` 中写连接条件：

```sql
SELECT h.name, r.role_name
FROM heros h, roles r
WHERE h.role_id = r.id;
```

现在更推荐显式 `JOIN ... ON ...`：

```sql
SELECT h.name, r.role_name
FROM heros AS h
JOIN roles AS r ON r.id = h.role_id;
```

显式 `JOIN` 能把连接条件和过滤条件分开，层次更清晰，也能减少漏写连接条件导致笛卡尔积的风险。

`NATURAL JOIN` 和 `USING` 虽然更短，但会依赖同名列。表结构变化后可能悄悄改变连接行为，所以在业务 SQL 中我更倾向于明确写出 `ON` 条件。

# MySQL 5.7 与 8.0 的几个重要区别

MySQL 8.0 相比 5.7 的变化很多，这里只记我认为最常见的部分：

| 方面 | MySQL 5.7 | MySQL 8.0 |
| --- | --- | --- |
| 查询缓存 | 保留，但默认关闭 | 已移除 |
| 默认字符集 | `latin1` | `utf8mb4` |
| 窗口函数 | 不支持 | 支持 |
| 公用表表达式 CTE | 不支持 | 支持 `WITH`，包括递归 CTE |
| 数据字典 | 主要依赖文件和系统表 | 使用事务型数据字典 |
| 默认认证插件 | `mysql_native_password` | 早期 8.0 默认使用 `caching_sha2_password` |

从 5.7 升级到 8.0 时，除了语法和功能，还要检查字符集、排序规则、保留字、认证方式和已废弃配置，不能只看 SQL 能不能执行。

# COUNT(*)、COUNT(1) 与 COUNT(字段)

这三个写法最重要的区别不是谁更快，而是语义。

- `COUNT(*)`：统计结果集中的行数；
- `COUNT(1)`：表达式 `1` 对每一行都不为 `NULL`，通常也统计行数；
- `COUNT(column)`：只统计该字段不为 `NULL` 的行数。

在 MySQL InnoDB 中，`COUNT(*)` 和 `COUNT(1)` 通常会得到相同的执行计划，没有必要为了所谓的性能差异把所有代码改成 `COUNT(1)`。

对于没有 `WHERE` 和 `GROUP BY` 的精确行数统计，InnoDB 不能像 MyISAM 那样直接返回一个始终准确的固定行数，因为它需要考虑事务和 MVCC。优化器会选择合适的索引进行扫描，通常倾向于较小的可用二级索引；没有二级索引时才扫描聚簇索引。

这里要避免另一个误区：不要只为了 `COUNT(*)` 就盲目创建一个没有业务价值的二级索引。索引会占空间，也会增加写入成本。是否建立索引，应该结合整个查询和写入负载判断。

我的结论是：

1. 统计行数时优先写语义清楚的 `COUNT(*)`；
2. 统计某字段非空数量时使用 `COUNT(column)`；
3. 真正遇到性能问题时，用执行计划和真实数据验证，不要只背固定结论。
