# 赛博朋克2077 H5游戏 - 分轮次提示词体系

本文件包含所有可并行执行的轮次提示词。每个轮次都是独立的，可以在新的对话窗口中直接执行。

---

## 第一轮：引擎核心重构

**Agent**: Engine Developer
**可并行**: ✅
**文件**: `engine.js`, `styles.css`, `index.html`

### 上下文
- 项目：赛博朋克2077 H5游戏
- 当前阶段：Phase 1 - 引擎重构
- 已有文件：`engine.js`（现有代码）、`styles.css`（现有样式）、`index.html`（现有UI）
- 开发计划：`d:\Works\Software\Trae\Game\2077demo\.trae\documents\Cyberpunk2077_H5游戏开发计划.md`

### 任务
检查现有`engine.js`、`styles.css`、`index.html`文件，确保以下模块完整实现：

1. **StateManager** - 状态管理（已实现，检查完整性）
   - 玩家状态（HP/RAM/属性/物品）
   - 剧情进度（章节/节点/分支标记）
   - 结局判定
   - 存档/读档（localStorage）

2. **CheckSystem** - D20检定系统（已实现，检查完整性）
   - 属性检定（体能/智力/魅力）
   - DC难度设定
   - 成功/失败判定
   - 奖惩机制

3. **StoryEngine** - 剧情引擎（已实现，检查完整性）
   - JSON驱动的剧情节点系统
   - 对话系统（NPC对话、旁白、系统提示）
   - 分支选择系统
   - 打字机效果

4. **UIManager** - UI管理（已实现，检查完整性）
   - 故事日志渲染
   - 属性面板更新
   - 按钮动态生成
   - 物品栏管理

5. **DebugConsole** - 调试控制台（已实现，检查完整性）
   - 实时数值调整面板
   - 剧情节点跳转功能
   - 属性修改器
   - 快捷操作命令

### 要求
- 不删除任何现有功能
- 修复发现的Bug
- 确保模块间API一致
- 代码注释使用中文

### 完成标准
- 所有5个模块完整且无语法错误
- 模块间引用正确
- 存档系统正常工作
- 调试控制台功能完整

---

## 第二轮：NPC数据库完善

**Agent**: NPC/World Builder
**可并行**: ✅
**文件**: `npc_database.js`

### 上下文
- 项目：赛博朋克2077 H5游戏
- 当前阶段：Phase 1 - NPC角色库
- 已有文件：`npc_database.js`（已有6个角色基础数据）

### 任务
检查并完善`npc_database.js`：

1. 确保6个核心角色档案完整（v, jackson_welles, t_bug, judy_alvarez, panam_palmer, dexter_deshawn）
2. 每个角色包含：personality, background, relationships, slang, api_config
3. 俚语词库分类完整（combat, tech, social, general）
4. 世界书包含：factions, locations, concepts
5. API接入预留接口正常（generateDialogue, simulateTone）
6. 预设对话数据完整（getPresetDialogue）

### 要求
- 不修改engine.js中的调用逻辑
- 角色ID必须与story JSON中speaker字段一致
- 俚语分类清晰
- 保持NPCDatabase.init()初始化方式

### 完成标准
- 6个角色档案完整
- 俚语词库4大分类齐全
- 世界书至少3个势力、4个地点、4个概念
- API预留接口可正常调用

---

## 第三轮：第一章剧情数据验证

**Agent**: Story Designer
**可并行**: ✅
**文件**: `story/ch01_intro.json`

### 上下文
- 项目：赛博朋克2077 H5游戏
- 当前阶段：Phase 2 - 剧情数据设计
- 已有文件：`story/ch01_intro.json`（已有初稿）

### 任务
检查并优化`story/ch01_intro.json`：

1. 验证所有节点ID唯一且不重复
2. 验证所有next_node引用存在
3. 验证check节点格式正确
4. 验证choice节点格式正确
5. 验证speaker ID与npc_database.js一致
6. 验证effect_id与engine.js中定义一致
7. 检查剧情节奏和DC难度合理性

### 要求
- 不修改engine.js
- 节点命名遵循ch{章号}_{序号}规则
- DC难度合理（8-20范围）
- 失败不卡死，继续推进

### 完成标准
- 所有节点引用完整无断链
- 格式100%符合引擎要求
- 剧情流畅，DC难度合理
- 包含至少3个检定节点

