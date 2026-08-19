import { createInstance } from 'i18next';
import { useEffect, useMemo, type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import type { DeathmodeI18nMode, DeathmodeLocale, NormalizedDeathmodeLocale } from './types';

const zhCN = {
  common: { processing: '处理中' },
  dashboard: {
    sidebar: { dashboard: '控制台', overview: '备战室', deathmatch: '死斗模式', characters: '角色列表', recentBattles: '最近战斗' },
    mode: { deathmatch: '死斗' },
    battleType: { practice: '练习赛', ranked: '排位赛' },
    status: { pending: '等待中', running: '进行中', done: '已完成', error: '异常', canceled: '已取消' },
    result: { win: '胜利', loss: '失败', draw: '平局', unresolved: '未结算' },
    active: { waiting: '等待结果' },
    actions: { viewReplay: '战斗回放' },
    recent: { vsSeparator: 'vs', replayUnavailable: '暂无战斗回放', ratingDelta: '积分 {{delta}}' },
    challenge: { challenger: '挑战对方', target: '他人挑战', revenge: '一键复仇' },
    matchLabel: {
      randomMatch: '随机匹配', systemMatch: '系统匹配', directChallengeStarted: '挑战对方', directChallengeReceived: '他人挑战'
    },
    matchLabelTooltip: {
      practiceRandomStarted: '我发起了这场练习赛', rankedRandomStarted: '我发起了这场排位赛',
      rankedSystemMatched: '别的玩家匹配到了我', directChallengeStarted: '我发起了指定挑战练习赛',
      directChallengeReceived: '别的玩家发起了指定挑战练习赛'
    },
    records: {
      pageAria: 'AgentDuel 死斗对战记录', kicker: 'battle records', title: '对战记录', modeTitle: '最近战斗',
      fixedModeCopy: '仅显示死斗对局；可继续按对局类型和胜负筛选。', filterButton: '筛选',
      filterButtonWithCount: '筛选 {{count}}', filterMenuAria: '筛选对战记录', activeFiltersAria: '当前对战记录筛选',
      challengeRole: { challenger: '挑战对方', target: '他人挑战' }, clearFilters: '清除全部', applyFilters: '确定',
      cancelFilters: '取消', removeFilter: '移除 {{label}}', loadFailed: '对战记录暂时无法加载，请稍后重试。',
      empty: '还没有对战记录。开始一场练习赛或排位赛后会显示在这里。', emptyFiltered: '当前筛选下没有对战记录。',
      loadMore: '加载更多', loadingMore: '加载中',
      loadingTexts: ['正在读取最近的对战记录', '按时间整理战斗轨迹', '同步排位和练习赛结果', '确认哪些战斗已经生成战斗回放']
    },
    modePage: {
      breadcrumbAria: '备战室位置导航',
      charactersCopy: '按最近有效参战时间排列。提交中的版本和需要处理的失败提交会单独显示，不会混入稳定状态。',
      compiling: '正在编译',
      status: '状态',
      record: '排位胜/平/负',
      unknownModel: '未标注模型'
    },
    attention: { title: '需要处理' },
    submission: {
      pending_compile: '等待编译', compiling: '编译中', compile_failed: '编译失败', rejected: '已拒绝'
    },
    remediation: {
      status: {
        name_violation: '名称待整改', description_violation: '简介待整改', all_violation: '资料待整改', suspended: '已停用'
      }
    },
    characters: {
      create: '新建角色', openDetail: '查看角色 {{name}}', empty: '还没有死斗角色。创建角色后就可以提交 Agent 并开始对战。'
    },
    codeSource: { default: '默认 Agent' },
    stats: { rating: '积分' },
    error: { retry: '重新加载' }
  },
  battleMap: {
    previewUnavailable: '地图预览暂不可用。',
    names: { default_arena: '基础地图', reedbank_ruins: '苇岸遗迹', thicket_maze: '草丛迷宫', four_corners_ruins: '四隅遗迹' },
    descriptions: { deathmatch: {
      default_arena: '开放式基础死斗地图。', reedbank_ruins: '由河岸、遗迹和草丛组成的死斗地图。',
      thicket_maze: '拥有密集草丛和狭窄路线的死斗地图。', four_corners_ruins: '四角遗迹围绕中央区域展开的死斗地图。'
    } }
  },
  replay: { class: { warrior: '战士', mage: '法师', hunter: '猎人' } },
  characters: {
    create: {
      pageAria: '新建死斗角色', breadcrumbAria: '新建角色导航', loading: '正在读取角色槽位和职业列表',
      kicker: 'deathmatch setup', title: '新建死斗角色', copy: '选择一个职业，确认它的技能节奏和适合作战方式，再创建你的 1v1 死斗角色。',
      slotsAria: '角色槽位', remainingSlots: '剩余槽位', classSelectionTitle: '选择职业', classSelectionAria: '选择死斗职业',
      classUnavailable: '暂不可用', profileKicker: '战术剖面', profileStatsAria: '职业基础数值', combatTitle: '适合作战', skillsTitle: '职业技能',
      stats: { hp: '血量', actionPoints: '每回合行动力', basicAttackRange: '普攻距离' },
      range: { self: '自身', selfAround: '自身周围 1 格', cells: '{{range}} 格' },
      full: { title: '角色槽位已满', copy: '当前账号没有可用角色槽位。删除不再使用的角色后，才能继续创建新的死斗角色。', backToDashboard: '返回备战室' },
      form: {
        kicker: 'character record', title: '角色资料', nameLabel: '角色名称', namePlaceholder: '例如 Cold Start',
        nameHelp: '仅支持汉字、空格和大小写英文字母，当前长度 {{count}}/{{max}}。', nameImmutableHelp: '角色名称创建后不允许修改。',
        create: '创建角色', creating: '创建中', errors: {
          invalidName: '角色名称仅支持汉字、空格和大小写英文字母；汉字计 2，英文字母和空格计 1，总长度最多 10。',
          classUnavailable: '当前职业不可创建，请选择一个可用职业。', submitFailed: '角色创建失败，请稍后重试。'
        }
      },
      error: { kicker: 'character', title: '新建角色页无法加载', copy: '检查登录状态、网络或后端服务后重新加载。', retry: '重新加载' },
      classes: {
        warrior: { name: '战士', tagline: '近战压制', combat: '适合主动接近、逼迫换血和用控制限制对手路线。依靠冲锋接近、断筋留人、流血制造持续伤害。' },
        mage: { name: '法师', tagline: '爆发与控制', combat: '适合中距离爆发、控场和反制近战。依靠减速、闪现、冰霜新星拉开空间，再用火球术或魔杖普攻收割。' },
        hunter: { name: '猎人', tagline: '远程控距', combat: '适合远程压制、沉默关键技能并围绕 2 到 4 格距离作战。逃脱和陷阱能帮助重新拉开距离。' }
      },
      skillMeta: { cost: '消耗', range: '射程', cooldown: '冷却' },
      skills: {
        warrior: {
          charge: { name: '冲锋', effect: '沿可通行路径冲到目标相邻格，并施加眩晕，不造成伤害。' },
          hamstring: { name: '断筋', effect: '施加减速，使目标移动消耗增加。' },
          intimidatingShout: { name: '破胆怒吼', effect: '施加恐惧，限制目标主动靠近来源单位。' },
          bleed: { name: '流血', effect: '造成 1 点伤害，并施加流血持续伤害。' },
          basicAttack: { name: '近距离普攻', effect: '造成 2 点伤害。' }
        },
        mage: {
          frostbolt: { name: '寒冰箭', effect: '造成 1 点伤害，并施加减速。' },
          fireball: { name: '火球术', effect: '造成 2 点伤害，并施加灼烧。' },
          blink: { name: '闪现', effect: '朝当前朝向前方最多瞬移 3 格。' },
          frostNova: { name: '冰霜新星', effect: '对自身周围 1 格命中的目标造成 2 点伤害并施加定身。' },
          wandAttack: { name: '魔杖普攻', effect: '造成 2 点伤害。' }
        },
        hunter: {
          silencingShot: { name: '沉默射击', effect: '造成 1 点伤害并施加沉默，阻止目标释放技能。' },
          serpentSting: { name: '毒蛇钉刺', effect: '造成 1 点伤害，并施加毒素。' },
          disengage: { name: '逃脱', effect: '朝当前朝向后方最多后跳 3 格。' },
          freezingTrap: { name: '冰冻陷阱', effect: '在相邻 1 格放置陷阱，敌人踩中后施加定身。' },
          bowAttack: { name: '弓箭普攻', effect: '造成 2 点伤害。' }
        }
      }
    },
    detail: { loading: '正在读取角色详情', error: { kicker: 'character', title: '角色详情无法加载', copy: '角色不存在、无权访问，或当前登录状态已失效。', retry: '重新加载' } },
    edit: {
      pageAria: '编辑角色资料', breadcrumbAria: '编辑角色导航', kicker: 'character profile', title: '编辑角色资料',
      copy: '通常只能调整公开简介；名称被标记需要整改时会临时开放修改。', formTitle: '资料设置', nameLabel: '角色名称',
      nameImmutableHelp: '角色名称创建后不允许修改。', nameRemediationHelp: '请输入与当前名称不同的新名称。', descriptionLabel: '角色介绍',
      descriptionHelp: '{{count}}/300', cancel: '取消', save: '保存简介', submitRemediation: '提交整改内容', saving: '保存中',
      requiredNotice: '公开资料存在违规项，请修改被标记的字段后提交。', submittedNotice: '修改已提交，正在等待管理员审核；等待期间仍可再次修改。',
      suspendedNotice: '该角色已停用，不能通过此页面解除。', errors: {
        invalidOrUnchangedName: '请输入符合规则且与当前名称不同的新名称。', unchangedDescription: '请输入与当前简介不同的新简介。',
        invalidDescription: '角色介绍不能超过 300 个字符。', saveFailed: '角色介绍保存失败，请稍后重试。'
      }
    }
  }
};

const enUS = {
  common: { processing: 'Processing' },
  dashboard: {
    sidebar: { dashboard: 'Dashboard', overview: 'Overview', deathmatch: 'Deathmatch', characters: 'Character list', recentBattles: 'Recent battles' }, mode: { deathmatch: 'Deathmatch' },
    battleType: { practice: 'Practice', ranked: 'Ranked' },
    status: { pending: 'Pending', running: 'Running', done: 'Done', error: 'Error', canceled: 'Canceled' },
    result: { win: 'Win', loss: 'Loss', draw: 'Draw', unresolved: 'Unresolved' }, active: { waiting: 'Waiting' },
    actions: { viewReplay: 'Watch replay' }, recent: { vsSeparator: 'vs', replayUnavailable: 'No replay', ratingDelta: 'Rating {{delta}}' },
    challenge: { challenger: 'Challenge opponent', target: 'Challenged by others', revenge: 'Revenge' },
    matchLabel: { randomMatch: 'Random match', systemMatch: 'System match', directChallengeStarted: 'Challenged target', directChallengeReceived: 'Other player challenge' },
    matchLabelTooltip: { practiceRandomStarted: 'I started this practice battle', rankedRandomStarted: 'I started this ranked battle', rankedSystemMatched: 'Another player matched with me', directChallengeStarted: 'I started this direct practice challenge', directChallengeReceived: 'Another player started this direct practice challenge' },
    records: {
      pageAria: 'AgentDuel deathmatch battle records', kicker: 'battle records', title: 'Battle records', modeTitle: 'Deathmatch recent battles',
      fixedModeCopy: 'Showing deathmatch battles only. Filter further by match type and result.', filterButton: 'Filter', filterButtonWithCount: 'Filter {{count}}',
      filterMenuAria: 'Filter battle records', activeFiltersAria: 'Current battle record filters', challengeRole: { challenger: 'Challenge opponent', target: 'Challenged by others' },
      clearFilters: 'Clear all', applyFilters: 'Apply', cancelFilters: 'Cancel', removeFilter: 'Remove {{label}}', loadFailed: 'Battle records could not load. Try again later.',
      empty: 'No battle records yet. Start a practice or ranked battle to see it here.', emptyFiltered: 'No battle records match the current filters.',
      loadMore: 'Load more', loadingMore: 'Loading', loadingTexts: ['Reading recent battle records', 'Sorting battle traces by time', 'Syncing ranked and practice results', 'Checking which battles have replays']
    },
    modePage: {
      breadcrumbAria: 'Dashboard location navigation',
      charactersCopy: 'Ordered by last valid participation. In-progress and actionable failed submissions are kept outside stable rows.',
      compiling: 'Compiling', status: 'Status', record: 'Ranked W / D / L', unknownModel: 'Unspecified model'
    },
    attention: { title: 'Needs attention' },
    submission: {
      pending_compile: 'Waiting to compile', compiling: 'Compiling', compile_failed: 'Compilation failed', rejected: 'Rejected'
    },
    remediation: {
      status: {
        name_violation: 'Name change required', description_violation: 'Description change required',
        all_violation: 'Profile changes required', suspended: 'Suspended'
      }
    },
    characters: {
      create: 'New character', openDetail: 'View character {{name}}',
      empty: 'No deathmatch characters yet. Create one to submit an Agent and start battles.'
    },
    codeSource: { default: 'Default Agent' },
    stats: { rating: 'Rating' },
    error: { retry: 'Reload' }
  },
  battleMap: { previewUnavailable: 'Map preview is unavailable.', names: { default_arena: 'Basic Map', reedbank_ruins: 'Reedbank Ruins', thicket_maze: 'Thicket Maze', four_corners_ruins: 'Four Corners Ruins' }, descriptions: { deathmatch: { default_arena: 'An open basic deathmatch map.', reedbank_ruins: 'A deathmatch map with banks, ruins, and brush.', thicket_maze: 'A deathmatch map with dense brush and narrow routes.', four_corners_ruins: 'A deathmatch map built around four corner ruins.' } } },
  replay: { class: { warrior: 'Warrior', mage: 'Mage', hunter: 'Hunter' } },
  characters: {
    create: {
      pageAria: 'New deathmatch character', breadcrumbAria: 'New character navigation', loading: 'Loading character slots and classes', kicker: 'deathmatch setup',
      title: 'New deathmatch character', copy: 'Choose a class, review its skills and combat role, then create your 1v1 deathmatch character.', slotsAria: 'Character slots',
      remainingSlots: 'Open slots', classSelectionTitle: 'Choose class', classSelectionAria: 'Choose a deathmatch class', classUnavailable: 'Unavailable', profileKicker: 'Tactical profile',
      profileStatsAria: 'Class base stats', combatTitle: 'Best for', skillsTitle: 'Class skills', stats: { hp: 'HP', actionPoints: 'AP per turn', basicAttackRange: 'Basic range' },
      range: { self: 'Self', selfAround: 'Self plus 1 cell', cells: '{{range}} cells' }, full: { title: 'Character slots are full', copy: 'This account has no open character slots. Delete an unused character before creating another deathmatch character.', backToDashboard: 'Back to dashboard' },
      form: { kicker: 'character record', title: 'Character details', nameLabel: 'Character name', namePlaceholder: 'For example Cold Start', nameHelp: 'Only Han characters, spaces, and uppercase and lowercase English letters are supported. Current length: {{count}}/{{max}}.', nameImmutableHelp: 'Character names cannot be changed after creation.', create: 'Create character', creating: 'Creating', errors: { invalidName: 'Use only Han characters, spaces, and A-Z or a-z letters. Han characters count as 2, letters and spaces count as 1, and the maximum total is 10.', classUnavailable: 'This class cannot be created right now. Choose an available class.', submitFailed: 'Could not create the character. Try again later.' } },
      error: { kicker: 'character', title: 'New character page could not load', copy: 'Check your session, network, or backend service, then reload.', retry: 'Reload' },
      classes: { warrior: { name: 'Warrior', tagline: 'Melee pressure', combat: 'Best for closing distance, forcing trades, and using control to limit enemy routes.' }, mage: { name: 'Mage', tagline: 'Burst and control', combat: 'Best for mid-range burst, control, and countering melee pressure.' }, hunter: { name: 'Hunter', tagline: 'Ranged spacing', combat: 'Best for ranged pressure and fighting around the 2 to 4 cell band.' } },
      skillMeta: { cost: 'Cost', range: 'Range', cooldown: 'Cooldown' },
      skills: {
        warrior: { charge: { name: 'Charge', effect: 'Move to an adjacent cell and stun without damage.' }, hamstring: { name: 'Hamstring', effect: 'Apply slow.' }, intimidatingShout: { name: 'Intimidating Shout', effect: 'Apply fear.' }, bleed: { name: 'Bleed', effect: 'Deal 1 damage and apply bleed.' }, basicAttack: { name: 'Melee basic attack', effect: 'Deal 2 damage.' } },
        mage: { frostbolt: { name: 'Frostbolt', effect: 'Deal 1 damage and apply slow.' }, fireball: { name: 'Fireball', effect: 'Deal 2 damage and apply burn.' }, blink: { name: 'Blink', effect: 'Teleport up to 3 cells forward.' }, frostNova: { name: 'Frost Nova', effect: 'Deal 2 damage and root nearby targets.' }, wandAttack: { name: 'Wand attack', effect: 'Deal 2 damage.' } },
        hunter: { silencingShot: { name: 'Silencing Shot', effect: 'Deal 1 damage and apply silence.' }, serpentSting: { name: 'Serpent Sting', effect: 'Deal 1 damage and apply toxin.' }, disengage: { name: 'Disengage', effect: 'Jump up to 3 cells backward.' }, freezingTrap: { name: 'Freezing Trap', effect: 'Place a hidden adjacent trap that roots.' }, bowAttack: { name: 'Bow attack', effect: 'Deal 2 damage.' } }
      }
    },
    detail: { loading: 'Loading character detail', error: { kicker: 'character', title: 'Character detail could not load', copy: 'The character may not exist, may not belong to this account, or the session expired.', retry: 'Reload' } },
    edit: { pageAria: 'Edit character profile', breadcrumbAria: 'Edit character navigation', kicker: 'character profile', title: 'Edit character profile', copy: 'Normally only the public description can change. Name editing is temporarily unlocked when the name requires remediation.', formTitle: 'Profile settings', nameLabel: 'Character name', nameImmutableHelp: 'Character names cannot be changed after creation.', nameRemediationHelp: 'Enter a valid name that differs from the current name.', descriptionLabel: 'Character description', descriptionHelp: '{{count}}/300', cancel: 'Cancel', save: 'Save description', submitRemediation: 'Submit changes', saving: 'Saving', requiredNotice: 'This public profile has a flagged field. Change every required field before submitting.', submittedNotice: 'Your changes are awaiting administrator review. You can make further changes while you wait.', suspendedNotice: 'This character is suspended and cannot be restored from this page.', errors: { invalidOrUnchangedName: 'Enter a valid name that differs from the current name.', unchangedDescription: 'Enter a description that differs from the current description.', invalidDescription: 'Character description must not exceed 300 characters.', saveFailed: 'Could not save the character description. Try again later.' } }
  }
};

export function normalizeLocale(locale: DeathmodeLocale): NormalizedDeathmodeLocale {
  return locale === 'en-US' || locale === 'en_US' ? 'en-US' : 'zh-CN';
}

export function DeathmodeI18nBoundary({
  children,
  locale,
  mode = 'bundled'
}: {
  children: ReactNode;
  locale: NormalizedDeathmodeLocale;
  mode?: DeathmodeI18nMode;
}) {
  const i18n = useMemo(() => {
    const instance = createInstance();
    void instance.use(initReactI18next).init({
      fallbackLng: 'zh-CN',
      initAsync: false,
      interpolation: { escapeValue: false },
      lng: locale,
      resources: {
        'zh-CN': { translation: zhCN },
        'en-US': { translation: enUS }
      }
    });
    return instance;
  }, []);

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  return mode === 'host' ? children : <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
