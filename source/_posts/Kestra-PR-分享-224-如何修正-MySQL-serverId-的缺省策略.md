---
title: "Kestra PR 分享: #224 如何修正 MySQL serverId 的缺省策略"
date: 2026-09-24 00:16:28
categories:
  - 开源
tags:
  - Kestra
  - Debezium
  - MySQL
  - Java
  - Testing
  - GitHub
description: "记录 Kestra plugin-debezium PR #224 的实现与评审过程：复用 connector identity，稳定派生 MySQL serverId，并补齐测试、文档和完整验证。"
---

上一篇文章记录了我向 Kestra [`plugin-debezium`](https://github.com/kestra-io/plugin-debezium) 提交 PR #221 的过程：把 MySQL `serverId` 从必填配置改为可选配置，并在省略时生成一个 5400 到 6400 之间的值。

PR #221 已经解决了“必须手动配置”的问题，但它采用的随机缺省值留下了一个更隐蔽的问题：**同一个逻辑连接器在不同时间构建属性时，可能得到不同的 `serverId`。**

对应的后续 Pull Request 是 [`#224 fix(mysql): stabilize generated serverId`](https://github.com/kestra-io/plugin-debezium/pull/224)。这篇文章重点记录如何从评审意见出发，把“能用的默认值”改造成“符合连接器生命周期的默认值”。

<!-- more -->

## 问题

PR #221 合并时，缺省逻辑如下：

```java
runContext.render(this.serverId)
    .as(String.class)
    .orElseGet(() -> String.valueOf(
        new Random().nextInt(5400, 6401)
    ));
```

这段代码可以保证结果落在 `[5400, 6400]`，也不会覆盖用户显式配置或动态表达式渲染出来的值。从单次调用来看，它完全可用。

问题在于，`properties()` 不一定只调用一次。

Trigger 在轮询过程中可能重新构建 Capture，并再次生成 Debezium 属性。随机回退意味着：

```text
同一个 namespace + flow + task
第一次构建属性 → serverId = 5712
第二次构建属性 → serverId = 6341
第三次构建属性 → serverId = 5890
```

`serverId` 表示连接器加入 MySQL 集群时使用的客户端身份。对于同一个逻辑连接器，让它随着属性重建不断变化，并不符合这个字段的语义。

所以这次 follow-up 的目标并不是改变上游指定的 `[5400, 6400]` 范围，而是满足下面的关系：

```text
相同逻辑身份 → 相同默认 serverId
```

同时还必须保留原有行为：

- 用户显式配置的值优先；
- 动态表达式渲染后的值优先；
- 只有没有得到配置值时才计算默认值；
- 默认值仍位于闭区间 `[5400, 6400]`。

## 找到可以复用的稳定身份

继续阅读公共模块后，我发现 `AbstractDebeziumTask` 已经提供了一个很合适的能力：

```java
String deriveConnectorId(RunContext runContext)
```

它根据任务的逻辑上下文生成稳定的 connector identity，使用的信息包括：

- namespace；
- flow ID；
- task ID；
- `ForEach` 等场景下的迭代值。

其核心关系可以简化为：

```text
namespace | flow | task | iteration
                  ↓
            connector identity
```

这个身份原本已经用于 `name`、`topic.prefix` 和 `database.server.name`。与其为 MySQL 再设计一套身份规则，不如复用项目已有的定义。

不过这里遇到了一个 Java 可见性问题。

`AbstractDebeziumTask` 位于：

```text
io.kestra.plugin.debezium
```

MySQL `Capture` 位于：

```text
io.kestra.plugin.debezium.mysql
```

Java 的子包并不是父包的一部分。原方法采用包级可见性，因此即使 `Capture` 继承了 `AbstractDebeziumTask`，也不能跨包调用它。

最终只需要把方法改为 `protected`：

```java
protected String deriveConnectorId(RunContext runContext)
```

同时增加说明：

```java
Subclasses may reuse this identity to derive other stable
connector-scoped values.
```

这句话不会改变程序行为，只是在解释为什么子类需要访问该方法。当前最直接的使用场景，就是派生 MySQL 的默认 `serverId`。

## 把 connector identity 映射到指定范围

有了稳定身份，下一步是把字符串映射成 `[5400, 6400]` 范围内的整数。

首先把边界提取为常量：

```java
private static final int DEFAULT_SERVER_ID_MIN = 5400;
private static final int DEFAULT_SERVER_ID_RANGE = 1001;
```

为什么范围长度是 `1001`？因为这里是闭区间：

```text
6400 - 5400 + 1 = 1001
```

最终计算逻辑如下：

```java
int defaultServerId = DEFAULT_SERVER_ID_MIN
    + Math.floorMod(
        deriveConnectorId(runContext).hashCode(),
        DEFAULT_SERVER_ID_RANGE
    );
```

其中：

```text
Math.floorMod(hash, 1001) → [0, 1000]
加上 5400                  → [5400, 6400]
```

这里不能简单写成：

```java
hashCode % 1001
```

因为 Java 的 `%` 在被除数为负数时可能产生负数结果。如果哈希值为负，最终结果就可能小于 5400。`Math.floorMod` 可以保证余数始终处于非负范围，避免这个边界错误。

`String#hashCode()` 在这里不是用于密码学或安全校验，只承担稳定映射的作用。相同 connector identity 会得到相同哈希，从而得到相同的默认 `serverId`。

## 保留显式配置和动态表达式的优先级

完整实现并不是直接覆盖 `database.server.id`，而是继续通过 `orElseGet` 保留原有优先级：

```java
props.setProperty(
    "database.server.id",
    runContext.render(this.serverId).as(String.class).orElseGet(() -> {
        int defaultServerId = DEFAULT_SERVER_ID_MIN
            + Math.floorMod(
                deriveConnectorId(runContext).hashCode(),
                DEFAULT_SERVER_ID_RANGE
            );
        return String.valueOf(defaultServerId);
    })
);
```

执行顺序是：

1. 尝试渲染用户配置的 `serverId`；
2. 如果得到显式值或表达式结果，直接使用；
3. 只有结果为空时，才根据 connector identity 计算缺省值。

这保证了 follow-up PR 只修正缺省行为，不改变现有接口。

## 真的做到惰性计算了吗

这个分支最初的实现其实是先计算默认值，再交给 `orElseGet`：

```java
int defaultServerId = deriveDefaultServerId(...);

runContext.render(this.serverId)
    .as(String.class)
    .orElseGet(() -> String.valueOf(defaultServerId));
```

功能上没有错误，但即使用户已经显式配置 `serverId`，程序仍然会提前计算一次不会被使用的默认值。

这几乎没有性能影响，却让 `orElseGet` 的语义变得不够纯粹：既然选择的是惰性回退，就应该只在真正缺省时执行回退逻辑。

因此我又补了第二个提交：

```text
fix(mysql): defer default serverId calculation
```

把计算移动到 lambda 内部后，执行路径就和代码表达的意图完全一致了。

这件小事也说明，自我审查不应只问“结果对不对”，还应该问：

> 代码的结构是否准确表达了它的执行条件？

## 更新测试：不仅在范围内，还必须保持稳定

PR #221 中的测试已经覆盖三种输入：

- 未配置；
- 显式值；
- 动态表达式。

PR #224 保留这些覆盖，并增加稳定性断言。在没有配置 `serverId` 时，对同一个任务和 `RunContext` 再次调用 `properties()`：

```java
var repeatedProperties = task.properties(
    runContext,
    runContext.workingDir().path().resolve("offsets.dat"),
    runContext.workingDir().path().resolve("dbhistory.dat")
);

assertEquals(
    properties.getProperty("database.server.id"),
    repeatedProperties.getProperty("database.server.id")
);
```

如果实现仍然使用随机数，这个断言就可能失败；改成确定性映射后，两次结果必然相同。

评审还指出，测试任务 ID 不应硬编码为：

```java
.id("capture")
```

于是改为项目测试约定中的：

```java
.id(IdUtils.create())
```

这两项改动解决的是不同问题：

- `IdUtils.create()` 避免测试 ID 硬编码并遵循仓库规范；
- 重复调用断言验证稳定 `serverId` 的回归行为。

不能把“稳定性由 `IdUtils.create()` 保证”混为一谈。

## 稳定不等于唯一

确定性映射解决了同一逻辑身份反复变化的问题，但 `[5400, 6400]` 只有 1001 个值，不同连接器仍然可能映射到同一个数字。

这个范围是上游方案的一部分，本次 PR 没有擅自扩大，而是在 Schema 和插件文档中准确说明限制：

- 省略配置时，从 connector identity 派生稳定值；
- 结果位于 5400 到 6400；
- 有限范围仍然可能碰撞；
- 多个连接器访问同一个 MySQL 集群时，生产环境建议显式配置唯一值。

这里需要区分两个概念：

```text
稳定：同一个逻辑身份重复计算，结果相同
唯一：不同逻辑身份之间，结果绝不重复
```

当前实现承诺前者，不承诺后者。文档如果把“稳定”写成“保证唯一”，就会给用户错误预期。

## 测试

修改完成后，我先运行聚焦测试：

```powershell
.\gradlew.bat :plugin-debezium-mysql:test `
  --tests "io.kestra.plugin.debezium.mysql.ServerIdTest" `
  --console=plain
```

聚焦结果为：

```text
3 passed, 0 failed, 0 skipped
```

随后启动测试所需的 MySQL 服务，运行完整模块测试和插件文档检查。为避免本地测试存储目录互相影响，我为本次运行设置了独立路径：

```powershell
$runId = Get-Date -Format "yyyyMMddHHmmss"
$env:JAVA_TOOL_OPTIONS = "-Dkestra.storage.local.base-path=build/test-storage-$runId"

try {
    .\gradlew.bat --no-daemon `
      :plugin-debezium-mysql:test `
      :plugin-debezium-mysql:lintPluginDocs `
      --rerun-tasks `
      --console=plain
}
finally {
    Remove-Item Env:JAVA_TOOL_OPTIONS -ErrorAction SilentlyContinue
}
```

最终结果：

```text
MySQL module: 14 passed, 0 failed, 0 skipped
Plugin documentation: all 25 rules passed
git diff --check: passed
BUILD SUCCESSFUL
```

完整测试还实际连接了 MySQL 8.0，并完成了 binlog 流读取。这比只验证一个计算方法更有价值，因为它确认新的 `serverId` 最终能被 Debezium 和 MySQL 接受。

## 最终合并结果

PR #224 最终修改了 5 个文件：

```text
5 files changed, 26 insertions(+), 7 deletions(-)
```

它被合并为上游提交：

```text
5ce215b fix(mysql): stabilize generated serverId (#224)
```

从功能上看，这次 PR 只把一行随机数换成了确定性映射；但从设计上看，它补齐了缺省值的身份语义、测试约束和用户预期。

## 总结

### 1. 第一个 PR 解决可用性，第二个 PR 修正语义

PR #221 让用户可以省略 `serverId`，解决的是配置门槛。

PR #224 让相同连接器得到稳定的默认值，解决的是生命周期语义。

这两个目标都合理，但后者只有在理解 Trigger 如何重复构建 Capture 后才能看清。

### 2. 优先复用已有身份模型

项目已经定义了 connector identity，就不应该在 MySQL 子模块中重新拼接 namespace、flow 和 task。复用公共模型可以减少不同连接器之间的语义漂移。

### 3. 确定性映射要注意负数和边界

从哈希映射到闭区间时，至少要确认：

- 区间长度是否包含两端；
- 负哈希是否会产生负余数；
- 最小值和最大值能否被覆盖；
- 同一输入跨调用是否稳定。

`1001` 和 `Math.floorMod` 分别解决了前两个容易忽略的问题。

### 4. `orElseGet` 不只是写法差异

`orElse` 表示值已经准备好，`orElseGet` 表示只有缺省时才计算。既然选择后者，就应该把完整的回退逻辑放进 supplier，而不是提前求值。

### 5. 文档应写清承诺边界

稳定值仍可能碰撞。与其用“自动生成唯一值”制造错误安全感，不如明确说明有限范围，并告诉生产用户何时应该显式配置。

### 6. 小步 follow-up 是正常的开源协作方式

第一个 PR 合并后继续改进，并不代表第一次贡献失败。相反，能够把非阻塞反馈整理成边界清楚、验证完整的第二个 PR，本身就是一次更成熟的协作。

## 总结

PR #224 的核心公式很短：

```java
5400 + Math.floorMod(connectorIdentity.hashCode(), 1001)
```

但这行代码背后需要回答一整组问题：身份从哪里来、为什么要稳定、如何处理负数、如何保留用户配置、如何验证重复调用、如何描述碰撞限制，以及是否应该扩大本次 PR 的范围。

两次 PR 连在一起，让我对“默认值”有了更具体的认识：

> 好的默认值不仅要类型合法，还要在正确的生命周期中保持正确。

对于数据库连接器、消息系统客户端、分布式锁或任何带身份含义的配置，这条原则都值得反复检查。

## 相关链接

- [Kestra plugin-debezium](https://github.com/kestra-io/plugin-debezium)
- [PR #221：fix(mysql): make serverId optional](https://github.com/kestra-io/plugin-debezium/pull/221)
- [PR #224：fix(mysql): stabilize generated serverId](https://github.com/kestra-io/plugin-debezium/pull/224)
