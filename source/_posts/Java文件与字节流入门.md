---
title: Java 文件与字节流入门
date: 2026-09-29 10:10:00
categories:
  - 学习笔记
tags:
  - Java
  - IO
---

## 文件位置：`Path` 与 `File`

`Path` 表示一个文件系统路径，`File` 是较早的路径抽象。它们表示路径，不等于已经打开了文件，也不要求先创建一个 `File` 对象才能读写。新代码可以先从 `Path` 和 `Files` 入手：

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

Path path = Paths.get("data", "notes.txt");
System.out.println(path.toAbsolutePath().normalize());
System.out.println(Files.exists(path));
```

相对路径按程序运行时的工作目录解释，不是按 `.java` 文件所在目录解释。`normalize()` 会整理路径中的 `.` 和 `..`，但不会因此创建文件。旧代码如果已经使用 `File`，可以调用 `file.toPath()` 与 `Files` API 配合。

## 输入与输出：方向以程序为准

`InputStream` 从外部读取字节到程序；`OutputStream` 把程序中的字节写出去。`Files.newInputStream(path)` 和 `Files.newOutputStream(path)` 可以打开文件流。

单字节读取时，`read()` 返回 `0` 到 `255`，到达末尾返回 `-1`。批量读取时，`read(byte[])` 返回本次实际读到的字节数；写出时要传入这个数量，不能每次都把整个缓冲区写出去，否则最后一块可能混入旧数据。

下面是一段完整的文件复制程序。运行前准备好输入文件，执行 `java FileCopyExample input.txt copy.txt`：

```java
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class FileCopyExample {
    public static void main(String[] args) throws Exception {
        Path source = Paths.get(args[0]);
        Path target = Paths.get(args[1]);

        try (InputStream in = Files.newInputStream(source);
             OutputStream out = Files.newOutputStream(target)) {
            byte[] buffer = new byte[8192];
            int count;
            while ((count = in.read(buffer)) != -1) {
                out.write(buffer, 0, count);
            }
        }
    }
}
```

`Files.newOutputStream(target)` 默认会创建不存在的目标文件；目标文件已存在时会截断原内容。因此不要把唯一一份重要文件作为测试目标。若只想复制文件，直接用 `Files.copy(source, target)` 更简洁；这里手写循环是为了看清字节流的工作过程。

## 为什么使用 `try` 管理资源

文件流占用系统资源。即使读取或写入途中抛出异常，`try` 后括号中的流也会在离开代码块时关闭。示例中的输入、输出流会按声明的相反顺序关闭，不需要再手写 `finally`。

`flush()` 用于要求输出流将已缓冲的数据继续交给下一层。并非每个输出流都有自己的缓冲区，也不能把 `flush()` 理解成“数据一定已经安全落盘”。在普通文件复制中，正确关闭流是必需的；只有需要在流保持打开时及时交出缓冲数据，才考虑显式调用 `flush()`。

## 字节不是文字

上述程序复制的是原始字节，所以图片、压缩包和文本都能按相同方式处理。但要把文字变成字节或还原成文字时，必须明确字符编码。例如：

```java
import java.nio.charset.StandardCharsets;

byte[] data = "学习 Java".getBytes(StandardCharsets.UTF_8);
String text = new String(data, StandardCharsets.UTF_8);
```

把字节长度、字符数和文件大小混为一谈，容易在中文文本上出错。如果任务本来就是整段文本的读写，还可以直接使用 `Files` 提供的文本方法，无须为了使用流而手写复制循环。

