---
title: MYSQL字段类型优化
date: 2026-09-16 12:55:54
categories:
  - 学习笔记
tags:
  - MySQL
---

# 核心原则

## 范围内选择最小的数据类型

字段类型越小，意味着单行数据和索引记录更紧凑。在相同页大小下，数据库可以容纳更多记录，从而可能提高缓存命中率并减少磁盘 I/O。


### 辨析 
类型声明的的大小，不代表按最大长度占用空间

```
nickname VarChar(20)
```
VarChar(20) 中的 20 表示最多保存 20 个字符，并不意味着每行都会固定占用 20 个字符的空间。VarChar 通常按照实际内容长度保存数据，同时额外使用 1 或 2 字节记录长度。

如果用户昵称只有 5 个字符，数据库主要保存这 5 个字符编码后的字节，而不是预留完整的 20 个字符空间。实际占用还会受到字符集影响， utf8mb4 中一个字符最多可能需要 4 字节。

不过，字段声明的最大长度仍可能影响：

- 是否需要使用 1 字节或 2 字节的长度前缀；
- InnoDB 对最大行长度的检查；
- 临时表、排序和某些执行阶段的内存估算；
- 索引键允许的最大长度；
- 应用驱动和 ORM 对字段的处理方式。

整数类型则是固定长度的：

所以，能用 INT 就不用 BIGINT 。

但也不要取极限值，字段类型先由业务语义和生命周期确定，再讨论字节数。过窄的类型会把正常增长变成高风险 DDL。


## 选择简单的数据类型

复杂的数据类型不利于 MySQL 优化器 进行分析和优化。

优先使用能够直接表达业务语义的原生类型，避免把结构化数据编码成需要额外解析的字符串、二进制对象或 JSON。

```
优先级 整型 > date,time > Char,VarChar > blob
```

## 减少 NULL

1. 引入三值逻辑

SQL 中的布尔判断不仅有 TRUE 和 FALSE，还存在 UNKNOWN。

下面的查询不能找到空值：
```
SELECT *
FROM customer
WHERE phone = NULL;
```
必须使用：
```
SELECT *
FROM customer
WHERE phone IS NULL;
```
NULL 还会影响 AND、OR、NOT、IN 和 NOT IN 等表达式。如果开发者不了解三值逻辑，容易编写出结果不符合预期的查询。

2. 影响聚合结果

大部分聚合函数会忽略 NULL：
```
SELECT
    COUNT(*) AS total_rows,
    COUNT(phone) AS known_phone_rows
FROM customer;
```
COUNT(*) 统计所有行，而 COUNT(phone) 只统计 phone 不为 NULL 的行。两者含义不同，报表和统计代码必须明确区分。

3. 增加应用判断分支

允许 NULL 后，应用、ORM、序列化接口和业务代码都需要正确处理可空状态。如果字段实际上不存在“未知”或“不适用”的业务含义，允许 NULL 只会增加无意义的分支。

4. 影响索引选择性和执行计划

InnoDB 可以为允许 NULL 的列建立索引，IS NULL 查询也可能使用索引。因此，“可空列不能使用索引”是错误的。

真正影响执行计划的是数据分布。例如，如果一列 90% 的记录都是 NULL，查询 IS NULL 需要返回大部分数据，优化器就可能认为全表扫描比索引访问更划算。

5. 产生少量存储开销

InnoDB 通常使用位图记录哪些可空列是 NULL。若索引记录中包含 (N) 个可空字段，NULL 位图大约需要：

[
\operatorname{CEILING}(N / 8)
]
字节。


### 原因



# 版本差异

同一条设计建议在三个版本中可能有不同前提。

