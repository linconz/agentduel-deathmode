import { describe, expect, it } from 'vitest';
import {
  createDeathmatchBattleRecordRows,
  filterDeathmatchBattleRecordRows,
  toggleBattleRecordFilter
} from '../src/battleModel';
import type { DeathmatchBattle } from '../src/types';

const battle: DeathmatchBattle = {
  public_id: 'battle-1',
  share_path: '/b/replay-1',
  battle_type: 'ranked',
  game_mode_id: 'deathmatch',
  map_id: 'default_arena',
  status: 'done',
  participants: [
    { side: 'red', kind: 'character', public_id: 'mine', name: 'Mine', rating_delta: 16 },
    { side: 'blue', kind: 'character', public_id: 'enemy', name: 'Enemy', rating_delta: -16 }
  ],
  winner_side: 'red',
  replay_available: true,
  created_at: '2026-08-18T00:00:00.000Z'
};

describe('deathmatch battle model', () => {
  it('builds owner-aware battle rows and replay links', () => {
    const [row] = createDeathmatchBattleRecordRows([battle], new Set(['mine']));
    expect(row?.result).toBe('win');
    expect(row?.ownHref).toBe('/characters/mine');
    expect(row?.opponentHref).toBe('/characters/public/enemy');
    expect(row?.replayHref).toBe('/b/replay-1');
  });

  it('filters and toggles without a game-mode filter', () => {
    const filters = toggleBattleRecordFilter(
      { battleTypes: [], challengeRoles: [], results: [] },
      { kind: 'result', value: 'win' }
    );
    const rows = createDeathmatchBattleRecordRows([battle], new Set(['mine']));
    expect(filterDeathmatchBattleRecordRows(rows, filters)).toHaveLength(1);
  });

  it('lets an embedded host replace every navigation target', () => {
    const [row] = createDeathmatchBattleRecordRows([battle], new Set(['mine']), {
      getCharacterHref: (publicId, view) => `/plugin/characters/${view}/${publicId}`,
      getReplayHref: (source) => `/plugin/replays/${source.public_id}`,
      getRevengeHref: () => null
    });
    expect(row?.ownHref).toBe('/plugin/characters/owned/mine');
    expect(row?.opponentHref).toBe('/plugin/characters/public/enemy');
    expect(row?.replayHref).toBe('/plugin/replays/battle-1');
    expect(row?.revengeHref).toBeNull();
  });
});
