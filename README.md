# 薅羊毛小助手

“薅羊毛小助手”是一个帮你全网寻找优惠的 Skill，覆盖外卖、闪购、会员充值、酒店机票等优惠业务。公开源码、禁止商用；用户发送“今日优惠”，Skill 会询问或沿用当前城市，实时读取服务端精选优惠，并返回：

- 今日最高折扣
- 今日大额优惠券
- 每个商品独立的二维码领取页及“在当前设备直接打开”入口
- 完整优惠看板

商品、排序、上下架及推广链接均由云端更新。用户安装一次即可持续获得最新内容，无需因商品变化重新安装。仓库不包含 CPS 密钥、供应商适配、佣金、订单或私有后端代码。

## Codex 安装

```bash
git clone https://github.com/xiaojingfan-11/yangmao-skill.git ~/.codex/skills/yangmao-skill
```

安装后重启 Agent/Codex，使其重新发现 Skill。

也可以直接把仓库地址发给支持 GitHub Skill 安装的 Agent：

```text
请从下面的 GitHub 仓库安装并启用“薅羊毛小助手” Skill。安装后读取仓库根目录 SKILL.md；每次查询必须实时调用 API，禁止缓存、复用或凭记忆回答上一次的优惠数据：
https://github.com/xiaojingfan-11/yangmao-skill
```

## 其他 Agent 安装

支持 `SKILL.md` 的 Agent：下载或克隆本仓库，将根目录 `SKILL.md` 导入其 Skills 目录，然后重启或刷新 Skills。

```bash
git clone https://github.com/xiaojingfan-11/yangmao-skill.git yangmao-skill
```

不支持 `SKILL.md`、但支持 HTTP API 或 OpenAPI 的 Agent：导入以下公开接口定义，并把“今日优惠”配置为入口指令：

```text
https://api.richisme.xyz/openapi.json
```

接入时必须遵守：每次查询实时调用 API；只展示接口返回内容；不得缓存、补写或凭模型记忆编造优惠；使用接口返回的领取链接，不自行拼接推广链接。

## 豆包手机端安装

豆包普通对话不能直接访问第三方 API，需要使用豆包 App 的“创建技能”模式：

1. 打开豆包 App，新建对话。
2. 选择底部的“创建技能”。
3. 发送下面的创建要求。
4. 创建完成后启用“包优惠”，在普通对话中发送“今日优惠”。

```text
请创建一个名为“包优惠”的技能。

触发指令“今日优惠”时，实时 GET：
https://api.richisme.xyz/v1/offers/today?city=530100

把 promotions 展示为“今日折扣促销”，把 coupons 展示为“今日领券优惠”，每组最多10条。每项显示 title、summary、valueText；city 为 null 时标注“全国可用”；使用 detailUrl 生成可点击的“查看并领取”。每次查询必须实时调用 API，禁止缓存、复用或凭记忆回答上一次的优惠数据；禁止编造接口未返回的内容。

精选推荐结束后提示：
没有找到想要的商品？可以继续问我，例如“会员充值”“携程优惠”“咖啡”“外卖红包”“品牌点餐”“酒店机票”或“酒吧优惠”。

用户继续询问具体品类、品牌或需求时，实时 POST：
https://api.richisme.xyz/v1/catalog/search
Content-Type: application/json

请求体：
{"keyword":"从用户问题中提取的关键词","city":"530100","limit":20}

读取 offers 数组并展示 title、summary、适用范围，以及由 redirectUrl 生成的“查看并领取”。不得只筛选今日精选；无结果时明确说明完整商品库暂未找到；nextCursor 不为空且用户回复“更多”时继续查询下一页。
```

当前豆包安装示例固定使用昆明代码 `530100`。全国城市自动识别上线前，创建技能时应替换为用户需要的城市代码。

商品、精选名单、排序、上下架、说明和领取链接均来自同一套云端 API。因此只需在运营后台修改一次，GitHub Skill、豆包 Skill 和其他 Agent 下一次查询时都会获得最新数据，无需重新安装。GitHub 中的 Skill 规则文件发生变化时，已经安装到第三方平台的本地副本不会自动升级，需要平台重新导入或更新；这与商品数据实时同步是两件事。

## 使用

```text
今日优惠
```

首次使用时按提示输入城市，例如“昆明”。后续可直接说“今日优惠”或“切换城市”。

完整看板：https://luck.richisme.xyz/

## 支持的接入方式

- Codex/兼容 Skills 的 Agent：读取根目录 `SKILL.md`
- WorkBuddy/CodeBuddy：使用插件清单和 `skills/yangmao-skill/SKILL.md`
- MCP Agent：运行 `pnpm mcp`
- 豆包手机端：使用“创建技能”生成 API 调用脚本
- 其他 Agent：读取根目录 `SKILL.md`，或导入 `https://api.richisme.xyz/openapi.json`

## 开发验证

需要 Node.js 24 LTS 与 pnpm 11：

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm security:boundary
```

## 许可证

本项目采用 PolyForm Noncommercial License 1.0.0。允许个人学习、研究、测试和其他非商业用途；禁止商业使用。商业授权请联系项目所有者。

这属于“公开源码（source-available）”，不是 OSI 定义的开源软件。
