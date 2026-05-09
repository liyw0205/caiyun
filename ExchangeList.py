# 脚本名称: [奖品ID查询]
# 功能描述: [查询云朵兑换奖品的ID并生成json文件]
# 更新日期：2026-4-11

# cron: 0 0 29 2 *
# const $ = new Env('奖品ID查询')

import requests
import time
import json
import os

URL = "https://m.mcloud.139.com/market/signin/page/exchangeList"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://m.mcloud.139.com/",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}

def fetch_and_save():
    try:
        print("开始请求接口...")
        response = requests.get(URL, headers=HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data.get("code") == 0 and "result" in data:
            prizes = []
            for group_key, group_items in data["result"].items():
                for item in group_items:
                    prize_name = item.get("prizeName", "未知")
                    p_order = item.get("pOrder", "未知")
                    prize_id = item.get("prizeId", "未知")
                    prizes.append({
                        "prizeId": prize_id,
                        "pOrder": p_order,
                        "prizeName": prize_name
                    })

            query_time = time.strftime('%Y-%m-%d %H:%M:%S')
            total = len(prizes)

            print(f"查询时间: {query_time}")
            print(f"奖品总数: {total}")
            print("-" * 50)
            print(f"{'奖品ID':<12} {'兑换所需积分':<12} {'奖品名称'}")
            print("-" * 50)

            for i, p in enumerate(prizes):
                clean_name = p['prizeName'].replace('\r', '').replace('\n', '').replace('\t', ' ')
                print(f"{p['prizeId']:<12}     {p['pOrder']:<12} {clean_name}")
                if i != len(prizes) - 1:
                    print("-" * 50)

            output = {
                "query_time": query_time,
                "total": total,
                "prizes": prizes
            }
            with open("ExchangeList.json", "w", encoding="utf-8") as f:
                json.dump(output, f, ensure_ascii=False, indent=2)
            print(f"\n数据已保存至: {os.path.abspath('ExchangeList.json')}")
        else:
            error_msg = data.get('msg', '未知错误')
            print(f"接口返回错误: {error_msg}")
            with open("ExchangeList.json", "w", encoding="utf-8") as f:
                json.dump({"error": error_msg, "raw": data}, f, ensure_ascii=False, indent=2)

    except Exception as e:
        print(f"发生错误: {e}")

if __name__ == "__main__":
    fetch_and_save()