---

## 第四轮：第二章剧情数据验证

**Agent**: Story Designer
**可并行**: ✅
**文件**: `story/ch02_middle.json`

### 上下文
- 项目：赛博朋克2077 H5游戏
- 当前阶段：Phase 2 - 剧情数据设计
- 已有文件：`story/ch02_middle.json`（已有初稿）

### 任务
检查并优化`story/ch02_middle.json`：

1. 验证所有节点ID唯一
2. 验证所有引用存在
3. 盟友线分支正确（judy/panam两条线）
4. 关键抉择点格式正确
5. effect_id正确设置（ally_judy, ally_panam, chose_escape, chose_solo）
6. 与第一章的剧情衔接自然

### 要求
- 不修改engine.js
- 盟友线选择影响最终结局
- 包含德克斯特、朱迪、帕南角色
- 关键抉择点不超过3个

### 完成标准
- 所有节点引用完整
- 盟友线分支逻辑正确
- effect_id与引擎一致
- 至少1个检定节点

---

## 第五轮：第三章剧情数据验证

**Agent**: Story Designer
**可并行**: ✅
**文件**: `story/ch03_climax.json`

### 上下文
- 项目：赛博朋克2077 H5游戏
- 当前阶段：Phase 2 - 剧情数据设计
- 已有文件：`story/ch03_climax.json`（已有初稿）

### 任务
检查并优化`story/ch03_climax.json`：

1. 验证所有节点ID唯一
2. 验证所有引用存在
3. 结局触发逻辑正确（good/bad）
4. 最终抉择点格式正确
5. 连续检定难度递增
6. 与前两章的剧情衔接

### 要求
- 不修改engine.js
- 结局触发与allyPath关联
- 包含4-5个检定节点
- 难度递增设计

### 完成标准
- 所有节点引用完整
- 好/坏结局正确触发
- 最终抉择点清晰
- 检定难度合理递增

---

## 第六轮：章节集成与加载器实现

**Agent**: Engine Developer
**可并行**: ✅（需第一、三、四、五轮完成）
**文件**: `engine.js`

### 上下文
- 项目：赛博朋克2077 H5游戏
- 当前阶段：Phase 3 - 引擎集成
- 已有文件：`engine.js`、`story/*.json`（所有章节已验证）

### 任务
实现章节集成系统：

1. 实现JSON剧情加载器（StoryEngine.loadStory）
   - 支持加载指定章节文件
   - 错误处理（文件不存在等）
   
2. 实现章节切换
   - 章节结束后加载下一章
   - 保存章节进度

3. 实现剧情节点解析与渲染
   - 支持所有节点类型
   - 正确的节点间跳转

4. 实现检定系统与剧情联动
   - 检定节点正确触发CheckSystem
   - 成功/失败分支正确执行

5. 实现结局判定与渲染
   - 根据allyPath和最终选择判定结局
   - 好/坏结局界面正确显示

