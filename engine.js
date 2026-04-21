// Cyberpunk 2077 TRPG - Game Engine v2.1 (Chapter transition fix)
// ==========================================

// --- 游戏状态管理 ---
const StateManager = {
  state: {
    player: {
      hp: 78,
      maxHp: 100,
      ram: 45,
      maxRam: 60,
      attributes: {
        physique: 12,
        intellect: 16,
        charisma: 14
      }
    },
    currentEvent: {
      name: "强行破解门禁",
      attribute: "intellect",
      dc: 15
    },
    stage: 0,
    currentNodeId: "ch01_01",
    isGameOver: false,
    items: [],
    flags: {},
    allyPath: null,
    completedChapters: [],
    chapterProgress: {},
    awaitingCheck: false,
    lastCheckNode: null
  },

  init() {
    // Load from localStorage if available
    const saved = localStorage.getItem('cp2077_save');
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch(e) {
        console.warn('Failed to load save:', e);
      }
    }
  },

  save() {
    localStorage.setItem('cp2077_save', JSON.stringify(this.state));
  },

  reset() {
    localStorage.removeItem('cp2077_save');
    this.state = {
      player: {
        hp: 78,
        maxHp: 100,
        ram: 45,
        maxRam: 60,
        attributes: {
          physique: 12,
          intellect: 16,
          charisma: 14
        }
      },
      currentEvent: {
        name: "强行破解门禁",
        attribute: "intellect",
        dc: 15
      },
      stage: 0,
      currentNodeId: "ch01_01",
      isGameOver: false,
      items: [],
      flags: {},
      allyPath: null,
      completedChapters: [],
      chapterProgress: {},
      awaitingCheck: false,
      lastCheckNode: null
    };
    UIManager.updateAll();
    UIManager.clearChoices();
  },

  adjustHP(delta) {
    this.state.player.hp = Math.max(0, Math.min(this.state.player.maxHp, this.state.player.hp + delta));
    this.checkDeath();
    UIManager.updateAll();
    this.save();
  },

  adjustRAM(delta) {
    this.state.player.ram = Math.max(0, Math.min(this.state.player.maxRam, this.state.player.ram + delta));
    this.checkDeath();
    UIManager.updateAll();
    this.save();
  },

  setHP(value) {
    this.state.player.hp = Math.max(0, Math.min(this.state.player.maxHp, value));
    UIManager.updateAll();
    this.save();
  },

  setRAM(value) {
    this.state.player.ram = Math.max(0, Math.min(this.state.player.maxRam, value));
    UIManager.updateAll();
    this.save();
  },

  setAttribute(attr, value) {
    if (this.state.player.attributes.hasOwnProperty(attr)) {
      this.state.player.attributes[attr] = value;
      UIManager.updateAll();
      this.save();
    }
  },

  addItem(itemId) {
    if (!this.state.items.includes(itemId)) {
      this.state.items.push(itemId);
      UIManager.updateInventory();
      this.save();
    }
  },

  removeItem(itemId) {
    this.state.items = this.state.items.filter(id => id !== itemId);
    UIManager.updateInventory();
    this.save();
  },

  clearItems() {
    this.state.items = [];
    UIManager.updateInventory();
    this.save();
  },

  setFlag(flagName, value = true) {
    this.state.flags[flagName] = value;
    this.save();
  },

  hasFlag(flagName) {
    return this.state.flags[flagName] === true;
  },

  setAllyPath(path) {
    this.state.allyPath = path;
    this.save();
  },

  getCurrentNode() {
    return this.state.currentNodeId;
  },

  setNode(nodeId) {
    this.state.currentNodeId = nodeId;
    this.save();
  },

  checkDeath() {
    if (this.state.player.hp <= 0 || this.state.player.ram <= 0) {
      this.state.isGameOver = true;
      StoryEngine.triggerEnding('bad_death');
    }
  }
};

// --- D20 检定系统 ---
const CheckSystem = {
  isRolling: false,
  forceNextResult: null, // 'success' or 'fail'

  calculateModifier(attrValue) {
    return Math.floor((attrValue - 10) / 2);
  },

  rollD20() {
    return Math.floor(Math.random() * 20) + 1;
  },

  async performCheck(event, onSuccess, onFailure) {
    if (this.isRolling || StateManager.state.isGameOver) return;
    this.isRolling = true;
    
    const attrKey = event.attribute;
    const mod = this.calculateModifier(StateManager.state.player.attributes[attrKey]);
    let finalRoll;

    if (this.forceNextResult === 'success') {
      finalRoll = 20;
      this.forceNextResult = null;
    } else if (this.forceNextResult === 'fail') {
      finalRoll = 1;
      this.forceNextResult = null;
    } else {
      finalRoll = this.rollD20();
    }

    const total = finalRoll + mod;
    const isSuccess = total >= event.dc;

    await UIManager.animateDice(finalRoll, total, mod);

    const attrName = attrKey === 'intellect' ? '智力' : (attrKey === 'physique' ? '体能' : '魅力');
    await StoryEngine.addStoryEntry(
      `[检定] ${event.name} (${attrName} DC ${event.dc})... D20: ${finalRoll} + ${mod} = ${total} // ${isSuccess ? '成功!' : '失败!'}`,
      isSuccess ? 'text-green-400' : 'text-red-400',
      20
    );

    if (isSuccess) {
      if (onSuccess) onSuccess();
    } else {
      const isCh3 = StoryEngine.currentChapter && StoryEngine.currentChapter.includes('ch03');
      const ramPenalty = isCh3 ? -4 : -8;
      const hpPenalty = isCh3 ? -7 : -15;
      StateManager.adjustRAM(ramPenalty);
      StateManager.adjustHP(hpPenalty);
      await StoryEngine.addStoryEntry(`[警告] 遭到ICE协议反噬！RAM严重流失，神经突触受损 (HP ${hpPenalty})`, 'text-pink-500', 15);
      if (onFailure) onFailure();
    }

    this.isRolling = false;
  }
};

