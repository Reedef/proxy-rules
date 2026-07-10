#!/usr/bin/env node
// 拼接 partials/ 片段, 生成 build.config.json 里声明的各 profile ini。
// 用法:
//   node build.mjs           生成全部 profile
//   node build.mjs my        只生成名为 my 的 profile
//   node build.mjs --check    只校验(不写盘): 若生成结果与现有文件不一致则以非 0 退出(适合 CI)
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(root, 'build.config.json'), 'utf8'));
const partsDir = join(root, cfg.partsDir ?? 'partials');
const outDir = join(root, cfg.outDir ?? '.');
const banner = cfg.banner ?? '';

const argv = process.argv.slice(2);
const checkOnly = argv.includes('--check');
const wanted = argv.filter((a) => !a.startsWith('--'));

function readPart(name) {
  const p = join(partsDir, `${name}.ini`);
  try {
    return readFileSync(p, 'utf8');
  } catch {
    throw new Error(`缺少片段文件: ${p} (build.config.json 里引用了 "${name}")`);
  }
}

function render(spec) {
  let body = spec.parts.map(readPart).join('');
  // 归一化: 片段之间最多一个空行, 结尾恰好一个换行
  body = body.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/\s*$/, '\n');
  // 生成横幅插入到 [custom] 行之后
  if (banner) body = body.replace(/^(\[custom\]\n)/, `$1${banner}\n`);
  return body;
}

const profiles = Object.entries(cfg.profiles).filter(
  ([name]) => wanted.length === 0 || wanted.includes(name),
);
if (profiles.length === 0) {
  console.error(`没有匹配的 profile: ${wanted.join(', ')}`);
  process.exit(2);
}

let drift = 0;
for (const [name, spec] of profiles) {
  const body = render(spec);
  const outPath = join(outDir, spec.output);
  if (checkOnly) {
    let cur = '';
    try {
      cur = readFileSync(outPath, 'utf8');
    } catch {}
    if (cur !== body) {
      console.error(`✗ ${name} -> ${spec.output} 与片段不一致 (需运行 node build.mjs)`);
      drift++;
    } else {
      console.log(`✓ ${name} -> ${spec.output} 一致`);
    }
  } else {
    writeFileSync(outPath, body, 'utf8');
    console.log(`✓ ${name} -> ${spec.output} (${spec.parts.length} 片段, ${body.length} 字节)`);
  }
}

if (checkOnly && drift > 0) process.exit(1);
console.log(checkOnly ? '校验完成' : `完成: 生成 ${profiles.length} 个 ini`);
