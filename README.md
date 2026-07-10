# proxy-rules

个人 Clash 分流配置（基于 [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)，方案 B 精简版）。

**特性**：按地区分组（港/日/美/新/台）+ 独立 AI 组 + 标准去广告。

## 结构

- `my.ini` — **自动生成**，供 subconverter 使用的自定义配置（策略组 + 规则加载）。请勿手改。
- `partials/` — `my.ini` 的源片段（拆开维护，便于复用）：
  - `header.ini` — 文件头注释
  - `rules-personal.ini` — **个人规则加载**（MyDirect / MyProxy，指向本仓库 rules/）
  - `rules-official.ini` — 官方规则加载（ACL4SSR 在线，自动同步）；拼在末尾，故显示顺序不影响其优先级
  - `groups-lead.ini` — **置顶策略组**：🚀 节点选择 + 🤖 AI服务
  - `manga.ini` — 漫画（ruleset + 📚 漫画 策略组，一体）；**仅 `my` 引入**，显示排在 AI 之后
  - `groups-region.ini` — 地区测速组（自动选择 + 港/日/美/新/台/韩）
  - `groups-business.ini` — 其余业务分组（媒体 / 微软 / 直连 / 拦截 / 兜底）
  - `footer.ini` — 转换器开关（**公共块**）

  > 策略组显示顺序 = `custom_proxy_group` 行的拼接顺序（纯 UI，不影响分流）；
  > `ruleset` 优先级 = `ruleset` 行的拼接顺序（先命中先生效，须在 FINAL 前）。二者是独立的两条流。
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

新增一个 profile：在 `build.config.json` 的 `profiles` 里加一项，列出它要拼的片段名即可。

### 片段覆盖（profile 专属版本）

解析每个片段时，脚本**先找 profile 专属子目录，再回退父目录**：

```
partials/<profile>/<片段名>.ini   ← 优先(该 profile 的专属版本)
partials/<片段名>.ini             ← 回退(所有 profile 共享的默认版本)
```

所以想让某个 profile 用不同的某片段，**只需在 `partials/<profile>/` 下放一个同名文件**，
不用改 `build.config.json` 的 `parts`。构建日志会用 `[覆盖: xxx]` 标出用了哪些专属片段。

**现有 profile：**

| profile | 输出 | 说明 |
|---|---|---|
| `my`    | `my.ini`    | 含个人规则(personal)；漫画组正常。 |
| `outer` | `outer.ini` | **不含个人规则**；用 `partials/outer/groups-business.ini` 覆盖，去掉了依赖个人规则的 📚 漫画 组。 |

## 使用

subconverter 订阅链接（`config` 指向本仓库的 `my.ini` raw 地址）：

```
https://你的subconverter地址/sub?target=clash&url=<机场订阅链接URL编码>&config=<my.ini的raw地址URL编码>
```

其中 `my.ini` 的 raw 地址为：

```
https://raw.githubusercontent.com/Reedef/proxy-rules/main/my.ini
```
