import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const currentDir = process.cwd();

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

const exchangeId = Number(
  process.env.EXCHANGE_ID || "231228012"
);

if (!Number.isFinite(exchangeId) || exchangeId <= 0) {
  throw new Error(`商品 ID 不合法：${process.env.EXCHANGE_ID}`);
}

/**
 * 推荐使用 ACCOUNT_NO：
 *   ACCOUNT_NO=1 表示第 1 个账号
 *   ACCOUNT_NO=2 表示第 2 个账号
 *
 * 为了兼容旧变量，也支持 ACCOUNT_INDEX：
 *   ACCOUNT_INDEX=0 表示第 1 个账号
 *   ACCOUNT_INDEX=1 表示第 2 个账号
 */
let accountIndex = 0;
let accountText = "";

if (process.env.ACCOUNT_NO) {
  const accountNo = Number(process.env.ACCOUNT_NO);

  if (!Number.isInteger(accountNo) || accountNo <= 0) {
    throw new Error(`账号序号不合法：ACCOUNT_NO=${process.env.ACCOUNT_NO}`);
  }

  accountIndex = accountNo - 1;
  accountText = `ACCOUNT_NO=${accountNo}，对应 config[${accountIndex}]`;
} else if (process.env.ACCOUNT_INDEX) {
  accountIndex = Number(process.env.ACCOUNT_INDEX);

  if (!Number.isInteger(accountIndex) || accountIndex < 0) {
    throw new Error(`账号下标不合法：ACCOUNT_INDEX=${process.env.ACCOUNT_INDEX}`);
  }

  accountText = `ACCOUNT_INDEX=${accountIndex}，对应 config[${accountIndex}]`;
} else {
  accountIndex = 0;
  accountText = `默认第 1 个账号，对应 config[0]`;
}

console.log(`兑换账号：${accountText}`);
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