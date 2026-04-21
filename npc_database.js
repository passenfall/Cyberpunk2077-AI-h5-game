// ==========================================
// Cyberpunk 2077 TRPG - NPC Database
// ==========================================

const NPCDatabase = {
  characters: {},
  slangDictionary: {},
  worldbook: {},

  init() {
    this.characters = {
      v: {
        id: "v",
        name: "V",
        role: "雇佣兵/玩家角色",
        personality: {
          traits: ["坚韧", "机智", "重情义", "略带叛逆"],
          tone: "直接、干练，偶尔带点黑色幽默",
          quirks: ["喜欢用夜之城俚语", "危机时刻保持冷静"]
        },
        background: "夜之城街头出身的雇佣兵，擅长黑客技术和街头生存",
        relationships: {
          jackson_welles: "生死兄弟",
          t_bug: "可靠的黑客搭档",
          judy_alvarez: "潜在盟友/浪漫线",
          panam_palmer: "潜在盟友/浪漫线"
        },
        slang: ["chrome", "gonk", "choom", "preem", "delta"],
        api_config: {
          system_prompt: "你是赛博朋克2077中的V，一个夜之城的雇佣兵。你性格坚韧机智，说话直接干练，偶尔带点黑色幽默。你来自街头，擅长黑客技术和生存技能。",
          temperature: 0.8,
          max_tokens: 150
        }
      },

      jackson_welles: {
        id: "jackson_welles",
        name: "杰克·威尔斯",
        role: "V的搭档/兄弟",
        personality: {
          traits: ["豪爽", "忠诚", "乐观", "重家庭"],
          tone: "热情洋溢，经常使用西班牙语俚语，充满街头气息",
          quirks: ["喜欢叫V'伙计'(amigo)", "总是提到他妈妈做的菜", "对成为传奇充满渴望"]
        },
        background: "瓦伦蒂诺帮出身，后成为自由雇佣兵。梦想是和V一起成为夜之城的传奇人物",
        relationships: {
          v: "生死兄弟，最信任的搭档",
          mama_welles: "深爱的母亲"
        },
        slang: ["amigo", "vale", "pendejo", "órale"],
        api_config: {
          system_prompt: "你是杰克·威尔斯，V的搭档。你性格豪爽忠诚，说话热情洋溢，经常使用西班牙语俚语（如amigo、vale）。你来自瓦伦蒂诺帮，梦想和V一起成为夜之城的传奇。你总是提到你妈妈做的菜。",
          temperature: 0.9,
          max_tokens: 120
        }
      },

      t_bug: {
        id: "t_bug",
        name: "T-Bug",
        role: "网络黑客/远程支援",
        personality: {
          traits: ["冷静", "专业", "略带毒舌", "极度专注"],
          tone: "简洁、技术化，偶尔带点讽刺",
          quirks: ["用黑客术语说话", "对技术细节有强迫症", "不信任企业"]
        },
        background: "经验丰富的网络黑客，专门为企业级网络渗透提供技术支持",
        relationships: {
          v: "雇佣关系，但互相信任",
          jackson_welles: "同事关系"
        },
        slang: ["ICE", "daemon", "sub-net", "ping", "bricked"],
        api_config: {
          system_prompt: "你是T-Bug，一个专业的网络黑客。你说话简洁、技术化，经常使用黑客术语（如ICE、daemon、ping）。你性格冷静专业，略带毒舌，对技术细节有强迫症，不信任任何企业。",
          temperature: 0.7,
          max_tokens: 100
        }
      },

      judy_alvarez: {
        id: "judy_alvarez",
        name: "朱迪·阿尔瓦雷兹",
        role: "超梦编辑师/潜在盟友",
        personality: {
          traits: ["叛逆", "富有同情心", "技术天才", "理想主义"],
          tone: "直接、带点愤世嫉俗，但内心温暖",
          quirks: ["经常抽烟", "对不公正现象零容忍", "用'choom'称呼朋友"]
        },
        background: "前漩涡帮成员，现为freelance超梦编辑师。致力于为受害者伸张正义",
        relationships: {
          v: "潜在盟友，可能发展为浪漫关系",
          maiko: "复杂的前同事关系"
        },
        slang: ["choom", "braindance", "BD", "gonk"],
        api_config: {
          system_prompt: "你是朱迪·阿尔瓦雷兹，一个超梦编辑师。你叛逆但心地善良，说话直接，带点愤世嫉俗但内心温暖。你经常用'choom'称呼朋友，对不公正现象零容忍。你曾是漩涡帮成员。",
          temperature: 0.85,
          max_tokens: 130
        }
      },

      panam_palmer: {
        id: "panam_palmer",
        name: "帕南·帕尔默",
        role: "游牧民/潜在盟友",
        personality: {
          traits: ["独立", "暴躁但忠诚", "机械天才", "重视荣誉"],
          tone: "直接、强势，偶尔流露脆弱",
          quirks: ["热爱车辆和机械", "对背叛零容忍", "喜欢用'V'直接称呼"]
        },
        background: "阿德卡多游牧部落成员，因与首领冲突而独自行动。精通机械和战斗",
        relationships: {
          v: "潜在盟友，可能发展为浪漫关系",
          saul: "游牧部落首领，关系复杂"
        },
        slang: ["Aldecaldos", "nomad", "chrome", "gonk"],
        api_config: {
          system_prompt: "你是帕南·帕尔默，阿德卡多游牧部落的成员。你独立、暴躁但极其忠诚。你说话直接强势，偶尔流露脆弱的一面。你热爱车辆和机械，对背叛零容忍。你来自游牧部落。",
          temperature: 0.85,
          max_tokens: 130
        }
      },

      dexter_deshawn: {
        id: "dexter_deshawn",
        name: "德克斯特·德肖恩",
        role: "中间人/任务发布者",
        personality: {
          traits: ["精明", "野心勃勃", "表面友好但危险", "极度实用主义"],
          tone: "圆滑、充满魅力，但暗藏威胁",
          quirks: ["喜欢谈论'大生意'", "总是保持微笑但眼神冰冷", "用商业术语包装非法交易"]
        },
        background: "夜之城知名中间人，专门为企业和个人之间的'特殊交易'牵线搭桥",
        relationships: {
          v: "雇佣关系（利用）",
          jackson_welles: "临时雇佣关系",
          araka_corporation: "暗中合作"
        },
        slang: ["eddies", "fixer", "gig", "score"],
        api_config: {
          system_prompt: "你是德克斯特·德肖恩，一个老练的中间人(fixer)。你说话圆滑、充满魅力，但暗藏威胁。你喜欢谈论'大生意'，总是保持微笑但眼神冰冷。你用商业术语包装非法交易。",
          temperature: 0.75,
          max_tokens: 140
        }
      }
    };

    this.slangDictionary = {
      combat: {
        chrome: { term: "chrome", meaning: "义体/机械改造", example: "他装了太多chrome了" },
        gonk: { term: "gonk", meaning: "蠢货/白痴", example: "别像个gonk一样" },
        zeroed: { term: "zeroed", meaning: "击杀/干掉", example: "他被zeroed了" },
        flatline: { term: "flatline", meaning: "死亡/断线", example: "他在任务中flatline了" },
        bricked: { term: "bricked", meaning: "被破坏/变砖", example: "我的义眼被bricked了" }
      },
      tech: {
        ICE: { term: "ICE", meaning: "入侵对抗电子（防御系统）", example: "这道ICE太厚了" },
        daemon: { term: "daemon", meaning: "守护程序（黑客工具）", example: "部署一个daemon进去" },
        netrun: { term: "netrun", meaning: "网络黑客行为", example: "我去netrun那个节点" },
        "sub-net": { term: "sub-net", meaning: "子网", example: "从sub-net绕过去" },
        ping: { term: "ping", meaning: "探测/扫描", example: "ping一下那个IP" }
      },
      social: {
        choom: { term: "choom", meaning: "朋友/兄弟", example: "嘿，choom" },
        amigo: { term: "amigo", meaning: "朋友（西班牙语）", example: "没问题，amigo" },
        vale: { term: "vale", meaning: "好的/没问题（西班牙语）", example: "Vale，走吧" },
        eddies: { term: "eddies", meaning: "欧元/钱", example: "这单能赚多少eddies？" },
        gig: { term: "gig", meaning: "任务/工作", example: "有个新gig" },
        fixer: { term: "fixer", meaning: "中间人", example: "去找fixer接活" }
      },
      general: {
        preem: { term: "preem", meaning: "极好的/棒极了", example: "这计划太preem了" },
        nova: { term: "nova", meaning: "太棒了/酷", example: "Nova！我们出发" },
        drek: { term: "drek", meaning: "垃圾/糟糕的东西", example: "这装备简直是drek" },
        delta: { term: "delta", meaning: "离开", example: "我们该delta了" },
        "wake up": { term: "wake up", meaning: "清醒点", example: "Wake up，V！" }
      }
    };

    this.worldbook = {
      factions: {
        araka_corporation: {
          name: "荒坂公司",
          type: "巨型跨国企业",
          description: "日本巨型财阀，专注于网络安全、义体技术和人工智能。夜之城的实际统治者之一",
          attitude: "极度危险，资源无限",
          influence: 5
        },
        valentinos: {
          name: "瓦伦蒂诺帮",
          type: "街头帮派",
          description: "拉美裔为主的帮派，重视家庭和荣誉，在圣多明哥活动",
          attitude: "危险但有原则",
          influence: 3
        },
        aldecaldos: {
          name: "阿德卡多",
          type: "游牧部落",
          description: "北美最后的游牧部落之一，驾驶武装车辆穿越恶地",
          attitude: "中立，可结盟",
          influence: 3
        },
        tyger_claws: {
          name: "虎爪帮",
          type: "街头帮派",
          description: "由日本和韩国移民组成的帮派，控制着沃森区的非法活动",
          attitude: "极度暴力",
          influence: 4
        }
      },
      locations: {
        araka_tower: {
          name: "荒坂塔",
          type: "企业设施",
          description: "荒坂公司的总部大楼，安保级别极高",
          danger_level: 5,
          district: "市中心"
        },
        afterlife: {
          name: "来生酒吧",
          type: "酒吧/据点",
          description: "雇佣兵和中间人的聚集地，传说中的地方",
          danger_level: 1,
          district: "沃森"
        },
        night_city_downtown: {
          name: "夜之城市中心",
          type: "城市区域",
          description: "繁华但危险，企业势力与街头文化交汇",
          danger_level: 3,
          district: "市中心"
        },
        badlands: {
          name: "恶地",
          type: "荒野区域",
          description: "夜之城外的荒漠地带，游牧部落的领地",
          danger_level: 4,
          district: "郊外"
        }
      },
      concepts: {
        relic: {
          name: "Relic芯片",
          description: "荒坂公司开发的实验性芯片，能够保存人类意识",
          importance: "核心剧情物品"
        },
        braindance: {
          name: "超梦（BD）",
          description: "可以录制和回放他人体验的技术",
          importance: "常见技术"
        },
        cyberpsychosis: {
          name: "赛博精神病",
          description: "过度义体化导致的精神失常",
          importance: "社会问题"
        },
        ripperdoc: {
          name: "ripperdoc（义体医生）",
          description: "非法义体改造医生，为雇佣兵提供装备升级",
          importance: "常见服务"
        }
      }
    };
  },

  getCharacter(id) {
    return this.characters[id] || null;
  },

  getDialogueTemplate(characterId) {
    const character = this.getCharacter(characterId);
    if (!character) return null;
    
    return {
      personality: character.personality,
      slang: character.slang || [],
      api_config: character.api_config
    };
  },

  getSlang(characterId, category) {
    if (characterId && this.characters[characterId]?.slang) {
      return this.characters[characterId].slang;
    }
    if (category && this.slangDictionary[category]) {
      return Object.values(this.slangDictionary[category]).map(s => s.term);
    }
    return [];
  },

  getSlangMeaning(term) {
    for (const category of Object.values(this.slangDictionary)) {
      if (category[term]) {
        return category[term];
      }
    }
    return null;
  },

  getWorldEntry(key) {
    for (const category of Object.values(this.worldbook)) {
      if (category[key]) {
        return category[key];
      }
    }
    return null;
  },

  getAllNPCs() {
    return Object.values(this.characters);
  },

  async generateDialogue(characterId, context, playerInput) {
    const character = this.getCharacter(characterId);
    if (!character) {
      return "[系统] 角色不存在";
    }

    try {
      const response = await fetch(API_CONFIG.default.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: API_CONFIG.default.model,
          messages: [
            { role: "system", content: character.api_config.system_prompt },
            { role: "user", content: context + (playerInput ? `\n玩家说：${playerInput}` : "") }
          ],
          temperature: character.api_config.temperature || API_CONFIG.default.temperature,
          max_tokens: character.api_config.max_tokens || API_CONFIG.default.max_tokens
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch(e) {
      console.warn("API调用失败，使用预设对话:", e);
      return this.getPresetDialogue(characterId);
    }
  },

  async simulateTone(characterId, baseText) {
    const character = this.getCharacter(characterId);
    if (!character) return baseText;

    const slang = character.slang || [];
    if (slang.length > 0 && Math.random() > 0.5) {
      const randomSlang = slang[Math.floor(Math.random() * slang.length)];
      return baseText + ` ${randomSlang}`;
    }

    return baseText;
  },

  getPresetDialogue(characterId) {
    const dialogues = {
      jackson_welles: [
        "V，amigo！准备好了吗？我们要干一票大的！",
        "我妈做了她拿手的玉米卷，任务结束后去我家吃？",
        "我们要成为传奇，V！夜之城会记住我们的名字！"
      ],
      t_bug: [
        "ICE已经压制了，但时间不多。你只有30秒。",
        "检测到daemon程序异常，你的sub-net连接不稳定。",
        "别担心，我已经ping过了所有节点。安全。"
      ],
      judy_alvarez: [
        "Choomba，你看起来需要来段BD放松一下。",
        "这城市烂透了，但我们还能做点什么，对吧？",
        "别像个gonk一样，V。我们有更好的选择。"
      ],
      panam_palmer: [
        "V，我的车修好了。随时可以出发。",
        "游牧部落的人也许脾气暴躁，但我们言出必行。",
        "恶地的星空比夜之城的霓虹美多了。"
      ],
      dexter_deshawn: [
        "V，我有个大生意要跟你谈。绝对的preem deal。",
        "eddies不是问题，只要你把活儿干漂亮。",
        "来生酒吧见，我们详谈这个gig的细节。"
      ]
    };

    const options = dialogues[characterId];
    if (options && Array.isArray(options)) {
      return options[Math.floor(Math.random() * options.length)];
    }
    return "[系统] 暂无预设对话";
  }
};

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
    jackson_welles: { temperature: 0.9, max_tokens: 120 },
    t_bug: { temperature: 0.7, max_tokens: 100 },
    judy_alvarez: { temperature: 0.85, max_tokens: 130 },
    panam_palmer: { temperature: 0.85, max_tokens: 130 },
    dexter_deshawn: { temperature: 0.75, max_tokens: 140 }
  }
};

NPCDatabase.init();
