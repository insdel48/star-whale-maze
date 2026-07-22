(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const canvas = $("#mazeCanvas");
  const ctx = canvas.getContext("2d");
  const miniMap = $("#miniMap");
  const miniCtx = miniMap.getContext("2d");
  const stage = $("#mazeStage");
  const sceneImageFiles = {
    forest: "forest-maze-v1.png", clock: "clock-maze-v1.png", dragon: "dragon-maze-v1.png",
    sea: "sea-maze-v1.png", stars: "stars-maze-v1.png"
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
    }
  ];

  const difficulty = [
    { label: "故事探索者", glyph: "◇", factor: 0 },
    { label: "勇敢冒险家", glyph: "◆◆", factor: 1 },
    { label: "迷宫大师", glyph: "✦✦✦", factor: 2 }
  ];

  const previewChapter = Number(new URLSearchParams(location.search).get("chapter"));
  const savedChapter = Math.min(Number(localStorage.getItem("starmaze-chapter")) || 0, chapters.length - 1);
  const state = {
    chapter: Number.isInteger(previewChapter) && previewChapter >= 1 && previewChapter <= chapters.length ? previewChapter - 1 : savedChapter,
    unlocked: Math.min(Number(localStorage.getItem("starmaze-unlocked")) || 0, chapters.length - 1),
    difficulty: Number(localStorage.getItem("starmaze-difficulty") ?? 1),
    sound: localStorage.getItem("starmaze-sound") !== "off",
    seed: Date.now() % 2147483647,
    graph: null, current: 0, goal: 0, collectibles: [], found: new Set(),
    trail: [], steps: 0, completed: false, dragging: false, activePointerId: null, hintPath: [],
    touchPoint: null, touchValid: true, boundaryMissAt: 0,
    width: 0, height: 0, dpr: 1, pad: 50, avgEdge: 45, toastTimer: 0,
    world: { width: 0, height: 0, pagesX: 1, pagesY: 1 },
    camera: { x: 0, y: 0 }, overview: false, blockedPulse: 0, cameraFrame: 0
  };

  let audioContext = null, installPrompt = null;

  function mulberry32(seed) {
    return function random() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function shuffle(array, rng) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function gridBase(cols, rows, warp, filter = () => true) {
    const nodes = [], lookup = new Map(), edges = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (!filter(col, row, cols, rows)) continue;
        const point = warp(col, row, cols, rows);
        const id = nodes.length;
        nodes.push({ id, x: point.x, y: point.y, col, row, ...point.meta });
        lookup.set(`${col},${row}`, id);
      }
    }
    nodes.forEach((node) => {
      [[1,0],[0,1]].forEach(([dx,dy]) => {
        const other = lookup.get(`${node.col + dx},${node.row + dy}`);
        if (other !== undefined) edges.push([node.id, other]);
      });
    });
    return { nodes, edges };
  }

  function hexBase(cols, rows) {
    const nodes = [], lookup = new Map(), edges = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const nx = (col + .5 * (row % 2)) / (cols - .5);
        const ny = row / (rows - 1);
        if (((nx - .5) ** 2 / .29 + (ny - .5) ** 2 / .31) > 1.05) continue;
        const id = nodes.length;
        nodes.push({ id, x: .08 + nx * .84, y: .08 + ny * .84, col, row });
        lookup.set(`${col},${row}`, id);
      }
    }
    nodes.forEach((node) => {
      const directions = node.row % 2 ? [[1,0],[0,1],[1,1]] : [[1,0],[-1,1],[0,1]];
      directions.forEach(([dx,dy]) => {
        const other = lookup.get(`${node.col + dx},${node.row + dy}`);
        if (other !== undefined) edges.push([node.id, other]);
      });
    });
    return { nodes, edges };
  }

  function polarBase(rings, sectors) {
    const nodes = [{ id: 0, x: .5, y: .5, ring: 0, sector: 0 }], edges = [];
    for (let ring = 1; ring <= rings; ring += 1) {
      const radius = .085 + ring * (.39 / rings);
      for (let sector = 0; sector < sectors; sector += 1) {
        const angle = -Math.PI / 2 + sector * Math.PI * 2 / sectors;
        nodes.push({ id: nodes.length, x: .5 + Math.cos(angle) * radius, y: .5 + Math.sin(angle) * radius, ring, sector, angle });
      }
    }
    const idAt = (ring, sector) => 1 + (ring - 1) * sectors + (sector % sectors + sectors) % sectors;
    for (let sector = 0; sector < sectors; sector += 1) edges.push([0, idAt(1, sector)]);
    for (let ring = 1; ring <= rings; ring += 1) {
      for (let sector = 0; sector < sectors; sector += 1) {
        edges.push([idAt(ring, sector), idAt(ring, sector + 1)]);
        if (ring < rings) edges.push([idAt(ring, sector), idAt(ring + 1, sector)]);
      }
    }
    return { nodes, edges };
  }

  function createBase(theme, level, rng) {
    if (theme === "clock") {
      const configs = [[6,16],[9,24],[12,32]];
      return polarBase(...configs[level]);
    }
    if (theme === "dragon") {
      const configs = [[13,9],[19,12],[25,16]];
      return hexBase(...configs[level]);
    }
    const configs = {
      forest: [[12,8],[18,11],[26,14]],
      sea: [[12,8],[18,11],[26,14]],
      stars: [[13,9],[19,12],[27,15]]
    };
    const [cols, rows] = configs[theme][level];
    return gridBase(cols, rows, (col, row, c, r) => {
      const u = col / (c - 1), v = row / (r - 1);
      if (theme === "forest") {
        return { x: .08 + u * .84 + Math.sin(row * 1.7 + col) * .012, y: .08 + v * .84 + Math.sin(col * 1.3) * .018 };
      }
      if (theme === "sea") {
        return { x: .07 + u * .86 + Math.sin(v * 9 + col) * .018, y: .09 + v * .82 + Math.sin(u * 8 + row) * .025 };
      }
      return { x: .09 + u * .82 + (rng() - .5) * .035, y: .08 + v * .84 + (rng() - .5) * .04 };
    }, theme === "stars" ? (col, row, c, r) => {
      const x = col / (c - 1) - .5, y = row / (r - 1) - .5;
      return x * x / .29 + y * y / .31 < 1.08;
    } : undefined);
  }

  function illustratedForestGraph() {
    const points = {
      start:[.084,.602], a1:[.104,.566], a2:[.127,.523], j1:[.143,.469],
      lamp1:[.216,.374], t1:[.184,.397], t2:[.239,.337], t3:[.248,.286], t4:[.228,.247],
      t5:[.275,.218], t6:[.326,.222], treeDoor:[.347,.166], top7:[.371,.194], top8:[.405,.242],
      top9:[.393,.302], top10:[.424,.335], waterfall:[.482,.160], uc1:[.462,.243], uc2:[.477,.309],
      l1:[.151,.574], l2:[.193,.617], bridge1:[.267,.645], l4:[.319,.603], l5:[.353,.536],
      shrineL:[.397,.486], shrineTop:[.427,.424], lamp2:[.458,.492], shrineR:[.492,.550],
      mid1:[.459,.373], mid2:[.510,.404], mid3:[.537,.462], mid4:[.516,.522], mid5:[.551,.580],
      mid6:[.614,.599], mid7:[.648,.566],
      stone1:[.525,.328], stone2:[.576,.291], stoneDead:[.633,.273], up1:[.576,.237], up2:[.616,.196],
      up3:[.682,.178], up4:[.747,.210], up5:[.771,.277], rt1:[.815,.315], rt2:[.862,.294], goal:[.914,.246],
      loop1:[.613,.345], loop2:[.658,.327], loop3:[.701,.349], loop4:[.713,.407], loop5:[.678,.455],
      loop6:[.702,.510], loop7:[.755,.522], pond1:[.780,.406], pond2:[.814,.440], pond3:[.861,.421], pond4:[.886,.359],
      lower1:[.466,.620], lower2:[.490,.681], lower3:[.548,.731], lower4:[.607,.752], lower5:[.651,.713],
      lamp3:[.696,.681], lower7:[.729,.642], lower8:[.756,.583], village1:[.788,.630], village2:[.800,.692],
      village3:[.839,.741], village4:[.891,.762], cottage:[.935,.692], southBridge:[.830,.850],
      pondL1:[.221,.686], pondL2:[.176,.738], pondL3:[.192,.796], pondL4:[.259,.851], pondL5:[.343,.887],
      pondL6:[.430,.878], pondL7:[.513,.835]
    };
    const keys = Object.keys(points);
    const ids = Object.fromEntries(keys.map((key, id) => [key, id]));
    const nodes = keys.map((key, id) => ({ id, key, x: points[key][0], y: points[key][1] }));
    const paths = [
      ["start","a1","a2","j1","t1","lamp1","t2","t3","t4","t5","t6","top7","top8","top9","top10","mid1","uc2"],
      ["t6","treeDoor"], ["top8","uc1","waterfall"], ["uc1","uc2"],
      ["a2","l1","l2","bridge1","l4","l5","shrineL","shrineTop","mid1"],
      ["shrineL","lamp2","shrineR","mid4","mid3","mid2","mid1"],
      ["uc2","stone1","stone2","up1","up2","up3","up4","up5","rt1","rt2","goal"],
      ["stone2","stoneDead"], ["stone2","loop1","loop2","loop3","loop4","pond1","pond2","pond3","pond4","rt2"],
      ["loop4","loop5","loop6","loop7","pond1"],
      ["mid2","mid3","mid4","mid5","mid6","mid7","loop6"],
      ["shrineR","lower1","lower2","lower3","lower4","lower5","lamp3","lower7","lower8","loop7"],
      ["lower8","village1","village2","village3","village4","cottage"],
      ["village4","southBridge"], ["pond3","loop7"],
      ["bridge1","pondL1","pondL2","pondL3","pondL4","pondL5","pondL6","pondL7","lower4"]
    ];
    const edgeKeys = new Set(), edges = [];
    paths.forEach((path) => path.slice(1).forEach((key, index) => {
      const a = ids[path[index]], b = ids[key], edgeKey = a < b ? `${a}:${b}` : `${b}:${a}`;
      if (!edgeKeys.has(edgeKey)) { edgeKeys.add(edgeKey); edges.push([a,b]); }
    }));
    const adjacency = Array.from({ length: nodes.length }, () => []);
    edges.forEach(([a,b]) => { adjacency[a].push(b); adjacency[b].push(a); });
    return { nodes, edges, adjacency, illustrated: true, special: { start: ids.start, goal: ids.goal, collectibles: [ids.lamp1, ids.lamp2, ids.lamp3] } };
  }

  function buildIllustratedGraph(points, paths, specialKeys) {
    const keys = Object.keys(points);
    const ids = Object.fromEntries(keys.map((key, id) => [key, id]));
    const nodes = keys.map((key, id) => ({ id, key, x: points[key][0], y: points[key][1] }));
    const edgeKeys = new Set(), edges = [];
    paths.forEach((path) => path.slice(1).forEach((key, index) => {
      const a = ids[path[index]], b = ids[key], edgeKey = a < b ? `${a}:${b}` : `${b}:${a}`;
      if (!edgeKeys.has(edgeKey)) { edgeKeys.add(edgeKey); edges.push([a,b]); }
    }));
    const adjacency = Array.from({ length: nodes.length }, () => []);
    edges.forEach(([a,b]) => { adjacency[a].push(b); adjacency[b].push(a); });
    return {
      nodes, edges, adjacency, illustrated: true,
      special: { start: ids[specialKeys.start], goal: ids[specialKeys.goal], collectibles: specialKeys.collectibles.map((key) => ids[key]) }
    };
  }

  function illustratedClockGraph() {
    const points = {
      start:[.055,.752], a1:[.086,.748], a2:[.101,.683], a3:[.105,.602], j1:[.112,.505],
      left1:[.132,.452], gear1:[.151,.414], left2:[.185,.374], left3:[.166,.319], upper1:[.217,.291],
      upper2:[.251,.235], upper3:[.302,.179], upper4:[.365,.169], upper5:[.411,.217], upper6:[.449,.275],
      centralTop:[.497,.292], topR1:[.557,.279], topR2:[.624,.218], topR3:[.694,.258], topR4:[.756,.298],
      topR5:[.818,.315], goalApproach:[.872,.292], goal:[.907,.183],
      midL1:[.201,.447], midL2:[.271,.462], midL3:[.323,.429], midL4:[.377,.442], gear2:[.484,.458],
      midR1:[.549,.449], midR2:[.615,.480], midR3:[.684,.510], midR4:[.755,.528], right1:[.817,.501],
      right2:[.878,.466], right3:[.914,.405],
      b1:[.095,.823], b2:[.158,.795], b3:[.219,.758], b4:[.279,.694], b5:[.337,.721], b6:[.401,.758],
      b7:[.461,.716], b8:[.520,.666], b9:[.580,.699], b10:[.644,.741], b11:[.708,.758], b12:[.766,.742],
      gear3:[.827,.790], b14:[.881,.761], b15:[.914,.698], b16:[.927,.608],
      loopL1:[.231,.575], loopL2:[.286,.622], loopL3:[.342,.579], loopL4:[.406,.613],
      loopR1:[.677,.605], loopR2:[.735,.630], loopR3:[.793,.590], clockDead:[.051,.378], gardenDead:[.219,.563]
    };
    const paths = [
      ["start","a1","a2","a3","j1","left1","gear1","left2","left3","upper1","upper2","upper3","upper4","upper5","upper6","centralTop","topR1","topR2","topR3","topR4","topR5","goalApproach","goal"],
      ["j1","midL1","midL2","midL3","midL4","gear2","midR1","midR2","midR3","midR4","right1","right2","right3","goalApproach"],
      ["start","b1","b2","b3","b4","b5","b6","b7","b8","b9","b10","b11","b12","gear3","b14","b15","b16","right2"],
      ["midL2","loopL1","gardenDead"], ["loopL1","loopL2","b4"], ["loopL2","loopL3","loopL4","b7"],
      ["midL4","loopL3"], ["gear2","loopL4"], ["midR3","loopR1","loopR2","loopR3","right1"],
      ["loopR2","b11"], ["loopR3","b12"], ["j1","clockDead"], ["centralTop","topR1","midR1"]
    ];
    return buildIllustratedGraph(points, paths, { start:"start", goal:"goal", collectibles:["gear1","gear2","gear3"] });
  }

  function illustratedDragonGraph() {
    const points = {
      start:[.038,.833], a1:[.096,.821], a2:[.143,.774], a3:[.179,.718], a4:[.203,.651], j1:[.201,.581],
      leftL:[.151,.557], leftShrine:[.112,.516], gem1:[.135,.463], leftU:[.103,.414], leftTop:[.105,.362],
      weave1:[.154,.339], weave2:[.203,.381], weave3:[.251,.421], weave4:[.283,.472], weave5:[.312,.523],
      up1:[.247,.332], up2:[.289,.282], up3:[.343,.271], up4:[.392,.314], up5:[.421,.378],
      up6:[.468,.420], up7:[.514,.386], up8:[.558,.338], up9:[.619,.301], up10:[.680,.321],
      up11:[.715,.379], up12:[.770,.410], right1:[.825,.425], right2:[.877,.473], right3:[.912,.541],
      high1:[.579,.268], high2:[.609,.195], high3:[.661,.143], high4:[.716,.151], high5:[.761,.202],
      high6:[.807,.221], high7:[.850,.191], goal:[.910,.163],
      c1:[.267,.568], c2:[.337,.592], c3:[.402,.565], gem2:[.479,.557], c5:[.539,.584], c6:[.572,.648],
      c7:[.630,.699], c8:[.696,.738], c9:[.753,.752], gem3:[.786,.770], c11:[.835,.744], c12:[.881,.697], c13:[.908,.625],
      low1:[.468,.650], low2:[.520,.713], low3:[.603,.786], low4:[.647,.842], low5:[.726,.866], low6:[.811,.868], low7:[.874,.817],
      cave1:[.748,.487], cave2:[.793,.531], cave3:[.849,.532], blueDead:[.273,.438], tunnelDead:[.215,.742]
    };
    const paths = [
      ["start","a1","a2","a3","a4","j1","leftL","leftShrine","gem1","leftU","leftTop","weave1","weave2","weave3","weave4","weave5","j1"],
      ["weave2","up1","up2","up3","up4","up5","up6","up7","up8","up9","up10","up11","up12","right1","right2","right3"],
      ["up8","high1","high2","high3","high4","high5","high6","high7","goal"],
      ["j1","c1","c2","c3","gem2","c5","c6","c7","c8","c9","gem3","c11","c12","c13","right3"],
      ["gem2","low1","low2","c6"], ["low2","low3","low4","low5","low6","low7","c11"],
      ["up12","cave1","cave2","cave3","right2"], ["cave2","c9"], ["weave4","blueDead"], ["a3","tunnelDead"],
      ["c3","up5"], ["c5","up7"]
    ];
    return buildIllustratedGraph(points, paths, { start:"start", goal:"goal", collectibles:["gem1","gem2","gem3"] });
  }

  function illustratedSeaGraph() {
    const points = {
      start:[.060,.779], a1:[.102,.757], a2:[.144,.718], a3:[.181,.669], a4:[.161,.618], a5:[.132,.573],
      a6:[.121,.520], shell1:[.116,.451], leftU:[.137,.394], leftTop:[.132,.334], t1:[.169,.291], t2:[.214,.291],
      t3:[.248,.332], t4:[.271,.389], t5:[.253,.459], t6:[.292,.503],
      top1:[.309,.334], top2:[.368,.296], top3:[.421,.268], top4:[.479,.222], top5:[.540,.169],
      top6:[.603,.181], top7:[.654,.211], top8:[.706,.232], top9:[.763,.245], top10:[.817,.254],
      top11:[.867,.224], goal:[.892,.137],
      centerL:[.350,.478], center1:[.405,.506], shell2:[.490,.512], center3:[.548,.519], center4:[.602,.487],
      center5:[.650,.453], center6:[.696,.420], center7:[.751,.406], center8:[.802,.423], center9:[.851,.461], center10:[.886,.523],
      b1:[.181,.718], b2:[.232,.744], b3:[.290,.720], b4:[.351,.674], b5:[.416,.666], b6:[.478,.701],
      b7:[.541,.676], b8:[.604,.670], b9:[.660,.717], b10:[.704,.768], shell3:[.731,.780], b12:[.787,.779],
      b13:[.839,.733], b14:[.887,.681], b15:[.920,.603],
      loopL1:[.213,.565], loopL2:[.261,.592], loopL3:[.315,.565], loopC1:[.400,.593], loopC2:[.455,.611],
      loopR1:[.589,.587], loopR2:[.651,.594], loopR3:[.718,.564], village:[.760,.526], moonDead:[.354,.185], reefDead:[.932,.513]
    };
    const paths = [
      ["start","a1","a2","a3","a4","a5","a6","shell1","leftU","leftTop","t1","t2","t3","t4","t5","t6","centerL","center1","shell2","center3","center4","center5","center6","center7","center8","center9","center10","b15"],
      ["t3","top1","top2","top3","top4","top5","top6","top7","top8","top9","top10","top11","goal"],
      ["start","b1","b2","b3","b4","b5","b6","b7","b8","b9","b10","shell3","b12","b13","b14","b15"],
      ["a4","loopL1","loopL2","loopL3","t6"], ["loopL2","b3"],
      ["centerL","loopC1","loopC2","shell2"], ["loopC1","b5"], ["loopC2","b6"],
      ["center4","loopR1","loopR2","loopR3","village","center8"], ["loopR2","b9"], ["loopR3","b10"],
      ["top3","moonDead"], ["center10","reefDead"], ["top9","center7"]
    ];
    return buildIllustratedGraph(points, paths, { start:"start", goal:"goal", collectibles:["shell1","shell2","shell3"] });
  }

  function illustratedStarsGraph() {
    const points = {
      start:[.117,.742], a1:[.146,.704], a2:[.181,.662], a3:[.218,.612], a4:[.228,.554], a5:[.192,.503],
      star1:[.085,.514], left1:[.142,.491], left2:[.188,.443], left3:[.225,.399], left4:[.201,.351], left5:[.211,.315],
      left6:[.259,.321], left7:[.298,.369], left8:[.339,.427], left9:[.381,.468], left10:[.423,.494],
      top1:[.306,.315], top2:[.318,.255], top3:[.354,.204], top4:[.341,.169], top5:[.382,.178], top6:[.420,.229],
      top7:[.461,.259], top8:[.508,.259], top9:[.553,.237], top10:[.593,.272], top11:[.612,.338], top12:[.617,.404],
      ringL:[.470,.379], star2:[.525,.430], ringR:[.581,.404], ringD:[.578,.515], ringB:[.536,.575], ringBL:[.480,.570],
      b1:[.232,.677], b2:[.286,.718], b3:[.347,.717], b4:[.397,.757], b5:[.470,.746], b6:[.544,.727],
      b7:[.615,.696], b8:[.678,.697], star3:[.716,.757], b10:[.778,.747], b11:[.823,.704], b12:[.861,.642],
      r1:[.675,.436], r2:[.737,.431], r3:[.795,.478], r4:[.850,.527], r5:[.878,.594],
      goal1:[.761,.349], goal2:[.792,.298], goal3:[.783,.241], goal4:[.806,.202], goal5:[.838,.198], goal:[.860,.150],
      observatory:[.347,.112], constellation:[.393,.820], orchard:[.914,.496]
    };
    const paths = [
      ["start","a1","a2","a3","a4","a5","left1","star1"],
      ["left1","left2","left3","left4","left5","left6","left7","left8","left9","left10","ringBL","star2","ringL","left10"],
      ["left7","top1","top2","top3","top4","top5","top6","top7","top8","top9","top10","top11","top12","ringR","star2"],
      ["star2","ringR","ringD","ringB","ringBL"],
      ["a3","b1","b2","b3","b4","b5","b6","b7","b8","star3","b10","b11","b12","r5"],
      ["top12","r1","r2","r3","r4","r5"], ["r3","orchard"], ["b8","r3"],
      ["r2","goal1","goal2","goal3","goal4","goal5","goal"],
      ["top3","observatory"], ["b4","constellation"], ["ringD","b6"]
    ];
    return buildIllustratedGraph(points, paths, { start:"start", goal:"goal", collectibles:["star1","star2","star3"] });
  }

  function carveMaze(base, rng) {
    const candidates = Array.from({ length: base.nodes.length }, () => []);
    base.edges.forEach(([a,b]) => { candidates[a].push(b); candidates[b].push(a); });
    const start = Math.floor(rng() * base.nodes.length);
    const stack = [start], visited = new Set([start]), carved = [];
    while (stack.length) {
      const current = stack[stack.length - 1];
      const options = shuffle(candidates[current].filter((n) => !visited.has(n)), rng);
      if (!options.length) { stack.pop(); continue; }
      const next = options[0];
      visited.add(next); stack.push(next); carved.push([current, next]);
    }
    const adjacency = Array.from({ length: base.nodes.length }, () => []);
    carved.forEach(([a,b]) => { adjacency[a].push(b); adjacency[b].push(a); });
    return { nodes: base.nodes, edges: carved, adjacency };
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

  function graphDistance(graph, a, b) { return bfs(graph, a).distance[b]; }

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

  function chooseSpecialNodes(graph) {
    const start = graph.nodes.reduce((best, node) => (node.x + (1 - node.y) < graph.nodes[best].x + (1 - graph.nodes[best].y) ? node.id : best), 0);
    const startMap = bfs(graph, start);
    const goal = startMap.distance.reduce((bestDist, value, id) => value > bestDist.value ? { value, id } : bestDist, { value: -1, id: start }).id;
    let candidates = graph.nodes.filter((node) => graph.adjacency[node.id].length === 1 && node.id !== start && node.id !== goal).map((node) => node.id);
    if (candidates.length < 3) candidates = graph.nodes.map((node) => node.id).filter((id) => id !== start && id !== goal);
    const chosen = [];
    while (chosen.length < 3 && candidates.length) {
      const best = candidates.reduce((winner, id) => {
        const anchors = [start, goal, ...chosen];
        const score = Math.min(...anchors.map((anchor) => graphDistance(graph, id, anchor)));
        return score > winner.score ? { id, score } : winner;
      }, { id: candidates[0], score: -1 });
      chosen.push(best.id); candidates = candidates.filter((id) => id !== best.id);
    }
    return { start, goal, collectibles: chosen };
  }

  function startChapter(chapterIndex = state.chapter) {
    state.chapter = chapterIndex;
    state.seed = (state.seed + 104729) % 2147483647;
    const rng = mulberry32(state.seed + chapterIndex * 99991 + state.difficulty * 7127);
    const illustratedFactories = {
      forest: illustratedForestGraph, clock: illustratedClockGraph, dragon: illustratedDragonGraph,
      sea: illustratedSeaGraph, stars: illustratedStarsGraph
    };
    const factory = illustratedFactories[chapters[chapterIndex].theme];
    if (factory) state.graph = factory();
    else {
      const base = createBase(chapters[chapterIndex].theme, state.difficulty, rng);
      state.graph = carveMaze(base, rng);
    }
    if (state.graph.illustrated) validateGraph(state.graph, chapters[chapterIndex].theme);
    const special = state.graph.special || chooseSpecialNodes(state.graph);
    state.current = special.start; state.goal = special.goal; state.collectibles = special.collectibles;
    state.found = new Set(); state.trail = [state.current]; state.steps = 0;
    state.completed = false; state.dragging = false; state.activePointerId = null;
    state.touchPoint = null; state.touchValid = true; state.hintPath = []; state.overview = false;
    $("#overviewButton").setAttribute("aria-pressed", "false");
    localStorage.setItem("starmaze-chapter", state.chapter);
    updateStoryUI();
    requestAnimationFrame(resizeCanvas);
  }

  function updateStoryUI() {
    const chapter = chapters[state.chapter];
    const palette = {
      forest:["#174f54","#102f3e"], clock:["#82632f","#253e51"], dragon:["#3f7468","#274854"],
      sea:["#227b94","#153f63"], stars:["#4859a0","#202b66"]
    }[chapter.theme];
    document.documentElement.style.setProperty("--chapter-accent", palette[0]);
    document.documentElement.style.setProperty("--chapter-deep", palette[1]);
    document.body.dataset.theme = chapter.theme;
    $("#chapterNumber").textContent = String(state.chapter + 1).padStart(2, "0");
    $("#chapterKicker").textContent = chapter.kicker;
    $("#chapterTitle").textContent = chapter.title;
    $("#chapterStory").textContent = chapter.story;
    $("#missionIcon").textContent = chapter.item;
    $("#missionText").textContent = chapter.mission;
    $("#storyTip").innerHTML = "<small>阿洛说</small><span>有些路看起来很近，却不一定能到达。</span>";
    $("#dragHint").classList.remove("hidden");
    $("#chapterProgress").innerHTML = chapters.map((_, i) => `<i class="${i < state.chapter ? "done" : i === state.chapter ? "current" : ""}"></i>`).join("");
    updateCollectionUI(); updateChapterList();
  }

  function updateCollectionUI() {
    const chapter = chapters[state.chapter];
    $("#collection").innerHTML = state.collectibles.map((id) => `<i class="${state.found.has(id) ? "found" : ""}">${state.found.has(id) ? chapter.item : "?"}</i>`).join("");
  }

  function updateChapterList() {
    $("#chapterList").innerHTML = chapters.map((chapter, index) => {
      const locked = index > state.unlocked;
      return `<button data-chapter="${index}" style="--chapter-art:url('./assets/scenes/${sceneImageFiles[chapter.theme]}')" class="${index === state.chapter ? "current" : ""} ${locked ? "locked" : ""}" ${locked ? "disabled" : ""}>
        <span class="chapter-emoji">${chapter.icon}</span><small>CHAPTER ${String(index + 1).padStart(2,"0")}</small><b>${chapter.title}</b><em>${locked ? "🔒" : index < state.unlocked ? "✓" : ""}</em>
      </button>`;
    }).join("");
    $("#chapterList").querySelectorAll("button:not([disabled])").forEach((button) => button.addEventListener("click", () => {
      $("#chapterDialog").close(); startChapter(Number(button.dataset.chapter));
    }));
  }

  function resizeCanvas() {
    const rect = stage.getBoundingClientRect();
    state.width = rect.width; state.height = rect.height; state.dpr = Math.min(devicePixelRatio || 1, 2);
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
      draw();
      if (t < 1) state.cameraFrame = requestAnimationFrame(animate);
    };
    state.cameraFrame = requestAnimationFrame(animate);
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
    const column = Math.min(state.world.pagesX - 1, Math.max(0, Math.floor(worldPoint(current).x / state.width)));
    const row = Math.min(state.world.pagesY - 1, Math.max(0, Math.floor(worldPoint(current).y / state.height)));
    const page = state.graph.illustrated ? Math.min(4, Math.floor(current.x * 4) + 1) : row * state.world.pagesX + column + 1;
    const pageCount = state.graph.illustrated ? 4 : state.world.pagesX * state.world.pagesY;
    $("#worldPage").textContent = state.overview ? `完整绘本地图 · ${state.graph.nodes.length} 个路口` : `探索区域 ${page} / ${pageCount}`;
  }

  function drawScene() {
    const theme = chapters[state.chapter].theme;
    const gradients = {
      forest: ["#9ab9a0", "#416f69"], clock: ["#dfc68d", "#8f6d4f"], dragon: ["#9aa8a2", "#475b58"],
      sea: ["#72b7bc", "#2c7084"], stars: ["#1f4168", "#091d38"]
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
    const colors={forest:["rgba(20,53,46,.74)","#e8dfbd"],clock:["rgba(74,45,29,.68)","#f3dfaa"],dragon:["rgba(24,43,41,.76)","#d9d5bd"],sea:["rgba(9,58,73,.72)","#d8e1c4"],stars:["rgba(0,7,28,.76)","#bcd8d6"]}[theme];
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
    ctx.save();ctx.strokeStyle=state.graph.illustrated?"rgba(255,224,139,.72)":"rgba(220,116,93,.72)";ctx.lineWidth=state.graph.illustrated?Math.max(2,state.avgEdge*.035):Math.max(3,state.avgEdge*.075);ctx.lineCap="round";ctx.setLineDash(state.graph.illustrated?[1,11]:[2,7]);
    if(state.trail.length>1)for(let i=1;i<state.trail.length;i+=1){edgeCurve(state.graph.nodes[state.trail[i-1]],state.graph.nodes[state.trail[i]]);ctx.stroke();}
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
    const base = Math.max(13, Math.min(22, state.avgEdge * .22));
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
      const color = kind === "goal" ? (locked ? "#8ca7a6" : "#82dce7") : "#ffd86c";
      ctx.shadowColor = color; ctx.shadowBlur = 14 + pulse * 12; ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, base * .12);
      ctx.globalAlpha = .7 + pulse * .25; ctx.beginPath(); ctx.arc(p.x, p.y, base * (1.1 + pulse * .22), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, base * .18, 0, Math.PI * 2); ctx.fill();
      for (let ray = 0; ray < 6; ray += 1) {
        const angle = ray * Math.PI / 3 + pulse * .15;
        ctx.beginPath(); ctx.moveTo(p.x + Math.cos(angle) * base * .55, p.y + Math.sin(angle) * base * .55);
        ctx.lineTo(p.x + Math.cos(angle) * base * .82, p.y + Math.sin(angle) * base * .82); ctx.stroke();
      }
      if (kind === "goal" && locked) {
        ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 5; ctx.fillStyle = "rgba(9,35,42,.88)";
        ctx.beginPath(); ctx.roundRect(p.x - base * .38, p.y - base * .22, base * .76, base * .7, base * .12); ctx.fill();
        ctx.strokeStyle = "#dce8dc"; ctx.lineWidth = Math.max(1.5, base * .1); ctx.beginPath(); ctx.arc(p.x, p.y - base * .2, base * .25, Math.PI, 0); ctx.stroke();
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
    if(performance.now()-state.blockedPulse<260){const p=screenPoint(state.graph.nodes[state.current]),r=Math.max(20,Math.min(29,state.avgEdge*.32));ctx.save();ctx.strokeStyle="rgba(255,225,146,.58)";ctx.lineWidth=1.5;ctx.setLineDash([2,6]);ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.stroke();ctx.restore();}
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
    if(p.x<state.width*.27||p.x>state.width*.73||p.y<state.height*.25||p.y>state.height*.75)centerCameraOnCurrent();
  }

  function moveTo(next) {
    if(state.completed||!state.graph.adjacency[state.current].includes(next))return false;
    state.current=next;state.trail.push(next);state.steps+=1;state.hintPath=[];$("#dragHint").classList.add("hidden");
    $("#storyTip").innerHTML="<small>正在探索</small><span>小地图里的白框会跟着阿洛移动。</span>";
    playTone(310+(state.steps%5)*32,.045,"sine",.018);
    const collectibleIndex=state.collectibles.indexOf(next);
    if(collectibleIndex!==-1&&!state.found.has(next)){
      state.found.add(next);updateCollectionUI();showToast(chapters[state.chapter].finds[collectibleIndex]);playCollectSound();
      stage.classList.remove("found-glow"); void stage.offsetWidth; stage.classList.add("found-glow");
      $("#storyTip").innerHTML=`<small>找到了 ${state.found.size}/3</small><span>${state.found.size===3?"出口已经亮起来了！":"还有宝物藏在别的岔路里。"}</span>`;
    }
    if(next===state.goal){
      if(state.found.size===state.collectibles.length)completeChapter();
      else{showToast(`${chapters[state.chapter].goalName}还没有醒来……还有 ${state.collectibles.length-state.found.size} 件宝物没有找到。`);playTone(156,.12,"sine",.012);}
    }
    followCurrentIfNeeded();draw();return true;
  }

  function moveDirection(direction) {
    const vectors={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]},v=vectors[direction],current=screenPoint(state.graph.nodes[state.current]);
    let best={id:-1,score:.15};
    state.graph.adjacency[state.current].forEach((id)=>{const p=screenPoint(state.graph.nodes[id]),dx=p.x-current.x,dy=p.y-current.y,len=Math.hypot(dx,dy),score=(dx/len)*v[0]+(dy/len)*v[1];if(score>best.score)best={id,score};});
    if(best.id>=0)moveTo(best.id);else softBlocked();
  }

  function softBlocked(){state.blockedPulse=performance.now();playTone(142,.035,"sine",.008);$("#storyTip").innerHTML="<small>这边没有路</small><span>换一个方向试试，不着急。</span>";draw();setTimeout(draw,280);}

  function pointerPosition(event){const rect=canvas.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top};}

  function segmentMetrics(point, start, end) {
    const dx=end.x-start.x,dy=end.y-start.y,lengthSquared=dx*dx+dy*dy||1;
    const progress=Math.max(0,Math.min(1,((point.x-start.x)*dx+(point.y-start.y)*dy)/lengthSquared));
    const x=start.x+dx*progress,y=start.y+dy*progress;
    return {progress,distance:Math.hypot(point.x-x,point.y-y)};
  }

  function touchTolerance(){return Math.max(27,Math.min(46,state.avgEdge*.42));}

  function nearestReachableRoad(point) {
    const start=screenPoint(state.graph.nodes[state.current]);
    return state.graph.adjacency[state.current].reduce((best,id)=>{
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
      draw(); return false;
    }
    const nearNext=road.end&&Math.hypot(point.x-road.end.x,point.y-road.end.y)<Math.max(31,tolerance*.86);
    if(road.progress>.6||nearNext){
      const moved=moveTo(road.id);
      if(moved&&hops<3)return moveToward(point,hops+1)||true;
      return moved;
    }
    draw(); return false;
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
    showToast(state.found.size<3?"金色微光指向最近的一件宝物。":"所有宝物都找到了，去追随通往出口的光吧。",2200);playTone(660,.18,"sine",.03);draw();
    setTimeout(()=>{state.hintPath=[];draw();},2400);
  }

  function showToast(message,duration=3000){const toast=$("#storyToast");toast.textContent=message;toast.classList.add("show");clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>toast.classList.remove("show"),duration);}
  function completeChapter(){
    state.completed=true;const chapter=chapters[state.chapter];state.unlocked=Math.max(state.unlocked,Math.min(state.chapter+1,chapters.length-1));localStorage.setItem("starmaze-unlocked",state.unlocked);
    $("#winScene").textContent="";$("#winScene").style.backgroundImage=`url('./assets/scenes/${sceneImageFiles[chapter.theme]}')`;$("#winKicker").textContent=chapter.winKicker;$("#winTitle").textContent=chapter.winTitle;$("#winStory").textContent=chapter.winStory;$("#winSteps").textContent=state.steps;$("#winTreasures").textContent=state.found.size;
    $("#nextChapterButton").innerHTML=state.chapter<chapters.length-1?'翻到下一页 <span>→</span>':'从故事开头再读一遍 <span>↻</span>';
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

  canvas.addEventListener("pointerdown",(event)=>{
    if(!event.isPrimary||state.activePointerId!==null||state.overview)return;
    event.preventDefault();
    const point=pointerPosition(event),player=screenPoint(state.graph.nodes[state.current]),road=nearestReachableRoad(point);
    const canGrab=Math.hypot(point.x-player.x,point.y-player.y)<=Math.max(52,touchTolerance()*1.35)||road.distance<=touchTolerance();
    if(!canGrab){state.touchPoint=point;state.touchValid=false;state.dragging=true;draw();setTimeout(()=>{state.dragging=false;state.touchPoint=null;draw();},220);return;}
    state.activePointerId=event.pointerId;state.dragging=true;state.touchPoint=point;state.touchValid=true;
    canvas.setPointerCapture(event.pointerId);moveToward(point);
  });
  canvas.addEventListener("pointermove",(event)=>{
    if(!state.dragging||event.pointerId!==state.activePointerId)return;
    event.preventDefault();
    const coalesced=typeof event.getCoalescedEvents==="function"?event.getCoalescedEvents():[];
    const samples=coalesced.length?coalesced:[event];
    samples.forEach((sample)=>moveToward(pointerPosition(sample)));
  });
  function endPointer(event){
    if(event.pointerId!==state.activePointerId)return;
    state.dragging=false;state.activePointerId=null;state.touchPoint=null;state.touchValid=true;draw();
  }
  canvas.addEventListener("pointerup",endPointer);canvas.addEventListener("pointercancel",endPointer);canvas.addEventListener("lostpointercapture",endPointer);
  document.querySelectorAll(".move-button").forEach((button)=>button.addEventListener("pointerdown",(event)=>{event.preventDefault();moveDirection(button.dataset.dir);}));
  window.addEventListener("keydown",(event)=>{const keys={ArrowUp:"up",ArrowRight:"right",ArrowDown:"down",ArrowLeft:"left",w:"up",d:"right",s:"down",a:"left"};if(keys[event.key]){event.preventDefault();moveDirection(keys[event.key]);}});
  window.addEventListener("resize",resizeCanvas);

  $("#storyButton").addEventListener("click",()=>$("#introDialog").showModal());
  $("#chapterButton").addEventListener("click",()=>{updateChapterList();$("#chapterDialog").showModal();});
  $("#difficultyButton").addEventListener("click",()=>$("#difficultyDialog").showModal());
  $("#installButton").addEventListener("click",openInstallHelp);$("#outsideButton").addEventListener("click",openInstallHelp);
  $("#overviewButton").addEventListener("click",()=>{state.overview=!state.overview;$("#overviewButton").setAttribute("aria-pressed",String(state.overview));$("#overviewButton b").textContent=state.overview?"返回":"全图";if(!state.overview)centerCameraOnCurrent(true);updateAverageEdge();showToast(state.overview?"现在看到的是完整世界，再点一次回到阿洛身边。":"回到阿洛身边，继续沿路探险。",1800);draw();});
  $("#hintButton").addEventListener("click",showHint);$("#newMazeButton").addEventListener("click",()=>startChapter());
  document.querySelectorAll("[data-close]").forEach((button)=>button.addEventListener("click",()=>{const dialog=$(`#${button.dataset.close}`);dialog.close();if(button.dataset.close==="introDialog")localStorage.setItem("starmaze-intro","seen");}));
  $("#soundButton").setAttribute("aria-pressed",String(state.sound));
  $("#soundButton").addEventListener("click",()=>{state.sound=!state.sound;localStorage.setItem("starmaze-sound",state.sound?"on":"off");$("#soundButton").setAttribute("aria-pressed",String(state.sound));$("#soundButton").setAttribute("aria-label",state.sound?"关闭声音":"打开声音");if(state.sound)playTone(660,.12,"sine",.04);});
  document.querySelectorAll("#difficultyList button").forEach((button)=>{
    button.classList.toggle("selected",Number(button.dataset.level)===state.difficulty);
    button.addEventListener("click",()=>{state.difficulty=Number(button.dataset.level);localStorage.setItem("starmaze-difficulty",state.difficulty);document.querySelectorAll("#difficultyList button").forEach((item)=>item.classList.toggle("selected",item===button));$("#difficultyLabel").textContent=difficulty[state.difficulty].label;$("#difficultyGlyph").textContent=difficulty[state.difficulty].glyph;$("#difficultyDialog").close();startChapter();});
  });
  $("#difficultyLabel").textContent=difficulty[state.difficulty].label;$("#difficultyGlyph").textContent=difficulty[state.difficulty].glyph;
  $("#nextChapterButton").addEventListener("click",()=>{$("#winDialog").close();startChapter(state.chapter<chapters.length-1?state.chapter+1:0);});
  $("#replayButton").addEventListener("click",()=>{$("#winDialog").close();startChapter();});

  window.addEventListener("beforeinstallprompt",(event)=>{event.preventDefault();installPrompt=event;updateInstallStatus();});
  $("#installAppButton").addEventListener("click",async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;updateInstallStatus();});
  window.addEventListener("appinstalled",()=>{installPrompt=null;updateInstallStatus();});
  if("serviceWorker" in navigator&&location.protocol!=="file:")window.addEventListener("load",async()=>{try{const registration=await navigator.serviceWorker.register("./sw.js");registration.update().catch(()=>{});}catch(_){/* The installed game may start while offline. */}});
  startChapter();
  if(!localStorage.getItem("starmaze-intro"))setTimeout(()=>$("#introDialog").showModal(),550);
})();
