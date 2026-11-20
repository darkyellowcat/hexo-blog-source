---
title: ArceOS 实验记录：从 NotFound 到成功进入 mmap 系统调用
date: 2026-11-16 17:15:00
categories:
  - 踩坑
tags:
  - ArceOS
  - 操作系统
  - Rust
description: "记录 ArceOS sys_map 实验中排查 NotFound 的全过程：从工具链环境变量缺失、测试脚本静默失败，最终成功触发 sys_mmap。"
---

在做 ArceOS 第五题 `sys_map` 时，我遇到了一个看起来很像文件映射相关的问题：内核启动正常，用户地址空间也创建成功，但加载用户程序时却报错 `NotFound`。

一开始，我怀疑是 FAT32 文件系统或者 ELF 加载器出了 bug。但顺着调用链由外向内逐步排查，才发现真正的原因非常朴素——只是 WSL 环境中 RISC-V musl 交叉编译工具链没有加入 `PATH`，而测试脚本又没有设置 fail-fast，把构建期的问题伪装成了运行期的内核异常。

这里把整个排查链路和踩坑细节记录下来。

<!-- more -->

## 一、第一次运行：Cannot load app! NotFound

在终端执行实验测试脚本：

```bash
./scripts/test-sys_map.sh
```

QEMU 启动很顺利，屏幕刷过了一连串内核初始化日志，但最终却直接 panic 停住了：

```text
panicked at exercises/sys_map/src/main.rs:37:21:
Cannot load app! NotFound
sys_mmap default
```

定位到 `exercises/sys_map/src/main.rs` 对应的源码：

```rust
let entry = match load_user_app("/sbin/mapfile", &mut uspace) {
    Ok(e) => e,
    Err(err) => panic!("Cannot load app! {:?}", err),
};
```

内核尝试从虚拟磁盘的 `/sbin/mapfile` 读取 ELF 并加载到用户地址空间，但底层文件系统返回了 `NotFound`。

- `mapfile.c`：用户态 C 程序的源码。
- `mapfile`：由交叉编译器生成的 RISC-V 静态链接二进制文件。

而内核加载器认的只有后者。

## 二、检查磁盘镜像：问题发生在写入之前

检查本地磁盘镜像文件：

```bash
ls -lh disk.img
```

`disk.img` 确实存在且刚刚被更新过。接着用 `mdir` 直接检查镜像内部的 `/sbin` 目录：

```bash
mdir -i disk.img ::/sbin
```

终端输出了目录内容：

```text
Directory for ::/sbin

.            <DIR>
..           <DIR>
origin   bin        14

3 files                  14 bytes free
```

`/sbin` 目录下只有一个原有的 `origin.bin`，根本没有 `mapfile` 的影子。

这说明问题根本还没走到内核解析 ELF 的阶段，而是在更早的一步——**用户程序压根就没被打包进磁盘镜像**。

## 三、追踪测试脚本：静默失败与缺失的 PATH

既然镜像里没有文件，那就看镜像是怎么生成的。打开 `scripts/test-sys_map.sh`：

```bash
cd "$(dirname "$0")/../arceos" || exit 1

rm pflash.img -f
rm disk.img -f

make pflash_img
make disk_img

make payload
./update_disk.sh payload/mapfile_c/mapfile

make run A=exercises/sys_map/ BLK=y
```

整个脚本的流程很清晰：

1. 清理旧镜像，重新生成固件与磁盘镜像；
2. 编译用户态程序（`make payload`）；
3. 把编译出的二进制文件写入磁盘镜像（`./update_disk.sh`）；
4. 启动 QEMU 运行 ArceOS。

这里脚本埋了个隐蔽的小坑：**脚本开头没有加 `set -e`**。

如果第 2 步编译失败，Shell 不会中断退出，而是若无其事地继续执行第 3 步和第 4 步。写入脚本找不到文件就写了个寂寞，最终把**构建期的编译错误**包装成了**运行期的内核 NotFound**。

