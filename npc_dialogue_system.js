// Cyberpunk 2077 TRPG - NPC AI Dialogue System
// ==========================================

const NPCDialogueSystem = {
  currentNPC: 't_bug',
  currentNode: null,
  conversationHistory: [],
  isWaitingForResponse: false,
  apiConfig: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    model: 'gpt-4',
    temperature: 0.8,
    maxTokens: 200
  },
  isConnected: false,

  storyNodes: {
    ch01: {
      name: '第一章: 偷天换日 - 荒坂塔机房',
      node: 'ch01_choice_01',
      context: '玩家V正在尝试突破荒坂塔机房的门禁。T-Bug通过远程网络提供技术支持。外面安保正在集结，时间紧迫。',
      availableNPCs: ['t_bug', 'jackson_welles']
    },
    ch02: {
      name: '第二章: 中间人与抉择 - 来生酒吧',
      node: 'ch02_choice_01',
      context: '玩家V在来生酒吧与中间人德克斯特会面。德克斯特提出了一个有风险但报酬丰厚的任务。V需要决定是否接受。',
      availableNPCs: ['t_bug', 'jackson_welles']
    }
  },

  init() {
    this.loadAPIConfig();
    this.bindEvents();
    this.populateStoryNodes();
    this.updateAPIStatus();
  },

  bindEvents() {
    document.getElementById('close-npc-dialogue').addEventListener('click', () => this.closePanel());
    document.getElementById('send-npc-message').addEventListener('click', () => this.sendMessage());
    document.getElementById('npc-chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    document.querySelectorAll('.npc-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const npc = btn.dataset.npc;
        this.switchNPC(npc);
      });
    });

    document.getElementById('story-node-selector').addEventListener('change', (e) => {
      const nodeKey = e.target.value;
      this.switchStoryNode(nodeKey);
    });

    document.getElementById('api-config-btn').addEventListener('click', () => this.showAPIConfig());
    document.getElementById('close-api-config').addEventListener('click', () => this.hideAPIConfig());
    document.getElementById('save-api-config').addEventListener('click', () => this.saveAPIConfig());
    document.getElementById('test-api-btn').addEventListener('click', () => this.testAPIConnection());

    document.getElementById('api-config-modal').addEventListener('click', (e) => {
      if (e.target.id === 'api-config-modal') this.hideAPIConfig();
    });
  },

  openPanel() {
    document.getElementById('npc-dialogue-panel').classList.remove('hidden');
  },

  closePanel() {
    document.getElementById('npc-dialogue-panel').classList.add('hidden');
  },

  populateStoryNodes() {
    const selector = document.getElementById('story-node-selector');
    selector.innerHTML = '<option value="">选择剧情节点...</option>';
    
    Object.entries(this.storyNodes).forEach(([key, node]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = node.name;
      selector.appendChild(option);
    });
  },

  switchStoryNode(nodeKey) {
    if (!nodeKey || !this.storyNodes[nodeKey]) {
      this.currentNode = null;
      this.clearChat();
      return;
    }

    this.currentNode = nodeKey;
    this.conversationHistory = [];
    this.clearChat();

    const node = this.storyNodes[nodeKey];
    this.addSystemMessage(`[系统] 已切换至: ${node.name}`);
    this.addSystemMessage(`[剧情] ${node.context}`);
    this.addSystemMessage(`[提示] 当前可对话NPC: T-Bug、杰克`);

    const npcData = NPCDatabase.getCharacter(this.currentNPC);
    if (npcData) {
      this.addSystemMessage(`[NPC] ${npcData.name} 已上线，可以开始对话...`);
    }
  },

  switchNPC(npcId) {
    if (this.currentNPC === npcId) return;

    this.currentNPC = npcId;
    this.conversationHistory = [];
    this.clearChat();

    document.querySelectorAll('.npc-select-btn').forEach(btn => {
      if (btn.dataset.npc === npcId) {
        btn.classList.add('active');
        btn.classList.remove('bg-gray-700', 'text-gray-400');
        btn.classList.add('glow-cyan', 'bg-cyan-600', 'text-white');
      } else {
        btn.classList.remove('active');
        btn.classList.remove('glow-cyan', 'bg-cyan-600', 'text-white');
        btn.classList.add('bg-gray-700', 'text-gray-400');
      }
    });

    const npcData = NPCDatabase.getCharacter(npcId);
    if (npcData) {
      this.addSystemMessage(`[系统] 已切换至与 ${npcData.name} 对话`);
      this.addNPCMessage(npcData.name, this.generateGreeting(npcId));
    }
  },

  generateGreeting(npcId) {
    const greetings = {
      t_bug: 'V，网络连接正常。我已经准备好提供技术支持了。说吧，需要什么帮助？',
      jackson_welles: 'V，amigo！有什么需要兄弟帮忙的？我随时待命！'
    };
    return greetings[npcId] || '...';
  },

  async sendMessage() {
    const input = document.getElementById('npc-chat-input');
    const message = input.value.trim();
    
    if (!message || this.isWaitingForResponse) return;
    if (!this.currentNode) {
      this.addSystemMessage('[系统] 请先选择一个剧情节点');
      return;
    }

    input.value = '';
    this.addPlayerMessage(message);
    this.isWaitingForResponse = true;

    const typingIndicator = this.showTypingIndicator();

    try {
      const response = await this.callLLMAPI(message);
      typingIndicator.remove();
      
      const npcData = NPCDatabase.getCharacter(this.currentNPC);
      this.addNPCMessage(npcData.name, response);
    } catch (error) {
      typingIndicator.remove();
      this.addSystemMessage(`[系统] API调用失败: ${error.message}`);
      this.addSystemMessage('[系统] 使用预设回复...');
      
      const fallbackResponse = this.generateFallbackResponse(message);
      const npcData = NPCDatabase.getCharacter(this.currentNPC);
      this.addNPCMessage(npcData.name, fallbackResponse);
    }

    this.isWaitingForResponse = false;
  },

  async callLLMAPI(playerMessage) {
    const npcData = NPCDatabase.getCharacter(this.currentNPC);
    if (!npcData) {
      throw new Error('NPC不存在');
    }

    const systemPrompt = this.buildSystemPrompt(npcData);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.conversationHistory.slice(-10),
      { role: 'user', content: playerMessage }
    ];

    const requestBody = {
      model: this.apiConfig.model,
      messages: messages,
      temperature: this.apiConfig.temperature,
      max_tokens: this.apiConfig.maxTokens
    };

    const response = await fetch(this.apiConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiConfig.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    this.conversationHistory.push(
      { role: 'user', content: playerMessage },
      { role: 'assistant', content: assistantMessage }
    );

    return assistantMessage;
  },

  buildSystemPrompt(npcData) {
    let prompt = npcData.api_config.system_prompt;
    
    if (this.currentNode) {
      const storyNode = this.storyNodes[this.currentNode];
      prompt += `\n\n当前剧情背景: ${storyNode.context}`;
    }

    prompt += '\n\n请用中文回复，保持角色性格，适当使用赛博朋克俚语。回复要简洁自然，不要超过3句话。';

    return prompt;
  },

  generateFallbackResponse(playerMessage) {
    const lowerMessage = playerMessage.toLowerCase();
    
    const fallbackResponses = {
      t_bug: {
        keywords: {
          '门禁': '门禁系统的ICE比预期厚。我需要更多时间来分析它的协议。你那边情况如何？',
          '破解': '正在尝试绕过防火墙...别急，这需要精确操作。给我30秒。',
          '安保': '监测到安保信号增强。你们的时间不多了，尽快完成任务撤离。',
          '帮助': '我已经在全力支援了。网络通道稳定，但随时可能被检测到。',
          'default': '收到。我正在监控网络流量，保持警惕。有情况我会立即通知你。'
        }
      },
      jackson_welles: {
        keywords: {
          '安保': '外面到处都是荒坂的安保！V，你那边搞定没？我车已经发动了！',
          '撤离': '撤离路线已经规划好了。拿到芯片后直接往东侧出口跑！',
          '芯片': 'Relic芯片？那可是个大玩意儿。小心点，V，这玩意儿肯定有自毁协议。',
          '帮助': '别担心，amigo！我就在外面等着。你搞定里面，我负责外面！',
          'default': '明白，兄弟！我在这边盯着，有情况马上告诉你。小心点！'
        }
      }
    };

    const responses = fallbackResponses[this.currentNPC];
    if (!responses) return '...';

    for (const [keyword, response] of Object.entries(responses.keywords)) {
      if (keyword !== 'default' && lowerMessage.includes(keyword)) {
        return response;
      }
    }

    return responses.keywords.default;
  },

  addPlayerMessage(message) {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message player-message p-3 rounded';
    messageDiv.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">V</div>
        <div>
          <p class="text-yellow-400 text-sm font-bold mb-1">玩家</p>
          <p class="text-gray-200 text-sm">${this.escapeHtml(message)}</p>
        </div>
      </div>
    `;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  },

  addNPCMessage(npcName, message) {
    const chatHistory = document.getElementById('chat-history');
    const npcData = NPCDatabase.getCharacter(this.currentNPC);
    const avatar = npcName.charAt(0).toUpperCase();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message npc-message p-3 rounded';
    messageDiv.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">${avatar}</div>
        <div>
          <p class="text-cyan-400 text-sm font-bold mb-1">${npcData?.name || npcName}</p>
          <p class="text-gray-200 text-sm">${this.escapeHtml(message)}</p>
        </div>
      </div>
    `;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  },

  addSystemMessage(message) {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message system-message p-3 rounded';
    messageDiv.innerHTML = `
      <p class="text-gray-400 text-sm">${this.escapeHtml(message)}</p>
    `;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  },

  showTypingIndicator() {
    const chatHistory = document.getElementById('chat-history');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message npc-message p-3 rounded';
    typingDiv.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
          ${this.currentNPC.charAt(0).toUpperCase()}
        </div>
        <div>
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
    chatHistory.appendChild(typingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return typingDiv;
  },

  clearChat() {
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = '';
  },

  showAPIConfig() {
    document.getElementById('api-config-modal').classList.remove('hidden');
    
    document.getElementById('api-endpoint').value = this.apiConfig.endpoint;
    document.getElementById('api-key').value = this.apiConfig.apiKey;
    document.getElementById('api-model').value = this.apiConfig.model;
    document.getElementById('api-temperature').value = this.apiConfig.temperature;
    document.getElementById('api-max-tokens').value = this.apiConfig.maxTokens;
  },

  hideAPIConfig() {
    document.getElementById('api-config-modal').classList.add('hidden');
  },

  saveAPIConfig() {
    this.apiConfig.endpoint = document.getElementById('api-endpoint').value.trim();
    this.apiConfig.apiKey = document.getElementById('api-key').value.trim();
    this.apiConfig.model = document.getElementById('api-model').value.trim();
    this.apiConfig.temperature = parseFloat(document.getElementById('api-temperature').value);
    this.apiConfig.maxTokens = parseInt(document.getElementById('api-max-tokens').value);

    this.saveAPIConfigToStorage();
    this.updateAPIStatus();
    this.hideAPIConfig();
    this.addSystemMessage('[系统] API配置已保存');
  },

  async testAPIConnection() {
    const statusEl = document.getElementById('api-status');
    statusEl.textContent = 'API: 测试中...';
    statusEl.className = 'testing';

    if (!this.apiConfig.apiKey) {
      statusEl.textContent = 'API: 错误 - 缺少API Key';
      statusEl.className = 'error';
      this.addSystemMessage('[系统] 测试失败: 请先输入API Key');
      return;
    }

    try {
      const response = await fetch(this.apiConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: this.apiConfig.model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        statusEl.textContent = 'API: 已连接';
        statusEl.className = 'connected';
        this.isConnected = true;
        this.addSystemMessage('[系统] API连接测试成功');
      } else {
        const errorData = await response.json().catch(() => ({}));
        statusEl.textContent = `API: 错误 - ${errorData.error?.message || '连接失败'}`;
        statusEl.className = 'error';
        this.isConnected = false;
        this.addSystemMessage(`[系统] API连接测试失败: ${errorData.error?.message || 'HTTP ' + response.status}`);
      }
    } catch (error) {
      statusEl.textContent = `API: 错误 - ${error.message}`;
      statusEl.className = 'error';
      this.isConnected = false;
      this.addSystemMessage(`[系统] API连接测试失败: ${error.message}`);
    }
  },

  updateAPIStatus() {
    const statusEl = document.getElementById('api-status');
    if (this.apiConfig.apiKey) {
      statusEl.textContent = 'API: 已配置';
      statusEl.className = 'connected';
      this.isConnected = true;
    } else {
      statusEl.textContent = 'API: 未连接';
      statusEl.className = '';
      this.isConnected = false;
    }
  },

  saveAPIConfigToStorage() {
    localStorage.setItem('cp2077_api_config', JSON.stringify(this.apiConfig));
  },

  loadAPIConfig() {
    const saved = localStorage.getItem('cp2077_api_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        this.apiConfig = { ...this.apiConfig, ...config };
      } catch (e) {
        console.warn('Failed to load API config:', e);
      }
    }
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  openDialogue() {
    this.openPanel();
    if (!this.currentNode) {
      this.addSystemMessage('[系统] 请先选择一个剧情节点开始对话');
    }
  }
};

// Keyboard shortcut to open dialogue panel
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    NPCDialogueSystem.openDialogue();
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => NPCDialogueSystem.init());
} else {
  NPCDialogueSystem.init();
}
