# cliq-dify-agent-proxy

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Docker Pulls](https://img.shields.io/docker/pulls/mmhk/cliq-dify-agent-proxy)](https://hub.docker.com/r/mmhk/cliq-dify-agent-proxy)


此專案是一個代理服務器，用於連接 Zoho Cliq 與 Dify.AI，實現智能對話功能。

## 功能特點

- 無縫整合 Zoho Cliq 與 Dify.AI
- 支援多輪對話
- 自動處理消息轉發
- 安全的 API 認證機制

## 系統需求

- Node.js 16.x 或更高版本
- npm 或 yarn 包管理器
- 有效的 Zoho Cliq 帳號
- Dify.AI API 金鑰


## 技术栈

- **Deluge**: 一个类似于 JavaScript 的脚本语言，用于编写 Bot Hook 的处理逻辑。
- **Incoming Webhook**: 用于处理长时间运行的任务。

## 限制与挑战

尽管 Deluge 提供了一种简单的方式来编写处理逻辑，但它在很多方面受到了限制：

1. **语法限制**:
    - Deluge 是一个阉割版的 JavaScript，缺少许多现代 JavaScript 的高级特性。
    - 这使得某些复杂的逻辑难以实现。

2. **执行时间限制**:
    - `invokeurl` 函数用于调用外部 API，但其执行时间有严格的限制。
    - 这意味着对于需要长时间处理的任务，直接使用 `invokeurl` 可能会导致超时。

3. **外部 API 调用**:
    - 尽管可以通过 `invokeurl` 调用外部 API 来实现一些额外的处理，但由于执行时间限制，很多情况下需要采用其他方法。

## 解决方案

为了克服上述限制，推荐使用 **Incoming Webhook** 来处理长时间运行的任务：

1. **使用 Incoming Webhook**:
    - 当接收到 Zoho Cliq 的消息时，可以通过 Deluge 脚本触发一个外部服务的 webhook。
    - 外部服务可以处理长时间运行的任务，并在完成后将结果发送回 Zoho Cliq。

2. **示例流程**:
    - 用户在 Zoho Cliq 中触发某个操作。
    - Deluge 脚本接收到消息后，调用外部服务的 webhook。
    - 外部服务处理任务并返回结果。
    - 结果通过另一个 webhook 或其他方式发送回 Zoho Cliq。
