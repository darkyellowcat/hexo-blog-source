---
title: "Kestra PR 分享提交 fix(MySQL):让 Debezium serverId 从必填变为可选"
date: 2026-09-24 00:16:08
categories:
  - 开源
tags:
  - Kestra
  - Debezium
  - MySQL
  - Java
  - GitHub
description: "记录我向 Kestra 的 plugin-debezium 提交 PR #221 的完整过程：从定位 serverId 的使用链路，到实现可选配置、补充测试和文档，再到合并后的评审反馈。"
---

这篇文章记录我第一次向 Kestra 的 [`plugin-debezium`](https://github.com/kestra-io/plugin-debezium) 仓库提交 MySQL 相关修复的经历。

对应的 Pull Request 是 [`#221 fix(mysql): make serverId optional`](https://github.com/kestra-io/plugin-debezium/pull/221)。它解决的问题并不复杂：MySQL Debezium 连接器的 `serverId` 原本是必填项，我希望把它改成可选项，并在用户未配置时自动生成一个可用值。

但真正动手后我发现，“把必填改成可选”远不只是删除一个校验注解。配置模型、运行时逻辑、动态表达式、单元测试、集成测试、示例和文档都必须保持一致。

<!-- more -->

## 背景：`serverId` 为什么存在

Debezium 的 MySQL 连接器需要读取 MySQL binlog。连接时，它会以一个数据库客户端的身份加入 MySQL 集群，而 `serverId` 就是这个客户端使用的数字标识。

对于同一个 MySQL 集群中同时运行的客户端，这个值应当保持唯一。显式配置当然最稳妥，但在本地试用、开发环境或只运行一个连接器时，要求用户必须先挑选一个数字，会增加不必要的配置成本。

修改前，Kestra 的 MySQL Capture 将 `serverId` 定义为必填属性：

```java
@NotNull
@PluginProperty(group = "main")
private Property<String> serverId;
```

在生成 Debezium 属性时，代码直接渲染这个值：

```java
props.setProperty(
    "database.server.id",
    runContext.render(this.serverId).as(String.class).orElse(null)
);
```

这意味着，只要没有配置 `serverId`，任务就无法通过属性校验，也无法正常构建连接器配置。

## 目标：可选，但不能破坏现有用法

我为这次修改确定了三个基本目标：

1. 用户可以省略 `serverId`，插件负责提供默认值。
2. 已经显式配置 `serverId` 的用户不受影响。
3. Kestra 的动态表达式仍然可以正常渲染，例如 `{{ inputs.serverId }}`。

这类改动最容易犯的错误，是只让“未配置”场景通过，却意外破坏显式配置或表达式配置。因此，测试必须同时覆盖三条路径。

## 第一步：调整属性定义

首先移除 `@NotNull`，并把这个属性从主要配置移动到高级配置：

```java
@PluginProperty(group = "advanced")
private Property<String> serverId;
```

这个变化包含两层含义：

- `serverId` 不再参与必填校验；
- 普通用户不需要为了启动连接器而优先关注它，但有唯一性要求的生产环境仍然可以显式设置。

只删除 `@NotNull` 还不够。如果运行时继续向 `Properties#setProperty` 传入空值，问题只会从“配置校验失败”变成“构建属性时失败”。因此还需要为缺省场景提供实际值。

## 第二步：为缺省值增加回退逻辑

PR #221 中采用的第一版实现，是在没有渲染出 `serverId` 时，从闭区间 `[5400, 6400]` 中生成一个随机值：

```java
props.setProperty(
    "database.server.id",
    runContext.render(this.serverId)
        .as(String.class)
        .orElseGet(() -> String.valueOf(
            new Random().nextInt(5400, 6401)
        ))
);
```

这里使用 `orElseGet` 很重要：只有没有显式值或表达式渲染结果时，才需要执行默认值生成逻辑。

同时，`nextInt` 的上界不包含在结果中，所以传入 `6401` 才能覆盖到 `6400`。最终范围是：

```text
5400 <= serverId <= 6400
```

需要强调的是，这是 PR #221 合并时的第一版方案。它解决了“字段必须配置”的问题，但随机值的生命周期后来成为评审讨论的重点，也是第二篇文章要讲的内容。

## 第三步：用参数化测试覆盖三种输入

为了避免只验证缺省场景，我新增了 `ServerIdTest`，通过参数化测试覆盖三种输入：

```java
private static Stream<Property<String>> serverIds() {
    return Stream.of(
        null,
        Property.ofValue("123456789"),
        Property.ofExpression("{{ inputs.serverId }}")
    );
}
```

它们分别代表：

| 场景 | 输入 | 预期结果 |
| --- | --- | --- |
| 未配置 | `null` | 自动生成 `[5400, 6400]` 范围内的值 |
| 显式配置 | `123456789` | 保留原值 |
| 动态表达式 | `{{ inputs.serverId }}` | 渲染后得到 `123456789` |

测试首先确认任务不再因为缺少 `serverId` 而违反属性约束：

```java
assertTrue(
    validator.validateProperty(task, "serverId").isEmpty()
);
```

然后把生成的属性交给 Debezium 的 `MySqlConnectorConfig` 解析，而不是只比较一段字符串：

```java
var connectorConfig = new MySqlConnectorConfig(
    Configuration.from(properties)
);
```

未配置时验证数值范围：

```java
assertTrue(
    connectorConfig.getServerId() >= 5400 &&
    connectorConfig.getServerId() <= 6400
);
```

显式值或表达式存在时，则验证最终属性和 Debezium 解析结果都没有被默认逻辑覆盖：

```java
assertEquals(
    "123456789",
    properties.getProperty("database.server.id")
);
assertEquals(123456789L, connectorConfig.getServerId());
```

这种测试方式给我的一个启发是：配置类修改不能只测试 Java 字段本身，最好继续向下走一步，确认真正的下游组件也能接受最终结果。

## 第四步：用 Trigger 集成测试验证“真的可以省略”

单元测试证明了属性生成逻辑，但还需要确认实际 Flow 中确实可以不写 `serverId`。

原来的 Trigger 测试 Flow 显式配置了：

```yaml
serverId: 123456789
```

我在测试资源中删除了这一行，并把测试方法改名为：

```java
void flowWithoutServerId(Optional<Execution> optionalExecution)
```

这样测试表达的意图就非常直接：MySQL Trigger 在没有配置 `serverId` 的情况下，仍然应当启动并捕获数据。

这里还有一个看似矛盾但实际合理的处理：自动化测试故意省略 `serverId`，用于验证新能力；面向用户的 Trigger 示例仍然展示显式配置，提醒生产环境为连接器分配唯一值。

## 第五步：同步 Schema 和插件文档

如果代码已经允许省略字段，而文档还写着“required”，用户仍然会按照旧规则配置，插件界面也可能传达错误信息。

因此 PR 同时调整了两处说明：

- `MysqlInterface` 中 `serverId` 的 Schema 描述；
- 插件总文档中的数据库专属属性说明。

文档标题从：

```text
Database-specific required properties
```

调整为：

```text
Database-specific properties
```

MySQL 部分也从“必须设置”改为“可以选择设置；省略时由插件生成一个 5400 到 6400 之间的值”。

这一步让我意识到，公开配置的行为由三部分共同定义：

```text
字段注解 + 运行时实现 + 用户文档
```

三者只改一个，都会留下不一致。

## PR 提交后的流程

我在自己的 fork 中创建了 `fix/mysql-optional-server-id` 分支，推送提交后，向 `kestra-io/plugin-debezium:main` 发起 PR。

作为外部贡献者，这个 PR 经历了几个典型步骤：

- 自动添加外部贡献者和插件区域标签；
- 等待具有写权限的维护者批准评审；
- 部分 GitHub Actions 工作流需要维护者授权后才能运行；
- 维护者完成评审并批准合并。

最终，PR #221 被合并为上游提交：

```text
7aef67b fix(mysql): make serverId optional (#221)
```

## 合并之后，评审并没有结束

PR #221 合并后，维护者又留下了几条非阻塞建议：

1. 默认 `serverId` 每次构建属性时都随机生成，不够稳定；Trigger 轮询过程中可能重复构建 Capture，因此同一个逻辑连接器可能不断更换 ID。
2. 测试中不应硬编码任务 ID，应使用项目约定的 `IdUtils.create()`。
3. 文档需要准确描述最终采用的默认值生命周期。

这些反馈没有否定“让 `serverId` 可选”这个目标，但指出了第一版默认策略的不足：

> 一个默认值不仅要合法，还要符合对象的生命周期。

对普通业务字段来说，随机默认值可能没有问题；但 `serverId` 代表连接器身份，稳定性本身就是语义的一部分。

我没有在已经合并的 PR 上继续追加修改，而是基于最新的上游 `main` 创建新分支，提交 follow-up PR [`#224 fix(mysql): stabilize generated serverId`](https://github.com/kestra-io/plugin-debezium/pull/224)。这部分会放在下一篇文章中展开。

## 总结

### 1. “可选”是一条完整链路

把字段从必填改为可选，至少需要检查：

- 校验注解；
- 配置分组和 Schema；
- 空值进入运行时后的行为；
- 显式值是否仍然优先；
- 动态表达式是否仍能渲染；
- 单元测试与集成测试；
- 示例和用户文档。

### 2. 默认值需要考虑生命周期

默认值能通过类型校验，并不代表它符合业务语义。对于身份、分区、锁、偏移量名称等字段，还要继续追问：

- 同一次调用中是否稳定？
- 同一个逻辑任务的多次构建中是否稳定？
- 重启后是否稳定？
- 并发实例之间是否应该相同？

这也是随机 `serverId` 在后续评审中暴露问题的根本原因。

### 3. 测试名称应该表达行为

`flowWithoutServerId` 比笼统的 `flow` 更有价值。测试失败时，维护者不需要先阅读方法内容，就能知道哪条能力发生了回归。

### 4. 合并不是反馈的终点

开源项目中，非阻塞建议完全可以通过后续 PR 继续改进。与其为了追求一次提交“绝对完美”而迟迟不发，不如先交付边界清楚、经过验证的改动，再对评审意见做聚焦的小步迭代。

## 总结

PR #221 的代码改动并不庞大：移除必填校验、增加缺省逻辑、补齐测试并更新文档。但它让我第一次系统地处理了一个公开配置从必填到可选的完整生命周期。

更重要的是，合并后的反馈让我意识到：

> 默认值不是“随便找一个能用的值”，而是 API 行为的一部分。

下一篇将继续记录 PR #224：如何把随机 `serverId` 改为根据连接器逻辑身份稳定派生的值，以及为什么这个 follow-up PR 比表面看起来更值得讨论。

## 相关链接

- [Kestra plugin-debezium](https://github.com/kestra-io/plugin-debezium)
- [PR #221：fix(mysql): make serverId optional](https://github.com/kestra-io/plugin-debezium/pull/221)
- [PR #224：fix(mysql): stabilize generated serverId](https://github.com/kestra-io/plugin-debezium/pull/224)
