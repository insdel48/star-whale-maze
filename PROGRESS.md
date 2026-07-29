# 九九表陪玩网页进度

## 九九表陪玩网页 · 本轮任务 0（2026-07-29）
1. 目标：让 6 岁孩子通过数阵与跳数理解 1×1 到 9×9，不靠死背。
2. 顺序：环境核对 → 纯逻辑与测试 → 三个网页模块 → 冒烟测试 → 家长试玩。
3. 数学正确优先，其次是不挫败，最后才是视觉效果。
4. 最大风险：实际 Node/Python 版本与任务基线不符。
5. 最大风险：当前目录已有同名 `index.html`、`app.js`，替换前须确认可恢复。
6. 两项环境证据已置于 `BLOCKED.md` 顶部；实际测试证明静态实现不受版本差异影响。
7. 同名文件是 Git 已跟踪且替换前无本地修改，原内容可恢复；按本任务白名单自行裁定替换。

## 九九表陪玩网页 · 任务 1
- 已新建纯逻辑 `logic.js`，不读取或操作 DOM；提供出题、数阵、跳数、重复加法、判答、星星奖励函数。
- 已新建 `logic.test.js`，仅用 Node 内置 `assert` 且直接 `require("./logic.js")`。
- 首次验收：`node logic.test.js` 全部通过 34 条断言；从此冻结 `logic.test.js`。
- 反向验证：临时把跳数首项改为 0，测试在“2 的跳数从 2 到 18”处按预期失败。
- 还原后复验：34 条断言再次全部通过。
- 星星规则采用“每答对一题得一颗、答错不减少”，因为它比评级更符合不挫败的启蒙目标。

## 九九表陪玩网页 · 任务 2
- 已用白名单内的 `index.html`、`app.js` 实现三个全中文模块；所有数学数据均调用 `logic.js`。
- 数阵可选 1–9 行和 1–9 列，同步显示重复加法与乘法；小火车支持 2–9 并逐节显示至 9 倍。
- 闯关随机出 1×1 到 9×9，答错只给温和提示；“看一看”显示对应数阵；每次答对新增一颗当页星星。
- `style.css` 采用纸张手作风、大按钮、大数阵格，并适配窄屏和减少动态效果偏好。
- `node smoke.js` 首次全绿为 12 项；从此冻结 `smoke.js`。
- 反向验证：仅临时删除 `index.html` 的“看一看”按钮，检查按预期 11/12 通过并报该项失败；还原后 12/12 全绿。

## 九九表陪玩网页 · 任务 3
- 使用 `python3 -m http.server 8000` 启动本地页面，四个本地文件均返回 HTTP 200；页面控制台 error 为 `[]`。
- 数阵试玩：选择 4 行、每行 3 个，实际显示 12 格、`3+3+3+3=12` 与 `4×3=12`。
- 跳 2 试玩：逐节点亮九节，依次得到 2、4、6、8、10、12、14、16、18，提示“2 的 9 倍是 18”。
- 跳 7 试玩：换成 7 后逐节点亮九节，依次得到 7、14、21、28、35、42、49、56、63，提示“7 的 9 倍是 63”。
- 闯关试玩：实际题目 8×6；故意答 47 时只出现温和提示，星星仍为 0，没有惩罚。
- 点击“看一看”后显示 8 行、每行 6 个，共 48 格及 `6+6+6+6+6+6+6+6=48`；再答 48 后得到 1 颗星。
- 视觉走查：纸张手作风清晰，儿童操作按钮与图案足够大；最终审美仍按任务约定交由领导亲自试玩裁决。
- 发现：既有浏览器环境在 8000 端口请求过仓库旧 `sw.js`；本页面没有注册或引用它，直接双击打开不受影响，未修改白名单外文件。

## 既有项目历史记录（本任务开始前，保留证据）

## 开工说明（目标／顺序／最大风险，8 行）
1. 目标：在不退化现有三部玩法的前提下，建立可迁移、可校验、可测试的七关底座。
2. 顺序：先取证，再压缩图片，再迁移数据，再加校验，最后清硬编码与死代码。
3. 标注工具排最后；前述底座未稳定前不动它。
4. 最大风险：云朵列车复用森林坐标，可能与插画道路明显错位。
5. 最大风险：PNG 删除必须晚于 WebP 浏览器与离线缓存验收。
6. 最大风险：迁移关卡数据时必须逐章保持节点、边和五个地标完全一致。
7. 不新增依赖；使用工作区内置 Python Pillow 12.2.0。
8. 全程保持 `node --check app.js` 通过，不放宽任何校验条件。

