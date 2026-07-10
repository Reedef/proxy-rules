# proxy-rules

个人 Clash 分流配置（基于 [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)，方案 B 精简版）。

**特性**：按地区分组（港/日/美/新/台）+ 独立 AI 组 + 标准去广告。

## 结构

- `my.ini` — **自动生成**，供 subconverter 使用的自定义配置（策略组 + 规则加载）。请勿手改。
- `partials/` — `my.ini` 的源片段（拆开维护，便于复用）：
  - `header.ini` — 文件头注释
  - `rules-personal.ini` — **个人规则加载**（指向本仓库 rules/，单独维护）
  - `rules-official.ini` — 官方规则加载（ACL4SSR 在线，自动同步）
  - `groups-region.ini` — 地区测速组 + 主入口（**公共块，可跨 profile 复用**）
  - `groups-business.ini` — 业务分组（AI / 媒体 / 漫画 / 微软 等）
  - `footer.ini` — 转换器开关（**公共块**）
- `build.config.json` — 声明每个 profile 由哪些片段按序拼成。
- `build.mjs` — 拼接脚本（零依赖 Node）。
- `rules/MyProxy.list` — 个人强制走代理的域名。
- `rules/MyDirect.list` — 个人强制直连的域名。
- `rules/MyManga.list` — 漫画站点（走 📚 漫画 组）。

绝大多数规则集直接引用 ACL4SSR 官方在线地址，自动同步官方更新；仅个人规则维护在本仓库。

## 构建（改配置的正确姿势）

subconverter 的 ini **不支持 include 另一个 ini**，所以用片段 + 拼接脚本实现复用：

```bash
node build.mjs          # 按 build.config.json 拼接生成所有 profile 的 ini
node build.mjs my       # 只生成名为 my 的 profile
node build.mjs --check  # 校验 my.ini 是否与片段一致(不写盘, 供 CI/提交前检查)
```

**改配置时改 `partials/` 下的片段，然后 `node build.mjs` 重新生成 `my.ini` 再提交。**

新增一个 profile（复用公共片段）：在 `build.config.json` 的 `profiles` 里加一项，
例如复用 `groups-region` / `footer`，只换 `groups-business`：

```json
"lite": { "output": "lite.ini", "parts": ["header", "rules", "groups-region", "groups-business-lite", "footer"] }
```
再建对应的 `partials/groups-business-lite.ini` 即可。

## 使用

subconverter 订阅链接（`config` 指向本仓库的 `my.ini` raw 地址）：

```
https://你的subconverter地址/sub?target=clash&url=<机场订阅链接URL编码>&config=<my.ini的raw地址URL编码>
```

其中 `my.ini` 的 raw 地址为：

```
https://raw.githubusercontent.com/Reedef/proxy-rules/main/my.ini
```
