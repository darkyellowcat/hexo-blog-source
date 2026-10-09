---
title: Java 二维数组复制：共享行与复制元素
date: 2026-09-29 10:20:00
categories:
  - 学习笔记
tags:
  - Java
  - 数组
---

## 举例

```java
public class ArrayCopyExample {
    public static void main(String[] args) {
        int[][] original = {{2, 4}, {6, 8}};

        int[][] sharedRows = original.clone();
        sharedRows[0][0] = 20;

        int[][] copiedRows = new int[original.length][];
        for (int i = 0; i < original.length; i++) {
            copiedRows[i] = new int[original[i].length];
            System.arraycopy(original[i], 0, copiedRows[i], 0, original[i].length);
        }
        copiedRows[0][0] = 99;

        System.out.println(original[0][0]);              // 20
        System.out.println(sharedRows[0][0]);            // 20
        System.out.println(copiedRows[0][0]);            // 99
        System.out.println(original == sharedRows);      // false
        System.out.println(original[0] == sharedRows[0]); // true
        System.out.println(original[0] == copiedRows[0]); // false
    }
}
```

Java 的 `int[][]` 实际上是“元素为 `int[]` 引用的数组”。可以分两层看：

```text
original ──> 外层数组 ──> 第一行 int[] {2, 4}
                       └─> 第二行 int[] {6, 8}
```

## 复制外层数组：行仍然共享

`original.clone()` 创建了新的外层数组，但复制到新外层数组中的元素是**行数组的引用**。因此 `original != sharedRows`，而 `original[0] == sharedRows[0]`。改动 `sharedRows[0][0]`，相当于改动两者共同指向的第一行，所以 `original[0][0]` 也变成 `20`。

只调用一次 `System.arraycopy(original, ..., another, ...)` 复制整个外层数组，效果也是复制行引用；它不会自动递归地复制每一行。

## 逐行复制：整数元素不再共享

示例中的循环为每一行新建 `int[]`，再把该行的整数复制过去。此时 `copiedRows[0]` 与 `original[0]` 是两个数组。给 `copiedRows[0][0]` 赋值 `99`，不会改变 `original[0][0]`。

顺序也重要：程序先通过 `sharedRows` 把原数组的 `2` 改成 `20`，随后才创建 `copiedRows`。因此复制进去的是 `20`，最后又被改成 `99`。分析原练习的结果时，也要按代码执行顺序跟踪每一步，而不能只看最初的初始化值。

这里复制的是 `int` 这样的基本类型值。若行内存放的是对象引用，逐行复制只会复制这些引用，对象本身仍可能被共享；“复制行”不等于“递归复制了所有对象”。
