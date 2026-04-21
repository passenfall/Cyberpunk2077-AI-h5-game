# 赛博朋克2077 H5游戏开发计划

## 一、项目概述

基于现有demo，开发一个精简但完整的赛博朋克2077同人H5游戏。游戏剧情遵循原作主线，精简分支，包含一个好结局（与朱迪/帕南逃脱夜之城）和一个坏结局（V在夜之城消逝）。目标是达到**可玩级别**，流程完整但不过度美化。

## 二、技术架构

### 核心结构

```
project/
├── index.html              # 游戏主入口（UI骨架 + 引擎入口）
├── styles.css              # 全局样式（赛博朋克风格）
├── engine.js               # 游戏引擎核心（状态机、剧情系统、检定系统）
├── npc_database.js         # NPC角色库（角色档案、俚语、世界书、API预留）
├── story/                  # 剧情数据目录
│   ├── ch01_intro.json     # 第一章：偷天换日（荒坂塔）
│   ├── ch02_middle.json    # 第二章：中间人与抉择
│   ├── ch03_climax.json    # 第三章：最终行动
│   └── endings.json        # 结局数据
└── assets/                 # 音效/图片资源（可选，初期可省略）
```

### 引擎核心模块

1. **StoryEngine** - 剧情引擎（engine.js）

   * JSON驱动的剧情节点系统

   * 对话系统（NPC对话、旁白、系统提示）

   * 分支选择系统

   * 打字机效果

2. **CheckSystem** - D20检定系统（engine.js）

   * 属性检定（体能/智力/魅力）

   * DC难度设定

   * 成功/失败判定

   * 奖惩机制

3. **StateManager** - 状态管理（engine.js）

   * 玩家状态（HP/RAM/属性/物品）

   * 剧情进度（章节/节点/分支标记）

   * 结局判定

4. **UIManager** - UI管理（engine.js）

   * 故事日志渲染

   * 属性面板更新

   * 按钮动态生成

   * 物品栏管理

5. **DebugConsole** - 调试控制台（engine.js）

   * 实时数值调整面板

   * 剧情节点跳转功能

   * 属性修改器

   * 快捷操作命令

6. **NPCDatabase** - NPC角色库（npc\_database.js）

   * 角色档案（性格/背景/关系）

   * 俚语词库（夜之城黑话库）

   * 世界书设定（势力/地点/事件）

   * API接入预留接口（大模型动态对话）

## 三、调试控制台设计

### 3.1 控制台UI

* 位置：屏幕右下角悬浮按钮，点击展开调试面板

* 触发方式：

  * 点击调试图标按钮

  * 快捷键：`Ctrl + Shift + D`

* 样式：半透明深色背景，赛博朋克风格边框，不影响游戏主界面

### 3.2 功能模块

#### A. 数值调整面板

```
┌─── 数值调整 ─────────────────┐
│ HP:  [████████░░]  78/100   │
│      [-10] [-5] [+5] [+10]  │
│ RAM: [███████░░░]  45/60    │
│      [-10] [-5] [+5] [+10]  │
│                               │
│ 体能 Physique:     12  [±1] │
│ 智力 Intellect:    16  [±1] │
│ 魅力 Charisma:     14  [±1] │
└─────────────────────────────┘
```

#### B. 剧情跳转面板

```
┌─── 剧情跳转 ─────────────────┐
│ 当前节点: ch01_03            │
│                               │
│ [跳转到]                      │
│ ▼ 第一章                     │
│   ○ ch01_01 - 开场           │
│   ○ ch01_02 - 门禁突破       │
│   ○ ch01_03 - 机房潜入       │
│ ▼ 第二章                     │
│   ○ ch02_01 - 来生酒吧       │
│   ○ ch02_02 - 中间人交涉     │
│ ▼ 第三章                     │
│   ○ ch03_01 - 最终行动       │
│ ▼ 结局                       │
│   ○ ending_good - 好结局     │
│   ○ ending_bad  - 坏结局     │
│                               │
│ [确认跳转]                    │
└─────────────────────────────┘
```

#### C. 快捷命令面板

```
┌─── 快捷命令 ─────────────────┐
│ 输入命令: > _                 │
│                               │
│ 常用命令:                     │
│ [添加物品] [清空背包]         │
│ [重置检定] [自动成功]         │
│ [显示全部节点] [导出状态]     │
└─────────────────────────────┘
```

### 3.3 快捷命令列表

