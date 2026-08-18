import { describe, expect, it } from 'vitest';
import { createCharacterUpdateInput, getCharacterEditFormState } from '../src/characterEditModel';
import type { DeathmatchCharacter } from '../src/types';

function character(status: DeathmatchCharacter['status']): DeathmatchCharacter {
  return {
    public_id: 'character-1',
    name: 'Aria',
    description: 'Old description',
    status,
    remediation: status === 'active' || status === 'suspended'
      ? null
      : { violation_type: status, marked_at: '2026-08-18T00:00:00.000Z', submitted_at: null },
    class_id: 'mage'
  };
}

describe('character edit model', () => {
  it('updates only the active character description', () => {
    expect(createCharacterUpdateInput(character('active'), 'Aria', 'New description')).toEqual({
      input: { description: 'New description' },
      error: null
    });
  });

  it('requires every flagged field to change', () => {
    expect(createCharacterUpdateInput(character('all_violation'), 'Aria', 'New description').error).toBe('invalidOrUnchangedName');
    expect(createCharacterUpdateInput(character('all_violation'), 'Nova', 'Old description').error).toBe('unchangedDescription');
    expect(createCharacterUpdateInput(character('all_violation'), 'Nova', 'New description')).toEqual({
      input: { name: 'Nova', description: 'New description' },
      error: null
    });
  });

  it('keeps suspended characters disabled', () => {
    expect(getCharacterEditFormState(character('suspended'), 'Aria', 'New description').isSuspended).toBe(true);
  });
});