| **能力或默认行为**          | **MySQL 5.7**     | **MySQL 8.0**      | **MySQL 8.4**      |
|-----------------------------|-------------------|--------------------|--------------------|
| 默认字符集                  | latin1            | utf8mb4            | utf8mb4            |
| 默认排序规则                | latin1_swedish_ci | utf8mb4_0900_ai_ci | utf8mb4_0900_ai_ci |
| 原生 JSON                   | 支持              | 支持               | 支持               |
| JSON 路径索引               | 生成列            | 生成列或函数索引   | 生成列或函数索引   |
| 函数索引                    | 不支持            | 8.0.13 起支持      | 支持               |
| JSON 多值索引               | 不支持            | 8.0.17 起支持      | 支持               |
| JSON 局部更新               | 不支持优化        | 有条件支持         | 有条件支持         |
| 整数显示宽度                | 可用              | 8.0.17 起弃用      | 弃用               |
| FLOAT DOUBLE AUTO_INCREMENT | 可用但不建议      | 弃用               | 8.4.0 起不支持     |

## 默认值变化的实际影响

MySQL 5.7 默认使用 latin1 和 latin1_swedish_ci，而 8.0 与 8.4 默认使用 utf8mb4 和 utf8mb4_0900_ai_ci。若 DDL 没有显式指定字符集和排序规则，同一份建表语句可能得到不同列定义。比较、排序、唯一索引冲突和索引长度都可能随之改变。升级方案应把隐式默认值改成显式定义。

# InnoDB 存储基础

字段类型的物理成本不能只看类型表。InnoDB 将表组织为以主键为序的聚簇索引。聚簇索引叶子记录保存完整行，二级索引叶子记录保存二级索引列和对应的主键列。变长列可能保存在索引页内，也可能通过 20 字节指针引用溢出页。

## 主键宽度的放大效应

假设一张表有五个二级索引，把主键从 4 字节 INT 改成 8 字节 BIGINT，会给每条二级索引记录增加最多 4 字节的主键负担。实际空间还受记录头、页填充率、压缩和主键列是否已包含在索引中影响，但方向明确。选择主键类型时应把所有二级索引计入成本。

## 行格式决定长列位置

COMPACT 行格式会在记录内保留长变长值的前 768 字节，再把其余部分放到溢出页。DYNAMIC 行格式可以把长值完整放到行外，并在聚簇记录中保留 20 字节指针。是否外置取决于页面能否容纳整行，而不是只由列名是 VarChar 还是 TEXT 决定。DYNAMIC 同时支持更大的索引键前缀。


| **类型**  | **基本存储量**         | **设计提示**                   |
|-----------|------------------------|--------------------------------|
| TINYINT   | 1 字节                 | 适合小范围代码和值域明确的状态 |
| SMALLINT  | 2 字节                 | 适合中小范围计数或代码         |
| MEDIUMINT | 3 字节                 | 节省 1 字节但生态使用较少      |
| INT       | 4 字节                 | 常用整数和中等规模标识         |
| BIGINT    | 8 字节                 | 适合大规模标识和大范围累计值   |
| DATE      | 3 字节                 | 只保存日期                     |
| TIMESTAMP | 4 字节加小数秒         | 带时区转换且存在 2038 范围边界 |
| DATETIME  | 5 字节加小数秒         | 保存日历日期时间               |
| VarChar   | 实际字节加 1 或 2 字节 | 前缀长度由最大可能字节数决定   |
| DECIMAL   | 按 9 位十进制数分组    | 精度和小数位分别影响存储       |

# 整数类型

## 按生命周期估算取值域

整数类型应覆盖字段在整个生命周期内的最大和最小值。估算时不能只看当前行数，还要加入数据保留年限、业务增长、历史导入、分库编码、ID 生成策略和计算中间值。对于主键，范围不足后的扩容通常需要修改所有引用列，并可能触发表重建。

| **类型**  | **字节** | **有符号范围**            | **无符号范围**  |
|-----------|----------|---------------------------|-----------------|
| TINYINT   | 1        | -128 到 127               | 0 到 255        |
| SMALLINT  | 2        | -32768 到 32767           | 0 到 65535      |
| MEDIUMINT | 3        | -8388608 到 8388607       | 0 到 16777215   |
| INT       | 4        | -2147483648 到 2147483647 | 0 到 4294967295 |
| BIGINT    | 8        | 约负 9.22e18 到正 9.22e18 | 0 到约 1.84e19  |