| 命令                        | 功能描述       | 示例                        |
| ------------------------- | ---------- | ------------------------- |
| `set hp <value>`          | 设置HP值      | `set hp 100`              |
| `set ram <value>`         | 设置RAM值     | `set ram 60`              |
| `set attr <name> <value>` | 设置属性       | `set attr intellect 20`   |
| `add item <id>`           | 添加物品       | `add item keycard`        |
| `goto <node_id>`          | 跳转到指定节点    | `goto ch02_01`            |
| `list nodes`              | 列出所有剧情节点   | `list nodes`              |
| `list items`              | 列出所有物品     | `list items`              |
| `list npcs`               | 列出所有NPC角色  | `list npcs`               |
| `show npc <id>`           | 显示指定NPC档案  | `show npc jackson_welles` |
| `force success`           | 下一次检定强制成功  | `force success`           |
| `force fail`              | 下一次检定强制失败  | `force fail`              |
| `show state`              | 显示当前游戏状态   | `show state`              |
| `export state`            | 导出当前状态到剪贴板 | `export state`            |
| `set flag <name>`         | 设置剧情标记     | `set flag ally_judy`      |
| `reset`                   | 重置游戏到初始状态  | `reset`                   |

### 3.4 技术实现

```javascript
const DebugConsole = {
  init() {},
  toggle() {},
  adjustValue(type, delta) {},
  jumpToNode(nodeId) {},
  executeCommand(cmd) {},
  showState() {},
  exportState() {},
  setupShortcuts() {}
};
```

## 四、NPC角色库设计

### 4.1 数据结构

```javascript
const NPCDatabase = {
  characters: {},
  slangDictionary: {},
  worldbook: {},
  init() {},
  getCharacter(id) {},
  getDialogueTemplate(characterId) {},
  getSlang(characterId, category) {},
  getWorldEntry(key) {},
  async generateDialogue(characterId, context, playerInput) {},
  async simulateTone(characterId, baseText) {}
};
```

### 4.2 核心角色档案

#### V（主角）

```json
{
  "id": "v",
  "name": "V",
  "role": "雇佣兵/玩家角色",
  "personality": {
    "traits": ["坚韧", "机智", "重情义", "略带叛逆"],
    "tone": "直接、干练，偶尔带点黑色幽默",
    "quirks": ["喜欢用夜之城俚语", "危机时刻保持冷静"]
  },
  "background": "夜之城街头出身的雇佣兵，擅长黑客技术和街头生存",
  "relationships": {
    "jackson_welles": "生死兄弟",
    "t_bug": "可靠的黑客搭档",
    "judy": "潜在盟友/浪漫线",
    "panam": "潜在盟友/浪漫线"
  },
  "api_config": {
    "system_prompt": "你是赛博朋克2077中的V，一个夜之城的雇佣兵...",
    "temperature": 0.8,
    "max_tokens": 150
  }
}
```

#### 杰克·威尔斯（Jackson Welles）

```json
{
  "id": "jackson_welles",
  "name": "杰克·威尔斯",
  "role": "V的搭档/兄弟",
  "personality": {
    "traits": ["豪爽", "忠诚", "乐观", "重家庭"],
    "tone": "热情洋溢，经常使用西班牙语俚语，充满街头气息",
    "quirks": ["喜欢叫V'伙计'(amigo)", "总是提到他妈妈做的菜", "对成为传奇充满渴望"]
  },
  "background": "瓦伦蒂诺帮出身，后成为自由雇佣兵。梦想是和V一起成为夜之城的传奇人物",
  "relationships": {
    "v": "生死兄弟，最信任的搭档",
    "mama_welles": "深爱的母亲"
  },
  "slang": ["amigo", "vale", "pendejo", "órale"],
  "api_config": {
    "system_prompt": "你是杰克·威尔斯，V的搭档。你性格豪爽，说话带西班牙语俚语...",
    "temperature": 0.9,
    "max_tokens": 120
  }
}
```

#### T-Bug

```json
{
  "id": "t_bug",
  "name": "T-Bug",
  "role": "网络黑客/远程支援",
  "personality": {
    "traits": ["冷静", "专业", "略带毒舌", "极度专注"],
    "tone": "简洁、技术化，偶尔带点讽刺",
    "quirks": ["用黑客术语说话", "对技术细节有强迫症", "不信任企业"]
  },
  "background": "经验丰富的网络黑客，专门为企业级网络渗透提供技术支持",
  "relationships": {
    "v": "雇佣关系，但互相信任",
    "jackson_welles": "同事关系"
  },
  "slang": ["ICE", "daemon", "sub-net", "ping", "bricked"],
  "api_config": {
    "system_prompt": "你是T-Bug，一个专业的网络黑客。你的说话方式简洁、技术化...",
    "temperature": 0.7,
    "max_tokens": 100
  }
}
```

