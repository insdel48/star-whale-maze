(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const canvas = $("#mazeCanvas");
  const ctx = canvas.getContext("2d");
  const miniMap = $("#miniMap");
  const miniCtx = miniMap.getContext("2d");
  const stage = $("#mazeStage");
  const sceneImageFiles = {
    forest: "forest-maze-v1.webp", clock: "clock-maze-v1.webp", dragon: "dragon-maze-v1.webp",
    sea: "sea-maze-v1.webp", stars: "stars-maze-v1.webp", cloudtrain: "cloud-train-maze-v1.webp",
    moonlibrary: "moon-library-maze-v1.webp"
  };
  const sceneImages = Object.fromEntries(Object.entries(sceneImageFiles).map(([theme, file]) => {
    const image = new Image();
    image.decoding = "async";
    image.addEventListener("load", () => { if (state.graph && chapters[state.chapter].theme === theme) draw(); });
    image.src = `./assets/scenes/${file}`;
    return [theme, image];
  }));

  const chapters = [
    {
      title: "雨落下来的晚上", kicker: "星鲸坠落以后", icon: "🌲", item: "✨", goal: "🚪",
      mission: "找到 3 盏萤火灯，再去森林门",
      story: "一颗蓝色的星星掉进森林。阿洛披上雨衣，跟着微弱的歌声出发了。",
      finds: ["第一盏灯说：别怕走进看不见尽头的小路。", "第二盏灯落在树根深处，像一颗温暖的眼睛。", "第三盏灯亮起时，整座森林都开始呼吸。"],
      winKicker: "第一盏星灯亮了", winTitle: "森林记住了阿洛的名字", winStory: "树木让开一条路，远处传来齿轮倒着转动的声音。", theme: "forest", goalName: "森林门"
    },
    {
      title: "会倒着走的钟城", kicker: "时间迷了路", icon: "🕰️", item: "⚙️", goal: "🔔",
      mission: "找回 3 枚铜齿轮，敲响钟楼",
      story: "城里的钟都在倒着走。昨天追着今天跑，所有门每分钟都会换一次方向。",
      finds: ["小齿轮咔哒一声，记起了早晨。", "第二枚齿轮藏在时间最慢的圆环里。", "三枚齿轮一起转动，钟城终于等来了明天。"],
      winKicker: "第二盏星灯亮了", winTitle: "停住的时间重新出发", winStory: "十二声钟响变成十二只鸟，飞向远处沉睡的龙脊。", theme: "clock", goalName: "钟楼"
    },
    {
      title: "睡龙的背脊", kicker: "山也会做梦", icon: "🐉", item: "💎", goal: "🥚",
      mission: "找到 3 颗梦石，唤醒龙蛋",
      story: "阿洛踩着一片片鳞甲前进。脚下的山打着呼噜，每一次呼吸都会改变岩洞的岔路。",
      finds: ["蓝色梦石里，藏着一场会飞的梦。", "金色梦石很烫，像一小团太阳。", "最后一颗梦石醒来，巨龙翻了个身。"],
      winKicker: "第三盏星灯亮了", winTitle: "巨龙送出一阵顺风", winStory: "龙蛋裂开一条银色的缝，里面涌出的风把阿洛送向月亮海。", theme: "dragon", goalName: "龙蛋"
    },
    {
      title: "月亮沉入大海", kicker: "潮汐忘记回家", icon: "🌊", item: "🐚", goal: "🗼",
      mission: "收集 3 只回声贝，点亮灯塔",
      story: "月亮沉在海底，岛屿像鲸鱼一样慢慢游动。只有贝壳记得灯塔在哪里。",
      finds: ["贝壳里传来森林落雨的声音。", "第二只贝壳装着钟城清脆的钟声。", "第三只贝壳唱起星鲸很久以前的歌。"],
      winKicker: "第四盏星灯亮了", winTitle: "月亮从海里升起来", winStory: "灯塔的光铺成一座银桥，一直通向天空中最后的花园。", theme: "sea", goalName: "灯塔"
    },
    {
      title: "星星开花的庭院", kicker: "天空的另一边", icon: "🌌", item: "⭐", goal: "🐋",
      mission: "摘下 3 颗星种子，找到星鲸",
      story: "这里没有上和下，只有一条条发光的星路。阿洛听见老朋友在花园尽头歌唱。",
      finds: ["第一颗星种子开出一朵蓝色小花。", "第二颗星种子照亮了走过的所有远路。", "最后一颗星种子说：真正的勇敢，是愿意送朋友回家。"],
      winKicker: "五盏星灯全部亮了", winTitle: "星鲸终于游回天空", winStory: "它绕着阿洛游了三圈，留下一个会发光的约定：迷路的时候，抬头就能再见。", theme: "stars", goalName: "星鲸"
    },
    {
      title: "云朵列车的最后一站", kicker: "最后一班送雨列车", icon: "🚂", item: "🎫", goal: "🌈",
      mission: "找到 3 张云朵车票，把朵朵送到彩虹站",
      story: "一朵叫朵朵的小云错过了最后一班送雨列车。远方的花谷等着下雨，阿洛答应陪它穿过整张大地图。",
      finds: [
        "第一张车票从雾里亮起来，告诉他们：真正的站台藏在向日葵转身的方向。",
        "第二张车票落在断桥边。朵朵鼓起勇气下了一场小雨，一道彩虹变成了新桥。",
        "雪洞冻住了最后一张车票。阿洛把提灯贴近冰面，温暖让列车重新响起汽笛。"
      ],
      winKicker: "花谷终于等到了雨", winTitle: "朵朵搭上了回家的列车", winStory: "列车驶进彩虹站，朵朵化成一场温柔的雨。花朵抬起头，阿洛收到一张写着“下次见”的云朵车票。", theme: "cloudtrain", goalName: "彩虹站"
    },
    {
      title: "逃走的故事页", kicker: "月亮落下以前", icon: "📚", item: "📜", goal: "🌙",
      mission: "找回 3 张故事页，打开月亮书库",
      story: "午夜的风把一本没有结尾的故事吹散了。三张故事页变成纸鸟，飞进花园、墨水河和猫头鹰钟楼。",
      finds: [
        "第一张故事页躲在花园里。它写着：每一次勇敢出发，都是故事真正的开头。",
        "第二张故事页落进墨水河。阿洛把它折成一座纸桥，空白的地方慢慢浮出新的道路。",
        "最后一张故事页被猫头鹰守着。猫头鹰说：结尾不是故事停下来，而是朋友带着故事回家。"
      ],
      winKicker: "月亮书库重新亮了", winTitle: "所有晚安故事都有了结尾", winStory: "三张故事页飞回书中。月亮书库一盏接一盏亮起来，睡着的小朋友都在梦里翻到了最温暖的最后一页。", theme: "moonlibrary", goalName: "月亮书库"
    }
  ];

  chapters.forEach((chapter, index) => {
    chapter.storyId = index < 5 ? "starwhale" : index === 5 ? "cloudtrain" : "moonlibrary";
    chapter.storyChapter = index < 5 ? index : 0;
  });

  const stories = [
    {
      id: "starwhale", title: "阿洛与星鲸", subtitle: "五盏星灯的远行", cover: sceneImageFiles.forest,
      chapterIndices: [0, 1, 2, 3, 4], badge: "第一部 · 5 个迷宫",
      introTitle: "那天晚上，<br />一颗星星落进了雨里",
      introStory: "阿洛在窗外发现一只迷路的小星鲸。它的五盏星灯散落在奇怪的世界里。只有穿过所有迷宫，才能送它回到天空。",
      introButton: "穿上雨衣，出发！", introIcon: "🐋"
    },
    {
      id: "cloudtrain", title: "阿洛与云朵列车", subtitle: "云朵列车的最后一站", cover: sceneImageFiles.cloudtrain,
      chapterIndices: [5], badge: "第二部 · 1 张完整大迷宫",
      introTitle: "最后一班送雨列车，<br />已经开走了",
      introStory: "一朵叫朵朵的小云错过了最后一班送雨列车。远方的花谷正等着下雨，阿洛答应陪它穿过雾站、花田和雪洞，一直走到彩虹站。",
      introButton: "陪朵朵去车站！", introIcon: "☁️"
    },
    {
      id: "moonlibrary", title: "阿洛与月光图书馆", subtitle: "逃走的故事页", cover: sceneImageFiles.moonlibrary,
      chapterIndices: [6], badge: "第三部 · 1 张月光大迷宫",
      introTitle: "午夜的风，<br />吹走了故事的最后一页",
      introStory: "月光图书馆里，一本没有结尾的故事忽然散开了。小狐狸管理员墨墨请阿洛在月亮落下前，穿过书塔和墨水河，把三张逃走的故事页带回书库。",
      introButton: "去找故事的结尾！", introIcon: "🦊"
    }
  ];

  const storyById = (storyId) => stories.find((story) => story.id === storyId) || stories[0];
  const storyPosition = (chapterIndex) => storyById(chapters[chapterIndex].storyId).chapterIndices.indexOf(chapterIndex);
  const progressKey = (storyId) => `starmaze-progress-${storyId}`;
  function readStoryProgress(storyId) {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey(storyId)) || "null");
      if (saved) return { started: Boolean(saved.started), current: Number(saved.current) || 0, unlocked: Number(saved.unlocked) || 0, completed: Boolean(saved.completed), bestSteps: Number(saved.bestSteps) || 0 };
    } catch (_) { /* Ignore damaged progress and rebuild it below. */ }
    if (storyId === "starwhale") {
      const legacyUnlocked = Math.min(Number(localStorage.getItem("starmaze-unlocked")) || 0, 4);
      const legacyChapter = Math.min(Number(localStorage.getItem("starmaze-chapter")) || 0, 4);
      return { started: Boolean(localStorage.getItem("starmaze-intro")) || legacyUnlocked > 0 || legacyChapter > 0, current: legacyChapter, unlocked: legacyUnlocked, completed: legacyUnlocked >= 4, bestSteps: 0 };
    }
    return { started: false, current: 0, unlocked: 0, completed: false, bestSteps: 0 };
  }
  function writeStoryProgress(storyId, progress) {
    localStorage.setItem(progressKey(storyId), JSON.stringify(progress));
  }

  const difficulty = [
    { label: "故事探索者", glyph: "◇", factor: 0 },
    { label: "勇敢冒险家", glyph: "◆◆", factor: 1 },
    { label: "迷宫大师", glyph: "✦✦✦", factor: 2 }
  ];

  const previewChapter = Number(new URLSearchParams(location.search).get("chapter"));
  const savedStoryId = stories.some((story) => story.id === localStorage.getItem("starmaze-current-story")) ? localStorage.getItem("starmaze-current-story") : "starwhale";
  const savedProgress = readStoryProgress(savedStoryId);
  const savedStory = storyById(savedStoryId);
  const savedChapter = savedStory.chapterIndices[Math.min(savedProgress.current, savedStory.chapterIndices.length - 1)];
  const initialChapter = Number.isInteger(previewChapter) && previewChapter >= 1 && previewChapter <= chapters.length ? previewChapter - 1 : savedChapter;
  const initialProgress = readStoryProgress(chapters[initialChapter].storyId);
  const state = {
    storyId: chapters[initialChapter].storyId,
    chapter: initialChapter,
    unlocked: initialProgress.unlocked,
    difficulty: Number(localStorage.getItem("starmaze-difficulty") ?? 1),
    sound: localStorage.getItem("starmaze-sound") !== "off",
    seed: Date.now() % 2147483647,
    graph: null, current: 0, goal: 0, collectibles: [], found: new Set(),
    trail: [], steps: 0, completed: false, dragging: false, activePointerId: null, hintPath: [],
    touchPoint: null, touchValid: true, boundaryMissAt: 0, gestureVisited: new Set(),
    pointerSamples: [], inputFrame: 0, drawFrame: 0, cameraPending: false,
    gestureMode: null, panStartPoint: null, panStartCamera: null, panMoved: false,
    width: 0, height: 0, dpr: 1, pad: 50, avgEdge: 45, toastTimer: 0,
    world: { width: 0, height: 0, pagesX: 1, pagesY: 1 },
    camera: { x: 0, y: 0 }, overview: false, cameraFrame: 0
  };

  let audioContext = null, installPrompt = null;
  let narrationActive = false, narrationToken = 0, chineseVoice = null;

  function mulberry32(seed) {
    return function random() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function illustratedGraph(theme) {
    const data = window.STAR_MAZE_LEVELS?.[theme];
    if (!data) throw new Error(theme + ": missing level data");
    const nodes = data.nodes.map((node) => ({ ...node }));
    const edges = data.edges.map(([a, b]) => [a, b]);
    const adjacency = Array.from({ length: nodes.length }, () => []);
    edges.forEach(([a, b]) => { adjacency[a].push(b); adjacency[b].push(a); });
    return {
      nodes, edges, adjacency, illustrated: true,
      special: {
        start: data.special.start,
        goal: data.special.goal,
        collectibles: [...data.special.collectibles]
      }
    };
  }

  function bfs(graph, start) {
    const distance = Array(graph.nodes.length).fill(-1);
    const parent = Array(graph.nodes.length).fill(-1);
    const queue = [start]; distance[start] = 0;
    for (let i = 0; i < queue.length; i += 1) {
      graph.adjacency[queue[i]].forEach((next) => {
        if (distance[next] !== -1) return;
        distance[next] = distance[queue[i]] + 1;
        parent[next] = queue[i]; queue.push(next);
      });
    }
    return { distance, parent };
  }

  function validateGraph(graph, theme) {
    if (graph.nodes.length < 50 || graph.adjacency.length !== graph.nodes.length) throw new Error(`${theme}: maze is not complex enough`);
    if (graph.edges.length < graph.nodes.length || graph.adjacency.filter((links) => links.length >= 3).length < 4) throw new Error(`${theme}: maze needs more loops and crossroads`);
    graph.edges.forEach(([a,b]) => {
      if (!graph.nodes[a] || !graph.nodes[b] || !graph.adjacency[a].includes(b) || !graph.adjacency[b].includes(a)) throw new Error(`${theme}: broken maze edge`);
    });
    const special = graph.special;
    if (!special || new Set([special.start,special.goal,...special.collectibles]).size !== 5) throw new Error(`${theme}: invalid story landmarks`);
    const reach = bfs(graph, special.start).distance;
    if (reach.some((distance) => distance < 0)) throw new Error(`${theme}: disconnected maze region`);
    if (reach[special.goal] < 12 || [special.goal,...special.collectibles].some((id) => reach[id] < 4)) throw new Error(`${theme}: challenge route is too short`);
  }

  function startChapter(chapterIndex = state.chapter) {
    stopNarration();
    state.chapter = chapterIndex;
    state.storyId = chapters[chapterIndex].storyId;
    state.unlocked = readStoryProgress(state.storyId).unlocked;
    state.seed = (state.seed + 104729) % 2147483647;
    state.graph = illustratedGraph(chapters[chapterIndex].theme);
    validateGraph(state.graph, chapters[chapterIndex].theme);
    const special = state.graph.special;
    state.current = special.start; state.goal = special.goal; state.collectibles = special.collectibles;
    state.found = new Set(); state.trail = [state.current]; state.steps = 0;
    state.completed = false; state.dragging = false; state.activePointerId = null;
    state.touchPoint = null; state.touchValid = true; state.hintPath = []; state.overview = false;
    state.gestureVisited = new Set(); state.pointerSamples = []; state.cameraPending = false;
    state.gestureMode = null; state.panStartPoint = null; state.panStartCamera = null; state.panMoved = false;
    cancelAnimationFrame(state.inputFrame); state.inputFrame = 0;
    cancelAnimationFrame(state.cameraFrame); state.cameraFrame = 0;
    canvas.classList.remove("is-panning");
    $(".story-card").classList.remove("overview-mode");
    $("#overviewButton").setAttribute("aria-pressed", "false");
    const progress = readStoryProgress(state.storyId);
    progress.current = storyPosition(state.chapter);
    writeStoryProgress(state.storyId, progress);
    localStorage.setItem("starmaze-current-story", state.storyId);
    if (state.storyId === "starwhale") localStorage.setItem("starmaze-chapter", state.chapter);
    updateStoryUI();
    requestAnimationFrame(resizeCanvas);
  }

  function updateStoryUI() {
    const chapter = chapters[state.chapter];
    const palette = {
      forest:["#174f54","#102f3e"], clock:["#82632f","#253e51"], dragon:["#3f7468","#274854"],
      sea:["#227b94","#153f63"], stars:["#4859a0","#202b66"], cloudtrain:["#8a6932","#203e66"],
      moonlibrary:["#a06b35","#172f58"]
    }[chapter.theme];
    document.documentElement.style.setProperty("--chapter-accent", palette[0]);
    document.documentElement.style.setProperty("--chapter-deep", palette[1]);
    document.body.dataset.theme = chapter.theme;
    $("#brandTitle").textContent = storyById(state.storyId).title;
    $("#chapterNumber").textContent = String(storyPosition(state.chapter) + 1).padStart(2, "0");
    $("#chapterKicker").textContent = chapter.kicker;
    $("#chapterTitle").textContent = chapter.title;
    $("#chapterStory").textContent = chapter.story;
    $("#missionIcon").textContent = chapter.item;
    $("#missionText").textContent = chapter.mission;
    $("#storyTip").innerHTML = "<small>阿洛说</small><span>有些路看起来很近，却不一定能到达。</span>";
    $("#dragHint").classList.remove("hidden");
    const story = storyById(state.storyId);
    const position = storyPosition(state.chapter);
    $("#chapterProgress").innerHTML = story.chapterIndices.map((_, i) => `<i class="${i < position ? "done" : i === position ? "current" : ""}"></i>`).join("");
    updateCollectionUI(); updateChapterList();
  }

  function updateCollectionUI() {
    const chapter = chapters[state.chapter];
    $("#collection").innerHTML = state.collectibles.map((id) => `<i class="${state.found.has(id) ? "found" : ""}">${state.found.has(id) ? chapter.item : "?"}</i>`).join("");
  }

  function updateChapterList() {
    const story = storyById(state.storyId);
    const progress = readStoryProgress(state.storyId);
    $("#chapterList").innerHTML = story.chapterIndices.map((index, position) => {
      const chapter = chapters[index];
      const locked = position > progress.unlocked;
      return `<button data-chapter="${index}" style="--chapter-art:url('./assets/scenes/${sceneImageFiles[chapter.theme]}')" class="${index === state.chapter ? "current" : ""} ${locked ? "locked" : ""}" ${locked ? "disabled" : ""}>
        <span class="chapter-emoji">${chapter.icon}</span><small>CHAPTER ${String(position + 1).padStart(2,"0")}</small><b>${chapter.title}</b><em>${locked ? "🔒" : position < progress.unlocked || progress.completed ? "✓" : ""}</em>
      </button>`;
    }).join("");
    $("#chapterList").querySelectorAll("button:not([disabled])").forEach((button) => button.addEventListener("click", () => {
      $("#chapterDialog").close(); startChapter(Number(button.dataset.chapter));
    }));
  }

  function updateIntroUI() {
    const story = storyById(state.storyId);
    $("#introTitle").innerHTML = story.introTitle;
    $("#introStory").textContent = story.introStory;
    $("#introStartButton").textContent = story.introButton;
    $("#introDialog .intro-sky span").textContent = story.introIcon;
    $("#introDialog .intro-sky").style.backgroundImage = `linear-gradient(90deg,rgba(12,24,66,.06),rgba(12,24,66,.22)),url('./assets/scenes/${story.cover}')`;
  }

  function renderBookshelf() {
    const playable = stories.map((story, index) => {
      const progress = readStoryProgress(story.id);
      const total = story.chapterIndices.length;
      const finished = progress.completed ? total : Math.min(progress.unlocked, total - 1);
      const status = progress.completed ? "已完成" : progress.started ? "进行中" : "未开始";
      const action = progress.completed ? "再玩一次" : progress.started ? "继续故事" : "开始故事";
      const best = progress.completed && progress.bestSteps ? `<small class="book-best">最好成绩 · ${progress.bestSteps} 步</small>` : "";
      return `<article class="story-book ${progress.completed ? "is-complete" : ""}" style="--book-cover:url('./assets/scenes/${story.cover}')">
        <div class="story-book-cover"><span class="book-number">STORY ${String(index + 1).padStart(2,"0")}</span>${progress.completed ? '<span class="completion-seal">✓<b>已完成</b></span>' : ""}</div>
        <div class="story-book-copy"><small>${story.badge}</small><h2>${story.title}</h2><p>${story.subtitle}</p><div class="book-progress"><span><i style="--progress:${progress.completed ? 100 : Math.round(finished / total * 100)}%"></i></span><b>${status} · ${progress.completed ? total : finished}/${total}</b></div>${best}<button type="button" data-story="${story.id}">${action}<span>→</span></button></div>
      </article>`;
    }).join("");
    const future = [4, 5, 6].map((number) => `<article class="story-book future-book" aria-disabled="true"><div class="future-cover"><span>STORY ${String(number).padStart(2,"0")}</span><b>${["✦","☁","⌁"][number - 4]}</b></div><div class="story-book-copy"><small>新的冒险</small><h2>第 ${number} 部故事</h2><p>绘本工坊正在装订这一页……</p><button type="button" disabled>即将到来</button></div></article>`).join("");
    $("#bookshelfGrid").innerHTML = playable + future;
    $("#bookshelfGrid").querySelectorAll("[data-story]").forEach((button) => button.addEventListener("click", () => openStory(button.dataset.story)));
  }

  function showBookshelf() {
    stopNarration();
    document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
    renderBookshelf();
    $("#gameBook").hidden = true;
    $("#bookshelf").hidden = false;
    document.body.classList.add("showing-bookshelf");
  }

  function openStory(storyId) {
    const story = storyById(storyId);
    const progress = readStoryProgress(story.id);
    const wasStarted = progress.started;
    progress.started = true;
    if (progress.completed) progress.current = 0;
    writeStoryProgress(story.id, progress);
    state.storyId = story.id;
    state.unlocked = progress.unlocked;
    $("#bookshelf").hidden = true;
    $("#gameBook").hidden = false;
    document.body.classList.remove("showing-bookshelf");
    updateIntroUI();
    startChapter(story.chapterIndices[Math.min(progress.current, story.chapterIndices.length - 1)]);
    if (!wasStarted || !localStorage.getItem(`starmaze-intro-${story.id}`)) setTimeout(() => $("#introDialog").showModal(), 420);
  }

  function resizeCanvas() {
    if (!state.graph || $("#gameBook").hidden) return;
    const rect = stage.getBoundingClientRect();
    const touchDevice = navigator.maxTouchPoints > 0 || matchMedia("(pointer: coarse)").matches;
    state.width = rect.width; state.height = rect.height;
    state.dpr = Math.min(devicePixelRatio || 1, touchDevice ? 1.5 : 2);
    canvas.width = Math.round(rect.width * state.dpr); canvas.height = Math.round(rect.height * state.dpr);
    canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    state.pad = Math.max(28, Math.min(rect.width, rect.height) * .07);
    if (state.graph.illustrated) {
      const imageAspect = 1672 / 941;
      const desiredPagesX = [1.55, 1.85, 2.15][state.difficulty];
      let innerWidth = state.width * desiredPagesX;
      let innerHeight = innerWidth / imageAspect;
      if (innerHeight < state.height * 1.28) { innerHeight = state.height * 1.28; innerWidth = innerHeight * imageAspect; }
      state.world.width = innerWidth + state.pad * 2;
      state.world.height = innerHeight + state.pad * 2;
      state.world.pagesX = 2;
      state.world.pagesY = 2;
    } else {
      const pages = [[2,1.2],[3,1.55],[4,2]][state.difficulty];
      state.world.pagesX = pages[0]; state.world.pagesY = pages[1];
      state.world.width = state.width * state.world.pagesX;
      state.world.height = state.height * state.world.pagesY;
    }
    centerCameraOnCurrent(true);
    updateAverageEdge();
    draw();
  }

  function updateAverageEdge() {
    const lengths = state.graph.edges.map(([a,b]) => {
      const p = screenPoint(state.graph.nodes[a]), q = screenPoint(state.graph.nodes[b]);
      return Math.hypot(p.x - q.x, p.y - q.y);
    });
    state.avgEdge = lengths.reduce((sum,n) => sum + n, 0) / lengths.length;
  }

  function worldPoint(node) {
    return { x: state.pad + node.x * (state.world.width - state.pad * 2), y: state.pad + node.y * (state.world.height - state.pad * 2) };
  }

  function illustratedRect() {
    const aspect = 1672 / 941;
    if (!state.overview) return { x: state.pad - state.camera.x, y: state.pad - state.camera.y, width: state.world.width - state.pad * 2, height: state.world.height - state.pad * 2 };
    const maxWidth = state.width - state.pad * 2, maxHeight = state.height - state.pad * 2;
    const width = Math.min(maxWidth, maxHeight * aspect), height = width / aspect;
    return { x: (state.width - width) / 2, y: (state.height - height) / 2, width, height };
  }

  function screenPoint(node) {
    if (state.overview && state.graph.illustrated) {
      const rect = illustratedRect();
      return { x: rect.x + node.x * rect.width, y: rect.y + node.y * rect.height };
    }
    if (state.overview) return { x: state.pad + node.x * (state.width - state.pad * 2), y: state.pad + node.y * (state.height - state.pad * 2) };
    const point = worldPoint(node);
    return { x: point.x - state.camera.x, y: point.y - state.camera.y };
  }

  function scenePoint(x, y) {
    if (state.overview && state.graph.illustrated) {
      const rect = illustratedRect();
      return { x: rect.x + x * rect.width, y: rect.y + y * rect.height };
    }
    if (state.overview) return { x: state.pad + x * (state.width - state.pad * 2), y: state.pad + y * (state.height - state.pad * 2) };
    return { x: state.pad + x * (state.world.width - state.pad * 2) - state.camera.x, y: state.pad + y * (state.world.height - state.pad * 2) - state.camera.y };
  }

  function isVisible(point, margin = 80) {
    return point.x > -margin && point.y > -margin && point.x < state.width + margin && point.y < state.height + margin;
  }

  function cameraTarget(nodeId) {
    const p = worldPoint(state.graph.nodes[nodeId]);
    return {
      x: Math.max(0, Math.min(state.world.width - state.width, p.x - state.width / 2)),
      y: Math.max(0, Math.min(state.world.height - state.height, p.y - state.height / 2))
    };
  }

  function centerCameraOnCurrent(immediate = false) {
    const target = cameraTarget(state.current);
    if (immediate) { state.camera.x = target.x; state.camera.y = target.y; return; }
    const start = { ...state.camera }, began = performance.now(), duration = 280;
    cancelAnimationFrame(state.cameraFrame);
    const animate = (now) => {
      const t = Math.min(1, (now - began) / duration), eased = 1 - (1 - t) ** 3;
      state.camera.x = start.x + (target.x - start.x) * eased;
      state.camera.y = start.y + (target.y - start.y) * eased;
      requestDraw();
      if (t < 1) state.cameraFrame = requestAnimationFrame(animate);
    };
    state.cameraFrame = requestAnimationFrame(animate);
  }

  function panCamera(point) {
    if (!state.panStartPoint || !state.panStartCamera || state.overview) return;
    const dx = point.x - state.panStartPoint.x, dy = point.y - state.panStartPoint.y;
    const maxX = Math.max(0, state.world.width - state.width);
    const maxY = Math.max(0, state.world.height - state.height);
    state.camera.x = Math.max(0, Math.min(maxX, state.panStartCamera.x - dx));
    state.camera.y = Math.max(0, Math.min(maxY, state.panStartCamera.y - dy));
    if (!state.panMoved && Math.hypot(dx, dy) > 8) {
      state.panMoved = true;
      $("#dragHint").classList.add("hidden");
      $("#storyTip").innerHTML = "<small>正在看地图</small><span>可以回看走过的路，也可以看看前面；找到阿洛后按住他继续走。</span>";
    }
    requestDraw();
  }

  function draw() {
    drawScene();
    drawMazePaths();
    drawTrail();
    drawSpecials();
    drawPlayer();
    drawTouchGuide();
    drawMiniMap();
  }

  function requestDraw() {
    if (state.drawFrame) return;
    state.drawFrame = requestAnimationFrame(() => {
      state.drawFrame = 0;
      draw();
    });
  }

  function currentSceneImage() { return sceneImages[chapters[state.chapter].theme]; }
  function sceneImageReady() { const image = currentSceneImage(); return Boolean(image && image.complete && image.naturalWidth); }

  function drawMiniMap() {
    const w = miniMap.width, h = miniMap.height, inset = 6;
    miniCtx.clearRect(0, 0, w, h);
    if (state.graph.illustrated && sceneImageReady()) {
      miniCtx.drawImage(currentSceneImage(), 0, 0, w, h);
      miniCtx.fillStyle = "rgba(5,24,33,.42)"; miniCtx.fillRect(0, 0, w, h);
    } else { miniCtx.fillStyle = "rgba(8,30,45,.9)"; miniCtx.fillRect(0, 0, w, h); }
    miniCtx.strokeStyle = "rgba(226,230,204,.42)"; miniCtx.lineWidth = 1.2; miniCtx.lineCap = "round";
    state.graph.edges.forEach(([a,b]) => {
      const p = state.graph.nodes[a], q = state.graph.nodes[b];
      miniCtx.beginPath(); miniCtx.moveTo(inset + p.x * (w - inset * 2), inset + p.y * (h - inset * 2));
      miniCtx.lineTo(inset + q.x * (w - inset * 2), inset + q.y * (h - inset * 2)); miniCtx.stroke();
    });
    if (state.difficulty < 2) state.collectibles.forEach((id) => {
      if (state.found.has(id)) return;
      const p = state.graph.nodes[id]; miniCtx.fillStyle = "#f0ba56"; miniCtx.beginPath(); miniCtx.arc(inset + p.x * (w - inset * 2), inset + p.y * (h - inset * 2), 2.4, 0, Math.PI * 2); miniCtx.fill();
    });
    const current = state.graph.nodes[state.current];
    miniCtx.fillStyle = "#f07d67"; miniCtx.beginPath(); miniCtx.arc(inset + current.x * (w - inset * 2), inset + current.y * (h - inset * 2), 3.7, 0, Math.PI * 2); miniCtx.fill();
    if (!state.overview) {
      miniCtx.strokeStyle = "rgba(255,255,255,.92)"; miniCtx.lineWidth = 1;
      miniCtx.strokeRect(inset + state.camera.x / state.world.width * (w - inset * 2), inset + state.camera.y / state.world.height * (h - inset * 2), Math.max(8, state.width / state.world.width * (w - inset * 2)), Math.max(7, state.height / state.world.height * (h - inset * 2)));
    }
    const viewCenterX = state.camera.x + state.width / 2, viewCenterY = state.camera.y + state.height / 2;
    const column = Math.min(state.world.pagesX - 1, Math.max(0, Math.floor(viewCenterX / state.width)));
    const row = Math.min(state.world.pagesY - 1, Math.max(0, Math.floor(viewCenterY / state.height)));
    const illustratedProgress = Math.max(0, Math.min(.999, (viewCenterX - state.pad) / Math.max(1, state.world.width - state.pad * 2)));
    const page = state.graph.illustrated ? Math.floor(illustratedProgress * 4) + 1 : row * state.world.pagesX + column + 1;
    const pageCount = state.graph.illustrated ? 4 : state.world.pagesX * state.world.pagesY;
    const pageMode = state.panMoved ? "查看区域" : "探索区域";
    $("#worldPage").textContent = state.overview ? `完整绘本地图 · ${state.graph.nodes.length} 个路口` : `${pageMode} ${page} / ${pageCount}`;
  }

  function drawScene() {
    const theme = chapters[state.chapter].theme;
    const gradients = {
      forest: ["#9ab9a0", "#416f69"], clock: ["#dfc68d", "#8f6d4f"], dragon: ["#9aa8a2", "#475b58"],
      sea: ["#72b7bc", "#2c7084"], stars: ["#1f4168", "#091d38"], cloudtrain: ["#6fa4b5", "#213c68"],
      moonlibrary: ["#425c82", "#08162e"]
    };
    const gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
    gradient.addColorStop(0, gradients[theme][0]); gradient.addColorStop(1, gradients[theme][1]);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, state.width, state.height);
    ctx.save();
    if (state.graph.illustrated && sceneImageReady()) {
      const rect = illustratedRect();
      ctx.drawImage(currentSceneImage(), rect.x, rect.y, rect.width, rect.height);
      if (state.overview) {
        ctx.fillStyle = "rgba(4,24,31,.08)";
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      }
    } else if (theme === "forest") drawForest();
    else if (theme === "clock") drawClock();
    else if (theme === "dragon") drawDragon();
    else if (theme === "sea") drawSea();
    else if (theme === "stars") drawStars();
    ctx.restore();
  }

  function seededDecor() { return mulberry32(state.seed + state.chapter * 211 + 88); }
  function drawForest() {
    const rng = seededDecor();
    const scale = state.overview ? .42 : 1;
    const river = [scenePoint(.03,.22),scenePoint(.28,.36),scenePoint(.52,.28),scenePoint(.73,.56),scenePoint(.97,.48)];
    ctx.strokeStyle="rgba(91,164,173,.25)";ctx.lineWidth=70*scale;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(river[0].x,river[0].y);ctx.bezierCurveTo(river[1].x,river[1].y,river[2].x,river[2].y,river[3].x,river[3].y);ctx.lineTo(river[4].x,river[4].y);ctx.stroke();
    for (let i = 0; i < 180; i += 1) {
      const point=scenePoint(rng(),rng()),r=(10+rng()*23)*scale;if(!isVisible(point,r+25))continue;
      ctx.strokeStyle="rgba(74,68,44,.38)";ctx.lineWidth=Math.max(1.5,4*scale);ctx.beginPath();ctx.moveTo(point.x,point.y+r*.25);ctx.lineTo(point.x-2*scale,point.y+r*1.15);ctx.stroke();
      const colors=["rgba(31,91,73,.42)","rgba(83,125,75,.4)","rgba(184,205,139,.32)"];
      for(let layer=0;layer<3;layer+=1){ctx.fillStyle=colors[(i+layer)%3];ctx.beginPath();ctx.arc(point.x+(layer-1)*r*.38,point.y-layer*r*.18,r*(.72-layer*.09),0,Math.PI*2);ctx.fill();}
      if(i%17===0&&!state.overview){ctx.fillStyle="#e8d6a6";ctx.beginPath();ctx.arc(point.x+r*.7,point.y+r*.85,5,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle="#dc745d";ctx.beginPath();ctx.arc(point.x+r*.7,point.y+r*.78,7,Math.PI,Math.PI*2);ctx.fill();}
    }
  }
  function drawClock() {
    const center=scenePoint(.5,.5),worldUnit=Math.min(state.overview?state.width:state.world.width,state.overview?state.height:state.world.height),outer=worldUnit*.42;
    ctx.strokeStyle="rgba(77,51,35,.18)";ctx.lineWidth=state.overview?3:12;
    for(let ring=1;ring<=7;ring+=1){ctx.beginPath();ctx.arc(center.x,center.y,outer*ring/7,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle="rgba(74,49,36,.2)";ctx.font=`${Math.max(12,outer*.09)}px Georgia`;ctx.textAlign="center";ctx.textBaseline="middle";
    for(let i=0;i<12;i+=1){const a=-Math.PI/2+i*Math.PI/6;ctx.fillText(i||12,center.x+Math.cos(a)*outer*.92,center.y+Math.sin(a)*outer*.92);}
    const gears=[[.16,.2,.09],[.82,.18,.07],[.2,.78,.06],[.78,.73,.11],[.54,.14,.05]];
    gears.forEach(([x,y,r],index)=>{const p=scenePoint(x,y),radius=r*worldUnit;if(!isVisible(p,radius))return;ctx.save();ctx.translate(p.x,p.y);ctx.rotate((state.seed%17+index)*.13);ctx.strokeStyle="rgba(91,60,37,.28)";ctx.lineWidth=Math.max(3,radius*.12);for(let tooth=0;tooth<12;tooth+=1){ctx.rotate(Math.PI/6);ctx.beginPath();ctx.moveTo(radius*.8,0);ctx.lineTo(radius*1.08,0);ctx.stroke();}ctx.beginPath();ctx.arc(0,0,radius*.75,0,Math.PI*2);ctx.stroke();ctx.restore();});
  }
  function drawDragon() {
    const points=[scenePoint(.04,.72),scenePoint(.22,.14),scenePoint(.46,.78),scenePoint(.7,.24),scenePoint(.96,.55)],scale=state.overview?.35:1;
    ctx.strokeStyle="rgba(31,73,58,.28)";ctx.lineWidth=125*scale;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);ctx.bezierCurveTo(points[1].x,points[1].y,points[2].x,points[2].y,points[3].x,points[3].y);ctx.lineTo(points[4].x,points[4].y);ctx.stroke();
    const rng=seededDecor();for(let i=0;i<95;i+=1){const p=scenePoint(rng(),rng());if(!isVisible(p,40))continue;const size=(10+rng()*22)*scale;ctx.fillStyle=i%3?"rgba(218,226,203,.15)":"rgba(34,63,58,.22)";ctx.beginPath();ctx.moveTo(p.x,p.y-size);ctx.lineTo(p.x+size*.8,p.y+size*.7);ctx.lineTo(p.x-size*.9,p.y+size*.55);ctx.closePath();ctx.fill();if(i%13===0&&!state.overview){ctx.strokeStyle="rgba(235,238,218,.22)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-size,p.y+size);ctx.lineTo(p.x,p.y-size*1.4);ctx.lineTo(p.x+size,p.y+size);ctx.stroke();}}
  }
  function drawSea() {
    const rng=seededDecor(),scale=state.overview?.42:1;
    for(let i=0;i<150;i+=1){const p=scenePoint(rng(),rng());if(!isVisible(p,55))continue;if(i%4){ctx.strokeStyle="rgba(235,247,225,.16)";ctx.lineWidth=2*scale;ctx.beginPath();ctx.arc(p.x,p.y,10+rng()*16,Math.PI,Math.PI*2);ctx.stroke();}else{const rx=(20+rng()*42)*scale,ry=(10+rng()*18)*scale;ctx.fillStyle="rgba(230,207,139,.3)";ctx.beginPath();ctx.ellipse(p.x,p.y,rx,ry,rng(),0,Math.PI*2);ctx.fill();ctx.fillStyle="rgba(86,132,81,.3)";ctx.beginPath();ctx.ellipse(p.x,p.y-ry*.2,rx*.72,ry*.7,rng(),0,Math.PI*2);ctx.fill();if(!state.overview&&i%12===0){ctx.strokeStyle="rgba(63,79,54,.5)";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+5,p.y-24);ctx.stroke();ctx.fillStyle="rgba(56,116,76,.55)";ctx.beginPath();ctx.arc(p.x+2,p.y-27,10,0,Math.PI*2);ctx.fill();}}}
  }
  function drawStars() {
    const rng=seededDecor(),scale=state.overview?.45:1;
    for(let i=0;i<320;i+=1){const p=scenePoint(rng(),rng());if(!isVisible(p,15))continue;const r=(rng()*2+.4)*scale;ctx.fillStyle=i%11===0?"#f0ba56":"rgba(255,255,255,.68)";ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();}
    [[.14,.27,.085,"rgba(104,164,184,.18)"],[.78,.2,.055,"rgba(240,186,86,.16)"],[.68,.76,.12,"rgba(140,105,169,.14)"]].forEach(([x,y,r,color])=>{const p=scenePoint(x,y),worldUnit=Math.min(state.overview?state.width:state.world.width,state.overview?state.height:state.world.height),radius=r*worldUnit;if(!isVisible(p,radius))return;ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(255,255,255,.13)";ctx.lineWidth=3*scale;ctx.beginPath();ctx.ellipse(p.x,p.y,radius*1.55,radius*.28,-.18,0,Math.PI*2);ctx.stroke();});
  }

  function edgeCurve(a, b) {
    const p = screenPoint(a), q = screenPoint(b), theme = chapters[state.chapter].theme;
    ctx.beginPath(); ctx.moveTo(p.x,p.y);
    if (state.graph.illustrated) ctx.lineTo(q.x,q.y);
    else if (theme === "clock" && a.ring && a.ring === b.ring) {
      const center=scenePoint(.5,.5),mx=(p.x+q.x)/2-center.x,my=(p.y+q.y)/2-center.y,len=Math.hypot(mx,my)||1;
      const radius=(Math.hypot(p.x-center.x,p.y-center.y)+Math.hypot(q.x-center.x,q.y-center.y))/2;
      ctx.quadraticCurveTo(center.x+mx/len*radius,center.y+my/len*radius,q.x,q.y);
    } else if (theme === "forest" || theme === "sea") {
      const sign=((a.id*17+b.id*31)%2?1:-1),dx=q.x-p.x,dy=q.y-p.y;
      ctx.quadraticCurveTo((p.x+q.x)/2-dy*.11*sign,(p.y+q.y)/2+dx*.11*sign,q.x,q.y);
    } else ctx.lineTo(q.x,q.y);
  }

  function drawMazePaths() {
    if (state.graph.illustrated && sceneImageReady()) {
      const overviewScale = state.overview ? .48 : 1;
      const outer = Math.max(14, Math.min(22, state.avgEdge * .26)) * overviewScale;
      const inner = Math.max(5, outer * .42);
      ctx.save();
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(4,22,29,.27)"; ctx.lineWidth = outer;
      state.graph.edges.forEach(([a,b]) => { edgeCurve(state.graph.nodes[a], state.graph.nodes[b]); ctx.stroke(); });
      ctx.strokeStyle = "rgba(255,247,207,.18)"; ctx.lineWidth = inner;
      state.graph.edges.forEach(([a,b]) => { edgeCurve(state.graph.nodes[a], state.graph.nodes[b]); ctx.stroke(); });
      ctx.strokeStyle = "rgba(255,211,101,.62)"; ctx.lineWidth = Math.max(3, inner * .65);
      ctx.shadowColor = "rgba(255,211,101,.42)"; ctx.shadowBlur = 9;
      state.graph.adjacency[state.current].forEach((id) => { edgeCurve(state.graph.nodes[state.current], state.graph.nodes[id]); ctx.stroke(); });
      ctx.fillStyle = "rgba(255,238,176,.95)"; ctx.shadowColor = "rgba(255,214,110,.85)"; ctx.shadowBlur = 15;
      state.graph.adjacency[state.current].forEach((id) => { const q = screenPoint(state.graph.nodes[id]); ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(3.5, inner * .5), 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
      return;
    }
    const theme=chapters[state.chapter].theme;
    const colors={forest:["rgba(20,53,46,.74)","#e8dfbd"],clock:["rgba(74,45,29,.68)","#f3dfaa"],dragon:["rgba(24,43,41,.76)","#d9d5bd"],sea:["rgba(9,58,73,.72)","#d8e1c4"],stars:["rgba(0,7,28,.76)","#bcd8d6"],cloudtrain:["rgba(12,40,62,.72)","#f3e3af"],moonlibrary:["rgba(7,21,43,.7)","#f5ddb0"]}[theme];
    const inner=Math.max(7,Math.min(15,state.avgEdge*.23)), outer=inner+7;
    ctx.lineCap="round";ctx.lineJoin="round";
    ctx.strokeStyle=colors[0];ctx.lineWidth=outer;
    state.graph.edges.forEach(([a,b])=>{edgeCurve(state.graph.nodes[a],state.graph.nodes[b]);ctx.stroke();});
    ctx.strokeStyle=colors[1];ctx.lineWidth=inner;
    if(theme==="stars"){ctx.shadowColor="#8ad7e5";ctx.shadowBlur=7;}
    state.graph.edges.forEach(([a,b])=>{edgeCurve(state.graph.nodes[a],state.graph.nodes[b]);ctx.stroke();});
    ctx.shadowColor="transparent";
    ctx.fillStyle=colors[1];state.graph.nodes.forEach((node)=>{const p=screenPoint(node);ctx.beginPath();ctx.arc(p.x,p.y,inner/2,0,Math.PI*2);ctx.fill();});
  }

  function drawTrail() {
    if(state.trail.length<2&&state.hintPath.length<2)return;
    ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
    if(state.trail.length>1&&state.graph.illustrated){
      const trailOuter=Math.max(7,Math.min(13,state.avgEdge*.12));
      ctx.strokeStyle="rgba(11,39,43,.62)";ctx.lineWidth=trailOuter;ctx.setLineDash([]);
      for(let i=1;i<state.trail.length;i+=1){edgeCurve(state.graph.nodes[state.trail[i-1]],state.graph.nodes[state.trail[i]]);ctx.stroke();}
      ctx.strokeStyle="rgba(255,202,74,.92)";ctx.lineWidth=Math.max(3.5,trailOuter*.46);ctx.shadowColor="rgba(255,219,111,.72)";ctx.shadowBlur=7;
      for(let i=1;i<state.trail.length;i+=1){edgeCurve(state.graph.nodes[state.trail[i-1]],state.graph.nodes[state.trail[i]]);ctx.stroke();}
    } else if(state.trail.length>1){
      ctx.strokeStyle="rgba(220,116,93,.78)";ctx.lineWidth=Math.max(3,state.avgEdge*.075);ctx.setLineDash([2,7]);
      for(let i=1;i<state.trail.length;i+=1){edgeCurve(state.graph.nodes[state.trail[i-1]],state.graph.nodes[state.trail[i]]);ctx.stroke();}
    }
    if(state.hintPath.length>1){ctx.strokeStyle="#f4a928";ctx.lineWidth=Math.max(7,state.avgEdge*.2);ctx.setLineDash([9,5]);ctx.shadowColor="#fff2a1";ctx.shadowBlur=12;for(let i=1;i<state.hintPath.length;i+=1){edgeCurve(state.graph.nodes[state.hintPath[i-1]],state.graph.nodes[state.hintPath[i]]);ctx.stroke();}}
    ctx.restore();
  }

  function token(nodeId, emoji, fill, locked=false) {
    const p=screenPoint(state.graph.nodes[nodeId]),r=Math.max(15,Math.min(25,state.avgEdge*.34));
    if(!isVisible(p,r*2))return;
    ctx.save();ctx.shadowColor="rgba(0,0,0,.28)";ctx.shadowBlur=8;ctx.shadowOffsetY=4;ctx.fillStyle=fill;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.shadowColor="transparent";ctx.strokeStyle="rgba(255,255,255,.88)";ctx.lineWidth=3;ctx.stroke();ctx.font=`${r*1.25}px "Apple Color Emoji",sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(emoji,p.x,p.y+1);if(locked){ctx.font=`${r*.75}px sans-serif`;ctx.fillText("🔒",p.x+r*.72,p.y-r*.72);}ctx.restore();
  }

  function illustratedMarker(nodeId, kind, locked = false) {
    const p = screenPoint(state.graph.nodes[nodeId]);
    const base = Math.max(17, Math.min(28, state.avgEdge * .29)) * (kind === "goal" ? 1.12 : 1);
    if (!isVisible(p, base * 4)) return;
    const pulse = .5 + Math.sin(performance.now() / 430 + nodeId) * .5;
    ctx.save();
    if (kind === "player") {
      ctx.shadowColor = "rgba(255,200,66,.72)"; ctx.shadowBlur = 12 + pulse * 7;
      ctx.fillStyle = "#f3c342"; ctx.strokeStyle = "rgba(92,55,25,.88)"; ctx.lineWidth = Math.max(1.5, base * .1);
      ctx.beginPath(); ctx.arc(p.x, p.y - base * .47, base * .3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x, p.y - base * .2); ctx.lineTo(p.x + base * .56, p.y + base * .62); ctx.quadraticCurveTo(p.x, p.y + base * .83, p.x - base * .56, p.y + base * .62); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.shadowColor = "transparent"; ctx.fillStyle = "#67412d";
      ctx.fillRect(p.x - base * .42, p.y + base * .61, base * .25, base * .18); ctx.fillRect(p.x + base * .17, p.y + base * .61, base * .25, base * .18);
    } else {
      const color = kind === "goal" ? (locked ? "#b8d8d5" : "#6eeeff") : "#ffd451";
      const icon = kind === "goal" ? chapters[state.chapter].goal : chapters[state.chapter].item;
      ctx.shadowColor = color; ctx.shadowBlur = 19 + pulse * 10; ctx.strokeStyle = color; ctx.lineWidth = Math.max(2.5, base * .13);
      ctx.globalAlpha = .82; ctx.beginPath(); ctx.arc(p.x, p.y, base * (1.2 + pulse * .16), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = .48; ctx.beginPath(); ctx.arc(p.x, p.y, base * .94, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      ctx.globalAlpha = 1; ctx.shadowColor = "rgba(0,0,0,.34)"; ctx.shadowBlur = 7; ctx.fillStyle = "rgba(8,32,38,.9)";
      ctx.beginPath(); ctx.arc(p.x, p.y, base * .69, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = Math.max(2, base * .09); ctx.stroke();
      ctx.shadowColor = color; ctx.shadowBlur = 11; ctx.font = `${base * .88}px "Apple Color Emoji",sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(icon,p.x,p.y+1);
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, base * .1);
      for (let ray = 0; ray < 8; ray += 1) {
        const angle = ray * Math.PI / 4 + pulse * .12;
        ctx.beginPath(); ctx.moveTo(p.x + Math.cos(angle) * base * .92, p.y + Math.sin(angle) * base * .92);
        ctx.lineTo(p.x + Math.cos(angle) * base * 1.13, p.y + Math.sin(angle) * base * 1.13); ctx.stroke();
      }
      if (kind === "goal" && locked) {
        ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 5; ctx.fillStyle = "rgba(9,35,42,.88)";
        ctx.beginPath(); ctx.roundRect(p.x + base * .28, p.y + base * .19, base * .58, base * .54, base * .12); ctx.fill();
        ctx.strokeStyle = "#f2fff6"; ctx.lineWidth = Math.max(1.5, base * .08); ctx.beginPath(); ctx.arc(p.x + base * .57, p.y + base * .2, base * .18, Math.PI, 0); ctx.stroke();
      }
    }
    ctx.restore();
  }
  function drawSpecials() {
    const chapter=chapters[state.chapter];
    if (state.graph.illustrated) {
      state.collectibles.forEach((id)=>{if(!state.found.has(id))illustratedMarker(id,"collectible");});
      illustratedMarker(state.goal,"goal",state.found.size<state.collectibles.length);
      return;
    }
    state.collectibles.forEach((id)=>{if(!state.found.has(id))token(id,chapter.item,"#f0ba56");});
    token(state.goal,chapter.goal,"#86b8b1",state.found.size<state.collectibles.length);
  }
  function drawPlayer() {
    if (state.graph.illustrated) illustratedMarker(state.current,"player"); else token(state.current,"🧒","#dc745d");
  }

  function drawTouchGuide() {
    if (!state.dragging || !state.touchPoint || state.overview) return;
    const point = state.touchPoint;
    ctx.save();
    ctx.fillStyle = state.touchValid ? "rgba(255,223,130,.16)" : "rgba(255,255,255,.08)";
    ctx.strokeStyle = state.touchValid ? "rgba(255,235,174,.82)" : "rgba(255,205,162,.56)";
    ctx.lineWidth = 2; ctx.setLineDash(state.touchValid ? [] : [3,7]);
    ctx.beginPath(); ctx.arc(point.x, point.y, state.touchValid ? 24 : 19, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function followCurrentIfNeeded() {
    if(state.overview)return;
    const p=screenPoint(state.graph.nodes[state.current]);
    if(p.x<state.width*.27||p.x>state.width*.73||p.y<state.height*.25||p.y>state.height*.75){
      if(state.dragging)state.cameraPending=true;
      else centerCameraOnCurrent();
    }
  }

  function moveTo(next) {
    if(state.completed||!state.graph.adjacency[state.current].includes(next))return false;
    state.current=next;state.trail.push(next);state.steps+=1;state.hintPath=[];$("#dragHint").classList.add("hidden");
    if(state.dragging)state.gestureVisited.add(next);
    $("#storyTip").innerHTML="<small>正在探索</small><span>小地图里的白框会跟着阿洛移动。</span>";
    playTone(310+(state.steps%5)*32,.045,"sine",.018);
    const collectibleIndex=state.collectibles.indexOf(next);
    if(collectibleIndex!==-1&&!state.found.has(next)){
      state.found.add(next);updateCollectionUI();showToast(chapters[state.chapter].finds[collectibleIndex]);playCollectSound();
      stage.classList.remove("found-glow"); void stage.offsetWidth; stage.classList.add("found-glow");
      $("#storyTip").innerHTML=`<small>找到了 ${state.found.size}/${state.collectibles.length}</small><span>${state.found.size===state.collectibles.length?"出口已经亮起来了！":"还有宝物藏在别的岔路里。"}</span>`;
    }
    if(next===state.goal){
      if(state.found.size===state.collectibles.length)completeChapter();
      else{showToast(`${chapters[state.chapter].goalName}还没有醒来……还有 ${state.collectibles.length-state.found.size} 件宝物没有找到。`);playTone(156,.12,"sine",.012);}
    }
    followCurrentIfNeeded();requestDraw();return true;
  }

  function pointerPosition(event){const rect=canvas.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top};}

  function segmentMetrics(point, start, end) {
    const dx=end.x-start.x,dy=end.y-start.y,lengthSquared=dx*dx+dy*dy||1;
    const progress=Math.max(0,Math.min(1,((point.x-start.x)*dx+(point.y-start.y)*dy)/lengthSquared));
    const x=start.x+dx*progress,y=start.y+dy*progress;
    return {progress,distance:Math.hypot(point.x-x,point.y-y)};
  }

  function touchTolerance(){return Math.max(32,Math.min(54,state.avgEdge*.5));}

  function nearestReachableRoad(point) {
    const start=screenPoint(state.graph.nodes[state.current]);
    const neighbors=state.graph.adjacency[state.current];
    const fresh=neighbors.filter((id)=>!state.gestureVisited.has(id));
    return (fresh.length?fresh:neighbors).reduce((best,id)=>{
      const end=screenPoint(state.graph.nodes[id]),metrics=segmentMetrics(point,start,end);
      return metrics.distance<best.distance?{id,end,...metrics}:best;
    },{id:-1,distance:Infinity,progress:0,end:null});
  }

  function moveToward(point, hops=0){
    if(state.overview||state.completed)return false;
    state.touchPoint=point;
    const road=nearestReachableRoad(point),tolerance=touchTolerance();
    state.touchValid=road.id>=0&&road.distance<=tolerance;
    if(!state.touchValid){
      if(performance.now()-state.boundaryMissAt>500){
        state.boundaryMissAt=performance.now();
        $("#storyTip").innerHTML="<small>走到路边啦</small><span>把手指轻轻移回发光的小路，不会惩罚你。</span>";
      }
      requestDraw(); return false;
    }
    const nearNext=road.end&&Math.hypot(point.x-road.end.x,point.y-road.end.y)<Math.max(31,tolerance*.86);
    if(road.progress>.54||nearNext){
      const moved=moveTo(road.id);
      if(moved&&hops<6)return moveToward(point,hops+1)||true;
      return moved;
    }
    requestDraw(); return false;
  }

  function shortestPath(target) {
    const map=bfs(state.graph,state.current),path=[];let node=target;if(map.distance[node]<0)return path;
    while(node!==-1){path.push(node);if(node===state.current)break;node=map.parent[node];}
    return path.reverse();
  }

  function showHint() {
    const targets=state.collectibles.filter((id)=>!state.found.has(id));if(!targets.length)targets.push(state.goal);
    const options=targets.map((id)=>shortestPath(id)).filter((path)=>path.length);
    const hintLength=[11,7,4][state.difficulty];options.sort((a,b)=>a.length-b.length);state.hintPath=options[0].slice(0,Math.min(hintLength,options[0].length));
    showToast(state.found.size<state.collectibles.length?"金色微光指向最近的一件宝物。":"所有宝物都找到了，去追随通往出口的光吧。",2200);playTone(660,.18,"sine",.03);requestDraw();
    setTimeout(()=>{state.hintPath=[];requestDraw();},2400);
  }

  function showToast(message,duration=3000){const toast=$("#storyToast");toast.textContent=message;toast.classList.add("show");clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>toast.classList.remove("show"),duration);}

  function findChineseVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    chineseVoice = voices.find((voice)=>/^zh[-_]CN$/i.test(voice.lang))
      || voices.find((voice)=>/^zh/i.test(voice.lang))
      || null;
    return chineseVoice;
  }

  function setNarrationState(active) {
    narrationActive = active;
    document.querySelectorAll(".narration-button").forEach((button)=>{
      button.classList.toggle("is-speaking", active);
      button.setAttribute("aria-pressed", String(active));
      const label = button.querySelector(".read-label");
      if (label) label.textContent = active ? "停止" : button.dataset.readLabel;
    });
    $("#readButton").setAttribute("aria-label", active ? "停止朗读" : "朗读这一页");
  }

  function stopNarration() {
    narrationToken += 1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setNarrationState(false);
  }

  function speakText(text) {
    if (narrationActive) { stopNarration(); return; }
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      showToast("这台浏览器暂时不能朗读，请换用平板自带的 Safari 或 Chrome。", 3200);
      return;
    }
    const cleanText = text.replace(/\s+/g, " ").trim();
    if (!cleanText) return;
    window.speechSynthesis.cancel();
    const token = ++narrationToken;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "zh-CN";
    utterance.rate = .88;
    utterance.pitch = 1.04;
    utterance.volume = 1;
    utterance.voice = chineseVoice || findChineseVoice();
    utterance.onend = ()=>{ if (token === narrationToken) setNarrationState(false); };
    utterance.onerror = ()=>{ if (token === narrationToken) setNarrationState(false); };
    setNarrationState(true);
    window.speechSynthesis.speak(utterance);
  }

  function currentPageNarration() {
    const chapter = chapters[state.chapter];
    const tip = $("#storyTip span")?.textContent || "";
    const found = state.found.size ? `已经找到 ${state.found.size} 件宝物。` : "宝物还在迷宫里等你。";
    return `第 ${storyPosition(state.chapter) + 1} 章，${chapter.title}。${chapter.story}。这一页的任务：${chapter.mission}。${found}${tip}。玩法提示：按住阿洛，沿着发光小路慢慢拖动。按住地图其他位置拖动，可以随时查看走过的路和前面的区域。`;
  }

  function introNarration() {
    const story = storyById(state.storyId);
    return `故事开始了。${story.introTitle.replace(/<br\s*\/?>/gi, "")}。${story.introStory}。按住阿洛，沿发光边界内拖动。拖动地图其他位置，可以随时查看前后的路。先找齐这一页的宝物。`;
  }

  function winNarration() {
    return `${$("#winKicker").textContent}。${$("#winTitle").textContent}。${$("#winStory").textContent}`;
  }

  function completeChapter(){
    stopNarration();
    state.completed=true;const chapter=chapters[state.chapter],story=storyById(state.storyId),position=storyPosition(state.chapter),progress=readStoryProgress(state.storyId),isLast=position===story.chapterIndices.length-1;
    progress.started=true;
    if(isLast){progress.completed=true;progress.current=0;progress.unlocked=story.chapterIndices.length-1;progress.bestSteps=progress.bestSteps?Math.min(progress.bestSteps,state.steps):state.steps;}
    else{progress.unlocked=Math.max(progress.unlocked,position+1);progress.current=position+1;}
    writeStoryProgress(state.storyId,progress);state.unlocked=progress.unlocked;
    if(state.storyId==="starwhale")localStorage.setItem("starmaze-unlocked",state.unlocked);
    $("#winScene").textContent="";$("#winScene").style.backgroundImage=`url('./assets/scenes/${sceneImageFiles[chapter.theme]}')`;$("#winKicker").textContent=chapter.winKicker;$("#winTitle").textContent=chapter.winTitle;$("#winStory").textContent=chapter.winStory;$("#winSteps").textContent=state.steps;$("#winTreasures").textContent=state.found.size;
    $("#nextChapterButton").dataset.action=isLast?"shelf":"next";
    $("#nextChapterButton").innerHTML=isLast?'回到故事书架 <span>→</span>':'翻到下一页 <span>→</span>';
    launchConfetti();playWinSound();setTimeout(()=>$("#winDialog").showModal(),650);
  }

  function launchConfetti(){const holder=$("#confetti");holder.replaceChildren();const colors=["#f0ba56","#dc745d","#8ac2ba","#fff3c8","#5f8fbd"];for(let i=0;i<42;i+=1){const piece=document.createElement("i");piece.style.left=`${Math.random()*100}%`;piece.style.background=colors[i%colors.length];piece.style.animationDelay=`${Math.random()*.5}s`;piece.style.animationDuration=`${1.2+Math.random()*.9}s`;holder.append(piece);}}
  function playTone(frequency,duration,type="sine",volume=.03,delay=0){if(!state.sound)return;try{audioContext||=new(window.AudioContext||window.webkitAudioContext)();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=type;osc.frequency.value=frequency;gain.gain.setValueAtTime(volume,audioContext.currentTime+delay);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+delay+duration);osc.connect(gain).connect(audioContext.destination);osc.start(audioContext.currentTime+delay);osc.stop(audioContext.currentTime+delay+duration);}catch(_){}}
  function playCollectSound(){[523,784].forEach((note,i)=>playTone(note,.22,"sine",.035,i*.08));}
  function playWinSound(){[392,523,659,784,1046].forEach((note,i)=>playTone(note,.3,"sine",.04,i*.1));}

  function updateInstallStatus(){
    const status=$("#installStatus"),standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
    status.className="install-status";
    if(standalone){status.classList.add("ready");status.textContent="✓ 已经安装好了。以后直接点主屏幕上的星鲸图标，断网也能打开。";}
    else if(location.protocol==="file:"){status.classList.add("warning");status.textContent="当前是本地文件预览模式。先发布到 HTTPS 网站，才能添加到主屏幕并可靠离线使用。";}
    else if(location.protocol==="https:"||location.hostname==="localhost"||location.hostname==="127.0.0.1"){status.classList.add("ready");status.textContent="这个地址已经满足安装条件。iPad 请按照下面四步添加到主屏幕。";}
    else{status.classList.add("warning");status.textContent="当前地址不是 HTTPS，平板浏览器不会允许安装离线版本。";}
    $("#installAppButton").hidden=!installPrompt;
  }

  function openInstallHelp(){updateInstallStatus();$("#installDialog").showModal();}

  function flushPointerSamples() {
    if (state.inputFrame) cancelAnimationFrame(state.inputFrame);
    state.inputFrame = 0;
    const samples = state.pointerSamples.splice(0);
    samples.forEach((point)=>moveToward(point));
    requestDraw();
  }

  function queuePointerSamples(event) {
    const coalesced=typeof event.getCoalescedEvents==="function"?event.getCoalescedEvents():[];
    const raw=coalesced.length?coalesced:[event];
    const stride=Math.max(1,Math.ceil(raw.length/5));
    for(let index=0;index<raw.length;index+=stride)state.pointerSamples.push(pointerPosition(raw[index]));
    if(raw.length>1)state.pointerSamples.push(pointerPosition(raw[raw.length-1]));
    if(state.pointerSamples.length>10)state.pointerSamples=state.pointerSamples.slice(-10);
    if(!state.inputFrame)state.inputFrame=requestAnimationFrame(flushPointerSamples);
  }

  canvas.addEventListener("pointerdown",(event)=>{
    if(!event.isPrimary||state.activePointerId!==null||state.overview)return;
    event.preventDefault();
    const point=pointerPosition(event),player=screenPoint(state.graph.nodes[state.current]),road=nearestReachableRoad(point);
    const canGrab=Math.hypot(point.x-player.x,point.y-player.y)<=Math.max(52,touchTolerance()*1.35)||road.distance<=touchTolerance();
    state.activePointerId=event.pointerId;state.pointerSamples=[];state.cameraPending=false;
    canvas.setPointerCapture(event.pointerId);
    if(canGrab){
      state.gestureMode="move";state.dragging=true;state.touchPoint=point;state.touchValid=true;
      state.gestureVisited=new Set([state.current]);state.panMoved=false;moveToward(point);
      return;
    }
    cancelAnimationFrame(state.cameraFrame);state.cameraFrame=0;
    state.gestureMode="pan";state.dragging=false;state.touchPoint=null;state.touchValid=true;
    state.panStartPoint=point;state.panStartCamera={...state.camera};state.panMoved=false;
    canvas.classList.add("is-panning");
  });
  canvas.addEventListener("pointermove",(event)=>{
    if(!state.gestureMode||event.pointerId!==state.activePointerId)return;
    event.preventDefault();
    if(state.gestureMode==="pan")panCamera(pointerPosition(event));
    else queuePointerSamples(event);
  });
  function endPointer(event){
    if(event.pointerId!==state.activePointerId)return;
    const mode=state.gestureMode;
    if(mode==="move"){
      if(event.type==="pointerup")state.pointerSamples.push(pointerPosition(event));
      flushPointerSamples();
    }else if(mode==="pan"&&event.type==="pointerup")panCamera(pointerPosition(event));
    state.dragging=false;state.activePointerId=null;state.touchPoint=null;state.touchValid=true;
    state.gestureVisited=new Set();state.gestureMode=null;state.panStartPoint=null;state.panStartCamera=null;
    canvas.classList.remove("is-panning");
    if(mode==="move"&&state.cameraPending){state.cameraPending=false;centerCameraOnCurrent();}
    else{state.cameraPending=false;requestDraw();}
  }
  canvas.addEventListener("pointerup",endPointer);canvas.addEventListener("pointercancel",endPointer);canvas.addEventListener("lostpointercapture",endPointer);
  window.addEventListener("resize",resizeCanvas);

  $("#storyButton").addEventListener("click",showBookshelf);
  $("#readButton").addEventListener("click",()=>speakText(currentPageNarration()));
  $("#introReadButton").addEventListener("click",()=>speakText(introNarration()));
  $("#winReadButton").addEventListener("click",()=>speakText(winNarration()));
  $("#chapterButton").addEventListener("click",()=>{updateChapterList();$("#chapterDialog").showModal();});
  $("#difficultyButton").addEventListener("click",()=>$("#difficultyDialog").showModal());
  $("#installButton").addEventListener("click",openInstallHelp);
  const outsideButton=$("#outsideButton");if(outsideButton)outsideButton.addEventListener("click",openInstallHelp);
  $("#overviewButton").addEventListener("click",()=>{state.overview=!state.overview;$(".story-card").classList.toggle("overview-mode",state.overview);$("#overviewButton").setAttribute("aria-pressed",String(state.overview));$("#overviewButton b").textContent=state.overview?"返回":"全图";if(!state.overview){state.panMoved=false;centerCameraOnCurrent(true);}updateAverageEdge();showToast(state.overview?"现在看到的是完整世界，再点一次回到阿洛身边。":"回到阿洛身边，继续沿路探险。",1800);requestDraw();});
  $("#hintButton").addEventListener("click",showHint);$("#newMazeButton").addEventListener("click",()=>startChapter());
  document.querySelectorAll("[data-close]").forEach((button)=>button.addEventListener("click",()=>{stopNarration();const dialog=$(`#${button.dataset.close}`);dialog.close();if(button.dataset.close==="introDialog"){localStorage.setItem(`starmaze-intro-${state.storyId}`,"seen");if(state.storyId==="starwhale")localStorage.setItem("starmaze-intro","seen");}}));
  $("#soundButton").setAttribute("aria-pressed",String(state.sound));
  $("#soundButton").addEventListener("click",()=>{state.sound=!state.sound;localStorage.setItem("starmaze-sound",state.sound?"on":"off");$("#soundButton").setAttribute("aria-pressed",String(state.sound));$("#soundButton").setAttribute("aria-label",state.sound?"关闭声音":"打开声音");if(state.sound)playTone(660,.12,"sine",.04);});
  document.querySelectorAll("#difficultyList button").forEach((button)=>{
    button.classList.toggle("selected",Number(button.dataset.level)===state.difficulty);
    button.addEventListener("click",()=>{state.difficulty=Number(button.dataset.level);localStorage.setItem("starmaze-difficulty",state.difficulty);document.querySelectorAll("#difficultyList button").forEach((item)=>item.classList.toggle("selected",item===button));$("#difficultyLabel").textContent=difficulty[state.difficulty].label;$("#difficultyGlyph").textContent=difficulty[state.difficulty].glyph;$("#difficultyDialog").close();startChapter();});
  });
  $("#difficultyLabel").textContent=difficulty[state.difficulty].label;$("#difficultyGlyph").textContent=difficulty[state.difficulty].glyph;
  $("#nextChapterButton").addEventListener("click",()=>{const action=$("#nextChapterButton").dataset.action;$("#winDialog").close();if(action==="shelf")showBookshelf();else{const story=storyById(state.storyId),next=story.chapterIndices[storyPosition(state.chapter)+1];startChapter(next);}});
  $("#replayButton").addEventListener("click",()=>{$("#winDialog").close();startChapter();});

  window.addEventListener("beforeinstallprompt",(event)=>{event.preventDefault();installPrompt=event;updateInstallStatus();});
  $("#installAppButton").addEventListener("click",async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;updateInstallStatus();});
  window.addEventListener("appinstalled",()=>{installPrompt=null;updateInstallStatus();});
  if("speechSynthesis" in window){findChineseVoice();window.speechSynthesis.addEventListener?.("voiceschanged",findChineseVoice);}
  window.addEventListener("pagehide",stopNarration);
  if("serviceWorker" in navigator&&location.protocol!=="file:")window.addEventListener("load",async()=>{try{const registration=await navigator.serviceWorker.register("./sw.js");registration.update().catch(()=>{});}catch(_){/* The installed game may start while offline. */}});
  renderBookshelf();
  showBookshelf();
})();