## 整数显示宽度不是容量

INT(4) 和 INT(11) 都占 4 字节，也具有相同取值范围。括号中的数字是历史显示宽度，不能限制输入位数。与 ZEROFILL 配合时，它可以影响格式化显示，但该能力从 MySQL 8.0.17 起被弃用。需要前导零的业务编号应作为字符串存储，或者在展示层格式化。

## Unsigned 的取舍

Unsigned 可以把负数区间换成更大的正数区间，但它也扩展了 MySQL 与其他数据库、语言类型和 ORM 之间的差异。主外键及所有关联列应保持整数宽度和符号属性一致。对金额、测量值和 DECIMAL 使用 Unsigned 的做法在 8.0.17 起被弃用，更清晰的业务下界可由 CHECK 或应用验证表达。

## 布尔值和状态值

MySQL 的 BOOL 和 BOOLEAN 是 TINYINT(1) 的同义形式，并不会自动阻止写入 2 或负数。若字段确实只允许两个状态，应在 8.x 使用 CHECK 约束，或者通过应用和测试保证输入。若业务存在未知、未处理和失败等额外状态，则不应强行压成布尔值。

# 精确数和近似数

DECIMAL 保存十进制定点精确值，FLOAT 和 DOUBLE 保存二进制浮点近似值。两类类型的差异不仅体现在展示小数位，还体现在表达式传播、聚合、相等判断和跨平台结果。

## 金额和精确计算

金额、余额、税额和必须按十进制规则结算的值通常应使用 DECIMAL。DECIMAL(M,D) 中 M 是总有效位数，D 是小数位数。设计时要根据最大金额、币种精度、税率计算和中间结果确定范围，不能习惯性使用 DECIMAL(10,2)。

**存储规则** DECIMAL 把整数部分和小数部分分别分组，每 9 个十进制数字使用 4 字节，剩余数字按组占 0 到 4 字节。符号不单独增加一个完整字节。

**写入规则** 小数位超过 D 时会舍入。整数位超出范围时，严格模式通常报错，非严格模式可能截到合法边界并产生警告。

## 浮点数的适用范围

FLOAT 和 DOUBLE 适合测量值、统计模型、图形和科学计算等允许近似误差的场景。不要用浮点列直接保存需要逐分一致的金额，也不要依赖直接等值比较。任何近似值参与表达式后，MySQL 会使用浮点运算；字符串参与数值表达式时也可能转换为 DOUBLE，使原本精确的计算变成近似计算。

```sql
SELECT 0.1 + 0.2 = 0.3 AS equal_result;

CREATE TABLE number_test (
    f FLOAT,
    d DOUBLE,
    amount DECIMAL(20, 6)
);
```

# 日期和时间类型

| **含义**             | **常用类型**              | **说明**                         |
|--------------------------|---------------------------|----------------------------------|
| 生日和结算日             | DATE                      | 只有日期，不应受时区转换影响     |
| 门店营业时间和预约日历值 | DATETIME                  | 按所在地规则解释，可另存时区标识 |
| 创建时间和事件发生时刻   | TIMESTAMP 或 UTC DATETIME | 需要统一时区策略和驱动配置       |
| 耗时和剩余时间           | 整数单位或专门建模        | 不要把持续时长误当作日期时间     |

## TIMESTAMP 和 DATETIME

TIMESTAMP 写入时按会话时区转换为 UTC，读取时再从 UTC 转回会话时区。DATETIME 保存写入的日历字段，不做这种转换。三个目标版本的官方文档都把 TIMESTAMP 上限列为 2038 年 1 月 19 日 03:14:07 UTC，而 DATETIME 支持到 9999 年。因而 TIMESTAMP 不能仅凭空间较小而成为默认选择。

## 小数秒精度

TIME、DATETIME 和 TIMESTAMP 的小数秒精度会增加存储。精度为 1 到 2 位增加 1 字节，3 到 4 位增加 2 字节，5 到 6 位增加 3 字节。只有在排序、去重或审计确实需要时才应使用微秒。