#### 朱迪·阿尔瓦雷兹（Judy Alvarez）

```json
{
  "id": "judy_alvarez",
  "name": "朱迪·阿尔瓦雷兹",
  "role": "超梦编辑师/潜在盟友",
  "personality": {
    "traits": ["叛逆", "富有同情心", "技术天才", "理想主义"],
    "tone": "直接、带点愤世嫉俗，但内心温暖",
    "quirks": ["经常抽烟", "对不公正现象零容忍", "用'choom'称呼朋友"]
  },
  "background": "前漩涡帮成员，现为 freelance 超梦编辑师。致力于为受害者伸张正义",
  "relationships": {
    "v": "潜在盟友，可能发展为浪漫关系",
    "maiko": "复杂的前同事关系"
  },
  "slang": ["choom", "braindance", "BD", "gonk"],
  "api_config": {
    "system_prompt": "你是朱迪·阿尔瓦雷兹，一个超梦编辑师。你叛逆但心地善良...",
    "temperature": 0.85,
    "max_tokens": 130
  }
}
```

#### 帕南·帕尔默（Panam Palmer）

```json
{
  "id": "panam_palmer",
  "name": "帕南·帕尔默",
  "role": "游牧民/潜在盟友",
  "personality": {
    "traits": ["独立", "暴躁但忠诚", "机械天才", "重视荣誉"],
    "tone": "直接、强势，偶尔流露脆弱",
    "quirks": ["热爱车辆和机械", "对背叛零容忍", "喜欢用'V'直接称呼"]
  },
  "background": "阿德卡多游牧部落成员，因与首领冲突而独自行动。精通机械和战斗",
  "relationships": {
    "v": "潜在盟友，可能发展为浪漫关系",
    "saul": "游牧部落首领，关系复杂"
  },
  "slang": ["Aldecaldos", "nomad", "chrome", "gonk"],
  "api_config": {
    "system_prompt": "你是帕南·帕尔默，阿德卡多游牧部落的成员。你独立、暴躁但极其忠诚...",
    "temperature": 0.85,
    "max_tokens": 130
  }
}
```

#### 德克斯特·德肖恩（Dexter DeShawn）

```json
{
  "id": "dexter_deshawn",
  "name": "德克斯特·德肖恩",
  "role": "中间人/任务发布者",
  "personality": {
    "traits": ["精明", "野心勃勃", "表面友好但危险", "极度实用主义"],
    "tone": "圆滑、充满魅力，但暗藏威胁",
    "quirks": ["喜欢谈论'大生意'", "总是保持微笑但眼神冰冷", "用商业术语包装非法交易"]
  },
  "background": "夜之城知名中间人，专门为企业和个人之间的'特殊交易'牵线搭桥",
  "relationships": {
    "v": "雇佣关系（利用）",
    "araka_corp": "暗中合作"
  },
  "slang": ["eddies", "fixer", "gig", "score"],
  "api_config": {
    "system_prompt": "你是德克斯特·德肖恩，一个老练的中间人。你说话圆滑但暗藏威胁...",
    "temperature": 0.75,
    "max_tokens": 140
  }
}
```

### 4.3 俚语词库

```json
{
  "combat": {
    "chrome": "义体/机械改造",
    "gonk": "蠢货/白痴",
    "zeroed": "击杀/干掉",
    "flatline": "死亡/断线",
    "bricked": "被破坏/变砖"
  },
  "tech": {
    "ICE": "入侵对抗电子（防御系统）",
    "daemon": "守护程序（黑客工具）",
    "netrun": "网络黑客行为",
    "sub-net": "子网",
    "ping": "探测/扫描"
  },
  "social": {
    "choom": "朋友/兄弟",
    "amigo": "朋友（西班牙语）",
    "vale": "好的/没问题（西班牙语）",
    "eddies": "欧元/钱",
    "gig": "任务/工作",
    "fixer": "中间人"
  },
  "general": {
    "preem": "极好的/棒极了",
    "nova": "太棒了/酷",
    "drek": "垃圾/糟糕的东西",
    "delta": "离开",
    "wake up": "清醒点"
  }
}
```

### 4.4 世界书（世界观设定）

