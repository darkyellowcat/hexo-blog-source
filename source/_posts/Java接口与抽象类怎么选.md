---
title: Java 接口与抽象类怎么选
date: 2026-09-29 10:30:00
categories:
  - 学习笔记
tags:
  - Java
  - 面向对象
---

**接口描述对象对外提供什么能力；抽象类可以为一组相关的子类保存共同状态和实现**。

## 用一个例子看两者如何配合

以下代码用控制台模拟消息发送。调用方只依赖 `MessageSender`，不需要知道发送器内部如何组织代码。

```java
interface MessageSender {
    void send(String message);

    default void sendIfPresent(String message) {
        if (message != null && !message.isEmpty()) {
            send(message);
        }
    }
}

abstract class NamedSender implements MessageSender {
    private final String name;

    protected NamedSender(String name) {
        this.name = name;
    }

    protected String label() {
        return "[" + name + "] ";
    }
}

class ConsoleSender extends NamedSender {
    ConsoleSender(String name) {
        super(name);
    }

    @Override
    public void send(String message) {
        System.out.println(label() + message);
    }
}

public class InterfaceExample {
    public static void main(String[] args) {
        MessageSender sender = new ConsoleSender("notice");
        sender.sendIfPresent("Hello"); // [notice] Hello
    }
}
```

`send()` 是接口规定的能力，具体类必须提供实现，除非该类仍是抽象类。`sendIfPresent()` 是接口的默认方法，调用它时会继续调用具体实现的 `send()`。`NamedSender` 则保存名字，并把构造和标签拼接逻辑留给同一类发送器的子类复用。

这个例子把两种机制放在一起展示；如果实际项目只有一个发送器、也没有共享实现的需要，直接让 `ConsoleSender implements MessageSender` 会更简单，不必专门引入抽象类。

## 接口不只是抽象方法

接口中的普通方法声明默认是 `public abstract`，实现时需要使用 `public`。接口也可以声明 `default` 方法和 `static` 方法；Java 9 起还可以使用私有方法辅助复用接口内部逻辑。接口字段始终是 `public static final`，不能用来存储每个对象各自会变化的状态。

默认方法适合在接口上增加一个对现有实现类也有合理含义的操作，但它不是“随手放公共代码”的地方。两个互不相关的接口若提供了相同签名的默认方法，实现类通常需要自己明确覆盖，不能指望编译器猜选哪一个。

## 抽象类能做什么

抽象类不能直接实例化，但可以有构造器、实例字段、普通方法和抽象方法。它适合一组关系紧密的类共享状态或部分实现。Java 类只能继承一个类，却可以实现多个接口；因此接口也适合描述不同类都具备的同一种能力。

| 遇到的问题 | 优先考虑 |
| --- | --- |
| 调用方只需约定“能做什么”，实现类可能来自不同类层次 | 接口 |
| 一组相关子类要共享实例状态、构造过程或受保护的实现 | 抽象类 |
| 两种需求同时存在 | 对外暴露接口，再按需要用抽象类复用实现 |

这只是选择依据，不是必须搭配使用的模板。先定义调用方真正需要的方法，再决定有没有足够的共性值得提取到抽象类。