## 零日期和 SQL 模式

把 0000-00-00 或 1970-01-01 当作未发生的哨兵值会把状态混入时间字段，并使范围查询和统计产生假数据。允许空值时应使用 NULL；不允许空值时应把业务状态拆成独立列。不同 sql_mode 对无效日期和零日期的处理存在差异，迁移前必须测试。

```sql
SET time_zone = '+08:00';
INSERT INTO temporal_test(ts_value, dt_value)
VALUES ('2026-09-16 10:00:00', '2026-09-16 10:00:00');

SET time_zone = '+00:00';
SELECT ts_value, dt_value FROM temporal_test;
```

# 字符和长文本类型

## VarChar 长度的含义

VarChar(N) 中的 N 是字符数，而不是字节数。实际数据占用取决于字符编码后的字节长度，并额外使用 1 或 2 字节保存长度。是否需要 2 字节长度前缀取决于列的最大可能字节数。VarChar(255) 使用 utf8mb4 时最大可能达到 1020 字节，因此 255 并不是通用的单字节分界或性能甜点。

## Char 的适用场景

Char 适合真正定长且尾部空格没有业务意义的值，例如某些固定长度代码。对于变长字符集，InnoDB 的实际存储会做专门处理，不能简单按 N 乘以 4 估算所有情况。尾部空格在存储、读取和比较中的行为还会受类型及排序规则的 PAD 属性影响。

## 二进制标识和值

十六进制散列、UUID 和原始字节若不需要语言学比较，应评估 BINARY 或 VARBINARY。将 16 字节 UUID 存成 Char(36) 会增加聚簇和二级索引宽度。若系统依赖按时间有序写入，还需要评估 UUID 版本和字节排列，不能只替换字段类型。

## TEXT 与 VarChar

TEXT 与 VarChar 的关键差异主要在最大长度、索引方式和某些 SQL 操作限制。TEXT 索引通常必须指定前缀长度，前缀索引可能无法提供完整唯一性和区分度。使用 DYNAMIC 行格式时，长 VarChar 和 TEXT 都可能完整外置；短 TEXT 值仍可能保存在行内。因此二者不能用行内和行外的简单二分法选择。

## 索引长度和 191 字符误区

utf8mb4 索引只能建立 191 字符是带条件的旧结论。COMPACT 和 REDUNDANT 行格式的索引键前缀上限为 767 字节，按每字符最多 4 字节计算得到 191。DYNAMIC 和 COMPRESSED 在默认 16KB 页下支持 3072 字节。页大小降低时，上限会按比例降低。

## 字符串字段决策问题

- 字段是自然语言文本、机器标识，还是原始二进制值。

- 最大长度来自业务规则，还是为了省事随意填写。

- 字段是否参与等值查询、范围查询、排序、分组或唯一约束。

- 尾部空格、大小写、重音和 Unicode 补充字符是否具有业务意义。

- 查询是否经常只读其他列，还是每次都需要返回大字段。

# JSON 类型

MySQL 原生 JSON 会验证写入内容并转换为便于按路径访问的二进制格式。二进制编码包含元数据和查找结构，因此空间通常接近文本表示并增加一定开销。JSON 的主要价值是验证、路径函数和索引能力，而不是保证压缩。

## 适合和不适合的字段

JSON 适合稀疏、变化快并且大部分不参与关系操作的扩展属性，例如第三方原始响应、设备差异化配置和少量可选元数据。以下字段通常应拆成普通列。

- 高频过滤、排序、分组和关联字段。

- 需要外键、NOT NULL、唯一约束或严格类型约束的核心属性。

- 更新频繁且可以稳定建模的小字段集合。

- 需要由 BI、数据仓库和多个语言客户端稳定消费的公共字段。

## 三个版本的索引路径

MySQL 5.7 不能直接为整个 JSON 建普通索引，常见方式是创建提取标量值的生成列并对生成列建索引。MySQL 8.0.13 起支持函数索引，可直接为表达式值建索引。MySQL 8.0.17 起支持面向 JSON 数组的多值索引。多值索引不能覆盖所有普通索引能力，并有排序、外键和在线创建限制。