顺藤摸瓜，查看用户程序的 Makefile（`arceos/payload/mapfile_c/Makefile`）：

```makefile
TARGET := mapfile

CC := riscv64-linux-musl-gcc
STRIP := riscv64-linux-musl-strip

all: $(TARGET)

%: %.c
	$(CC) -static $< -o $@
	$(STRIP) $@
```

这里需要调用 RISC-V musl 交叉编译工具链，而不是宿主机的 GCC。

在 WSL 终端里检查环境：

```bash
which riscv64-linux-musl-gcc
which riscv64-linux-musl-strip
```

两个命令都返回为空。

但工具链真的没装吗？

```bash
ls -la /opt/riscv64-linux-musl-cross/bin/
```

工具链整整齐齐地躺在 `/opt/` 下，用绝对路径直接调用也能正常跑。

**根本原因：工具链早已安装，但没有加入当前 WSL Shell 的 `PATH`。**

## 四、修复 PATH 并单独编译验证

在 WSL 终端中把工具链路径追加到当前会话：

```bash
export PATH="/opt/riscv64-linux-musl-cross/bin:$HOME/.cargo/bin:$PATH"
```

确认环境变量生效：

```bash
which riscv64-linux-musl-gcc
which riscv64-linux-musl-strip
```

两个命令都能正确输出路径了。先单独编译用户态程序：

```bash
cd ~/projects/2026a-arceos-darkyellowcat/arceos
make -C payload/mapfile_c
```

可以看到工具链正常被调用：

```text
riscv64-linux-musl-gcc -static mapfile.c -o mapfile
riscv64-linux-musl-strip mapfile
```

用 `file` 命令核对生成的文件格式：

```bash
file payload/mapfile_c/mapfile
```

输出如下：

```text
ELF 64-bit LSB pie executable,
UCB RISC-V, RVC, double-float ABI,
version 1 (SYSV), static-pie linked, stripped
```

确认是 RISC-V 64 位静态链接的可执行文件无误。

## 五、验证磁盘镜像写入与排查边界

编译产物就位后，先单独验证打包脚本：

```bash
./update_disk.sh payload/mapfile_c/mapfile
```

再次用 `mdir` 检查磁盘镜像内部的 `/sbin` 目录：

```bash
mdir -i disk.img ::/sbin
```

输出：

```text
Directory for ::/sbin

mapfile          30432 2026-11-16  16:59

1 file               30 432 bytes
```

`mapfile` 已经稳稳当当地进入了 FAT32 磁盘镜像。

需要说明的是，手动执行 `update_disk.sh` 只是排查时的**单步隔离验证**，并不是实验本身的日常操作。正常情况下，只要把环境变量配置好，让测试脚本里的 `make payload` 顺利通过，后续的打包和运行都是自动串联的。

把每一步的输入输出单独拉出来确认无误，再去跑全流程，排查的心态会踏实很多。

## 六、插曲：IntelliJ IDEA 的 Unresolved Import “虚警”

在顺带查看 `sys_map` 源码时，IntelliJ IDEA 飘了一片红线，提示：

```rust
use axhal::arch::UspaceContext;
```

存在 `unresolved import`。

第一反应是 `axhal` 是不是少导出了什么。顺着去翻 `arceos/modules/axhal/src/arch/riscv/mod.rs`：

```rust
#[cfg(feature = "uspace")]
pub use self::context::UspaceContext;
```

可以看到这个类型受 `uspace` feature 门控。再看 `exercises/sys_map/Cargo.toml`：

```toml
axhal = { workspace = true, features = ["uspace"] }
```

依赖配置里明明清清楚楚声明了 `features = ["uspace"]`。

后续命令行实际构建也证明了一切正常：程序不仅编译通过，还成功创建了用户地址空间并切换到了用户态。

