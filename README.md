# 中国移动云盘自动任务

本项目用于运行中国移动云盘自动任务。

通过配置 `asign.json` 后，执行启动脚本即可运行。  
项目支持多账号配置，并且启动脚本会自动识别 `caiyun-*.mjs` 主程序文件，避免每次版本更新后手动修改版本号。

---

## 目录结构

```text
.
├── caiyun-1.1.2.mjs      # 主程序文件，版本号可能不同
├── default_asign.json    # 默认配置示例文件
├── asign.json            # 实际运行配置文件，需要自行创建或复制
├── run.mjs               # 启动脚本
└── README.md             # 使用说明
```

说明：

| 文件 | 说明 |
|---|---|
| `caiyun-*.mjs` | 主程序文件，例如 `caiyun-1.1.2.mjs`、`caiyun-1.2.0.mjs` |
| `default_asign.json` | 配置示例文件，用于参考完整配置格式 |
| `asign.json` | 实际运行配置文件，程序运行时默认读取此文件 |
| `run.mjs` | 启动脚本 |
| `README.md` | 使用说明 |

---

## 环境要求

需要安装 Node.js。

建议使用 Node.js 18 或更高版本。

查看 Node.js 版本：

```bash
node -v
```

如果能正常输出版本号，例如：

```text
v18.20.0
```

说明 Node.js 已安装。

---

## 快速开始

### 1. 准备文件

请确保以下文件位于同一个目录中：

```text
caiyun-版本号.mjs
default_asign.json
run.mjs
```

例如：

```text
caiyun-1.1.2.mjs
default_asign.json
run.mjs
```

---

### 2. 复制配置示例

`default_asign.json` 是默认配置示例文件，不建议直接填写真实账号信息。

首次使用时，请复制一份为 `asign.json`：

Linux / macOS：

```bash
cp default_asign.json asign.json
```

Windows PowerShell：

```powershell
Copy-Item default_asign.json asign.json
```

Windows CMD：

```cmd
copy default_asign.json asign.json
```

复制后目录结构应类似：

```text
.
├── caiyun-1.1.2.mjs
├── default_asign.json
├── asign.json
├── run.mjs
└── README.md
```

---

### 3. 修改实际配置

编辑 `asign.json`，填写自己的账号信息。

最小配置示例：

```json
{
  "caiyun": [
    {
      "auth": "这里填写你的 authorization",
      "nickname": "账号1"
    }
  ],
  "message": {
    "onlyError": false
  }
}
```

其中最重要的是：

```json
"auth": "这里填写你的 authorization"
```

`auth` 是中国移动云盘 Cookie 中的 `authorization` 字段。

---

### 4. 运行

在当前目录执行：

```bash
node run.mjs
```

---

## 启动脚本

原始启动方式可能类似：

```js
import { run } from './caiyun-1.1.2.mjs';

await run('./asign.json');
```

这种写法固定了版本号。  
如果主程序文件从：

```text
caiyun-1.1.2.mjs
```

升级为：

```text
caiyun-1.1.3.mjs
```

就需要手动修改启动脚本。

推荐使用下面的 `run.mjs`，自动识别 `caiyun-*.mjs` 文件。

---

## 推荐 run.mjs

新建或修改 `run.mjs`：

```js
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
```

说明：

- 自动查找当前目录下的 `caiyun-*.mjs`
- 不需要固定版本号
- 默认读取 `./asign.json`
- 如果存在多个 `caiyun-*.mjs`，会选择排序靠后的文件

例如当前目录存在：

```text
caiyun-1.1.2.mjs
caiyun-1.1.3.mjs
caiyun-1.2.0.mjs
```

脚本会优先选择排序靠后的文件。

---

## 配置文件说明

本项目中建议保留两个配置文件：

```text
default_asign.json    # 配置示例文件
asign.json            # 实际运行配置文件
```

| 文件 | 是否填写真实信息 | 是否用于运行 | 说明 |
|---|---:|---:|---|
| `default_asign.json` | 不建议 | 默认不使用 | 作为配置模板和示例 |
| `asign.json` | 需要 | 是 | 实际运行时读取 |

默认启动脚本中的配置路径为：

```js
const configPath = './asign.json';
```

也就是说，执行：

```bash
node run.mjs
```

时，程序会读取：

```text
asign.json
```

而不是：

```text
default_asign.json
```

如果你只修改了 `default_asign.json`，但没有创建或修改 `asign.json`，程序不会使用你填写的配置。

---

## 多账号配置

`asign.json` 支持多个账号。

示例：

```json
{
  "caiyun": [
    {
      "auth": "账号1的authorization",
      "nickname": "账号1"
    },
    {
      "auth": "账号2的authorization",
      "nickname": "账号2"
    },
    {
      "auth": "账号3的authorization",
      "nickname": "账号3"
    }
  ],
  "message": {
    "onlyError": false
  }
}
```

每个账号都需要单独填写自己的 `auth`。

---

## 常用配置示例

