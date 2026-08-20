import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AgentDuelCharacterGuestBasic,
  AgentDuelCharacterOwnerBasic,
  AgentDuelCharacterOwnerBattleRecords,
  AgentDuelCharacterOwnerCodeSubmission,
  AgentDuelCharacterOwnerCodeVersions
} from '../src/character-detail';

const owner = {
  public_id: 'character-1', slot_no: 1, name: 'Alpha', description: 'Owner description', status: 'active' as const,
  class_id: 'mage' as const, api_key: 'secret', code_source: 'custom' as const, ranked_rating: 920,
  ranked_matches: 10, ranked_wins: 6, ranked_losses: 3, ranked_draws: 1, updated_at: '2026-08-01T00:00:00.000Z'
};

describe('character detail sections', () => {
  it('renders owner edit action and controlled battle tabs', () => {
    const html = renderToStaticMarkup(createElement(AgentDuelCharacterOwnerBasic, {
      activeBattleType: 'ranked', canStartBattle: true, character: owner, editHref: '/edit',
      onBattleTypeChange: () => undefined, onStartBattle: () => undefined
    }));
    expect(html).toContain('/edit');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('Alpha');
  });

  it('renders guest rating and host-provided challenge link', () => {
    const html = renderToStaticMarkup(createElement(AgentDuelCharacterGuestBasic, {
      challengeHref: '/challenge',
      character: { name: owner.name, description: owner.description, class_id: owner.class_id, ranked_rating: owner.ranked_rating, ranked_wins: 6, ranked_draws: 1, ranked_losses: 3 },
      locale: 'en-US'
    }));
    expect(html).toContain('/challenge');
    expect(html).toContain('920');
    expect(html).toContain('Challenge');
    expect(html).toContain('character-detail-battle-button');
  });

  it('uses a host editor and host-generated battle links', () => {
    const editorHtml = renderToStaticMarkup(createElement(AgentDuelCharacterOwnerCodeSubmission, {
      activeTab: 'manual', apiKey: 'secret-key', apiKeyError: null, apiKeyVisible: false,
      copiedApiKey: false, copiedPrompt: false, isRotatingApiKey: false, isSubmitting: false,
      manualSourceCode: 'export default 1', manualSubmitError: null, manualSubmitNotice: null,
      prompt: 'First line\nSecond line', sourceStatus: 'ready', locale: 'en-US',
      onCopyApiKey: () => undefined, onCopyPrompt: () => undefined,
      onManualSourceCodeChange: () => undefined, onRotateApiKey: () => undefined,
      onSubmitManualCode: () => undefined, onTabChange: () => undefined, onToggleApiKey: () => undefined,
      renderCodeEditor: ({ value }) => createElement('div', { 'data-host-editor': true }, value)
    }));
    expect(editorHtml).toContain('data-host-editor="true"');
    expect(editorHtml).toContain('Submit code');

    const battleHtml = renderToStaticMarkup(createElement(AgentDuelCharacterOwnerBattleRecords, {
      battles: [{
        public_id: 'battle-1', share_path: '/b/one', battle_type: 'practice', game_mode_id: 'deathmatch',
        map_id: 'default_arena', status: 'done', winner_side: 'red', replay_available: true,
        created_at: '2026-08-01T00:00:00.000Z', participants: [
          { side: 'red', kind: 'character', public_id: 'character-1', name: 'Alpha', rating_delta: null },
          { side: 'blue', kind: 'character', public_id: 'character-2', name: 'Beta', rating_delta: null }
        ]
      }],
      error: null, hasMore: true, ownerCharacterPublicId: 'character-1', status: 'ready',
      getCharacterHref: (publicId) => `/characters/${publicId}`,
      getReplayHref: () => '/replays/one', getRevengeHref: () => '/revenge/one',
      onLoadMore: () => undefined
    }));
    expect(battleHtml).toContain('/characters/character-2');
    expect(battleHtml).toContain('/replays/one');
    expect(battleHtml).toContain('/revenge/one');
    expect(battleHtml).toContain('dashboard-battle-row battle-record-row');
    expect(battleHtml).toContain('battle-map-label');
    expect(battleHtml).toContain('battle-map-tooltip');
    expect(battleHtml).toContain('character-battle-record-actions');
  });

  it('caps available versions at ten newest records', () => {
    const versions = Array.from({ length: 12 }, (_, index) => ({
      public_id: `version-${index}`, version_no: index + 1, status: 'compiled' as const, diagnostics: [],
      ai_model: index === 11 ? 'DeepSeek-R1' : null, change_summary: `Summary ${index + 1}`, completed_at: null,
      created_at: `2026-08-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`, is_current: false, is_available: true
    }));
    const html = renderToStaticMarkup(createElement(AgentDuelCharacterOwnerCodeVersions, {
      codeVersions: { compiled_versions: versions, latest_submission: null }, error: null,
      settingVersionId: null, status: 'ready', onRetry: () => undefined, onSetCurrentVersion: () => undefined
    }));
    expect((html.match(/character-detail-version-card/g) ?? []).length).toBe(10);
    expect(html).toContain('Summary 12');
    expect(html).not.toContain('>Summary 1<');
    expect(html).not.toContain('可用版本');
    expect(html).toContain('src="https://www.agentduel.app/model/logos/deepseek.svg"');
  });

  it('keeps prompt line breaks and fixes only the manual editor at 400px', () => {
    const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
    expect(styles).toMatch(/\.character-detail-prompt\s*\{[^}]*white-space:\s*pre-wrap/s);
    expect(styles).toMatch(/\.character-detail-code-editor\s*\{[^}]*height:\s*400px/s);
  });

  it('keeps the guest challenge link the same compact brown button as start battle', () => {
    const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
    expect(styles).toMatch(/\.character-detail-guest-action\s*\{[^}]*width:\s*max-content[^}]*min-width:\s*0/s);
    expect(styles).toMatch(/\.character-detail-guest-action\s*>\s*a\.duel-button\.character-detail-battle-button\s*\{[^}]*width:\s*auto[^}]*color:\s*var\(--duel-surface\)/s);
  });
});
