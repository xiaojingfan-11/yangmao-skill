# yangmao-skill

一个公开源码、禁止商用的优惠导购 Skill。用户发送“今日优惠”，Skill 会询问或沿用当前城市，实时读取服务端精选优惠，并返回：

- 今日最高折扣
- 今日大额优惠券
- 每个商品独立的二维码领取页及“在当前设备直接打开”入口
- 完整优惠看板

商品、排序、上下架及推广链接均由云端更新。用户安装一次即可持续获得最新内容，无需因商品变化重新安装。仓库不包含 CPS 密钥、供应商适配、佣金、订单或私有后端代码。

## 安装

```bash
git clone https://github.com/xiaojingfan-11/yangmao-skill.git ~/.codex/skills/yangmao-skill
```

安装后重启 Agent/Codex，使其重新发现 Skill。

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
- 其他 Agent：导入 `https://api.richisme.xyz/openapi.json`

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