```json
{
  "caiyun": [
    {
      "auth": "这里填写你的 authorization",
      "nickname": "账号1",
      "shake": {
        "enable": true,
        "num": 15,
        "delay": 2
      },
      "aiRedPack": {
        "enable": true
      },
      "cloudPhoneRedpack": {
        "enable": false
      },
      "盲盒": {
        "开启": true
      },
      "是否打印今日云朵": true,
      "剩余多少天刷新token": 10
    }
  ],
  "message": {
    "onlyError": false
  }
}
```

---

## 完整配置示例

`default_asign.json` 可作为完整配置示例参考。

示例：

```json
{
  "caiyun": [
    {
      "auth": "",
      "nickname": "账号1",
      "shake": {
        "enable": true,
        "num": 15,
        "delay": 2
      },
      "garden": {
        "enable": false,
        "inviteCodes": [],
        "waterFriend": 0,
        "开启果园助力": false
      },
      "aiRedPack": {
        "enable": true
      },
      "backupWaitTime": 20,
      "tasks": {
        "shareFile": "",
        "skipTasks": [],
        "每月上传任务单日数量": 5
      },
      "catalog": "/",
      "cloudPhoneRedpack": {
        "enable": false
      },
      "是否打印今日云朵": true,
      "剩余多少天刷新token": 10,
      "微信抽奖": {
        "次数": 1,
        "间隔": 500
      },
      "云朵大作战": {
        "开启": false,
        "目标排名": 500,
        "开启兑换": false,
        "邀请用户": [],
        "游戏时间": 300
      },
      "盲盒": {
        "开启": true
      },
      "文件获取方式": 1
    }
  ],
  "message": {
    "onlyError": false
  }
}
```

---

## 配置项说明

### caiyun

`caiyun` 是账号数组，每个对象代表一个中国移动云盘账号。

```json
{
  "caiyun": []
}
```

---

### auth

必填。

```json
{
  "auth": ""
}
```

说明：

```text
中国移动云盘 Cookie 中的 authorization 字段
```

如果 `auth` 为空或错误，账号任务将无法正常运行。

---

### nickname

可选。

```json
{
  "nickname": "账号1"
}
```

说明：

```text
账号昵称，用于日志中区分账号
```

---

### shake

摇一摇配置。