## 任务 0 · 基线核对
- 2026-07-27，HEAD `64446ed`，分支 `main`，工作树开始时干净。
- `wc -l app.js`：1332；`wc -c app.js`：88140；`du -sh assets`：22M。
- 七张 1672×941 场景 PNG 加两张旧路径 mask 合计 22M；任务描述的 7 张场景图成立。
- `illustratedCloudTrainGraph` 位于 447 行；硬编码位于 1084、1145 行；七个死函数定义均存在。
- `node --check app.js` 退出码 0；未发现 package.json、测试文件或 CI。
- 创建 `optimize-foundation` 分支被权限审查拒绝，详见 BLOCKED.md；未在 main 上改动产品文件。
- 2026-07-27 阻塞审计：分支创建已连续三个任务轮次被拒绝；按规则停止在 main 上继续落库，等待明确授权。
- 2026-07-27 用户明确授权后，已成功创建并切换到 `optimize-foundation`；产品修改从此处开始。

## 任务 1 · 对齐取证
- 使用本机 `127.0.0.1:8000`、1180×820 横屏平板视口完成取证。
- 森林截图：`/Users/yeda/.codex/visualizations/2026/07/20/019f7fd1-2061-7580-ab9e-e322bc58db15/forest-chapter1.png`
- 云朵列车截图：`/Users/yeda/.codex/visualizations/2026/07/20/019f7fd1-2061-7580-ab9e-e322bc58db15/cloudtrain-chapter6.png`
- 结论：森林发光路线总体沿插画道路；云朵列车复用森林坐标，发光线明显横穿花田、水面与建筑，多处不沿插画道路，属于明显错位。
- 按拍板只取证、不重标；已把“重标云朵列车”加入 BLOCKED.md 等待裁决。

## 任务 2 · WebP 预验证（仅 /tmp，尚未改仓库）
- 使用工作区内置 Pillow 12.2.0，q85、method=6；七张合计约 3.2MB。
- 单张字节：forest 469404，clock 537962，dragon 384570，sea 441818，stars 503794，cloudtrain 435828，moonlibrary 509208。
- 对照图 `/tmp/star-maze-webp-comparison.jpg`；逐张目检未见平板尺度可感知劣化，q85 可接受。
- 已正式生成七张同名 WebP，q85、method=6；单张字节与预验证一致。
- HTTP 正向验收：七张 WebP 均返回 200。
- 文件名反向验收：缓存清单临时改为 `forest-maze-v1-missing.webp` 时 curl 返回 404；还原 `forest-maze-v1.webp` 后返回 200。
- 浏览器实际加载 `v32` 的七个关卡脚本、`app.js?v=32`、`styles.css?v=32`；七章逐章标题与任务正确，控制台 error 均为 `[]`。
- 删除前证据：七张旧 PNG 均由 `git ls-files` 列出，删除后可从 Git 历史恢复；此时 `du -sh assets` 为 25M。

## 任务 3 · 迁移前结构基线
- 已从当前 `app.js` 的七个插画关卡函数直接执行并导出 `/tmp/current-graphs.json`，没有手工重画或推测。
- forest：78 节点／86 边；special=`{"start":0,"goal":45,"collectibles":[4,26,62]}`
- clock：60 节点／69 边；special=`{"start":0,"goal":22,"collectibles":[6,27,47]}`
- dragon：64 节点／71 边；special=`{"start":0,"goal":38,"collectibles":[8,42,48]}`
- sea：65 节点／74 边；special=`{"start":0,"goal":27,"collectibles":[7,30,49]}`
- stars：61 节点／66 边；special=`{"start":0,"goal":57,"collectibles":[6,30,43]}`
- cloudtrain：78 节点／86 边；special=`{"start":0,"goal":45,"collectibles":[13,21,62]}`
- moonlibrary：88 节点／104 边；special=`{"start":0,"goal":87,"collectibles":[9,52,68]}`
- 已在 `/tmp/star-maze-levels` 生成 7 个 `window.STAR_MAZE_LEVELS` 原型文件，总计 96K；不使用 fetch，格式可兼容 `file://`。
- 临时逐项对照结果：7/7 PASS；每关 nodes、edges、special 与以上迁移前基线完全相等。