```json
{
  "factions": {
    "araka_corporation": {
      "name": "荒坂公司",
      "type": "巨型跨国企业",
      "description": "日本巨型财阀，专注于网络安全、义体技术和人工智能。夜之城的实际统治者之一",
      "attitude": "极度危险，资源无限"
    },
    "valentinos": {
      "name": "瓦伦蒂诺帮",
      "type": "街头帮派",
      "description": "拉美裔为主的帮派，重视家庭和荣誉，在圣多明哥活动",
      "attitude": "危险但有原则"
    },
    "aldecaldos": {
      "name": "阿德卡多",
      "type": "游牧部落",
      "description": "北美最后的游牧部落之一，驾驶武装车辆穿越恶地",
      "attitude": "中立，可结盟"
    }
  },
  "locations": {
    "araka_tower": {
      "name": "荒坂塔",
      "type": "企业设施",
      "description": "荒坂公司的总部大楼，安保级别极高",
      "danger_level": 5
    },
    "afterlife": {
      "name": "来生酒吧",
      "type": "酒吧/据点",
      "description": "雇佣兵和中间人的聚集地，传说中的地方",
      "danger_level": 1
    },
    "night_city_downtown": {
      "name": "夜之城市中心",
      "type": "城市区域",
      "description": "繁华但危险，企业势力与街头文化交汇",
      "danger_level": 3
    }
  },
  "concepts": {
    "relic": {
      "name": "Relic芯片",
      "description": "荒坂公司开发的实验性芯片，能够保存人类意识"
    },
    "braindance": {
      "name": "超梦（BD）",
      "description": "可以录制和回放他人体验的技术"
    },
    "cyberpsychosis": {
      "name": "赛博精神病",
      "description": "过度义体化导致的精神失常"
    }
  }
}
```

### 4.5 API接入预留接口

```javascript
const API_CONFIG = {
  default: {
    provider: "openai_compatible",
    endpoint: "/api/v1/chat/completions",
    model: "gpt-4",
    temperature: 0.8,
    max_tokens: 200,
    timeout: 5000
  },
  character_overrides: {
    "jackson_welles": { temperature: 0.9, max_tokens: 120 },
    "t_bug": { temperature: 0.7, max_tokens: 100 }
  }
};

async function generateNPCDialogue(characterId, context) {
  const character = NPCDatabase.getCharacter(characterId);
  const systemPrompt = buildSystemPrompt(character);
  const response = await fetch(API_CONFIG.default.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: API_CONFIG.default.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: context }
      ],
      temperature: character.api_config?.temperature || API_CONFIG.default.temperature
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
```

## 五、游戏流程设计

### 章节结构（精简版）

#### 第一章：偷天换日（开场）

* **场景**：荒坂塔潜入

* **核心玩法**：黑客手段/物理突破/寻求支援

* **关键NPC**：T-Bug（远程支援）、杰克（外应）

* **检定节点**：3-4个

* **剧情走向**：无论成功失败都进入下一章，但会影响后续难度和资源

#### 第二章：中间人与抉择（转折）

* **场景**：来生酒吧/中间人据点

* **核心玩法**：对话交涉/信息收集/任务选择

* **关键NPC**：德克斯特·德肖恩（中间人）、朱迪/帕南（盟友线）

* **检定节点**：3-4个

* **关键抉择**：选择信任谁（影响结局走向）

  * 选择朱迪线 → 偏向好结局

  * 选择帕南线 → 偏向好结局

  * 选择独自行动 → 偏向坏结局

#### 第三章：最终行动（高潮）

* **场景**：最终任务地点（根据选择变化）

* **核心玩法**：连续检定/资源管理/最终抉择

* **检定节点**：4-5个（难度递增）

* **关键抉择**：最终结局选择

  * 好结局：成功逃离夜之城

  * 坏结局：牺牲在夜之城

### 结局系统

#### 好结局（The Star）

* **条件**：至少完成一条盟友线 + 最终检定成功

* **内容**：V与盟友一起离开夜之城，前往未知但充满希望的未来

* **视觉**：温暖的色调，自由的象征

#### 坏结局（Path of Least Resistance）

* **条件**：未建立盟友关系 或 最终检定失败

* **内容**：V独自面对荒坂，最终消逝在夜之城的霓虹中

* **视觉**：冷暗的色调，孤独的终局

## 六、开发任务分解

### Phase 1: 引擎重构（核心基础）

**目标**：将内嵌逻辑分离为模块化引擎

**任务清单**：

1. 创建 `engine.js` 文件，实现以下模块：

   * StoryEngine（剧情加载、节点解析、对话系统）

   * CheckSystem（D20掷骰、属性加成、成功判定）

   * StateManager（玩家状态、剧情标记、存档点）

   * UIManager（动态UI更新、按钮生成、故事日志）

   * DebugConsole（调试面板、数值调整、节点跳转、快捷命令）