```sql
-- MySQL 5.7 兼容方案
ALTER TABLE orders
  ADD customer_id BIGINT UNSIGNED
    GENERATED ALWAYS AS (
      CAST(JSON_UNQUOTE(JSON_EXTRACT(ext, '$.customer_id')) AS UNSIGNED)
    ) VIRTUAL,
  ADD INDEX idx_customer_id (customer_id);

-- MySQL 8.0.13 及以上
CREATE INDEX idx_customer
ON orders ((CAST(ext->>'$.customer_id' AS UNSIGNED)));
```

## 函数索引中的类型和排序规则

JSON_UNQUOTE 返回的字符串类型和排序规则可能与 CAST 后的表达式不同。若查询表达式与索引表达式在类型、长度或排序规则上不一致，优化器可能无法使用函数索引。设计函数索引时应把查询 SQL、CAST 类型和 COLLATE 一起固定，并用 EXPLAIN 验证。

## 局部更新的边界

MySQL 8.x 可以在满足条件时对 JSON 做局部原地更新，但不能将其概括为修改 JSON 永远不重写文档。被更新列必须是 JSON，语句需要使用 JSON_SET、JSON_REPLACE 或 JSON_REMOVE 等受支持函数，新值和可用空间还必须符合优化条件。直接把整份 JSON 赋给列不属于局部更新。

# NULL 设计

## NULL 表达未知

NULL 与空字符串、零和空 JSON 对象不同。NULL 通常表示未知、不适用或尚未发生。若业务需要区分未知和明确为空，就必须保留这种差异；用空字符串统一替代 NULL 会丢失信息。

```sql
SELECT * FROM customer WHERE phone IS NULL;
SELECT * FROM customer WHERE phone = '';

SELECT COUNT(*) AS rows_total,
       COUNT(phone) AS known_phone_count
FROM customer;
```

## 三值逻辑

任何值与 NULL 使用等号比较都不会得到 TRUE，包括 NULL 自身。搜索空值必须使用 IS NULL 或 IS NOT NULL。聚合函数通常忽略 NULL，而 COUNT(\*) 计算行数。复杂条件中的 UNKNOWN 还会影响 AND、OR 和 NOT 的结果，查询编写和测试必须覆盖空值。

## 存储成本

在 InnoDB COMPACT 和 DYNAMIC 记录中，可空列由位图记录。若索引记录中有 N 个可空列，位图使用 CEILING(N/8) 字节。可空变长列为 NULL 时不保存数据内容。因而每个 NULL 浪费一个字节并不准确。NOT NULL 的首要理由应是业务约束，而不是未经测量的性能假设。

## 索引和选择性

InnoDB 可以为允许 NULL 的列建立索引，IS NULL 也可能使用索引。是否使用取决于 NULL 比例、统计信息、查询返回列和成本模型。若绝大部分行都是 NULL，索引可能很小且有效；若查询需要返回大部分表，优化器也可能选择全表扫描。

# 字符集和排序规则

字符集决定字段能编码哪些字符以及最大字节数，排序规则决定字符串如何比较和排序。字段长度、索引大小、唯一约束和查询结果都可能同时受二者影响。

## 使用 utf8mb4

MySQL 传统的 utf8 最多使用 3 字节，无法保存 Unicode 补充平面字符。utf8 已作为 utf8mb3 的弃用别名。新系统通常应显式使用 utf8mb4，升级旧系统时要同时检查索引长度、连接字符集和实际脏数据。

# 字段选择框架

