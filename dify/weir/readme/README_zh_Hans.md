# Weir：推特（X）和 Reddit 数据

在 Dify 的工作流和智能体里读取公开的推特（X）和 Reddit 数据，无需 X 或 Reddit 账号，也无需 API Key。

## 工具

| 工具 | 返回内容 |
| --- | --- |
| 搜索推文 | 符合关键词和筛选条件的推文：账号、语言、最少点赞数、日期。查询里可以直接写 `from:`、`min_faves:` 等 X 搜索运算符。 |
| 获取推文回复 | 一条推文下的回复。 |
| 获取推文串 | 作者连续发布的完整推文串。 |
| 获取账号的推文 | 某个账号最近发布的推文。 |
| 搜索 Reddit | 全站或某个社区里的帖子。 |
| 获取 Reddit 评论 | 一条帖子的评论，按回复层级嵌套。 |

每个工具同时返回接口的 JSON（给工作流节点用）和一段简短文字（给智能体看）。推文和 Reddit 相关的工具既可以填 ID，也可以直接粘贴链接。

## 设置

1. 在 [weirapp.io](https://weirapp.io) 注册，在控制台的 Keys 页面创建 API Key。每个账号每月有 5,000 免费积分，无需绑卡。
2. 在 Dify 里打开 Weir 插件的设置，粘贴 Key。插件会用一次免费调用验证它。

## 价格

Weir 预付费，按结果计费：每条推文 1 积分，每条 Reddit 帖子或评论 3 积分，每次请求另加 1 积分。失败的调用不收费。最新价格见 [weirapp.io/pricing](https://weirapp.io/pricing)。

## 示例

在智能体里问：“这个月 r/SaaS 上大家怎么评价按用量计费？”智能体会用 **搜索 Reddit**（`subreddit: SaaS`，`time: month`），再对值得读的帖子调用 **获取 Reddit 评论**。

## 隐私

插件本身不存储任何数据，只把工具的输入和你的 Key 发送到 `api.weirapp.io`。详见 [PRIVACY.md](../PRIVACY.md)。

## 支持

- 源代码：https://github.com/tarun-khatri/weir-mcp/tree/main/dify/weir
- 文档：https://docs.weirapp.io
- 邮箱：support@weirapp.io

Weir 是独立产品，与 X 和 Reddit 无关联。
