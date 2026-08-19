import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AgentDuelCharacterList } from '../src/AgentDuelCharacterList';
import type { DeathmatchCharacterListItem } from '../src/types';

function createCharacter(overrides: Partial<DeathmatchCharacterListItem> = {}): DeathmatchCharacterListItem {
  return {
    public_id: 'character-1',
    name: 'Cold Start',
    class_id: 'mage',
    created_at: '2026-08-19T00:00:00.000Z',
    active_code: { version_no: 1, ai_model: 'GPT-5' },
    ranked_rating: 900,
    ranked_results: { wins: 3, draws: 1, losses: 2 },
    latest_submission: null,
    ...overrides
  };
}

describe('AgentDuelCharacterList', () => {
  it('renders bundled Chinese list copy, active code, ranked results, and newer compiling submissions', () => {
    const html = renderToStaticMarkup(
      <AgentDuelCharacterList
        characters={[
          createCharacter({
            latest_submission: { version_no: 2, status: 'compiling' }
          })
        ]}
        locale="zh-CN"
        renderAiModel={(aiModel) => <span>模型：{aiModel}</span>}
      />
    );

    expect(html).toContain('角色列表');
    expect(html).toContain('正在编译');
    expect(html).toContain('编译中');
    expect(html).toContain('模型：GPT-5');
    expect(html).toContain('3/1/2');
    expect(html).toContain('900');
    expect(html).toContain('aria-label="查看角色 Cold Start"');
    expect(html).not.toContain('duel-breadcrumbs');
  });

  it('leaves breadcrumb navigation to the host page', () => {
    const packageRoot = resolve(import.meta.dirname, '..');
    const componentSources = [
      'src/AgentDuelCharacterCreate.tsx',
      'src/AgentDuelCharacterEdit.tsx',
      'src/AgentDuelCharacterList.tsx',
      'src/AgentDuelDeathmatchRecentBattles.tsx'
    ].map((file) => readFileSync(resolve(packageRoot, file), 'utf8'));
    const styles = readFileSync(resolve(packageRoot, 'src/styles.css'), 'utf8');

    expect(componentSources.join('\n')).not.toContain('Breadcrumbs');
    expect(styles).not.toContain('.duel-breadcrumbs');
  });

  it('does not promote an older failed submission into the attention section', () => {
    const html = renderToStaticMarkup(
      <AgentDuelCharacterList
        characters={[
          createCharacter({
            active_code: { version_no: 2, ai_model: null },
            latest_submission: { version_no: 1, status: 'compile_failed' }
          })
        ]}
        locale="en-US"
      />
    );

    expect(html).not.toContain('Needs attention');
    expect(html).toContain('Unspecified model');
  });
});
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
