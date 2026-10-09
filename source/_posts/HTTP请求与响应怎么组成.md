---
title: HTTP 请求与响应怎么组成
date: 2026-09-29 10:00:00
categories:
  - 学习笔记
tags:
  - HTTP
  - 计算机网络
---

学习后端接口时，我曾把请求行叫作“状态行”，还以为只有 POST 请求才能带请求体。把一次 HTTP/1.1 交互拆开看，这两个概念就容易分清了。

## 从一次请求开始

下面的示例请求 `/notes/42`，响应是一段 JSON。这里展示的是便于阅读的 **HTTP/1.1 报文形式**；HTTP/2 和 HTTP/3 不使用同样的文本报文格式。

```http
GET /notes/42 HTTP/1.1
Host: example.com
Accept: application/json

```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 9

{"id":42}
```

空行用于分隔头部和消息体。上面的 GET 请求没有消息体；响应体 `{"id":42}` 按 ASCII 编码是 9 个字节，因此示例中的 `Content-Length` 为 9。实际长度要按传输的**字节**计算，不能直接用中文字数代替。

## 请求：我想做什么

HTTP/1.1 请求由请求行、头部字段和可选的消息体组成：

```text
方法 请求目标 HTTP版本
头字段名: 值

可选的消息体
```

请求行里的 `GET` 表示获取目标资源，`/notes/42` 是请求目标。`Host` 指明目标主机；`Accept` 表示客户端希望接收的内容类型。发送 JSON 时，常用 `Content-Type: application/json` 说明消息体的媒体类型。

不要用“GET 没有请求体、POST 一定有请求体”判断报文结构：消息体是否存在与方法名称不是一回事。GET 请求通常不发送内容，且请求内容没有通用定义的语义；POST 可以携带需要服务端处理的数据，也可能发送空内容。具体请求还要遵守所调用接口的约定。

## 响应：处理结果是什么

HTTP/1.1 响应由状态行、头部字段和可选的消息体组成。状态行中的 `200` 是状态码，`OK` 是原因短语；程序应依据状态码处理结果，不应依赖原因短语的固定文字。

| 状态码 | 常见含义 |
| --- | --- |
| `200 OK` | 请求成功，响应内容取决于请求方法 |
| `201 Created` | 已创建资源 |
| `204 No Content` | 请求成功，响应没有内容 |
| `301 Moved Permanently` | 资源被永久重定向 |
| `304 Not Modified` | 条件请求的资源未修改，可继续使用已有副本 |
| `400 Bad Request` | 服务端无法或不愿处理有问题的请求 |
| `401 Unauthorized` | 需要有效的身份凭据 |
| `403 Forbidden` | 服务端理解请求但拒绝处理 |
| `404 Not Found` | 没有找到目标资源 |
| `500 Internal Server Error` | 服务端处理时发生内部错误 |

状态码首位还可用于快速判断类别：`1xx` 表示信息，`2xx` 表示成功，`3xx` 表示重定向，`4xx` 表示客户端错误，`5xx` 表示服务端错误。响应头中的 `Content-Type` 描述内容类型，`Location` 常用于说明新资源或重定向目标，`Cache-Control` 用于表达缓存要求。

## 为什么不能把 TCP 握手画进每次 HTTP 请求

HTTP 定义请求和响应的语义，连接如何建立属于传输层。HTTP/1.1 和 HTTP/2 通常运行在 TCP 上；一条连接可以承载多个请求，不必每次请求都重新完成 TCP 握手。HTTP/3 则使用基于 UDP 的 QUIC，不能套用“先 TCP 三次握手，再发请求”的流程图。

不同版本的报文编码和传输方式不同，但方法、目标、头字段和状态码这些核心语义可以放在一起理解。初学时先读懂一组 HTTP/1.1 报文，再去了解 HTTP/2 的帧和 HTTP/3 的 QUIC，会更容易区分“请求的意思”和“消息如何传输”。

## 参考资料

- [RFC 9110：HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 9112：HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112.html)
- [RFC 9113：HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html)
- [RFC 9114：HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)
