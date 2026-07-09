# proxy-rules

个人 Clash 分流配置（基于 [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)，方案 B 精简版）。

**特性**：按地区分组（港/日/美/新/台）+ 独立 AI 组 + 标准去广告。

## 结构

- `my.ini` — 供 subconverter 使用的自定义配置（策略组 + 规则加载）。
- `rules/MyProxy.list` — 个人强制走代理的域名。
- `rules/MyDirect.list` — 个人强制直连的域名。

绝大多数规则集直接引用 ACL4SSR 官方在线地址，自动同步官方更新；仅个人规则维护在本仓库。

## 使用

subconverter 订阅链接（`config` 指向本仓库的 `my.ini` raw 地址）：

```
https://你的subconverter地址/sub?target=clash&url=<机场订阅链接URL编码>&config=<my.ini的raw地址URL编码>
```

其中 `my.ini` 的 raw 地址为：

```
https://raw.githubusercontent.com/Reedef/proxy-rules/main/my.ini
```
