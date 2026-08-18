import { isCharacterNameValid } from './characterModel';
import type { CharacterUpdateInput, DeathmatchCharacter } from './types';

export type CharacterEditValidationError =
  | 'invalidOrUnchangedName'
  | 'unchangedDescription'
  | 'invalidDescription';

export interface CharacterEditFormState {
  requiresName: boolean;
  requiresDescription: boolean;
  isNameInvalid: boolean;
  isDescriptionInvalid: boolean;
  hasRequiredChange: boolean;
  isSuspended: boolean;
}

export function getCharacterEditFormState(
  character: DeathmatchCharacter,
  name: string,
  description: string
): CharacterEditFormState {
  const requiresName = character.status === 'name_violation' || character.status === 'all_violation';
  const requiresDescription = character.status === 'description_violation' || character.status === 'all_violation';
  return {
    requiresName,
    requiresDescription,
    isNameInvalid: requiresName && !isCharacterNameValid(name),
    isDescriptionInvalid: description.trim().length > 300,
    hasRequiredChange: character.status === 'active'
      ? description.trim() !== (character.description ?? '').trim()
      : (!requiresName || name.trim() !== character.name)
        && (!requiresDescription || description.trim() !== (character.description ?? '').trim()),
    isSuspended: character.status === 'suspended'
  };
}

export function createCharacterUpdateInput(
  character: DeathmatchCharacter,
  name: string,
  description: string
): { input: CharacterUpdateInput | null; error: CharacterEditValidationError | null } {
  const normalizedName = name.trim();
  const normalizedDescription = description.trim();
  const state = getCharacterEditFormState(character, name, description);
  if (state.requiresName && (!isCharacterNameValid(name) || normalizedName === character.name)) {
    return { input: null, error: 'invalidOrUnchangedName' };
  }
  if (state.requiresDescription && normalizedDescription === (character.description ?? '').trim()) {
    return { input: null, error: 'unchangedDescription' };
  }
  if (state.isDescriptionInvalid) {
    return { input: null, error: 'invalidDescription' };
  }

  const input: CharacterUpdateInput = {};
  if (state.requiresName) input.name = normalizedName;
  if (state.requiresDescription || normalizedDescription !== (character.description ?? '').trim()) {
    input.description = normalizedDescription;
  }
  return { input, error: null };
}
