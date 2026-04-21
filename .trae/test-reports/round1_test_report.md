# 测试报告 - 第一轮

## 测试版本
Phase 4 - 全流程测试

## 代码检查结果

### engine.js: 通过
- 语法检查：无错误
- 所有模块定义完整（StateManager, CheckSystem, StoryEngine, UIManager, DebugConsole, StartScreen）
- 初始化逻辑正确（DOMContentLoaded 事件监听）

### npc_database.js: 通过
- 语法检查：无错误
- 6个NPC角色档案完整
- 俚语词库、世界书、API配置均完整
- NPCDatabase.init() 在文件末尾正确调用

### index.html 脚本引用: 通过
- `<script src="npc_database.js"></script>` 位于 body 底部
- `<script src="engine.js"></script>` 位于 npc_database.js 之后
- 加载顺序正确（npc_database 先于 engine）

### JSON格式: 通过
- ch01_intro.json: 格式有效
- ch02_middle.json: 格式有效
- ch03_climax.json: 格式有效

## 节点引用检查

### ch01 (ch01_intro.json): 完整
- 所有 next_node 引用均有效
- 所有 success_next / failure_next 引用均有效
- 所有 choice.next_node 引用均有效
- 节点链：ch01_01 -> ... -> ch01_04 -> ch01_choice_01 -> ch01_check_breach/power/subnet -> ch01_05 -> ... -> ch01_choice_02 -> ch01_check_shrine/grab/tbug -> ch01_09 -> ch01_choice_escape/search -> ch01_10 -> ... -> ch01_end

### ch02 (ch02_middle.json): 完整
- 所有 next_node 引用均有效
- 所有 success_next / failure_next 引用均有效
- 所有 choice.next_node 引用均有效
- 注意：ch02_end 节点没有 next_node，这是设计上的章节终止点
- 节点链完整覆盖德克斯特线、朱迪线、帕南线、盟友路线、孤狼路线

### ch03 (ch03_climax.json): 完整
- 所有 next_node 引用均有效
- 所有 success_next / failure_next 引用均有效
- 所有 choice.next_node 引用均有效
- 好结局/坏结局节点正确设置 next_ending 字段

## effect_id匹配检查

### engine.js 已定义效果列表:
| effect_id | 功能 |
|-----------|------|
| accepted_dexter | 设置 accepted_dexter 标记 |
| rejected_dexter | 设置 rejected_dexter 标记 |
| ally_judy | 设置朱迪盟友路线 |
| ally_panam | 设置帕南盟友路线 |
| chose_escape | 设置选择逃离标记 |
| chose_solo | 设置选择独自路线标记 |
| add_shard | 添加分离芯片物品 |
| add_keycard | 添加访问密钥物品 |
| add_decrypt_tool | 添加解密工具物品 |
| chose_good_ending | 设置好结局标记 |
| chose_bad_ending | 设置坏结局标记 |

### 章节JSON中使用的effect_id:
| 章节 | effect_id | 匹配状态 |
|------|-----------|---------|
| ch01 | add_shard | 已定义 |
| ch01 | add_keycard | 已定义 |
| ch02 | accepted_dexter | 已定义 |
| ch02 | rejected_dexter | 已定义 |
| ch02 | ally_judy | 已定义 |
| ch02 | ally_panam | 已定义 |
| ch02 | chose_escape | 已定义 |
| ch02 | chose_solo | 已定义 |
| ch03 | chose_good_ending | 已定义 |
| ch03 | chose_bad_ending | 已定义 |

### 未定义effect_id: 无，全部匹配

### 多余effect_id:
- engine.js 中定义了 `add_decrypt_tool`，但没有任何章节JSON使用此effect_id

## DC平衡分析

默认属性值：体能=12（调整值+1）、智力=16（调整值+3）、魅力=14（调整值+2）

属性调整值计算公式：floor((attr-10)/2)

| 章节 | 检定名称 | 属性 | 属性值 | DC | 调整值 | 需要掷骰值 | 成功率 | 评价 |
|------|---------|------|--------|----|--------|-----------|--------|------|
| ch01 | 强行破解门禁 | 智力 | 16 | 15 | +3 | 12+ | 45% | 正常 |
| ch01 | 物理破坏供电 | 体能 | 12 | 14 | +1 | 13+ | 40% | 稍难 |
| ch01 | 骇入维护节点 | 智力 | 16 | 12 | +3 | 9+ | 60% | 简单（奖励路径） |
| ch01 | 破解神龛锁 | 智力 | 16 | 16 | +3 | 13+ | 40% | 正常 |
| ch01 | 暴力拔出芯片 | 体能 | 12 | 18 | +1 | 17+ | 20% | 极难（惩罚路径） |
| ch01 | 请求T-Bug支援 | 魅力 | 14 | 14 | +2 | 12+ | 45% | 正常 |
| ch01 | 快速撤离 | 魅力 | 14 | 14 | +2 | 12+ | 45% | 正常 |
| ch01 | 搜索额外数据 | 智力 | 16 | 15 | +3 | 12+ | 45% | 正常 |
| ch02 | 破解维克多终端 | 智力 | 16 | 15 | +3 | 12+ | 45% | 正常 |
| ch02 | 甩掉荒坂追踪 | 智力 | 16 | 14 | +3 | 11+ | 50% | 正常 |
| ch02 | 超梦分析Relic芯片 | 智力 | 16 | 16 | +3 | 13+ | 40% | 正常 |
| ch02 | 改装突破用车 | 智力 | 16 | 15 | +3 | 12+ | 45% | 正常 |
| ch03 | 穿越封锁线 | 体能 | 12 | 14 | +1 | 13+ | 40% | 稍难 |
| ch03 | 躲避追踪无人机 | 智力 | 16 | 16 | +3 | 13+ | 40% | 正常 |
| ch03 | 突破最后防线 | 智力 | 16 | 18 | +3 | 15+ | 30% | 困难 |
| ch03 | 抵抗Relic侵蚀 | 魅力 | 14 | 20 | +2 | 18+ | 15% | 极难 |