// --- 剧情引擎 ---
const StoryEngine = {
  storyData: null,
  isTyping: false,
  storyLog: null,
  currentChapter: null,
  loadedChapters: {},

  chapterList: [
    { file: 'ch01_intro.json', id: 'ch01', name: '偷天换日', startNode: 'ch01_01' },
    { file: 'ch02_middle.json', id: 'ch02', name: '中间人与抉择', startNode: 'ch02_01' },
    { file: 'ch03_climax.json', id: 'ch03', name: '最终行动', startNode: 'ch03_01' }
  ],

  async loadStory(chapterFile) {
    if (this.loadedChapters[chapterFile]) {
      console.log('[Engine] Chapter already loaded from cache:', chapterFile);
      this.storyData = this.loadedChapters[chapterFile];
      return true;
    }
    try {
      const url = `story/${chapterFile}`;
      console.log('[Engine] Fetching chapter:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`[Engine] HTTP error ${response.status} fetching ${url}`);
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      console.log(`[Engine] Successfully loaded ${chapterFile}, nodes:`, data.nodes?.length || 0);
      this.loadedChapters[chapterFile] = data;
      this.storyData = data;
      return true;
    } catch(e) {
      console.error(`[Engine] Failed to load ${chapterFile}:`, e);
      return false;
    }
  },

  findNodeInAllChapters(nodeId) {
    if (this.storyData && this.storyData.nodes) {
      const node = this.storyData.nodes.find(n => n.node_id === nodeId);
      if (node) return node;
    }
    for (const key in this.loadedChapters) {
      if (this.loadedChapters[key].nodes) {
        const node = this.loadedChapters[key].nodes.find(n => n.node_id === nodeId);
        if (node) return node;
      }
    }
    return null;
  },

  findNode(nodeId) {
    return this.findNodeInAllChapters(nodeId);
  },

  async playNextChapter() {
    console.log('[Engine] ========== playNextChapter START ==========');
    console.log('[Engine] currentChapter:', this.currentChapter);
    
    if (!this.currentChapter) {
      console.error('[Engine] No current chapter set, cannot transition');
      await this.addStoryEntry('[系统] 错误：无法确定当前章节。', 'text-red-400', 20);
      return;
    }

    const currentIdx = this.chapterList.findIndex(c => c.file === this.currentChapter);
    console.log('[Engine] currentIdx:', currentIdx, 'chapterList.length:', this.chapterList.length);
    
    if (currentIdx < 0) {
      console.error('[Engine] Current chapter not found in chapterList:', this.currentChapter);
      await this.addStoryEntry('[系统] 错误：当前章节未在章节列表中注册。', 'text-red-400', 20);
      return;
    }
    if (currentIdx >= this.chapterList.length - 1) {
      console.log('[Engine] Already at last chapter');
      await this.addStoryEntry('[系统] 提示：当前已是最后一章。', 'text-gray-400', 20);
      return;
    }

    const nextChapter = this.chapterList[currentIdx + 1];
    const currentChapterObj = this.chapterList[currentIdx];
    console.log('[Engine] Transitioning from', currentChapterObj.name, 'to', nextChapter.name);

    if (currentChapterObj.id && !StateManager.state.completedChapters.includes(currentChapterObj.id)) {
      StateManager.state.completedChapters.push(currentChapterObj.id);
    }
    StateManager.state.chapterProgress[nextChapterObj.id] = nextChapterObj.startNode;
    StateManager.save();

    await this.addStoryEntry('', 'text-cyan-400', 10);
    await this.addStoryEntry(`--- ${currentChapterObj.name} 完成 ---`, 'text-green-400', 40);
    await this.addStoryEntry('', 'text-cyan-400', 10);
    await this.addStoryEntry(`[系统] 正在加载下一章：${nextChapter.name}...`, 'text-cyan-400', 20);

    UIManager.disableAllControls();

    await new Promise(r => setTimeout(r, 1500));

    console.log('[Engine] Loading next chapter:', nextChapter.file, 'start node:', nextChapter.startNode);
    const success = await this.loadStory(nextChapter.file);
    console.log('[Engine] loadStory result:', success);
    console.log('[Engine] After loadStory, currentChapter:', this.currentChapter, 'storyData.nodes:', this.storyData?.nodes?.length || 0);
    
    if (success) {
      this.currentChapter = nextChapter.file;
      console.log('[Engine] Set currentChapter to:', this.currentChapter);
      UIManager.enableAllControls();
      UIManager.clearChoices();
      console.log('[Engine] Chapter loaded successfully, playing node:', nextChapter.startNode);
      await this.playNode(nextChapter.startNode);
      console.log('[Engine] playNode completed for:', nextChapter.startNode);
    } else {
      console.error('[Engine] Failed to load chapter:', nextChapter.file);
      UIManager.enableAllControls();
      await this.addStoryEntry(`[系统] 下一章 "${nextChapter.name}" 加载失败。请检查文件 story/${nextChapter.file} 是否存在，并确保通过本地服务器运行游戏（而非直接打开 index.html）。`, 'text-red-400', 20);
      await this.addStoryEntry('[系统] 提示：可以使用 Python 启动本地服务器: python -m http.server 8000', 'text-yellow-400', 20);
    }
    console.log('[Engine] ========== playNextChapter END ==========');
  },

  async addStoryEntry(text, colorClass, speed = 25) {
    if (!this.storyLog) return;
    const p = document.createElement('p');
    p.className = `${colorClass} mb-2 chinese-text`;
    this.storyLog.appendChild(p);
    await this.typeWriter(p, text, speed);
    this.storyLog.scrollTop = this.storyLog.scrollHeight;
  },

  async typeWriter(element, text, speed = 25) {
    return new Promise((resolve) => {
      if (StoryEngine.isTyping) { resolve(); return; }
      StoryEngine.isTyping = true;
      let i = 0;
      const skipHandler = () => {
        element.textContent = text;
        StoryEngine.isTyping = false;
        resolve();
        element.removeEventListener('click', skipHandler);
      };
      element.addEventListener('click', skipHandler);
      
      function type() {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else {
          StoryEngine.isTyping = false;
          resolve();
          element.removeEventListener('click', skipHandler);
        }
      }
      type();
    });
  },

  async playNode(nodeId) {
    if (!this.storyData || StateManager.state.isGameOver) return;
    
    const node = this.findNode(nodeId);
    if (!node) {
      console.warn(`Node ${nodeId} not found`);
      return;
    }

    StateManager.setNode(nodeId);

    switch(node.type) {
      case 'dialogue':
        await this.playDialogue(node);
        break;
      case 'choice':
        await this.playChoice(node);
        break;
      case 'check':
        await this.playCheck(node);
        break;
      case 'ending':
        await this.playEnding(node);
        break;
    }
  },

  async playDialogue(node) {
    const colorMap = {
      'narrator': 'text-cyan-400',
      'system': 'text-gray-400',
      'player': 'text-yellow-400',
      't_bug': 'text-pink-500',
      'jackson_welles': 'text-orange-400',
      'judy_alvarez': 'text-purple-400',
      'panam_palmer': 'text-green-500',
      'dexter_deshawn': 'text-amber-500'
    };

    const speaker = node.speaker || 'narrator';
    const color = colorMap[speaker] || 'text-gray-300';
    const name = this.getSpeakerName(speaker);
    const text = name ? `[${name}] ${node.text}` : node.text;

    await this.addStoryEntry(text, color, node.speed || 25);
    if (node.delay) await new Promise(r => setTimeout(r, node.delay));

    if (node.next_node) {
      setTimeout(() => this.playNode(node.next_node), 300);
    }
  },

  getSpeakerName(speakerId) {
    const names = {
      'narrator': '旁白',
      'system': '系统',
      'player': '玩家',
      't_bug': 'T-Bug',
      'jackson_welles': '杰克',
      'judy_alvarez': '朱迪',
      'panam_palmer': '帕南',
      'dexter_deshawn': '德克斯特'
    };
    return names[speakerId] || '';
  },

  async playChoice(node) {
    await this.playDialogue(node);
    UIManager.showChoices(node.choices);
  },

  async playCheck(node) {
    await this.playDialogue(node);
    
    StateManager.state.currentEvent = {
      name: node.check.name,
      attribute: node.check.attribute,
      dc: node.check.dc
    };
    StateManager.state.awaitingCheck = true;
    StateManager.state.lastCheckNode = node.node_id;
    UIManager.updateAll();

    StateManager._checkCallbacks = {
      successResult: async () => {
        StateManager.state.awaitingCheck = false;
        StateManager.state.lastCheckNode = null;
        if (node.check.on_success) {
          await this.addStoryEntry(node.check.on_success, 'text-yellow-400', 20);
        }
        if (node.check.success_next) {
          setTimeout(() => this.playNode(node.check.success_next), 500);
        }
      },
      failureResult: async () => {
        StateManager.state.awaitingCheck = false;
        StateManager.state.lastCheckNode = null;
        if (node.check.on_failure) {
          await this.addStoryEntry(node.check.on_failure, 'text-red-400', 20);
        }
        if (node.check.failure_next) {
          setTimeout(() => this.playNode(node.check.failure_next), 500);
        }
      }
    };

    await StoryEngine.addStoryEntry('[系统] 点击上方掷骰按钮执行检定...', 'text-gray-400', 20);
  },

  async playEnding(node) {
    console.log('[Engine] playEnding called for node:', node.node_id);
    await this.playDialogue(node);

    // Check for explicit next_chapter property first
    if (node.next_chapter) {
      console.log('[Engine] playEnding: next_chapter detected:', node.next_chapter);
      const chapterObj = this.chapterList.find(c => c.file === node.next_chapter);
      if (chapterObj) {
        const currentChapterObj = this.chapterList.find(c => c.file === this.currentChapter);
        if (currentChapterObj && currentChapterObj.id) {
          if (!StateManager.state.completedChapters.includes(currentChapterObj.id)) {
            StateManager.state.completedChapters.push(currentChapterObj.id);
          }
        }
        StateManager.state.chapterProgress[chapterObj.id] = chapterObj.startNode;
        StateManager.save();

        await this.addStoryEntry('', 'text-cyan-400', 10);
        if (currentChapterObj) {
          await this.addStoryEntry(`--- ${currentChapterObj.name} 完成 ---`, 'text-green-400', 40);
        }
        await this.addStoryEntry('', 'text-cyan-400', 10);
        await this.addStoryEntry(`[系统] 正在加载下一章：${chapterObj.name}...`, 'text-cyan-400', 20);

        UIManager.disableAllControls();
        await new Promise(r => setTimeout(r, 1500));

        const success = await this.loadStory(node.next_chapter);
        if (success) {
          this.currentChapter = node.next_chapter;
          UIManager.enableAllControls();
          UIManager.clearChoices();
          console.log('[Engine] playEnding: Transitioning to', chapterObj.startNode);
          await this.playNode(chapterObj.startNode);
          return;
        } else {
          UIManager.enableAllControls();
          await this.addStoryEntry(`[系统] 下一章加载失败。`, 'text-red-400', 20);
        }
      }
      return;
    }

    // Fallback: check if this is a chapter ending node
    console.log('[Engine] playEnding: Checking if this is a chapter ending node...');
    const isChapterEnding = this.isChapterEndingNode(node);
    console.log('[Engine] playEnding: isChapterEnding =', isChapterEnding);

    if (isChapterEnding) {
      console.log('[Engine] playEnding: Transitioning to next chapter...');
      await new Promise(r => setTimeout(r, 800));
      await this.playNextChapter();
      console.log('[Engine] playEnding: playNextChapter completed, returning');
      return;
    }

    console.log('[Engine] playEnding: This is a game ending, not chapter transition');
    StateManager.state.isGameOver = true;
    UIManager.disableAllControls();

    const endingType = this.determineEnding(node.next_ending);
    console.log('[Engine] playEnding: endingType =', endingType);

    if (node.next_ending) {
      setTimeout(() => {
        UIManager.showEndingScreen(endingType);
      }, 1000);
    }
  },

  isChapterEndingNode(node) {
    console.log('[Engine] isChapterEndingNode check:', {
      currentChapter: this.currentChapter,
      nodeId: node.node_id,
      nodeType: node.type,
      chapterListLength: this.chapterList.length,
      storyDataNodes: this.storyData?.nodes?.length || 0
    });

    // Method 1: Check if current node is the last ending-type node in current chapter
    if (!this.currentChapter) {
      console.log('[Engine] isChapterEndingNode: No currentChapter set');
    } else {
      const chapterIdx = this.chapterList.findIndex(c => c.file === this.currentChapter);
      console.log('[Engine] isChapterEndingNode: chapterIdx =', chapterIdx);
      
      if (chapterIdx >= 0 && chapterIdx < this.chapterList.length - 1) {
        if (this.storyData && this.storyData.nodes) {
          const lastNode = this.storyData.nodes[this.storyData.nodes.length - 1];
          console.log('[Engine] isChapterEndingNode: lastNode =', lastNode.node_id, 'currentNode =', node.node_id);
          if (node.node_id === lastNode.node_id && node.type === 'ending') {
            console.log('[Engine] isChapterEndingNode: TRUE (Method 1 - last node match)');
            return true;
          }
        }
      }
    }

    // Method 2: Check by node ID pattern (chXX_end)
    const nodeIdMatch = node.node_id?.match(/^(ch\d+)_end$/);
    if (nodeIdMatch) {
      const chapterId = nodeIdMatch[1];
      const chapterObj = this.chapterList.find(c => c.id === chapterId);
      if (chapterObj) {
        const chapterIdx = this.chapterList.indexOf(chapterObj);
        console.log('[Engine] isChapterEndingNode: Method 2 matched, chapterIdx =', chapterIdx);
        if (chapterIdx < this.chapterList.length - 1) {
          console.log('[Engine] isChapterEndingNode: TRUE (Method 2 - node ID pattern)');
          return true;
        }
      }
    }

    console.log('[Engine] isChapterEndingNode: FALSE');
    return false;
  },

  determineEnding(fallback) {
    const state = StateManager.state;

    if (fallback === 'good') {
      if (state.allyPath !== null) {
        return 'good';
      }
      return 'bad';
    }

    if (fallback === 'bad') {
      if (state.allyPath !== null) {
        return 'good';
      }
      return 'bad';
    }

    return fallback || 'bad';
  },

  triggerEnding(type) {
    const endings = {
      'bad_death': {
        node_id: 'ending_bad_death',
        type: 'ending',
        speaker: 'system',
        text: '[系统] 致命错误：神经突触熔断。生命体征消失。',
        next_ending: 'bad'
      },
      'good': {
        node_id: 'ending_good',
        type: 'ending',
        speaker: 'narrator',
        text: 'V与盟友一起离开了夜之城，驶向未知的地平线...',
        next_ending: 'good'
      },
      'bad': {
        node_id: 'ending_bad',
        type: 'ending',
        speaker: 'narrator',
        text: 'V独自消逝在夜之城的霓虹中，再也没有人提起过这个名字...',
        next_ending: 'bad'
      }
    };
    const ending = endings[type];
    if (ending) {
      this.playEnding(ending);
    }
  }
};

// --- UI 管理器 ---
const UIManager = {
  elements: {},

  init() {
    this.elements = {
      storyLog: document.getElementById('story-log'),
      terminalInput: document.getElementById('terminal-input'),
      sendBtn: document.getElementById('send-btn'),
      rollBtn: document.getElementById('roll-btn'),
      diceResult: document.getElementById('dice-result'),
      diceValue: document.getElementById('dice-value'),
      diceTotal: document.getElementById('dice-total'),
      eventName: document.getElementById('event-name'),
      hpDisplay: document.getElementById('hp-display'),
      hpBar: document.getElementById('hp-bar'),
      ramDisplay: document.getElementById('ram-display'),
      ramBar: document.getElementById('ram-bar'),
      statPhysique: document.getElementById('stat-physique'),
      statIntellect: document.getElementById('stat-intellect'),
      statCharisma: document.getElementById('stat-charisma'),
      actionBtn1: document.getElementById('action-btn-1'),
      actionBtn2: document.getElementById('action-btn-2'),
      actionBtn3: document.getElementById('action-btn-3'),
      inventory: document.getElementById('inventory'),
      choices: document.getElementById('choices')
    };

    StoryEngine.storyLog = this.elements.storyLog;
    this.bindEvents();
    this.updateAll();
  },

  bindEvents() {
    this.elements.rollBtn.addEventListener('click', () => {
      if (StateManager.state.awaitingCheck && StateManager._checkCallbacks) {
        const event = StateManager.state.currentEvent;
        CheckSystem.performCheck(event,
          StateManager._checkCallbacks.successResult,
          StateManager._checkCallbacks.failureResult
        );
        return;
      }

      const event = StateManager.state.currentEvent;
      CheckSystem.performCheck(event,
        () => this.onCheckSuccess(event),
        () => this.onCheckFailure(event)
      );
    });

    this.elements.sendBtn.addEventListener('click', this.handleTerminalInput.bind(this));
    this.elements.terminalInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleTerminalInput();
    });

    this.elements.actionBtn1.addEventListener('click', () => this.handleAction(1));
    this.elements.actionBtn2.addEventListener('click', () => this.handleAction(2));
    this.elements.actionBtn3.addEventListener('click', () => this.handleAction(3));

    const openNPCDialogueBtn = document.getElementById('open-npc-dialogue-btn');
    if (openNPCDialogueBtn) {
      openNPCDialogueBtn.addEventListener('click', () => {
        if (typeof NPCDialogueSystem !== 'undefined') {
          NPCDialogueSystem.openDialogue();
        }
      });
    }
  },

  async handleTerminalInput() {
    if (StateManager.state.isGameOver) return;
    const input = this.elements.terminalInput.value.trim();
    if (!input) return;

    await StoryEngine.addStoryEntry(`[玩家] ${input}`, 'text-yellow-400', 20);
    this.elements.terminalInput.value = '';

    const awaitingCheck = StateManager.state.awaitingCheck;
    const currentNode = StateManager.getCurrentNode();

    if (awaitingCheck) {
      const checkNode = StoryEngine.findNode(StateManager.state.lastCheckNode);
      if (checkNode && checkNode.type === 'check') {
        await StoryEngine.addStoryEntry('[系统] 当前需要完成检定。请点击上方掷骰按钮执行检定。', 'text-gray-400', 25);
        return;
      }
    }

    if (currentNode) {
      const currentNodeObj = StoryEngine.findNode(currentNode);
      if (currentNodeObj && currentNodeObj.type === 'choice') {
        await StoryEngine.addStoryEntry('[系统] 请从下方选项中选择你的行动。', 'text-gray-400', 25);
        return;
      }
    }

    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('破解') || lowerInput.includes('hack') || lowerInput.includes('破解门禁')) {
      const checkBreach = StoryEngine.findNode('ch01_check_breach');
      if (checkBreach) {
        await StoryEngine.addStoryEntry('[系统] 正在切换到破解门禁流程...', 'text-gray-400', 20);
        setTimeout(() => StoryEngine.playNode('ch01_check_breach'), 500);
        return;
      }
    }

    if (lowerInput.includes('物理') || lowerInput.includes('破坏') || lowerInput.includes('供电')) {
      const checkPower = StoryEngine.findNode('ch01_check_power');
      if (checkPower) {
        await StoryEngine.addStoryEntry('[系统] 正在切换到物理破坏流程...', 'text-gray-400', 20);
        setTimeout(() => StoryEngine.playNode('ch01_check_power'), 500);
        return;
      }
    }

    if (lowerInput.includes('维护') || lowerInput.includes('节点') || lowerInput.includes('骇入')) {
      const checkSubnet = StoryEngine.findNode('ch01_check_subnet');
      if (checkSubnet) {
        await StoryEngine.addStoryEntry('[系统] 正在切换到骇入维护节点流程...', 'text-gray-400', 20);
        setTimeout(() => StoryEngine.playNode('ch01_check_subnet'), 500);
        return;
      }
    }

    const responses = [
      'V，集中注意力。使用上方控制台进行交互。',
      '夜之城不等人。请通过界面上的按钮推进剧情。',
      '通讯频道安静点，choomba。专注于眼前的任务。',
      '你的神经链路需要手动操作。使用掷骰按钮执行检定。'
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    setTimeout(async () => {
      await StoryEngine.addStoryEntry(`[系统] ${response}`, 'text-gray-400', 25);
    }, 500);
  },

  handleAction(btnNum) {
    if (StateManager.state.isGameOver || StoryEngine.isTyping) return;
    
    const currentNodeId = StateManager.getCurrentNode();
    const currentNode = StoryEngine.findNode(currentNodeId);

    if (currentNode && currentNode.type === 'choice') {
      const choice = currentNode.choices[btnNum - 1];
      if (choice) {
        StoryEngine.addStoryEntry(`[玩家] ${choice.text}`, 'text-yellow-400', 20);
        UIManager.clearChoices();
        
        if (choice.effect_id) {
          UIManager.executeEffect(choice.effect_id);
        }
        if (choice.next_node) {
          setTimeout(() => StoryEngine.playNode(choice.next_node), 500);
        }
      }
      return;
    }

    if (currentNode && currentNode.type === 'check' && btnNum === 1) {
      const event = StateManager.state.currentEvent;
      CheckSystem.performCheck(event,
        () => UIManager.onCheckSuccess(event),
        () => UIManager.onCheckFailure(event)
      );
      return;
    }

    if (btnNum === 1) {
      StoryEngine.addStoryEntry('[系统] 点击上方掷骰按钮执行检定。', 'text-gray-400', 20);
    } else if (btnNum === 2) {
      StoryEngine.addStoryEntry('[系统] 请根据剧情提示进行操作。', 'text-gray-400', 20);
    } else if (btnNum === 3) {
      StoryEngine.addStoryEntry('[系统] 使用界面中的选项推进剧情。', 'text-gray-400', 20);
    }
  },

  async onCheckSuccess(event) {
    // Success message is already handled by playCheck's successResult callback
    // No hardcoded stage logic here - let the JSON drive the flow
  },

  async onCheckFailure(event) {
    // Failure message and penalty are already handled by CheckSystem and playCheck's failureResult callback
    // No hardcoded stage logic here - let the JSON drive the flow
  },

  updateAll() {
    const state = StateManager.state;
    const player = state.player;

    if (this.elements.hpDisplay) {
      this.elements.hpDisplay.textContent = `${player.hp}/${player.maxHp}`;
    }
    if (this.elements.hpBar) {
      this.elements.hpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
    }
    if (this.elements.ramDisplay) {
      this.elements.ramDisplay.textContent = `${player.ram}/${player.maxRam}`;
    }
    if (this.elements.ramBar) {
      this.elements.ramBar.style.width = `${(player.ram / player.maxRam) * 100}%`;
    }
    if (this.elements.statPhysique) {
      this.elements.statPhysique.textContent = player.attributes.physique;
    }
    if (this.elements.statIntellect) {
      this.elements.statIntellect.textContent = player.attributes.intellect;
    }
    if (this.elements.statCharisma) {
      this.elements.statCharisma.textContent = player.attributes.charisma;
    }

    if (this.elements.eventName) {
      const attrName = state.currentEvent.attribute === 'intellect' ? '智力' : 
                       (state.currentEvent.attribute === 'physique' ? '体能' : '魅力');
      this.elements.eventName.textContent = `${state.currentEvent.name} - ${attrName} DC ${state.currentEvent.dc}`;
    }

    this.updateInventory();
  },

  updateInventory() {
    if (!this.elements.inventory) return;
    const items = StateManager.state.items;
    const itemNames = {
      'shard': '分离芯片',
      'keycard': '访问密钥',
      'decrypt_tool': '解密工具'
    };
    const itemIcons = {
      'shard': 'SD',
      'keycard': 'KY',
      'decrypt_tool': 'DT'
    };

    let html = '';
    items.forEach(id => {
      html += `<div class="bg-gray-800 border border-yellow-400 p-2 text-center">
        <div class="text-yellow-400 text-2xl mb-1">${itemIcons[id] || '?'}</div>
        <p class="text-xs text-gray-400">${itemNames[id] || id}</p>
      </div>`;
    });

    const emptySlots = Math.max(0, 6 - items.length);
    for (let i = 0; i < emptySlots; i++) {
      html += `<div class="bg-gray-800 border border-gray-700 p-2 text-center">
        <div class="text-gray-600 text-2xl mb-1">?</div>
        <p class="text-xs text-gray-600">空</p>
      </div>`;
    }

    this.elements.inventory.innerHTML = html;
  },

  async animateDice(finalRoll, total, mod) {
    this.elements.rollBtn.disabled = true;
    this.elements.diceResult.classList.remove('hidden');
    
    let rollCount = 0;
    const maxRolls = 15;
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        this.elements.diceValue.textContent = Math.floor(Math.random() * 20) + 1;
        rollCount++;
        
        if (rollCount >= maxRolls) {
          clearInterval(interval);
          this.elements.diceValue.textContent = finalRoll;
          this.elements.diceTotal.textContent = `总计: ${total} (D20: ${finalRoll} + 调整值: ${mod})`;
          
          if (total >= StateManager.state.currentEvent.dc) {
            this.elements.diceValue.className = 'text-4xl font-bold text-green-400';
          } else {
            this.elements.diceValue.className = 'text-4xl font-bold text-red-400';
          }
          
          this.elements.rollBtn.disabled = false;
          resolve();
        }
      }, 66);
    });
  },

  showChoices(choices) {
    if (!this.elements.choices) return;
    
    let html = '<div class="flex flex-wrap gap-2 mt-3">';
    choices.forEach((choice, idx) => {
      html += `<button class="choice-btn glow-yellow bg-yellow-400 text-gray-900 px-4 py-2 font-bold hover:bg-yellow-300 transition glitch" 
                data-choice="${idx}">${choice.text}</button>`;
    });
    html += '</div>';
    
    this.elements.choices.innerHTML = html;

    this.elements.choices.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.choice);
        const choice = choices[idx];
        StoryEngine.addStoryEntry(`[玩家] ${choice.text}`, 'text-yellow-400', 20);
        this.elements.choices.innerHTML = '';
        
        if (choice.effect_id) {
          this.executeEffect(choice.effect_id);
        }
        if (choice.next_node) {
          setTimeout(() => StoryEngine.playNode(choice.next_node), 500);
        }
      });
    });
  },

  clearChoices() {
    if (this.elements.choices) {
      this.elements.choices.innerHTML = '';
    }
  },

  executeEffect(effectId) {
    const effects = {
      'accepted_dexter': () => StateManager.setFlag('accepted_dexter', true),
      'rejected_dexter': () => StateManager.setFlag('rejected_dexter', true),
      'ally_judy': () => StateManager.setAllyPath('judy'),
      'ally_panam': () => StateManager.setAllyPath('panam'),
      'chose_escape': () => StateManager.setFlag('chose_escape', true),
      'chose_solo': () => StateManager.setFlag('chose_solo', true),
      'add_shard': () => StateManager.addItem('shard'),
      'add_keycard': () => StateManager.addItem('keycard'),
      'add_decrypt_tool': () => StateManager.addItem('decrypt_tool'),
      'chose_good_ending': () => StateManager.setFlag('final_choice_good', true),
      'chose_bad_ending': () => StateManager.setFlag('final_choice_bad', true)
    };
    
    if (effects[effectId]) {
      effects[effectId]();
    }
  },

  disableAllControls() {
    [this.elements.rollBtn, this.elements.actionBtn1, 
     this.elements.actionBtn2, this.elements.actionBtn3, 
     this.elements.sendBtn].forEach(btn => {
      if (btn) btn.disabled = true;
    });
  },

  enableAllControls() {
    StateManager.state.isGameOver = false;
    StateManager.state.awaitingCheck = false;
    StateManager.state.lastCheckNode = null;
    StateManager._checkCallbacks = null;
    [this.elements.rollBtn, this.elements.actionBtn1, 
     this.elements.actionBtn2, this.elements.actionBtn3, 
     this.elements.sendBtn].forEach(btn => {
      if (btn) btn.disabled = false;
    });
  },

  showEndingScreen(type) {
    const overlay = document.createElement('div');
    overlay.className = `ending-overlay fixed inset-0 flex items-center justify-center z-50`;
    overlay.style.backgroundColor = type === 'good' ? 'rgba(0, 0, 0, 0.92)' : 'rgba(0, 0, 0, 0.95)';
    
    const containerClass = type === 'good' ? 'ending-good' : 'ending-bad';
    
    const titleClass = type === 'good' 
      ? 'text-5xl md:text-6xl font-bold text-green-400 mb-6 tracking-widest chinese-text glow-green slide-up'
      : 'text-5xl md:text-6xl font-bold text-red-500 mb-6 tracking-widest chinese-text glitch-red slide-up';
    
    const textClass = type === 'good'
      ? 'text-xl md:text-2xl text-gray-200 mb-8 chinese-text leading-relaxed'
      : 'text-xl md:text-2xl text-gray-300 mb-8 chinese-text leading-relaxed';
    
    const btnClass = type === 'good'
      ? 'bg-green-500 text-gray-900 px-8 py-4 font-bold text-xl hover:bg-green-400 hover:shadow-[0_0_20px_#22c55e] transition-all duration-300 ending-restart-btn'
      : 'bg-red-500 text-white px-8 py-4 font-bold text-xl hover:bg-red-400 hover:shadow-[0_0_20px_#ef4444] transition-all duration-300 ending-restart-btn';
    
    const endingText = type === 'good'
      ? '你与盟友一起离开了夜之城，驶向未知的地平线。自由，第一次真正属于你。'
      : '你独自消逝在夜之城的霓虹中。在这里，传奇往往不得善终。';
    
    const title = type === 'good' ? 'THE STAR' : 'FLATLINED';
    
    overlay.innerHTML = `
      <div class="${containerClass} relative max-w-3xl p-8 md:p-12 text-center">
        <div class="scanline-overlay"></div>
        <h1 class="${titleClass} ending-title">${title}</h1>
        <p class="${textClass} ending-text">${endingText}</p>
        <button id="restart-btn" class="${btnClass}">重新开始</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      const titleEl = overlay.querySelector('.ending-title');
      if (titleEl) {
        titleEl.style.opacity = '1';
        titleEl.classList.add('slide-up');
      }
    }, 800);
    
    const endingTextEl = overlay.querySelector('.ending-text');
    if (endingTextEl) {
      setTimeout(() => {
        endingTextEl.style.opacity = '1';
        endingTextEl.classList.add('line-fade-in');
      }, 1500);
    }
    
    const restartBtn = overlay.querySelector('#restart-btn');
    if (restartBtn) {
      setTimeout(() => {
        restartBtn.style.opacity = '1';
        restartBtn.classList.add('line-fade-in');
      }, 2500);

      restartBtn.addEventListener('click', () => {
        StateManager.reset();
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        UIManager.disableAllControls();
        StartScreen.showStartScreen();
      });
    }
  }
};

// --- 调试控制台 ---
const DebugConsole = {
  isVisible: false,
  panel: null,
  toggleBtn: null,

  init() {
    this.createUI();
    this.setupShortcuts();
    this.updateValueDisplay();
  },

  createUI() {
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.id = 'debug-toggle';
    this.toggleBtn.className = 'fixed bottom-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-gray-900 bg-opacity-90 border-2 border-cyan-500 text-cyan-400 font-bold text-sm hover:bg-cyan-900 hover:text-cyan-300 transition-all duration-200 shadow-lg shadow-cyan-500/30';
    this.toggleBtn.innerHTML = '[D]';
    this.toggleBtn.title = '调试控制台 (Ctrl+Shift+D)';
    this.toggleBtn.addEventListener('click', () => this.toggle());
    document.body.appendChild(this.toggleBtn);

    this.panel = document.createElement('div');
    this.panel.id = 'debug-panel';
    this.panel.className = 'fixed bottom-16 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto bg-gray-900 bg-opacity-95 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/50 hidden';
    this.panel.style.fontFamily = "'Courier New', 'Microsoft YaHei', monospace";
    this.panel.style.backdropFilter = 'blur(10px)';
    
    this.panel.innerHTML = `
      <div class="p-4">
        <div class="flex items-center justify-between mb-4 border-b-2 border-cyan-500 pb-2">
          <h3 class="text-cyan-400 font-bold text-lg tracking-wider">[调试控制台]</h3>
          <button id="debug-close" class="text-gray-500 hover:text-red-400 text-xl font-bold">&times;</button>
        </div>
        
        <div class="mb-4 bg-gray-800 bg-opacity-50 p-3 border border-cyan-500/50">
          <h4 class="text-yellow-400 text-sm font-bold mb-2 tracking-wider">[数值调整]</h4>
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-red-400 font-bold">HP: <span id="debug-hp-display">--/--</span></span>
              <div class="flex gap-1">
                <button class="debug-num-btn bg-gray-700 border border-red-500/50 text-red-400 px-2 py-1 text-xs hover:bg-red-900/50 transition" data-type="hp" data-delta="-10">-10</button>
                <button class="debug-num-btn bg-gray-700 border border-red-500/50 text-red-400 px-2 py-1 text-xs hover:bg-red-900/50 transition" data-type="hp" data-delta="-1">-1</button>
                <button class="debug-num-btn bg-gray-700 border border-red-500/50 text-red-400 px-2 py-1 text-xs hover:bg-red-900/50 transition" data-type="hp" data-delta="+1">+1</button>
                <button class="debug-num-btn bg-gray-700 border border-red-500/50 text-red-400 px-2 py-1 text-xs hover:bg-red-900/50 transition" data-type="hp" data-delta="+10">+10</button>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-blue-400 font-bold">RAM: <span id="debug-ram-display">--/--</span></span>
              <div class="flex gap-1">
                <button class="debug-num-btn bg-gray-700 border border-blue-500/50 text-blue-400 px-2 py-1 text-xs hover:bg-blue-900/50 transition" data-type="ram" data-delta="-10">-10</button>
                <button class="debug-num-btn bg-gray-700 border border-blue-500/50 text-blue-400 px-2 py-1 text-xs hover:bg-blue-900/50 transition" data-type="ram" data-delta="-1">-1</button>
                <button class="debug-num-btn bg-gray-700 border border-blue-500/50 text-blue-400 px-2 py-1 text-xs hover:bg-blue-900/50 transition" data-type="ram" data-delta="+1">+1</button>
                <button class="debug-num-btn bg-gray-700 border border-blue-500/50 text-blue-400 px-2 py-1 text-xs hover:bg-blue-900/50 transition" data-type="ram" data-delta="+10">+10</button>
              </div>
            </div>
            <div class="mt-2 pt-2 border-t border-gray-700">
              <div class="flex items-center justify-between mb-1">
                <span class="text-yellow-400 font-bold">体能: <span id="debug-physique-display">--</span></span>
                <div class="flex gap-1">
                  <button class="debug-attr-btn bg-gray-700 border border-yellow-500/50 text-yellow-400 px-2 py-1 text-xs hover:bg-yellow-900/50 transition" data-attr="physique" data-delta="-1">-1</button>
                  <button class="debug-attr-btn bg-gray-700 border border-yellow-500/50 text-yellow-400 px-2 py-1 text-xs hover:bg-yellow-900/50 transition" data-attr="physique" data-delta="+1">+1</button>
                </div>
              </div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-cyan-400 font-bold">智力: <span id="debug-intellect-display">--</span></span>
                <div class="flex gap-1">
                  <button class="debug-attr-btn bg-gray-700 border border-cyan-500/50 text-cyan-400 px-2 py-1 text-xs hover:bg-cyan-900/50 transition" data-attr="intellect" data-delta="-1">-1</button>
                  <button class="debug-attr-btn bg-gray-700 border border-cyan-500/50 text-cyan-400 px-2 py-1 text-xs hover:bg-cyan-900/50 transition" data-attr="intellect" data-delta="+1">+1</button>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-pink-400 font-bold">魅力: <span id="debug-charisma-display">--</span></span>
                <div class="flex gap-1">
                  <button class="debug-attr-btn bg-gray-700 border border-pink-500/50 text-pink-400 px-2 py-1 text-xs hover:bg-pink-900/50 transition" data-attr="charisma" data-delta="-1">-1</button>
                  <button class="debug-attr-btn bg-gray-700 border border-pink-500/50 text-pink-400 px-2 py-1 text-xs hover:bg-pink-900/50 transition" data-attr="charisma" data-delta="+1">+1</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4 bg-gray-800 bg-opacity-50 p-3 border border-cyan-500/50">
          <h4 class="text-yellow-400 text-sm font-bold mb-2 tracking-wider">[剧情跳转]</h4>
          <select id="debug-node-select" class="w-full bg-gray-700 border border-cyan-500 text-cyan-400 text-sm px-2 py-1 mb-2 focus:outline-none focus:border-cyan-400">
            <option value="">选择节点...</option>
          </select>
          <button id="debug-jump-btn" class="w-full bg-cyan-600 border border-cyan-400 text-white px-3 py-1.5 text-sm font-bold hover:bg-cyan-500 transition tracking-wider">[确认跳转]</button>
        </div>

        <div class="mb-4 bg-gray-800 bg-opacity-50 p-3 border border-cyan-500/50">
          <h4 class="text-yellow-400 text-sm font-bold mb-2 tracking-wider">[快捷命令]</h4>
          <div class="flex flex-wrap gap-1 mb-2">
            <button class="debug-cmd-btn bg-gray-700 border border-green-500/50 text-green-400 px-2 py-1 text-xs hover:bg-green-900/50 transition" data-cmd="force success">强制成功</button>
            <button class="debug-cmd-btn bg-gray-700 border border-red-500/50 text-red-400 px-2 py-1 text-xs hover:bg-red-900/50 transition" data-cmd="force fail">强制失败</button>
            <button class="debug-cmd-btn bg-gray-700 border border-yellow-500/50 text-yellow-400 px-2 py-1 text-xs hover:bg-yellow-900/50 transition" data-cmd="show state">显示状态</button>
            <button class="debug-cmd-btn bg-gray-700 border border-purple-500/50 text-purple-400 px-2 py-1 text-xs hover:bg-purple-900/50 transition" data-cmd="list nodes">列出节点</button>
            <button class="debug-cmd-btn bg-gray-700 border border-orange-500/50 text-orange-400 px-2 py-1 text-xs hover:bg-orange-900/50 transition" data-cmd="list items">列出物品</button>
            <button class="debug-cmd-btn bg-gray-700 border border-blue-500/50 text-blue-400 px-2 py-1 text-xs hover:bg-blue-900/50 transition" data-cmd="list npcs">列出NPC</button>
            <button class="debug-cmd-btn bg-gray-700 border border-red-500/50 text-red-400 px-2 py-1 text-xs hover:bg-red-900/50 transition" data-cmd="reset">重置游戏</button>
          </div>
          <div class="flex gap-1">
            <input id="debug-cmd-input" type="text" placeholder="输入命令 (set/add/goto/force/show/list/reset)..." class="flex-1 bg-gray-700 border border-cyan-500 text-cyan-400 px-2 py-1 text-sm focus:outline-none focus:border-cyan-400 placeholder-gray-500">
            <button id="debug-cmd-send" class="bg-cyan-600 border border-cyan-400 text-white px-3 py-1 text-sm font-bold hover:bg-cyan-500 transition">[执行]</button>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            命令: set hp/ram/attr/flag &lt;value&gt; | add item &lt;id&gt; | goto &lt;nodeId&gt; | force success/fail | show state | list nodes/items/npcs | reset
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.panel);

    document.getElementById('debug-close').addEventListener('click', () => this.toggle());

    this.panel.querySelectorAll('.debug-num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const delta = parseInt(btn.dataset.delta);
        if (type === 'hp') {
          StateManager.adjustHP(delta);
          this.updateValueDisplay();
        }
        if (type === 'ram') {
          StateManager.adjustRAM(delta);
          this.updateValueDisplay();
        }
      });
    });

    this.panel.querySelectorAll('.debug-attr-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const attr = btn.dataset.attr;
        const delta = parseInt(btn.dataset.delta);
        StateManager.setAttribute(attr, StateManager.state.player.attributes[attr] + delta);
        this.updateValueDisplay();
      });
    });

    document.getElementById('debug-jump-btn').addEventListener('click', () => {
      const nodeId = document.getElementById('debug-node-select').value;
      if (nodeId) {
        this.jumpToNode(nodeId);
      }
    });

    this.panel.querySelectorAll('.debug-cmd-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.executeCommand(btn.dataset.cmd);
      });
    });

    document.getElementById('debug-cmd-send').addEventListener('click', () => {
      const input = document.getElementById('debug-cmd-input');
      if (input.value.trim()) {
        this.executeCommand(input.value.trim());
        input.value = '';
      }
    });

    document.getElementById('debug-cmd-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const input = e.target;
        if (input.value.trim()) {
          this.executeCommand(input.value.trim());
          input.value = '';
        }
      }
    });
  },

  updateValueDisplay() {
    const player = StateManager.state.player;
    const hpDisplay = document.getElementById('debug-hp-display');
    const ramDisplay = document.getElementById('debug-ram-display');
    const physiqueDisplay = document.getElementById('debug-physique-display');
    const intellectDisplay = document.getElementById('debug-intellect-display');
    const charismaDisplay = document.getElementById('debug-charisma-display');

    if (hpDisplay) {
      hpDisplay.textContent = `${player.hp}/${player.maxHp}`;
    }
    if (ramDisplay) {
      ramDisplay.textContent = `${player.ram}/${player.maxRam}`;
    }
    if (physiqueDisplay) {
      physiqueDisplay.textContent = player.attributes.physique;
    }
    if (intellectDisplay) {
      intellectDisplay.textContent = player.attributes.intellect;
    }
    if (charismaDisplay) {
      charismaDisplay.textContent = player.attributes.charisma;
    }
  },

  populateNodeSelect() {
    const select = document.getElementById('debug-node-select');
    if (!select || !StoryEngine.storyData || !StoryEngine.storyData.nodes) return;

    select.innerHTML = '<option value="">选择节点...</option>';

    const chapterGroups = {};
    
    StoryEngine.storyData.nodes.forEach(node => {
      const nodeId = node.node_id;
      const chapter = this.extractChapter(nodeId);
      
      if (!chapterGroups[chapter]) {
        chapterGroups[chapter] = [];
      }
      chapterGroups[chapter].push(node);
    });

    const chapterOrder = Object.keys(chapterGroups).sort();
    
    chapterOrder.forEach(chapter => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = chapter;
      
      chapterGroups[chapter].forEach(node => {
        const option = document.createElement('option');
        option.value = node.node_id;
        option.textContent = `${node.node_id} - ${node.type} (${node.speaker || '无'})`;
        optgroup.appendChild(option);
      });
      
      select.appendChild(optgroup);
    });

    const endingNodes = StoryEngine.storyData.nodes.filter(n => n.node_id.startsWith('ending_') || n.type === 'ending');
    if (endingNodes.length > 0) {
      const endingGroup = document.createElement('optgroup');
      endingGroup.label = '结局';
      endingNodes.forEach(node => {
        const option = document.createElement('option');
        option.value = node.node_id;
        option.textContent = `${node.node_id} - 结局`;
        endingGroup.appendChild(option);
      });
      select.appendChild(endingGroup);
    }
  },

  extractChapter(nodeId) {
    if (nodeId.startsWith('ch')) {
      const match = nodeId.match(/^(ch\d+)/);
      if (match) {
        const chapterNum = match[1];
        const chapterNames = {
          'ch01': '第一章: 开场',
          'ch02': '第二章: 来生酒吧',
          'ch03': '第三章: 最终行动'
        };
        return chapterNames[chapterNum] || chapterNum;
      }
    }
    return '其他';
  },

  toggle() {
    this.isVisible = !this.isVisible;
    this.panel.classList.toggle('hidden', !this.isVisible);
    
    if (this.isVisible) {
      this.updateValueDisplay();
      this.populateNodeSelect();
    }
  },

  setupShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });
  },

  jumpToNode(nodeId) {
    if (nodeId.startsWith('ending_')) {
      const type = nodeId.replace('ending_', '');
      StateManager.state.isGameOver = false;
      StoryEngine.triggerEnding(type === 'good' ? 'good' : 'bad');
      return;
    }
    
    StateManager.state.isGameOver = false;
    StateManager.state.awaitingCheck = false;
    StateManager.state.lastCheckNode = null;
    StateManager._checkCallbacks = null;
    StateManager.setNode(nodeId);
    UIManager.enableAllControls();
    StoryEngine.playNode(nodeId);
    StoryEngine.addStoryEntry(`[调试] 跳转到节点: ${nodeId}`, 'text-green-400', 15);
  },

  executeCommand(cmd) {
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();

    switch(command) {
      case 'set':
        if (parts[1] === 'hp' && parts[2]) {
          const value = parseInt(parts[2]);
          if (!isNaN(value)) {
            StateManager.setHP(value);
            StoryEngine.addStoryEntry(`[调试] HP 设置为 ${value}`, 'text-green-400', 15);
            this.updateValueDisplay();
          } else {
            StoryEngine.addStoryEntry('[调试] 无效的HP值', 'text-red-400', 15);
          }
        } else if (parts[1] === 'ram' && parts[2]) {
          const value = parseInt(parts[2]);
          if (!isNaN(value)) {
            StateManager.setRAM(value);
            StoryEngine.addStoryEntry(`[调试] RAM 设置为 ${value}`, 'text-green-400', 15);
            this.updateValueDisplay();
          } else {
            StoryEngine.addStoryEntry('[调试] 无效的RAM值', 'text-red-400', 15);
          }
        } else if (parts[1] === 'attr' && parts[2] && parts[3]) {
          const value = parseInt(parts[3]);
          if (!isNaN(value)) {
            StateManager.setAttribute(parts[2], value);
            StoryEngine.addStoryEntry(`[调试] ${parts[2]} 设置为 ${value}`, 'text-green-400', 15);
            this.updateValueDisplay();
          } else {
            StoryEngine.addStoryEntry('[调试] 无效的属性值', 'text-red-400', 15);
          }
        } else if (parts[1] === 'flag' && parts[2]) {
          const flagValue = parts[3] !== 'false';
          StateManager.setFlag(parts[2], flagValue);
          StoryEngine.addStoryEntry(`[调试] 标记 ${parts[2]} = ${flagValue}`, 'text-green-400', 15);
        } else {
          StoryEngine.addStoryEntry('[调试] 用法: set hp/ram/attr/flag <value>', 'text-yellow-400', 15);
        }
        break;

      case 'add':
        if (parts[1] === 'item' && parts[2]) {
          StateManager.addItem(parts[2]);
          StoryEngine.addStoryEntry(`[调试] 添加物品: ${parts[2]}`, 'text-green-400', 15);
        } else {
          StoryEngine.addStoryEntry('[调试] 用法: add item <id>', 'text-yellow-400', 15);
        }
        break;

      case 'goto':
        if (parts[1]) {
          this.jumpToNode(parts[1]);
        } else {
          StoryEngine.addStoryEntry('[调试] 用法: goto <nodeId>', 'text-yellow-400', 15);
        }
        break;

      case 'list':
        if (parts[1] === 'nodes') {
          StoryEngine.addStoryEntry('[调试] 可用节点列表:', 'text-cyan-400', 15);
          const nodes = StoryEngine.storyData?.nodes || [];
          if (nodes.length === 0) {
            StoryEngine.addStoryEntry('  (无数据)', 'text-gray-400', 10);
          } else {
            nodes.forEach(n => {
              StoryEngine.addStoryEntry(`  ${n.node_id} - ${n.type} (${n.speaker || '无'})`, 'text-gray-400', 10);
            });
          }
        } else if (parts[1] === 'items') {
          const items = StateManager.state.items;
          if (items.length === 0) {
            StoryEngine.addStoryEntry('[调试] 当前物品: 无', 'text-cyan-400', 15);
          } else {
            StoryEngine.addStoryEntry(`[调试] 当前物品: ${items.join(', ')}`, 'text-cyan-400', 15);
          }
        } else if (parts[1] === 'npcs') {
          StoryEngine.addStoryEntry('[调试] 可用NPC:', 'text-cyan-400', 15);
          if (typeof NPCDatabase !== 'undefined' && NPCDatabase.characters) {
            Object.keys(NPCDatabase.characters).forEach(id => {
              const npc = NPCDatabase.getCharacter(id);
              StoryEngine.addStoryEntry(`  ${id} - ${npc.name} (${npc.role})`, 'text-gray-400', 10);
            });
          } else {
            StoryEngine.addStoryEntry('  (NPC数据库未加载)', 'text-gray-400', 10);
          }
        } else {
          StoryEngine.addStoryEntry('[调试] 用法: list nodes/items/npcs', 'text-yellow-400', 15);
        }
        break;

      case 'show':
        if (parts[1] === 'state') {
          const state = StateManager.state;
          StoryEngine.addStoryEntry(`[调试] 状态: HP=${state.player.hp}/${state.player.maxHp} RAM=${state.player.ram}/${state.player.maxRam} Stage=${state.stage} Node=${state.currentNodeId}`, 'text-cyan-400', 15);
          StoryEngine.addStoryEntry(`[调试] 属性: 体能=${state.player.attributes.physique} 智力=${state.player.attributes.intellect} 魅力=${state.player.attributes.charisma}`, 'text-cyan-400', 15);
          StoryEngine.addStoryEntry(`[调试] 物品: ${state.items.join(', ') || '无'}`, 'text-cyan-400', 15);
          StoryEngine.addStoryEntry(`[调试] 标记: ${Object.keys(state.flags).length > 0 ? JSON.stringify(state.flags) : '无'}`, 'text-cyan-400', 15);
          StoryEngine.addStoryEntry(`[调试] 盟友路线: ${state.allyPath || '未选择'}`, 'text-cyan-400', 15);
        } else if (parts[1] === 'npc' && parts[2]) {
          if (typeof NPCDatabase !== 'undefined') {
            const npc = NPCDatabase.getCharacter(parts[2]);
            if (npc) {
              StoryEngine.addStoryEntry(`[调试] ${npc.name} - ${npc.role}`, 'text-cyan-400', 15);
              StoryEngine.addStoryEntry(`[调试] 性格: ${npc.personality.traits.join(', ')}`, 'text-gray-400', 10);
              StoryEngine.addStoryEntry(`[调试] 背景: ${npc.background}`, 'text-gray-400', 10);
            } else {
              StoryEngine.addStoryEntry(`[调试] 未找到NPC: ${parts[2]}`, 'text-red-400', 15);
            }
          } else {
            StoryEngine.addStoryEntry('[调试] NPC数据库未加载', 'text-red-400', 15);
          }
        } else {
          StoryEngine.addStoryEntry('[调试] 用法: show state / show npc <id>', 'text-yellow-400', 15);
        }
        break;

      case 'force':
        if (parts[1] === 'success') {
          CheckSystem.forceNextResult = 'success';
          StoryEngine.addStoryEntry('[调试] 下一次检定强制成功', 'text-green-400', 15);
        } else if (parts[1] === 'fail') {
          CheckSystem.forceNextResult = 'fail';
          StoryEngine.addStoryEntry('[调试] 下一次检定强制失败', 'text-red-400', 15);
        } else {
          StoryEngine.addStoryEntry('[调试] 用法: force success/fail', 'text-yellow-400', 15);
        }
        break;

      case 'reset':
        StoryEngine.addStoryEntry('[调试] 重置游戏...', 'text-yellow-400', 15);
        StateManager.reset();
        break;

      default:
        StoryEngine.addStoryEntry(`[调试] 未知命令: ${command}`, 'text-red-400', 15);
        StoryEngine.addStoryEntry('[调试] 可用命令: set/add/goto/force/show/list/reset', 'text-gray-400', 10);
    }
  }
};

