"use strict";

const fs = require("node:fs");

const files = {
  html: fs.readFileSync("index.html", "utf8"),
  css: fs.readFileSync("style.css", "utf8"),
  app: fs.readFileSync("app.js", "utf8"),
  logic: fs.readFileSync("logic.js", "utf8"),
};
const allSource = Object.values(files).join("\n");
let checkCount = 0;

function check(description, condition) {
  if (!condition) {
    console.error(`✗ ${description}`);
    process.exitCode = 1;
    return;
  }
  checkCount += 1;
  console.log(`✓ ${description}`);
}

check("存在数阵摆一摆模块锚点", /id=["']array-play["']/.test(files.html));
check("存在跳数小火车模块锚点", /id=["']skip-train["']/.test(files.html));
check("存在口诀闯关模块锚点", /id=["']challenge["']/.test(files.html));
check("存在“看一看”按钮", /<button[^>]*id=["']show-array-hint["'][^>]*>[\s\S]*?看一看[\s\S]*?<\/button>/.test(files.html));
check("logic.js 在 app.js 之前加载", files.html.indexOf("logic.js") < files.html.indexOf("app.js"));
check("网页脚本调用统一逻辑层", /MultiplicationLogic/.test(files.app));
check("每个模块都有家长引导语", (files.html.match(/class=["'][^"']*parent-tip[^"']*["']/g) || []).length >= 3);
check("没有计时压力词或程序标识", !/(countdown|timer|倒计时)/i.test(allSource));
check("没有网络外链或 CDN", !/(https?:\/\/|cdn)/i.test(allSource));
check("没有外部资源标签", !/<(?:script|link|img)[^>]+(?:src|href)=["'](?:\/\/|https?:)/i.test(files.html));
check("三个页面文件均为本地相对引用", /href=["']style\.css["']/.test(files.html) && /src=["']logic\.js["']/.test(files.html) && /src=["']app\.js["']/.test(files.html));
check("界面包含星星贴纸区域", /id=["']star-stickers["']/.test(files.html));

if (process.exitCode) {
  console.error(`\n未通过；已通过 ${checkCount} 项检查`);
} else {
  console.log(`\n全部通过：${checkCount} 项检查`);
}