### DC平衡评估

1. **暴力拔出芯片 (DC18/体能12)**: 成功率仅20%。这是高风险高回报选项，符合设计意图。

2. **抵抗Relic侵蚀 (DC20/魅力14)**: 成功率仅15%。作为最终检定，这个DC过高。即使掷出自然20（20+2=22），也只有自然20能通过。这会让玩家几乎必败，体验极差。建议降至DC16-17。

3. **突破最后防线 (DC18/智力16)**: 成功率30%。作为第三章连续检定的第三项，难度较高但尚可接受。

4. **整体检定失败惩罚**: 每次检定失败扣除RAM -8、HP -15。在第三章连续4次检定的情况下，连续失败可能导致HP/RAM归零触发死亡结局。建议在第三章减少失败惩罚。

## UI与视觉问题

### 问题1: 开始界面显示"由 Trae 驱动 // 基于 D20 检定系统"
- **文件**: index.html (第38行)
- **内容**: `<p class="text-sm text-gray-500 chinese-text">由 Trae 驱动 // 基于 D20 检定系统</p>`
- **严重程度**: 一般
- **修复建议**: 根据要求移除该文字，或替换为游戏品牌信息（如 "A Night City Story"）

### 问题2: Google Fonts 加载超时
- **文件**: styles.css (第5行)
- **内容**: `@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');`
- **错误**: `net::ERR_CONNECTION_TIMED_OUT https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap`
- **严重程度**: 轻微
- **影响**: 字体回退到 'Microsoft YaHei' / 'PingFang SC'，中文字体不受影响。英文终端字体样式略有变化但不影响功能。
- **修复建议**: 
  - 方案A: 移除 Google Fonts 引用，完全依赖系统字体回退
  - 方案B: 将字体文件本地化到 assets/fonts/ 目录
  - 方案C: 添加 CSS `font-display: swap` 以减少阻塞（@import URL中已有 display=swap 参数，但网络不通时无效）

## 问题汇总

| 序号 | 问题描述 | 严重程度 | 所在文件 | 修复建议 |
|------|---------|---------|---------|---------|
| 1 | 开始界面显示"由 Trae 驱动 // 基于 D20 检定系统"字样 | 一般 | index.html:38 | 移除该行或替换为游戏品牌文字 |
| 2 | Google Fonts 连接超时导致字体加载失败 | 轻微 | styles.css:5 | 移除 @import 或本地化字体文件 |
| 3 | DC20抵抗Relic侵蚀检定成功率仅15%，几乎必败 | 严重 | story/ch03_climax.json:116-125 | 将DC从20降至16-17 |
| 4 | 第三章连续4次检定，连续失败可能直接死亡 | 严重 | story/ch03_climax.json | 建议第三章失败惩罚减半（HP -7, RAM -4） |
| 5 | ch01_end节点next_ending为"bad"，但这是第一章章节结束，不应触发结局画面 | 严重 | story/ch01_intro.json:298 | ch01_end应标记为章节过渡而非最终结局，引擎中isChapterEndingNode()应能处理此逻辑 |
| 6 | add_decrypt_tool effect_id已定义但未被任何章节使用 | 轻微 | engine.js:809 | 保留用于后续扩展，或在使用前移除 |
| 7 | ch02_end节点无next_node，章节转换依赖StoryEngine.isChapterEndingNode()判断 | 一般 | story/ch02_middle.json:335-341 | ch02_end节点type应为"ending"而非"dialogue"，否则isChapterEndingNode()可能无法正确触发章节过渡 |

## 关键逻辑问题分析

### ch01_end 章节过渡逻辑

在 `engine.js` 的 `isChapterEndingNode()` 方法中，章节结束节点的判定逻辑为：
1. 当前章节不是最后一个章节
2. 当前节点是当前章节storyData的最后一个节点
3. 当前节点类型为"ending"

ch01_end 节点 type="ending"，符合条件，应能正确触发 `playNextChapter()`。

但 ch02_end 节点 type="dialogue"，不符合第3个条件。这意味着第二章结束后无法自动过渡到第三章。这是一个严重问题。

### 检定失败惩罚叠加

每次检定失败扣除 HP -15、RAM -8。第三章有4个连续检定节点：
- 如果全部失败：HP -60、RAM -32
- 初始状态 HP=78、RAM=45
- 全部失败后：HP=18（接近死亡）、RAM=13（极低）

虽然不会直接死亡，但资源消耗极其紧张。

## 总结

本次测试共发现 7 个问题，其中严重级别 3 个，一般级别 2 个，轻微级别 2 个。

最需要优先修复的问题：
1. ch02_end 节点类型错误（阻碍第二章到第三章的流程）
2. DC20 抵抗Relic侵蚀检定（几乎必败，体验极差）
3. 开始界面品牌文字（违反要求）
