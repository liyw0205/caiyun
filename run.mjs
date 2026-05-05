import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const configPath = './asign.json';
const currentDir = process.cwd();

const caiyunFiles = fs
  .readdirSync(currentDir)
  .filter(file => /^caiyun-.*\.mjs$/.test(file))
  .sort()
  .reverse();

if (caiyunFiles.length === 0) {
  throw new Error('未找到 caiyun-*.mjs 文件');
}

const caiyunFile = caiyunFiles[0];
const caiyunPath = path.join(currentDir, caiyunFile);

console.log(`当前使用主程序：${caiyunFile}`);
console.log(`当前使用配置：${configPath}`);

const { run } = await import(pathToFileURL(caiyunPath).href);

if (typeof run !== 'function') {
  throw new Error(`${caiyunFile} 中未导出 run 方法`);
}

await run(configPath);