import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const currentDir = process.cwd();

/**
 * 自动查找当前目录下最新的 caiyun-*.mjs
 * 例如：
 * caiyun-1.1.3.mjs
 */
const caiyunFiles = fs
  .readdirSync(currentDir)
  .filter(file => /^caiyun-.*\.mjs$/.test(file))
  .sort()
  .reverse();

if (caiyunFiles.length === 0) {
  throw new Error("未找到 caiyun-*.mjs 文件");
}

const caiyunFile = caiyunFiles[0];
const caiyunPath = path.join(currentDir, caiyunFile);

console.log(`当前使用主程序：${caiyunFile}`);

/**
 * 商品 ID
 *
 * 优先读取任务变量：
 *   EXCHANGE_ID
 *
 * 如果没有设置，就使用默认值。
 */
const exchangeId = Number(
  process.env.EXCHANGE_ID || "231228012"
);

if (!Number.isFinite(exchangeId) || exchangeId <= 0) {
  throw new Error(`商品 ID 不合法：${process.env.EXCHANGE_ID}`);
}

/**
 * 账号下标
 *
 * 原来你写的是：
 *   config[1]
 *
 * 这里支持任务变量：
 *   ACCOUNT_INDEX
 *
 * 默认仍然是 1。
 */
const accountIndex = Number(
  process.env.ACCOUNT_INDEX || "1"
);

if (!Number.isInteger(accountIndex) || accountIndex < 0) {
  throw new Error(`账号下标不合法：${process.env.ACCOUNT_INDEX}`);
}

console.log(`兑换账号下标：config[${accountIndex}]`);
console.log(`兑换商品 ID：${exchangeId}`);

const mod = await import(pathToFileURL(caiyunPath).href);

const { loadConfig, useExchange } = mod;

if (typeof loadConfig !== "function") {
  throw new Error(`${caiyunFile} 中未导出 loadConfig 方法`);
}

if (typeof useExchange !== "function") {
  throw new Error(`${caiyunFile} 中未导出 useExchange 方法`);
}

const { config, message } = await loadConfig();

if (!Array.isArray(config)) {
  throw new Error("配置读取失败：config 不是数组");
}

if (!config[accountIndex]) {
  throw new Error(`配置中不存在账号 config[${accountIndex}]`);
}

const { exchangeQuickly } = await useExchange(
  config[accountIndex],
  message
);

if (typeof exchangeQuickly !== "function") {
  throw new Error(`${caiyunFile} useExchange 返回对象中未找到 exchangeQuickly 方法`);
}

await exchangeQuickly(exchangeId);