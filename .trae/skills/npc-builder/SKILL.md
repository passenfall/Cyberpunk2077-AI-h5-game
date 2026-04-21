---
name: npc-builder
description: 赛博朋克2077 H5游戏NPC与世界设定师。负责NPC角色档案、俚语词库、世界书设定、角色关系网络。Use when creating or modifying NPC profiles, slang terms, world lore, faction info, character relationships, or when user mentions NPC, character, dialogue, slang, worldbook, lore, faction.
---

# NPC/世界设定师 Agent

## 职责范围

- 维护NPC角色数据库
- 扩展俚语词库
- 维护世界书（势力/地点/概念）
- 确保角色设定一致性
- 为剧情提供角色参考数据

## 操作文件

- `npc_database.js` - NPC角色库主文件

## 角色数据结构

```javascript
const NPCDatabase = {
  characters: {},       // 角色档案
  slangDictionary: {},  // 俚语词库
  worldbook: {},        // 世界书
}
```

### 角色档案模板

```json
{
  "id": "唯一标识",
  "name": "角色名称",
  "role": "角色定位",
  "personality": {
    "traits": ["性格特征1", "特征2"],
    "tone": "说话风格描述",
    "quirks": ["习惯1", "习惯2"]
  },
  "background": "背景故事",
  "relationships": {
    "其他角色id": "关系描述"
  },
  "slang": ["常用俚语"],
  "api_config": {
    "system_prompt": "AI对话系统提示词",
    "temperature": 0.8,
    "max_tokens": 150
  }
}
```

## 现有核心角色

### 6个已定义角色

| ID | 名称 | 角色 | 关键特征 |
|----|------|------|---------|
| v | V | 主角/雇佣兵 | 坚韧、机智、重情义 |
| jackson_welles | 杰克·威尔斯 | 搭档/兄弟 | 豪爽、忠诚、西班牙语俚语 |
| t_bug | T-Bug | 黑客/远程支援 | 冷静、专业、技术化 |
| judy_alvarez | 朱迪·阿尔瓦雷兹 | 超梦编辑师 | 叛逆、同情心、技术天才 |
| panam_palmer | 帕南·帕尔默 | 游牧民 | 独立、暴躁但忠诚 |
| dexter_deshawn | 德克斯特·德肖恩 | 中间人 | 精明、野心、圆滑但危险 |

### 提及但未定义角色

- roger (来生酒吧调酒师)
- maiko (朱迪的前同事)
- saul (游牧部落首领)
- mama_welles (杰克的母亲)
- victor (第二章提及)

## 俚语分类

### combat (战斗类)
chrome, gonk, zeroed, flatline, bricked

### tech (技术类)
ICE, daemon, netrun, sub-net, ping

### social (社交类)
choom, amigo, vale, eddies, gig, fixer

### general (通用类)
preem, nova, drek, delta, wake up

## 世界书结构

### factions (势力)

| ID | 名称 | 类型 | 危险度 |
|----|------|------|--------|
| araka_corporation | 荒坂公司 | 企业 | 5/5 |
| valentinos | 瓦伦蒂诺帮 | 帮派 | 3/5 |
| aldecaldos | 阿德卡多 | 游牧 | 3/5 |
| tyger_claws | 虎爪帮 | 帮派 | 4/5 |

### locations (地点)

| ID | 名称 | 类型 | 危险度 |
|----|------|------|--------|
| araka_tower | 荒坂塔 | 企业设施 | 5/5 |
| afterlife | 来生酒吧 | 酒吧/据点 | 1/5 |
| night_city_downtown | 市中心 | 城市区域 | 3/5 |
| badlands | 恶地 | 荒野区域 | 4/5 |

### concepts (概念)

| ID | 名称 | 重要性 |
|----|------|--------|
| relic | Relic芯片 | 核心剧情物品 |
| braindance | 超梦(BD) | 常见技术 |
| cyberpsychosis | 赛博精神病 | 社会问题 |
| ripperdoc | 义体医生 | 常见服务 |

## 修改规则

- 新增角色必须符合角色档案模板
- 俚语必须归属到正确分类
- 世界书条目包含name/type/description
- 不修改engine.js中的调用逻辑
- 角色ID必须与story JSON中speaker字段一致
- 保持NPCDatabase.init()初始化方式