| **业务数据** | **首选候选**                | **需要确认的问题**               |
|--------------|-----------------------------|----------------------------------|
| 主键         | INT 或 BIGINT               | 增长上限 生成策略 二级索引数量   |
| 状态码       | TINYINT SMALLINT 或 VarChar | 可读性 状态扩展 外部协议         |
| 金额         | DECIMAL 或整数最小单位      | 最大值 币种精度 舍入规则         |
| 事件时刻     | TIMESTAMP 或 UTC DATETIME   | 时区 2038 范围 驱动行为          |
| 日历时间     | DATETIME                    | 是否需要保存时区标识和夏令时规则 |
| 短文本       | VarChar                     | 最大字符数 字符集 比较规则 索引  |
| 长文本       | TEXT 系列                   | 读取频率 前缀索引 排序分组       |
| 固定二进制值 | BINARY 或 VARBINARY         | 长度 是否需要语言学比较          |
| 扩展属性     | JSON                        | 查询路径 约束 更新频率 版本能力  |
| 未知或未发生 | 允许 NULL                   | 业务是否需要区分空值和未知       |

# 常见误区核查

| **常见说法**                | **更准确的结论**                                                           |
|-----------------------------|----------------------------------------------------------------------------|
| 字段越小查询越快            | 更窄记录可能提高页密度和缓存命中率，收益仍取决于索引、访问模式和数据规模。 |
| INT(11) 只能保存 11 位      | 11 是历史显示宽度，不改变 4 字节存储和整数范围。                           |
| VarChar(255) 性能最好       | 没有通用分界。最大字节数、行长度和查询用途更重要。                         |
| Char 永远按最大长度占空间   | InnoDB 对变长字符集和不同 ROW_FORMAT 有专门存储规则。                      |
| TEXT 永远保存在行外         | 是否外置取决于行格式、值长度和整行大小。短 TEXT 可能行内。                 |
| TIMESTAMP 永远优于 DATETIME | 二者的时区语义和范围不同，空间只差 1 字节。                                |
| 金额用 DOUBLE 再 ROUND 就行 | 中间步骤已经可能产生近似误差，ROUND 不能恢复精确原值。                     |
| NOT NULL 一定更快           | 应先满足业务约束。可空列使用位图，性能需按查询和分布测试。                 |
| 可空列不能使用索引          | InnoDB 可索引 NULL，IS NULL 是否走索引由成本决定。                         |
| MySQL utf8 是完整 UTF 8     | 传统 utf8 是 utf8mb3，不能保存全部 Unicode。                               |
| utf8mb4 索引最多 191 字符   | 该数字来自旧行格式的 767 字节限制，不是所有配置的上限。                    |
| 8.0 修改 JSON 都是局部更新  | 只有满足函数和空间等条件的更新才能使用局部优化。                           |

# 迁移和上线检查

## 现状盘点 SQL

```sql
SELECT
    TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME,
    COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT,
    CharACTER_SET_NAME, COLLATION_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'your_database'
ORDER BY TABLE_NAME, ORDINAL_POSITION;

SELECT
    TABLE_SCHEMA, TABLE_NAME, ENGINE, ROW_FORMAT,
    TABLE_COLLATION, DATA_LENGTH, INDEX_LENGTH
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'your_database';
```

## 上线策略

字段类型修改可能引发表重建、长事务、复制延迟和额外临时空间。上线方案应明确所需 DDL 算法、锁级别、磁盘峰值、暂停条件和回滚路径。对大表，优先使用影子表迁移、双写校验或经过验证的在线 DDL 工具，并在真实数据分布上演练。

# 综合改造示例

下面的旧表可以正常存数据，但多个字段混淆了类型语义。

```sql
CREATE TABLE orders_bad (
    id VarChar(32),
    status VarChar(255),
    amount FLOAT,
    created_at VarChar(30),
    paid_at DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00',
    customer_name VarChar(255) CharACTER SET utf8,
    attributes LONGTEXT
);
```

在假设订单量需要 BIGINT、金额保留两位、时间表示事件时刻、扩展属性结构不稳定的前提下，可以改为以下定义。

```sql
CREATE TABLE orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    status TINYINT UNSIGNED NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    paid_at TIMESTAMP(6) NULL,
    customer_name VarChar(100)
        CharACTER SET utf8mb4
        COLLATE utf8mb4_0900_ai_ci NOT NULL,
    attributes JSON NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;
```