### 要求
- 不修改story/*.json
- 保持现有API兼容
- 错误处理完善

### 完成标准
- 三个章节可顺序加载
- 检定系统与剧情正确联动
- 结局系统正常工作
- 无引用断链

---

## 第七轮：调试控制台完善

**Agent**: Engine Developer
**可并行**: ✅
**文件**: `engine.js`

### 上下文
- 项目：赛博朋克2077 H5游戏
- 当前阶段：Phase 3 - 调试功能
- 已有文件：`engine.js`（已有DebugConsole基础实现）

### 任务
完善DebugConsole：

1. 数值调整面板
   - HP +/- 按钮
   - RAM +/- 按钮
   - 属性 +/- 按钮
   
2. 剧情跳转面板
   - 下拉菜单包含所有节点
   - 跳转按钮
   
3. 快捷命令面板
   - 支持所有命令（set, add, goto, list, show, force, reset）
   - 命令行输入和执行
   
4. UI样式
   - 赛博朋克风格
   - 悬浮按钮切换
   - 半透明背景

### 要求
- 不修改游戏核心逻辑
- 快捷键Ctrl+Shift+D可用
- 命令输出到故事日志

### 完成标准
- 所有快捷命令可用
- 剧情跳转功能正常
- UI样式符合赛博朋克风格

---

## 第八轮：游戏开始界面

**Agent**: UI/UX Designer
**可并行**: ✅
**文件**: `index.html`, `styles.css`

### 上下文
- 项目：赛博朋克2077 H5游戏
- 当前阶段：Phase 4 - 游戏体验优化
- 已有文件：`index.html`（直接开始游戏）、`styles.css`

### 任务
创建游戏开始界面：

1. 标题页面
   - "CYBERPUNK 2077 // TRPG" 标题
   - 赛博朋克风格装饰
   - 夜之城副标题

2. 菜单按钮
   - [开始游戏] - 开始新游戏
   - [继续游戏] - 读取存档（如有）
   - [操作说明] - 显示游戏说明

3. 视觉设计
   - 全屏背景效果
   - 霓虹发光标题
   - 扫描线背景
   - 故障动画装饰

4. 游戏说明面板
   - D20检定系统说明
   - 三个属性说明
   - 基本操作说明

### 要求
- 仅修改index.html和styles.css
- 不修改engine.js核心逻辑
- 保持TailwindCSS风格
- 响应式设计

### 完成标准
- 开始界面美观完整
- 开始游戏按钮正常工作
- 视觉风格符合赛博朋克
- 有游戏说明

---

## 第九轮：结局系统优化

**Agent**: UI/UX Designer
**可并行**: ✅
**文件**: `index.html`, `styles.css`, `engine.js`（仅showEndingScreen方法）

### 上下文
- 项目：赛博朋克2077 H5游戏
- 当前阶段：Phase 4 - 游戏体验优化
- 已有文件：`engine.js`（已有基础结局界面）、`styles.css`

### 任务
优化结局系统：

1. 好结局界面（THE STAR）
   - 绿色主题色调
   - 温暖的文字内容
   - 希望的象征
   - 重新开始按钮

2. 坏结局界面（FLATLINED）
   - 红色主题色调
   - 冷暗的文字内容
   - 孤独的终局
   - 重新开始按钮

3. 过渡动画
   - 渐入效果
   - 标题动画
   - 文字逐行显示

4. 重新开始功能
   - 清除存档
   - 重新开始游戏
   - 回到开始界面

### 要求
- 保持现有结局触发逻辑
- 不修改story JSON
- 视觉风格差异化明显

### 完成标准
- 好/坏结局视觉差异明显
- 过渡动画流畅
- 重新开始功能正常
- 结局文字内容完整

---

## 第十轮：全流程测试与Bug修复

**Agent**: QA Tester
**可并行**: ❌（需所有前序轮次完成）
**文件**: 所有文件（仅读取和分析）

### 上下文
- 项目：赛博朋克2077 H5游戏
- 当前阶段：Phase 4 - 测试验证
- 已有文件：所有游戏文件

### 任务
执行完整测试：

1. 代码语法检查
   - engine.js语法错误
   - npc_database.js语法错误
   - 所有JSON格式验证

2. 节点引用完整性检查
   - 所有章节next_node引用存在
   - 无断链

3. effect_id匹配检查
   - 所有choice的effect_id在engine.js中定义

4. DC平衡分析
   - 各检定成功率估算
   - 难度合理性评估

5. 生成测试报告
   - 问题列表
   - 严重程度
   - 修复建议

### 要求
- 不直接修改代码（仅报告问题）
- 输出报告到 `.trae/test-reports/` 目录
- 问题描述清晰具体

### 完成标准
- 完整测试报告
- 所有问题列出
- 修复建议具体
- 严重程度标注

---

## 并行执行指南

### 第一轮并行（可同时开启4个窗口）
```
窗口1: 第一轮 - 引擎核心重构 (Engine Developer)
窗口2: 第二轮 - NPC数据库完善 (NPC/World Builder)
窗口3: 第三轮 - 第一章剧情验证 (Story Designer)
窗口4: 第四轮 - 第二章剧情验证 (Story Designer)
窗口5: 第五轮 - 第三章剧情验证 (Story Designer)
```

### 第二轮并行（第一、三轮完成后）
```
窗口6: 第六轮 - 章节集成与加载器 (Engine Developer)
窗口7: 第七轮 - 调试控制台完善 (Engine Developer)
窗口8: 第八轮 - 游戏开始界面 (UI/UX Designer)
窗口9: 第九轮 - 结局系统优化 (UI/UX Designer)
```

### 第三轮（所有完成后）
```
窗口10: 第十轮 - 全流程测试与Bug修复 (QA Tester)
```
