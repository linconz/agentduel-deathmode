import { describe, expect, it } from 'vitest';
import {
  createCharacterClassOptions,
  getCharacterNameHelpParams,
  getDefaultCharacterClassId,
  isCharacterNameValid
} from '../src/characterModel';

describe('character model', () => {
  it('keeps the three classes in a stable order and honors availability', () => {
    const options = createCharacterClassOptions([{ class_id: 'mage', sort_order: 20 }]);
    expect(options.map((option) => option.classId)).toEqual(['warrior', 'mage', 'hunter']);
    expect(options.map((option) => option.isAvailable)).toEqual([false, true, false]);
    expect(getDefaultCharacterClassId(options)).toBe('mage');
  });

  it('uses the backend weighted character-name rule', () => {
    expect(isCharacterNameValid('寒冰 Mage')).toBe(true);
    expect(isCharacterNameValid('Mage1')).toBe(false);
    expect(getCharacterNameHelpParams('寒冰 Mages').count).toBe(10);
  });
});