猜测：在复杂的 Rust Workspace 中，如果存在多 target（如宿主机 x86_64 与目标机 RISC-V）和大量条件编译，IDE 默认的索引视图可能并没有激活特定的 feature 组合，从而报出虚假的未解析错误。

## 七、重新运行：成功进入 sys_mmap()

前置环境理顺后，再次执行完整的测试脚本：

```bash
./scripts/test-sys_map.sh
```

这一次，控制台输出完全变了样。

内核顺利完成了 ELF 的段解析与虚存映射：

```text
phdr: offset: 0x0=>0x0 size: 0x5FAC=>0x5FAC
VA:0x0 - VA:0x6000

phdr: offset: 0x6E70=>0x7E70 size: 0x340=>0x9B0
VA:0x7000 - VA:0x9000

entry: 0x526
```

随后成功分配了用户栈并建立地址空间：

```text
Mapping user stack: VA:0x3fffff0000 -> VA:0x4000000000

New user address space: AddrSpace {
    va_range: VA:0x0..VA:0x4000000000,
    page_table_root: PA:0x8064e000,
}
```

进入用户态后，用户程序开始发起一系列系统调用：

```text
handle_syscall [96] ...
handle_syscall [29] ...
handle_syscall [66] ...
MapFile ...
handle_syscall [56] ...
handle_syscall [64] ...
handle_syscall [57] ...
handle_syscall [56] ...
```

可以看到文件创建、写入、读取等准备动作都已跑通。最后，程序调用了 222 号系统调用：

```text
handle_syscall [222] ...

panicked at exercises/sys_map/src/syscall.rs:143:5:
not implemented: no sys_mmap!
```

翻看 `exercises/sys_map/src/syscall.rs`：

```rust
fn sys_mmap(
    addr: *mut usize,
    length: usize,
    prot: i32,
    flags: i32,
    fd: i32,
    _offset: isize,
) -> isize {
    unimplemented!("no sys_mmap!");
}
```

这说明我们已经彻底排除了环境、编译、镜像打包、内核文件读取、ELF 解析与用户态初始化的所有干扰。外层的所有阻碍都被清扫干净，代码正式停在了本次实验的核心入口——实现 `sys_mmap()`。

## 八、总结与排查心法

梳理一下这次排查过程中遇到的各个现象：

| 异常现象 | 实际原因 | 排查与应对方式 |
| --- | --- | --- |
| `Cannot load app! NotFound` | 磁盘镜像内缺少 `mapfile` | 用 `mdir` 检查镜像内部，锁定缺失环节 |
| `riscv64-linux-musl-gcc: not found` | 工具链目录未加入当前 WSL 的 `PATH` | 补充环境变量，检查 `which` 输出 |
| 编译失败但脚本没有停下 | 测试脚本缺少 `set -e`，缺乏 fail-fast | 逐行拆解测试脚本，单独执行子命令 |
| IDEA 报 `unresolved import` | 交叉编译环境与 IDE 静态索引不一致 | 以终端真实的 Cargo 编译结果为准 |
| `not implemented: no sys_mmap!` | 系统调用尚未实现 | 符合预期的断点，开始编写实验代码 |

做操作系统实验时，最忌讳的是“头痛医头”：看到内核报 `NotFound` 就一头扎进文件系统驱动或者内核代码里。

实际上，操作系统实验的运行依赖于一条非常严密的因果链：

```text
宿主机环境变量 (PATH)
        ↓
用户态程序交叉编译 (payload)
        ↓
打包写入磁盘镜像 (disk.img)
        ↓
QEMU 启动与内核文件系统读取 (/sbin/mapfile)
        ↓
ELF 解析与用户地址空间建立
        ↓
用户态执行与系统调用分发 (syscall 222)
```

沿着这条链路**由外向内、由前向后**逐步排查：前一级没有稳定产物，后一级必然报错；前一级确认正常，再把疑点留给下一级。