2. 创建 `npc_database.js` 文件：

   * 6个核心角色档案

   * 俚语词库（4大分类）

   * 世界书（势力/地点/概念）

   * API接入预留接口

3. 创建 `styles.css` 文件：

   * 提取HTML中的内嵌样式

   * 添加调试控制台样式

   * 完善赛博朋克视觉效果（扫描线、霓虹光效、故障动画）

4. 重构 `index.html`：

   * 保留UI骨架

   * 添加调试控制台入口按钮

   * 移除内嵌脚本

   * 引入 engine.js、npc\_database.js 和 styles.css

5. 创建 `story/` 目录结构

### Phase 2: 剧情数据设计

**目标**：完成所有章节的JSON剧情数据

**任务清单**：

1. 设计JSON剧情数据格式规范
2. 编写 `ch01_intro.json`（第一章剧情）
3. 编写 `ch02_middle.json`（第二章剧情）
4. 编写 `ch03_climax.json`（第三章剧情）
5. 编写 `endings.json`（结局数据）

### Phase 3: 引擎集成与联调

**目标**：引擎与剧情数据完整对接

**任务清单**：

1. 实现JSON剧情加载器
2. 实现剧情节点解析与渲染
3. 实现分支选择系统
4. 实现检定系统与剧情联动
5. 实现物品/线索系统
6. 实现结局判定与渲染
7. 实现调试控制台与引擎联动
8. 实现NPC角色库与剧情系统联动

### Phase 4: 游戏体验优化

**目标**：达到可玩级别

**任务清单**：

1. 添加游戏开始界面
2. 添加游戏结束界面（好/坏结局）
3. 添加重新开局功能
4. 添加章节过渡动画
5. 平衡检定难度（避免过高/过低）
6. 测试调试控制台功能完整性
7. 测试完整游戏流程
8. 修复Bug

## 七、关键设计决策

### 1. 剧情数据格式

采用JSON驱动，便于后续扩展和修改，无需改动引擎代码。

### 2. 检定系统简化

* 仅保留3个核心属性（体能/智力/魅力）

* 采用D20 + 属性调整值 vs DC的经典TRPG规则

* 属性调整值 = floor((属性值 - 10) / 2)

### 3. 分支简化

* 主线分支不超过3条

* 关键抉择点不超过5个

* 结局仅2个（好/坏），不做多结局分支

### 4. 资源管理

* HP：生命值，归零则游戏结束

* RAM：黑客资源，用于黑客手段检定，可恢复

* 物品：关键道具（分离芯片、访问密钥等），影响检定难度

### 5. 技术选型

* 保持纯HTML/CSS/JS，无框架依赖

* 使用TailwindCSS（CDN）快速构建UI

* 所有资源本地化，无需后端

### 6. 调试控制台设计原则

* 不影响正常游戏体验（默认隐藏）

* 快速访问（快捷键+悬浮按钮）

* 功能完整（数值、节点、命令全覆盖）

* 视觉统一（遵循赛博朋克UI风格）

### 7. NPC角色库设计原则

* 角色档案完整性（性格/背景/关系/API配置）

* 俚语词库分类清晰（战斗/技术/社交/通用）

* 世界书结构化（势力/地点/概念）

* API接口预留（支持后续接入大模型动态对话）

## 八、开发优先级

1. **P0（必须完成）**：引擎重构 + NPC角色库 + 第一章剧情 + 检定系统 + 基础UI + 调试控制台核心功能
2. **P1（重要）**：第二/三章剧情 + 分支系统 + 结局系统 + 调试控制台完整功能
3. **P2（锦上添花）**：开始/结束界面 + 过渡动画 + 音效

## 九、预计交付物

* 完整的可玩游戏（单HTML文件 + 配套JS/CSS/JSON）

* 3章精简剧情 + 2个结局

* D20检定系统

* 动态对话与分支选择

* 属性面板与物品栏

* 赛博朋克风格UI

* 调试控制台（数值调整、节点跳转、快捷命令）

* NPC角色库（6个角色档案 + 俚语词库 + 世界书 + API预留接口）

## 十、后续扩展方向（本次不包含）

* AI驱动的NPC对话（接入大模型API，基于已预留的接口）

* 更多分支剧情与结局

* 战斗系统（回合制）

* 音效与背景音乐

* 存档/读档系统

* 移动端适配优化

* 调试控制台高级功能（录制回放、批量测试脚本）

