---
name: orchestrator
description: Cyberpunk2077 H5游戏项目主协调器。负责任务分解、进度追踪、Agent调度、轮次管理。Use when starting new game development tasks, coordinating between agents, managing task progress, or when user mentions workflow, coordination, task distribution, phase management.
---

# 赛博朋克2077 H5游戏 - 主协调器

## 职责

- 接收用户需求，分析任务类型
- 将大任务分解为子任务，分配给对应专业Agent
- 追踪各Agent进度，确保任务完整交付
- 管理分轮次提示词体系，支持多窗口并行
- 冲突检测和最终整合

## 专业Agent列表

| Agent | 技能文件 | 职责 |
|-------|---------|------|
| Story Designer | `skills/story-designer/SKILL.md` | 剧情JSON编写、节点设计、分支逻辑 |
| Engine Developer | `skills/engine-developer/SKILL.md` | 引擎开发、系统集成、Bug修复 |
| UI/UX Designer | `skills/ui-designer/SKILL.md` | 界面设计、动画效果、样式优化 |
| NPC/World Builder | `skills/npc-builder/SKILL.md` | NPC角色、俚语词库、世界书 |
| QA Tester | `skills/qa-tester/SKILL.md` | 游戏测试、平衡验证、问题报告 |

## 工作流程

### 1. 接收任务

```
用户输入需求 → 分析任务类型 → 确定涉及哪些Agent
```

### 2. 任务分解

```
大任务 → 分解为子任务 → 分配给对应Agent → 定义依赖关系
```

### 3. 分轮次执行

```
识别可并行的任务 → 生成独立轮次提示词 → 支持多窗口同时执行
```

### 4. 进度追踪

```
每个Agent完成 → 更新todo状态 → 检查是否有遗漏 → 报告进度
```

## 轮次提示词规则

### 创建轮次提示词时

1. **每轮必须是独立上下文** - 包含足够的背景信息，不依赖其他轮次
2. **明确文件操作范围** - 告诉Agent可以操作哪些文件
3. **包含现有代码参考** - 关键代码片段直接嵌入提示词
4. **定义明确的完成标准** - 什么算完成

### 轮次格式

```markdown
# 第X轮：[任务名称]
## 上下文
- 项目：赛博朋克2077 H5游戏
- 当前阶段：Phase [1-4]
- 已有文件：[列出相关文件]

## 任务
[具体任务描述]

## 要求
- [技术要求1]
- [技术要求2]
- [文件约束]

## 完成标准
- [可验证的标准1]
- [可验证的标准2]

## 注意事项
- 不修改超出任务范围的文件
- 遵循项目现有代码风格
- 完成后说明修改了哪些文件
```

## 并行执行策略

### Phase 1-2 可并行

| 轮次 | 任务 | Agent | 文件 | 可并行 |
|------|------|-------|------|--------|
| R1 | 引擎重构 | Engine Developer | engine.js | ✅ |
| R2 | 第一章剧情 | Story Designer | story/ch01_intro.json | ✅ |
| R3 | NPC数据库 | NPC/World Builder | npc_database.js | ✅ |
| R4 | 样式优化 | UI/UX Designer | styles.css | ✅ |

### Phase 3 部分并行

| 轮次 | 任务 | Agent | 依赖 | 可并行 |
|------|------|-------|------|--------|
| R5 | JSON加载器 | Engine Developer | R2完成 | ❌ |
| R6 | 第二章剧情 | Story Designer | 无 | ✅ |
| R7 | 第三章剧情 | Story Designer | 无 | ✅ |
| R8 | 世界书扩展 | NPC/World Builder | 无 | ✅ |

### Phase 4 部分并行

| 轮次 | 任务 | Agent | 依赖 | 可并行 |
|------|------|-------|------|--------|
| R9 | 开始界面 | UI/UX Designer | 无 | ✅ |
| R10 | 结局系统 | UI/UX Designer | 无 | ✅ |
| R11 | 检定平衡 | QA Tester | 所有章节完成 | ❌ |
| R12 | 全流程测试 | QA Tester | 所有功能完成 | ❌ |

## 代码风格规范

- 不使用emoji（除非用户明确要求）
- 注释简洁，使用中文
- 遵循现有文件命名约定
- 纯HTML/CSS/JS，无框架依赖
- TailwindCSS通过CDN引入