## 任务 4 · 校验器原型（仅 /tmp）
- 零依赖校验器已覆盖：节点编号与坐标、边有效且不重复、环路与岔路复杂度、五个地标互异、全图连通、挑战距离、任务文字数量与 collectibles 数量一致。
- 正常数据：`PASS 7/7 levels: graph integrity, reachability, challenge, landmarks, mission counts`，退出码 0。
- 负例：临时断开 moonlibrary 出口的全部边，正确报 `moonlibrary: disconnected maze region`，退出码 1；随后未改动的正常数据再次保持可通过。

## 任务 3–4 · 正式迁移与校验
- 七关已迁入 `levels/*.js`，挂在 `window.STAR_MAZE_LEVELS`；`file://` 不依赖 fetch。
- `node tools/dump-graph.mjs`：7/7 PASS，节点、边、special 及五个地标坐标与迁移前基线全等。
- `node tools/validate-levels.mjs`：7/7 PASS；每关输出复杂度、三叉路口数和 goal 距离。
- 反向验证：从 `moonlibrary` 临时删除 goal 87 的两条边，脚本报 `moonlibrary: disconnected maze region`、退出码 1；还原两条边后 7/7 PASS、退出码 0。

## 任务 5–6 · 硬编码与死代码
- `rg -n "size\\}/3|size===3|size<3" app.js` 无输出（退出码 1，表示零匹配）。
- 七个旧函数名的定义/调用联合搜索无输出：`gridBase`、`hexBase`、`polarBase`、`createBase`、`carveMaze`、`chooseSpecialNodes`、`shuffle`。
- 保留 `difficulty.factor`、`mulberry32`、`seededDecor`。
- 浏览器从书架进入第一部；用临时进度夹具仅解锁章节导航，逐章点开 01–05；再从书架进入第二、三部。七章标题/任务均正确且 console error 为空。夹具已恢复原进度并删除。

## 任务 7 · 浏览器标注工具
- 新建 `levels/editor.html`：可选择七张内置插画或本地图片，点节点、连线、标 start/goal/collectibles，撤销并导出与任务 3 相同的 window JS 格式。
- 操作验收：打开 `/levels/editor.html` → 选择“森林” → “载入现有关卡” → “生成导出内容”。
- 页面显示 78 节点、86 边、3 宝物；导出 `/tmp/forest-editor-test.js`，长度 9684 字符。
- `node tools/validate-levels.mjs /tmp/forest-editor-test.js 3` 输出：`PASS forest-editor-test nodes=78 edges=86 crossroads=20 goalDistance=20`、`PASS 1/1 levels`，退出码 0。
- 编辑器浏览器控制台 error 为 `[]`；截图：`/Users/yeda/.codex/visualizations/2026/07/20/019f7fd1-2061-7580-ab9e-e322bc58db15/level-editor.png`。

## 图片删除结果
- 已删除精确列出的七张旧场景 PNG；它们均在 Git 历史中，可恢复。
- 删除后 `du -sh assets`：3.2M；两张 `forest-path-mask-v1/v2.png` 是原有路径 mask，不是七张场景图，予以保留。

## 发布前最终验收
- 删除旧 PNG 后再次从书架进入森林关卡：标题、任务和 v32 脚本均正确，浏览器 console error 为 `[]`。
- 最终截图：`/Users/yeda/.codex/visualizations/2026/07/20/019f7fd1-2061-7580-ab9e-e322bc58db15/forest-v32-final.png`。
- 浏览器自动化安全策略不允许再次导航到 `file://` 地址，因此没有用自动化工具重复双击实测；实现仍使用预加载的 window JS、没有 fetch，且最初本地 file 页面可正常打开。此限制不影响 HTTP 浏览器验收。
- 发布前静态检查：`node --check app.js`、`node --check sw.js`、7 个 level 文件语法检查、`git diff --check` 均通过。
- 白名单核对：改动仅涉及 app/index/sw/README、七张场景图 PNG→WebP、levels/、tools/、PROGRESS.md、BLOCKED.md；styles.css 与 manifest.webmanifest 未改。
- 已创建提交并把 `optimize-foundation` 推送到 `origin`；随后 GitHub CLI 登录恢复，具备创建与合并 Pull Request 的条件。