```json
{
  "shake": {
    "enable": true,
    "num": 15,
    "delay": 2
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `enable` | boolean | 是否开启摇一摇 |
| `num` | number | 摇一摇次数 |
| `delay` | number | 每次间隔时间，单位秒 |

---

### garden

果园配置。

```json
{
  "garden": {
    "enable": false,
    "inviteCodes": [],
    "waterFriend": 0,
    "开启果园助力": false
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `enable` | boolean | 是否开启果园 |
| `inviteCodes` | string[] | 邀请码列表 |
| `waterFriend` | number | 需要浇水的好友 UID |
| `开启果园助力` | boolean | 是否开启果园助力 |

---

### aiRedPack

AI 红包配置。

```json
{
  "aiRedPack": {
    "enable": true
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `enable` | boolean | 是否开启 AI 红包 |

---

### backupWaitTime

备份等待时间，单位秒。

```json
{
  "backupWaitTime": 20
}
```

---

### tasks

任务配置。

```json
{
  "tasks": {
    "shareFile": "",
    "skipTasks": [],
    "每月上传任务单日数量": 5
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `shareFile` | string | 分享任务默认使用的文件 ID，请确保该文件存在且后续不被删除 |
| `skipTasks` | number[] | 跳过的任务 ID |
| `每月上传任务单日数量` | number | 每月上传任务单日上传数量 |

说明：

如果某些任务无法自动完成，或者你不想运行某些任务，可以通过 `skipTasks` 跳过。

---

### catalog

上传文件使用目录的 ID，默认根目录。

```json
{
  "catalog": "/"
}
```

说明：

```text
默认值为 /
```

如需修改，请确认目录 ID 有效且文件夹真实存在。

---

### cloudPhoneRedpack

云手机红包派对配置。

```json
{
  "cloudPhoneRedpack": {
    "enable": false
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `enable` | boolean | 是否开启云手机红包派对 |

---

### 是否打印今日云朵

是否打印今日云朵信息。

```json
{
  "是否打印今日云朵": true
}
```

---

### 剩余多少天刷新token

配置剩余多少天时刷新 token。

```json
{
  "剩余多少天刷新token": 10
}
```

---

### 微信抽奖

微信抽奖配置。

```json
{
  "微信抽奖": {
    "次数": 1,
    "间隔": 500
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `次数` | number | 微信抽奖次数 |
| `间隔` | number | 微信抽奖间隔，单位毫秒 |

---

### 云朵大作战

云朵大作战配置。

```json
{
  "云朵大作战": {
    "开启": false,
    "目标排名": 500,
    "开启兑换": false,
    "邀请用户": [],
    "游戏时间": 300
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `开启` | boolean | 是否开启云朵大作战 |
| `目标排名` | number | 目标排名 |
| `开启兑换` | boolean | 是否开启兑换 |
| `邀请用户` | string[] | 邀请用户的手机号列表 |
| `游戏时间` | number | 游戏时间，单位秒 |

注意：

`邀请用户` 是你邀请的用户手机号，不是邀请你的用户。

---

### 盲盒

盲盒配置。

```json
{
  "盲盒": {
    "开启": true
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `开启` | boolean | 是否开启盲盒 |

---

### 文件获取方式

文件获取方式。

```json
{
  "文件获取方式": 1
}
```

可选值一般为：

```text
1 或 2
```

---

### message

消息配置。

```json
{
  "message": {
    "onlyError": false
  }
}
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `onlyError` | boolean | 是否只输出或推送错误消息 |

---

## 默认配置说明

如果某些字段没有写，程序会使用默认值。

常见默认值如下：

```json
{
  "shake": {
    "enable": true,
    "num": 15,
    "delay": 2
  },
  "garden": {
    "enable": false,
    "inviteCodes": [],
    "开启果园助力": false
  },
  "aiRedPack": {
    "enable": true
  },
  "backupWaitTime": 20,
  "tasks": {
    "skipTasks": [],
    "每月上传任务单日数量": 5
  },
  "catalog": "/",
  "cloudPhoneRedpack": {
    "enable": false
  },
  "是否打印今日云朵": true,
  "剩余多少天刷新token": 10,
  "微信抽奖": {
    "次数": 1,
    "间隔": 500
  },
  "云朵大作战": {
    "开启": false,
    "目标排名": 500,
    "开启兑换": false,
    "邀请用户": [],
    "游戏时间": 300
  },
  "盲盒": {
    "开启": true
  },
  "文件获取方式": 1
}
```

因此，如果你不想修改默认行为，可以只写最简单配置：

```json
{
  "caiyun": [
    {
      "auth": "这里填写你的 authorization",
      "nickname": "账号1"
    }
  ],
  "message": {
    "onlyError": false
  }
}
```

---

## JSON 格式注意事项

`asign.json` 和 `default_asign.json` 都必须是标准 JSON 格式。

请注意：

1. 不能写注释。
2. 不能有尾逗号。
3. 字符串必须使用英文双引号。
4. 字段名必须使用英文双引号。
5. 中文字段也必须使用英文双引号。
6. 布尔值只能写 `true` 或 `false`，不能写 `"true"` 或 `"false"`。
7. 数字不要加引号，除非该字段明确要求字符串。

错误示例：

```json
{
  "caiyun": [
    {
      "auth": "",
    }
  ]
}
```

错误原因：

```text
"auth": "", 后面多了尾逗号
```

正确示例：

```json
{
  "caiyun": [
    {
      "auth": ""
    }
  ]
}
```

---

## 常见问题

### 1. 提示未找到 caiyun-*.mjs 文件

请检查当前目录下是否存在主程序文件。

文件名应类似：

```text
caiyun-1.1.2.mjs
```

并且符合：

```text
caiyun-*.mjs
```

---

### 2. 提示未找到 run 方法

如果出现类似错误：

```text
xxx 中未导出 run 方法
```

说明主程序文件中没有导出 `run` 方法。

请确认主程序是否支持下面这种调用方式：

```js
import { run } from './caiyun-1.1.2.mjs';

await run('./asign.json');
```

---

### 3. 修改了 default_asign.json 但运行没生效

默认启动脚本读取的是：

```text
asign.json
```

不是：

```text
default_asign.json
```

请确认你已经执行过：

```bash
cp default_asign.json asign.json
```

并修改的是：

```text
asign.json
```

---

### 4. JSON 配置报错

请检查：

- 是否有注释
- 是否有尾逗号
- 是否使用了中文引号
- 是否括号不完整
- 是否把布尔值写成了字符串

错误：

```json
{
  "message": {
    "onlyError": "false"
  }
}
```

正确：

```json
{
  "message": {
    "onlyError": false
  }
}
```

---

### 5. 多个 caiyun-*.mjs 文件会使用哪个？

`run.mjs` 会读取当前目录下所有符合条件的文件：

```text
caiyun-*.mjs
```

然后排序并选择靠后的文件。

例如：

```text
caiyun-1.1.2.mjs
caiyun-1.1.3.mjs
caiyun-1.2.0.mjs
```

通常会选择：

```text
caiyun-1.2.0.mjs
```

---

## 更新主程序

当主程序版本更新时，例如从：

```text
caiyun-1.1.2.mjs
```

更新为：

```text
caiyun-1.1.3.mjs
```

只需要把新的 `caiyun-*.mjs` 文件放到当前目录。

如果使用推荐的 `run.mjs`，不需要修改启动脚本。

---

## 安全建议

1. 不要把包含真实 `auth` 的 `asign.json` 上传到公开仓库。
2. `default_asign.json` 只作为示例模板，建议不要填写真实账号信息。
3. 如果使用 Git，建议将 `asign.json` 加入 `.gitignore`。

建议创建 `.gitignore`：

```gitignore
asign.json
```

如果还需要忽略日志文件，可以写成：

```gitignore
asign.json
*.log
logs/
```

---

## 免责声明

本项目仅供学习和交流使用。

请勿用于非法用途。  
使用本项目产生的任何后果由使用者自行承担。