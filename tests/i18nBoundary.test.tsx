import { createInstance } from 'i18next';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getI18n, setI18n, useTranslation } from 'react-i18next';
import { describe, expect, it } from 'vitest';
import { DeathmodeI18nBoundary } from '../src/i18n';

function BundledLabel() {
  const { t } = useTranslation();
  return createElement('span', null, t('dashboard.records.title'));
}

describe('DeathmodeI18nBoundary', () => {
  it('does not replace the host i18n instance in host mode', async () => {
    const hostI18n = createInstance();
    await hostI18n.init({ lng: 'zh-CN', resources: { 'zh-CN': { translation: {} } } });
    setI18n(hostI18n);

    renderToStaticMarkup(createElement(
      DeathmodeI18nBoundary,
      { children: createElement('span', null, 'host'), locale: 'zh-CN', mode: 'host' }
    ));

    expect(getI18n()).toBe(hostI18n);
  });

  it('renders bundled translations without changing the global instance', async () => {
    const hostI18n = createInstance();
    await hostI18n.init({ lng: 'zh-CN', resources: { 'zh-CN': { translation: {} } } });
    setI18n(hostI18n);

    const html = renderToStaticMarkup(createElement(
      DeathmodeI18nBoundary,
      { children: createElement(BundledLabel), locale: 'zh-CN', mode: 'bundled' }
    ));

    expect(html).toContain('对战记录');
    expect(getI18n()).toBe(hostI18n);
  });
});