# 参考资料

0\.《高性能 MySQL(第三版)》

1\. [MySQL 5.7 Reference Manual Data Type Storage Requirements](https://docs.oracle.com/cd/E17952_01/mysql-5.7-en/storage-requirements.html)

2\. [MySQL 8.0 Reference Manual Data Type Storage Requirements](https://dev.mysql.com/doc/refman/8.0/en/storage-requirements.html)

3\. [MySQL 8.4 Reference Manual Data Type Storage Requirements](https://dev.mysql.com/doc/refman/8.4/en/storage-requirements.html)

4\. [MySQL 8.4 Reference Manual InnoDB Row Formats](https://dev.mysql.com/doc/refman/8.4/en/innodb-row-format.html)

5\. [MySQL 8.4 Reference Manual Clustered and Secondary Indexes](https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html)

6\. [MySQL 8.4 Reference Manual InnoDB Limits](https://dev.mysql.com/doc/refman/8.4/en/innodb-limits.html)

7\. [MySQL 5.7 Reference Manual Numeric Type Attributes](https://docs.oracle.com/cd/E17952_01/mysql-5.7-en/numeric-type-attributes.html)

8\. [MySQL 8.0 Reference Manual Numeric Type Attributes](https://dev.mysql.com/doc/refman/8.0/en/numeric-type-attributes.html)

9\. [MySQL 8.4 Reference Manual Integer Types](https://dev.mysql.com/doc/refman/8.4/en/integer-types.html)

10\. [MySQL 8.4 Reference Manual Fixed Point Types](https://dev.mysql.com/doc/refman/8.4/en/fixed-point-types.html)

11\. [MySQL 8.4 Reference Manual Floating Point Types](https://dev.mysql.com/doc/refman/8.4/en/floating-point-types.html)

12\. [MySQL 8.4 Reference Manual Precision Math](https://dev.mysql.com/doc/refman/8.4/en/precision-math.html)

13\. [MySQL 8.4 Reference Manual Expression Handling](https://dev.mysql.com/doc/refman/8.4/en/precision-math-expressions.html)

14\. [MySQL 5.7 Reference Manual Date Datetime and Timestamp Types](https://docs.oracle.com/cd/E17952_01/mysql-5.7-en/datetime.html)

15\. [MySQL 8.4 Reference Manual Date Datetime and Timestamp Types](https://dev.mysql.com/doc/refman/8.4/en/datetime.html)

16\. [MySQL 8.4 Reference Manual Char and VarChar Types](https://dev.mysql.com/doc/refman/8.4/en/Char.html)

17\. [MySQL 8.4 Reference Manual Blob and Text Types](https://dev.mysql.com/doc/refman/8.4/en/blob.html)

18\. [MySQL 5.7 Reference Manual JSON Data Type](https://docs.oracle.com/cd/E17952_01/mysql-5.7-en/json.html)

19\. [MySQL 8.0 Reference Manual JSON Data Type](https://dev.mysql.com/doc/refman/8.0/en/json.html)

20\. [MySQL 8.0 Reference Manual Create Index Statement](https://dev.mysql.com/doc/refman/8.0/en/create-index.html)

21\. [MySQL 8.4 Reference Manual Problems with NULL Values](https://dev.mysql.com/doc/refman/8.4/en/problems-with-null.html)

22\. [MySQL 5.7 Reference Manual Server Character Set and Collation](https://docs.oracle.com/cd/E17952_01/mysql-5.7-en/Charset-server.html)

23\. [MySQL 8.0 Reference Manual Server Character Set and Collation](https://dev.mysql.com/doc/refman/8.0/en/Charset-server.html)

24\. [MySQL 8.4 Reference Manual utf8mb4 Character Set](https://dev.mysql.com/doc/refman/8.4/en/Charset-unicode-utf8mb4.html)

25\. [MySQL 8.4 Reference Manual Measuring Performance](https://dev.mysql.com/doc/refman/8.4/en/optimize-benchmarking.html)