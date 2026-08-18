import type { CharacterClassId, EnabledCharacterClass } from './types';

export interface CharacterSkillProfile {
  skillId: string;
  cost: number;
  range: string;
  cooldown: number;
  i18nKey: string;
}

export interface CharacterClassProfile {
  classId: CharacterClassId;
  hp: number;
  actionPoints: number;
  basicAttackRange: string;
  logoUrl: string;
  i18nKey: string;
  skills: readonly CharacterSkillProfile[];
}

export interface CharacterClassOption {
  classId: CharacterClassId;
  isAvailable: boolean;
  profile: CharacterClassProfile;
}

export const characterClassOrder: readonly CharacterClassId[] = ['warrior', 'mage', 'hunter'];
export const characterNameMaxLength = 10;

const characterNameAllowedPattern = /^[\p{Script=Han}A-Za-z ]+$/u;
const hanCharacterPattern = /^\p{Script=Han}$/u;

export const characterClassProfiles: Record<CharacterClassId, CharacterClassProfile> = {
  warrior: {
    classId: 'warrior', hp: 5, actionPoints: 3, basicAttackRange: '1',
    logoUrl: '/resources/v1/character/class/warrior/logo.png', i18nKey: 'warrior',
    skills: [
      { skillId: 'charge', cost: 3, range: '2', cooldown: 3, i18nKey: 'charge' },
      { skillId: 'hamstring', cost: 2, range: '1', cooldown: 2, i18nKey: 'hamstring' },
      { skillId: 'intimidatingShout', cost: 3, range: '2', cooldown: 4, i18nKey: 'intimidatingShout' },
      { skillId: 'bleed', cost: 2, range: '1', cooldown: 4, i18nKey: 'bleed' },
      { skillId: 'basicAttack', cost: 3, range: '1', cooldown: 0, i18nKey: 'basicAttack' }
    ]
  },
  mage: {
    classId: 'mage', hp: 4, actionPoints: 3, basicAttackRange: '2',
    logoUrl: '/resources/v1/character/class/mage/logo.png', i18nKey: 'mage',
    skills: [
      { skillId: 'frostbolt', cost: 2, range: '4', cooldown: 2, i18nKey: 'frostbolt' },
      { skillId: 'fireball', cost: 3, range: '4', cooldown: 2, i18nKey: 'fireball' },
      { skillId: 'blink', cost: 3, range: 'self', cooldown: 3, i18nKey: 'blink' },
      { skillId: 'frostNova', cost: 2, range: 'self-1', cooldown: 4, i18nKey: 'frostNova' },
      { skillId: 'wandAttack', cost: 2, range: '2', cooldown: 0, i18nKey: 'wandAttack' }
    ]
  },
  hunter: {
    classId: 'hunter', hp: 4, actionPoints: 3, basicAttackRange: '2-4',
    logoUrl: '/resources/v1/character/class/hunter/logo.png', i18nKey: 'hunter',
    skills: [
      { skillId: 'silencingShot', cost: 3, range: '2-4', cooldown: 3, i18nKey: 'silencingShot' },
      { skillId: 'serpentSting', cost: 3, range: '2-4', cooldown: 4, i18nKey: 'serpentSting' },
      { skillId: 'disengage', cost: 2, range: 'self', cooldown: 2, i18nKey: 'disengage' },
      { skillId: 'freezingTrap', cost: 2, range: '1', cooldown: 4, i18nKey: 'freezingTrap' },
      { skillId: 'bowAttack', cost: 2, range: '2-4', cooldown: 0, i18nKey: 'bowAttack' }
    ]
  }
};

export function createCharacterClassOptions(enabledClasses: readonly EnabledCharacterClass[]): CharacterClassOption[] {
  const enabledClassIds = new Set(enabledClasses.map((item) => item.class_id));
  return characterClassOrder.map((classId) => ({
    classId,
    isAvailable: enabledClassIds.has(classId),
    profile: characterClassProfiles[classId]
  }));
}

export function getDefaultCharacterClassId(options: readonly CharacterClassOption[]): CharacterClassId {
  return options.find((option) => option.isAvailable)?.classId ?? characterClassOrder[0];
}

export function getCharacterNameWeightedLength(value: string): number {
  return Array.from(value.trim()).reduce(
    (length, character) => length + (hanCharacterPattern.test(character) ? 2 : 1),
    0
  );
}

export function isCharacterNameValid(value: string): boolean {
  const length = getCharacterNameWeightedLength(value);
  return length >= 1 && length <= characterNameMaxLength && characterNameAllowedPattern.test(value);
}

export function getCharacterNameHelpParams(value: string): {
  count: number;
  max: number;
  hasInvalidCharacters: boolean;
  isOverLimit: boolean;
  isInvalid: boolean;
} {
  const count = getCharacterNameWeightedLength(value);
  const hasInvalidCharacters = value.length > 0 && !characterNameAllowedPattern.test(value);
  const isOverLimit = count > characterNameMaxLength;
  return {
    count,
    max: characterNameMaxLength,
    hasInvalidCharacters,
    isOverLimit,
    isInvalid: value.length > 0 && !isCharacterNameValid(value)
  };
}

export function joinAssetUrl(assetBaseUrl: string, assetPath: string): string {
  if (!assetBaseUrl) return assetPath;
  return `${assetBaseUrl.replace(/\/$/, '')}/${assetPath.replace(/^\//, '')}`;
}