// --- Start Screen Manager ---
const StartScreen = {
  startScreenEl: null,
  gameMainEl: null,
  instructionsPanel: null,

  init() {
    this.startScreenEl = document.getElementById('start-screen');
    this.gameMainEl = document.getElementById('game-main');
    this.instructionsPanel = document.getElementById('instructions-panel');

    // Start Game button
    document.getElementById('start-game-btn').addEventListener('click', () => {
      this.hideStartScreen();
      this.showGameMain();
      initGame(false);
    });

    // Continue Game button
    document.getElementById('continue-game-btn').addEventListener('click', () => {
      const saved = localStorage.getItem('cp2077_save');
      if (saved) {
        try {
          const saveData = JSON.parse(saved);
          if (saveData.currentNodeId && !saveData.isGameOver) {
            this.hideStartScreen();
            this.showGameMain();
            initGame(true);
          } else {
            alert('没有找到有效的存档。请开始新游戏。');
          }
        } catch(e) {
          alert('存档损坏，请开始新游戏。');
        }
      } else {
        alert('没有找到存档。请开始新游戏。');
      }
    });

    // Show Instructions button
    document.getElementById('show-instructions-btn').addEventListener('click', () => {
      this.instructionsPanel.classList.remove('hidden');
    });

    // Close Instructions button
    document.getElementById('close-instructions-btn').addEventListener('click', () => {
      this.instructionsPanel.classList.add('hidden');
    });

    // Close instructions on background click
    this.instructionsPanel.addEventListener('click', (e) => {
      if (e.target === this.instructionsPanel) {
        this.instructionsPanel.classList.add('hidden');
      }
    });

    // Close instructions on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.instructionsPanel.classList.contains('hidden')) {
        this.instructionsPanel.classList.add('hidden');
      }
    });
  },

  hideStartScreen() {
    this.startScreenEl.style.transition = 'opacity 0.5s ease-out';
    this.startScreenEl.style.opacity = '0';
    setTimeout(() => {
      this.startScreenEl.classList.add('hidden');
    }, 500);
  },

  showStartScreen() {
    this.startScreenEl.classList.remove('hidden');
    this.startScreenEl.style.transition = 'opacity 0.5s ease-in';
    this.startScreenEl.style.opacity = '1';
    if (this.gameMainEl) {
      this.gameMainEl.classList.add('hidden');
    }
  },

  showGameMain() {
    if (this.gameMainEl) {
      this.gameMainEl.classList.remove('hidden');
    }
  }
};

