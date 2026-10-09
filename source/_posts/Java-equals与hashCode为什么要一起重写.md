---
title: Java 的 equals() 与 hashCode() 为什么要一起重写
date: 2026-09-29 10:40:00
categories:
  - 学习笔记
tags:
  - Java
  - 集合
---

两个对象字段看起来一样，放进 `HashSet` 后却查不到；或者重写了 `equals()`，编辑器又提示要重写 `hashCode()`。这些现象都指向同一个问题：我们给对象定义了新的“相等”含义，却没有同步定义它在哈希集合中的散列码。

## 默认比较与业务相等

`Object.equals()` 的默认实现比较的是两个引用是否指向同一个对象。若业务上认为两个不同实例只要具有相同的标识就相等，就需要在类里重写 `equals()`。

下面用不可变的用户标识作为集合键。两个 `UserKey("u-1")` 是不同实例，但按标识比较相等：

```java
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

final class UserKey {
    private final String id;

    UserKey(String id) {
        this.id = id;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof UserKey)) return false;
        UserKey that = (UserKey) other;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

public class HashCodeExample {
    public static void main(String[] args) {
        Set<UserKey> users = new HashSet<>();
        users.add(new UserKey("u-1"));
        System.out.println(users.contains(new UserKey("u-1"))); // true
        System.out.println("Aa".hashCode() == "BB".hashCode()); // true
    }
}
```

`HashSet` 先利用散列码定位候选位置，再结合相等比较判断元素是否匹配。若只按 `id` 重写 `equals()`，却保留 `Object.hashCode()`，两个业务上相等的实例可能得到不同散列码，集合查找就会出问题。示例让两个方法都依据同一个 `id` 字段，因此保持一致。

## 必须遵守的关系

| 条件 | 能推出什么 |
| --- | --- |
| `a.equals(b)` 为 `true` | `a.hashCode() == b.hashCode()` 必须成立 |
| 两个散列码相同 | **不能**推出两个对象相等，可能发生碰撞 |
| 两个散列码不同 | 若实现遵守契约，则两个对象不可能相等 |

`"Aa"` 和 `"BB"` 在 Java 中就是散列码相同、内容却不同的例子。普通 `hashCode()` 是供哈希表使用的整数值，不要求抗碰撞，也不适合当作密码摘要或安全校验值。

同一对象在一次程序运行中，只要参与相等比较的信息没有变化，反复调用 `hashCode()` 就应得到相同结果；规范不要求不同运行之间的结果一致。因此，不要把一般对象的散列码当作持久身份或数据库主键。

`Object.hashCode()` 的规范也**没有保证返回对象的内存地址**。它只要求尽可能让不同对象得到不同整数。旧笔记里“默认散列码就是存储地址”的说法不能作为 Java 的通用规则。

## 当对象用作集合键时

上例把 `id` 声明为 `final`，避免对象进入 `HashSet` 后再改变用于相等比较和散列计算的值。如果这类值在入集合后发生变化，查找可能落到与插入时不同的位置。编写值对象时，让相等比较涉及的字段保持不变，是最容易维护的做法。

实际重写时还要检查 `equals()` 本身的规则，例如自反、对称、传递，以及与 `null` 比较返回 `false`。不要只看两个示例对象能否比较成功，就认为实现已经满足契约。