// --- Game Initialization ---
function initGame(isContinue = false) {
  console.log('[Engine] initGame called, isContinue:', isContinue);
  StateManager.init();
  UIManager.init();
  DebugConsole.init();

  if (isContinue) {
    const state = StateManager.state;
    console.log('[Engine] Continue game - saved state:', state.currentNodeId, 'completedChapters:', state.completedChapters);

    if (state.chapterProgress && Object.keys(state.chapterProgress).length > 0) {
      const chapterKeys = Object.keys(state.chapterProgress);
      const lastChapterKey = chapterKeys[chapterKeys.length - 1];
      const resumeNode = state.chapterProgress[lastChapterKey];

      const chapterObj = StoryEngine.chapterList.find(c => c.id === lastChapterKey);
      if (chapterObj && resumeNode) {
        StoryEngine.currentChapter = chapterObj.file;
        console.log('[Engine] Loading saved chapter:', chapterObj.file, 'resume node:', resumeNode);
        StoryEngine.loadStory(chapterObj.file).then(success => {
          if (success) {
            UIManager.clearChoices();
            StoryEngine.playNode(resumeNode);
            StoryEngine.addStoryEntry('[系统] 存档已加载。继续游戏...', 'text-green-400', 20);
          } else {
            loadChapterFallback(chapterObj);
          }
        });
        return;
      }
    }
  }

  console.log('[Engine] New game - resetting state');
  StateManager.reset();
  StoryEngine.currentChapter = StoryEngine.chapterList[0].file;
  console.log('[Engine] Set currentChapter to:', StoryEngine.currentChapter);
  StoryEngine.loadStory('ch01_intro.json').then(success => {
    console.log('[Engine] ch01_intro.json loaded:', success, 'currentChapter:', StoryEngine.currentChapter);
    if (success) {
      StoryEngine.playNode('ch01_01');
    } else {
      loadChapterFallback(StoryEngine.chapterList[0]);
    }
  });
}

function loadChapterFallback(chapterObj) {
  StoryEngine.addStoryEntry('[系统] 神经链路连接已建立...', 'text-gray-400', 300);
  StoryEngine.addStoryEntry('[系统] 当前坐标：荒坂塔底层子网...', 'text-gray-400', 300);
  StoryEngine.addStoryEntry('[旁白] 霓虹灯的光芒穿透冷却液的雾气。你正躲在服务器机房外，前方是一扇重型防爆门，里面存放着目标：Relic分离芯片。', 'text-cyan-400', 500);
  StoryEngine.addStoryEntry('[T-Bug] "V，我已经压制了外围安保，但这扇防爆门的 ICE 比预想的厚。你得自己想办法突破进去。"', 'text-pink-500', 500);
  StoryEngine.addStoryEntry('[系统] 主线任务已更新: "偷天换日 - 突破机房门禁"', 'text-yellow-400', 400);
  StoryEngine.addStoryEntry('[系统] 等待玩家行动。请使用上方控制台进行交互或直接掷骰执行当前动作。', 'text-gray-400', 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => StartScreen.init());
} else {
  StartScreen.init();
}
