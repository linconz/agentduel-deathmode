import { AgentDuelBattleMatchLabelBadge } from '@agentduel/component';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  addBattleRecordFilter,
  createDeathmatchBattleRecordRows,
  emptyDeathmatchBattleRecordFilters,
  filterDeathmatchBattleRecordRows,
  getActiveBattleRecordFilterCount,
  hasActiveBattleRecordFilters,
  removeBattleRecordFilter,
  toggleBattleRecordFilter,
  type BattleRecordFilterOption,
  type DeathmatchBattleRecordRow
} from './battleModel';
import { Button, ButtonLink } from './components';
import { joinAssetUrl } from './characterModel';
import { DeathmodeI18nBoundary, normalizeLocale } from './i18n';
import type {
  AgentDuelDeathmatchRecentBattlesProps,
  BattleRecordResultFilter,
  BattleType,
  DeathmatchBattleRecordsPage,
  DeathmatchBattleRecordFilters,
  DeathmodeLinkComponent
} from './types';
import { readDeathmodeError } from './types';
import './styles.css';

type PageStatus = 'loading' | 'ready' | 'error';
type RecordsStatus = 'idle' | 'loading' | 'ready' | 'error';

const FILTER_OPTIONS: BattleRecordFilterOption[] = [
  { kind: 'battleType', value: 'practice' },
  { kind: 'battleType', value: 'ranked' },
  { kind: 'challengeRole', value: 'challenger' },
  { kind: 'challengeRole', value: 'target' },
  { kind: 'result', value: 'loss' },
  { kind: 'result', value: 'win' }
];

const MAP_THUMBNAILS: Readonly<Record<string, { path: string; width: number; height: number }>> = {
  default_arena: { path: '/resources/v1/map/thumb/basic-map-small.png', width: 190, height: 116 },
  reedbank_ruins: { path: '/resources/v1/map/thumb/reedbank-ruins-small.png', width: 180, height: 116 },
  thicket_maze: { path: '/resources/v1/map/thumb/thicket-maze-small.png', width: 180, height: 116 },
  four_corners_ruins: { path: '/resources/v1/map/thumb/four-corners-ruins-small.png', width: 180, height: 116 }
};

export function AgentDuelDeathmatchRecentBattles(props: AgentDuelDeathmatchRecentBattlesProps) {
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  return (
    <DeathmodeI18nBoundary locale={locale} mode={props.i18nMode}>
      <DeathmatchRecentBattlesContent {...props} normalizedLocale={locale} />
    </DeathmodeI18nBoundary>
  );
}

function DeathmatchRecentBattlesContent({
  assetBaseUrl = 'https://www.agentduel.app',
  className,
  dataSource,
  getCharacterHref,
  getReplayHref,
  getRevengeHref,
  linkComponent,
  normalizedLocale,
  onUnauthorized,
  style
}: AgentDuelDeathmatchRecentBattlesProps & { normalizedLocale: 'zh-CN' | 'en-US' }) {
  const { t } = useTranslation();
  const [contextStatus, setContextStatus] = useState<PageStatus>('loading');
  const [recordsStatus, setRecordsStatus] = useState<RecordsStatus>('idle');
  const [ownedPublicIds, setOwnedPublicIds] = useState<ReadonlySet<string>>(new Set());
  const [records, setRecords] = useState<DeathmatchBattleRecordsPage | null>(null);
  const [filters, setFilters] = useState<DeathmatchBattleRecordFilters>(emptyDeathmatchBattleRecordFilters);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadContext = useCallback(async (): Promise<void> => {
    setContextStatus('loading');
    try {
      const context = await dataSource.loadContext(normalizedLocale);
      setOwnedPublicIds(new Set(context.ownedCharacterPublicIds));
      setContextStatus('ready');
    } catch (error) {
      if (readDeathmodeError(error).status === 401) {
        onUnauthorized();
        return;
      }
      setContextStatus('error');
    }
  }, [dataSource, normalizedLocale, onUnauthorized]);

  useEffect(() => {
    void loadContext();
  }, [loadContext, reloadKey]);

  useEffect(() => {
    let active = true;
    setRecordsStatus('loading');
    setRecordsError(null);
    setRecords(null);
    void dataSource.loadBattles({ ...filters, limit: 20 }, normalizedLocale)
      .then((nextRecords) => {
        if (!active) return;
        setRecords(nextRecords);
        setRecordsStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        if (readDeathmodeError(error).status === 401) {
          onUnauthorized();
          return;
        }
        setRecordsError(t('dashboard.records.loadFailed'));
        setRecordsStatus('error');
      });
    return () => { active = false; };
  }, [dataSource, filters, normalizedLocale, onUnauthorized, reloadKey, t]);

  const rows = useMemo(
    () => filterDeathmatchBattleRecordRows(
      createDeathmatchBattleRecordRows(records?.battles ?? [], ownedPublicIds, {
        getCharacterHref,
        getReplayHref,
        getRevengeHref
      }),
      filters
    ),
    [filters, getCharacterHref, getReplayHref, getRevengeHref, ownedPublicIds, records]
  );
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(normalizedLocale, { dateStyle: 'medium' }),
    [normalizedLocale]
  );

  async function handleLoadMore(): Promise<void> {
    if (!records?.next_cursor || recordsStatus === 'loading') return;
    setRecordsStatus('loading');
    setRecordsError(null);
    try {
      const nextRecords = await dataSource.loadBattles({
        ...filters,
        cursor: records.next_cursor,
        limit: 20
      }, normalizedLocale);
      setRecords((current) => current
        ? { battles: [...current.battles, ...nextRecords.battles], next_cursor: nextRecords.next_cursor }
        : nextRecords);
      setRecordsStatus('ready');
    } catch (error) {
      if (readDeathmodeError(error).status === 401) {
        onUnauthorized();
        return;
      }
      setRecordsError(t('dashboard.records.loadFailed'));
      setRecordsStatus('error');
    }
  }

  const rootClassName = ['agentduel-deathmode', 'deathmode-recent-battles', className ?? ''].filter(Boolean).join(' ');
  return (
    <div className={rootClassName} style={style}>
      {contextStatus === 'loading' ? <LoadingLine /> : null}
      {contextStatus === 'error' ? (
        <section className="dashboard-error" aria-labelledby="battle-records-error-title">
          <p className="dashboard-kicker">{t('dashboard.records.kicker')}</p>
          <h1 id="battle-records-error-title">{t('dashboard.records.title')}</h1>
          <p>{t('dashboard.records.loadFailed')}</p>
          <Button onClick={() => setReloadKey((key) => key + 1)} variant="secondary" tone="neutral">{t('dashboard.error.retry')}</Button>
        </section>
      ) : null}
      {contextStatus === 'ready' ? (
        <BattleRecordsView
          assetBaseUrl={assetBaseUrl}
          dateFormatter={dateFormatter}
          filters={filters}
          linkComponent={linkComponent}
          onClearFilters={() => setFilters(emptyDeathmatchBattleRecordFilters)}
          onLoadMore={() => void handleLoadMore()}
          onSetFilters={setFilters}
          records={records}
          recordsError={recordsError}
          recordsStatus={recordsStatus}
          rows={rows}
        />
      ) : null}
    </div>
  );
}

function BattleRecordsView({
  assetBaseUrl,
  dateFormatter,
  filters,
  linkComponent,
  onClearFilters,
  onLoadMore,
  onSetFilters,
  records,
  recordsError,
  recordsStatus,
  rows
}: {
  assetBaseUrl: string;
  dateFormatter: Intl.DateTimeFormat;
  filters: DeathmatchBattleRecordFilters;
  linkComponent?: DeathmodeLinkComponent;
  onClearFilters(): void;
  onLoadMore(): void;
  onSetFilters(filters: DeathmatchBattleRecordFilters): void;
  records: DeathmatchBattleRecordsPage | null;
  recordsError: string | null;
  recordsStatus: RecordsStatus;
  rows: DeathmatchBattleRecordRow[];
}) {
  const { t } = useTranslation();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filters);

  function openFilterMenu(): void {
    setDraftFilters(filters);
    setIsFilterMenuOpen(true);
  }

  return (
    <>
      <section className="battle-records-hero" aria-labelledby="battle-records-title">
        <p className="dashboard-kicker">{t('dashboard.records.kicker')}</p>
        <h1 id="battle-records-title">{t('dashboard.records.modeTitle', { mode: t('dashboard.mode.deathmatch') })}</h1>
        <p>{t('dashboard.records.fixedModeCopy', { mode: t('dashboard.mode.deathmatch') })}</p>
      </section>
      <section className="dashboard-section" aria-labelledby="battle-record-list-title">
        <div className="dashboard-section-heading">
          <h2 id="battle-record-list-title">{t('dashboard.records.title')}</h2>
          <div className="battle-record-filter-menu-shell">
            <Button
              aria-controls="deathmatch-battle-record-filter-menu"
              aria-expanded={isFilterMenuOpen}
              onClick={isFilterMenuOpen ? () => setIsFilterMenuOpen(false) : openFilterMenu}
              size="sm"
              variant="secondary"
              tone="neutral"
            >
              {getActiveBattleRecordFilterCount(filters) > 0
                ? t('dashboard.records.filterButtonWithCount', { count: getActiveBattleRecordFilterCount(filters) })
                : t('dashboard.records.filterButton')}
            </Button>
            {isFilterMenuOpen ? (
              <div className="battle-record-filter-menu" id="deathmatch-battle-record-filter-menu" role="dialog" aria-label={t('dashboard.records.filterMenuAria')}>
                <div className="battle-record-filter-menu-options">
                  {FILTER_OPTIONS.map((option) => (
                    <label className="battle-record-filter-option" key={`${option.kind}:${option.value}`}>
                      <input
                        type="checkbox"
                        checked={hasFilterOption(draftFilters, option)}
                        onChange={() => setDraftFilters(toggleBattleRecordFilter(draftFilters, option))}
                      />
                      <span>{formatFilterOptionLabel(option, t)}</span>
                    </label>
                  ))}
                </div>
                <div className="battle-record-filter-menu-actions">
                  <Button onClick={() => setIsFilterMenuOpen(false)} size="sm" variant="secondary" tone="neutral">{t('dashboard.records.cancelFilters')}</Button>
                  <Button onClick={() => { onSetFilters(draftFilters); setIsFilterMenuOpen(false); }} size="sm">{t('dashboard.records.applyFilters')}</Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <ActiveFilters filters={filters} onClear={onClearFilters} onRemove={(option) => onSetFilters(removeBattleRecordFilter(filters, option))} />
        <BattleRecordsList
          assetBaseUrl={assetBaseUrl}
          dateFormatter={dateFormatter}
          filters={filters}
          linkComponent={linkComponent}
          onAddFilter={(option) => onSetFilters(addBattleRecordFilter(filters, option))}
          onLoadMore={onLoadMore}
          records={records}
          recordsError={recordsError}
          recordsStatus={recordsStatus}
          rows={rows}
        />
      </section>
    </>
  );
}

function ActiveFilters({
  filters,
  onClear,
  onRemove
}: {
  filters: DeathmatchBattleRecordFilters;
  onClear(): void;
  onRemove(option: BattleRecordFilterOption): void;
}) {
  const { t } = useTranslation();
  const options: BattleRecordFilterOption[] = [
    ...filters.battleTypes.map((value) => ({ kind: 'battleType' as const, value })),
    ...filters.challengeRoles.map((value) => ({ kind: 'challengeRole' as const, value })),
    ...filters.results.map((value) => ({ kind: 'result' as const, value }))
  ];
  if (options.length === 0) return null;
  return (
    <div className="battle-record-active-filters" aria-label={t('dashboard.records.activeFiltersAria')}>
      <button className="battle-record-clear-filters" type="button" onClick={onClear}>{t('dashboard.records.clearFilters')}</button>
      <div className="battle-record-filter-chips">
        {options.map((option) => {
          const label = formatFilterOptionLabel(option, t);
          return (
            <button
              className="battle-record-filter-chip"
              key={`${option.kind}:${option.value}`}
              type="button"
              aria-label={t('dashboard.records.removeFilter', { label })}
              onClick={() => onRemove(option)}
            ><span>{label}</span><span aria-hidden="true">x</span></button>
          );
        })}
      </div>
    </div>
  );
}

function BattleRecordsList({
  assetBaseUrl,
  dateFormatter,
  filters,
  linkComponent,
  onAddFilter,
  onLoadMore,
  records,
  recordsError,
  recordsStatus,
  rows
}: {
  assetBaseUrl: string;
  dateFormatter: Intl.DateTimeFormat;
  filters: DeathmatchBattleRecordFilters;
  linkComponent?: DeathmodeLinkComponent;
  onAddFilter(option: BattleRecordFilterOption): void;
  onLoadMore(): void;
  records: DeathmatchBattleRecordsPage | null;
  recordsError: string | null;
  recordsStatus: RecordsStatus;
  rows: DeathmatchBattleRecordRow[];
}) {
  const { t } = useTranslation();
  if (recordsStatus === 'loading' && rows.length === 0) return <LoadingLine inline />;
  if (recordsStatus === 'error' && rows.length === 0) return <p className="character-version-error" role="alert">{recordsError ?? t('dashboard.records.loadFailed')}</p>;
  if (rows.length === 0) {
    return (
      <>
        <p className="dashboard-empty-inline">{hasActiveBattleRecordFilters(filters) ? t('dashboard.records.emptyFiltered') : t('dashboard.records.empty')}</p>
        <LoadMore onLoadMore={onLoadMore} records={records} recordsError={recordsError} recordsStatus={recordsStatus} />
      </>
    );
  }
  return (
    <>
      <div className="dashboard-open-list">
        {rows.map((row) => (
          <BattleRecordRow
            assetBaseUrl={assetBaseUrl}
            dateFormatter={dateFormatter}
            filters={filters}
            key={row.battleId}
            linkComponent={linkComponent}
            onAddFilter={onAddFilter}
            row={row}
          />
        ))}
      </div>
      <LoadMore onLoadMore={onLoadMore} records={records} recordsError={recordsError} recordsStatus={recordsStatus} />
    </>
  );
}

function BattleRecordRow({
  assetBaseUrl,
  dateFormatter,
  filters,
  linkComponent,
  onAddFilter,
  row
}: {
  assetBaseUrl: string;
  dateFormatter: Intl.DateTimeFormat;
  filters: DeathmatchBattleRecordFilters;
  linkComponent?: DeathmodeLinkComponent;
  onAddFilter(option: BattleRecordFilterOption): void;
  row: DeathmatchBattleRecordRow;
}) {
  const { t } = useTranslation();
  const resultFilter = row.result === 'win' || row.result === 'loss' ? row.result : null;
  const replayLabel = row.status === 'pending' || row.status === 'running' ? t('dashboard.active.waiting') : t('dashboard.actions.viewReplay');
  return (
    <article className="dashboard-battle-row battle-record-row">
      <div>
        <BattleRecordTitle row={row} linkComponent={linkComponent} />
        <BattleDateMapMeta assetBaseUrl={assetBaseUrl} dateFormatter={dateFormatter} row={row} />
      </div>
      <div className="dashboard-battle-meta">
        <MetaFilter active={filters.battleTypes.includes(row.battleType)} label={t(`dashboard.battleType.${row.battleType}`)} onClick={() => onAddFilter({ kind: 'battleType', value: row.battleType })} />
        {row.status === 'done' ? null : <span>{t(`dashboard.status.${row.status}`)}</span>}
        {row.challengeRole && row.challengeLabelKey ? (
          <MetaFilter active={filters.challengeRoles.includes(row.challengeRole)} label={t(row.challengeLabelKey)} onClick={() => onAddFilter({ kind: 'challengeRole', value: row.challengeRole! })} />
        ) : row.matchLabelKey && row.matchLabelTone && row.matchLabelTooltipKey ? (
          <AgentDuelBattleMatchLabelBadge
            label={t(row.matchLabelKey)}
            tone={row.matchLabelTone}
            tooltip={t(row.matchLabelTooltipKey)}
          />
        ) : null}
        {resultFilter === null ? (
          <strong className={`is-${row.result}`}>{t(`dashboard.result.${row.result}`)}</strong>
        ) : (
          <MetaFilter active={filters.results.includes(resultFilter)} className={`is-${row.result}`} label={t(`dashboard.result.${row.result}`)} onClick={() => onAddFilter({ kind: 'result', value: resultFilter })} />
        )}
        {row.ratingDelta !== null ? <strong className={row.ratingDelta >= 0 ? 'is-rating-gain' : 'is-rating-loss'}>{t('dashboard.recent.ratingDelta', { delta: row.ratingDelta > 0 ? `+${row.ratingDelta}` : String(row.ratingDelta) })}</strong> : null}
      </div>
      <div className="dashboard-battle-row-actions">
        {row.revengeHref ? <ButtonLink className="character-battle-launch-button battle-revenge-list-button" href={row.revengeHref} linkComponent={linkComponent} size="sm" variant="secondary">{t('dashboard.challenge.revenge')}</ButtonLink> : null}
        {row.replayHref ? <ButtonLink href={row.replayHref} linkComponent={linkComponent} size="sm" variant="secondary">{replayLabel}</ButtonLink> : <span className="dashboard-muted-action">{t('dashboard.recent.replayUnavailable')}</span>}
      </div>
    </article>
  );
}

function BattleRecordTitle({ row, linkComponent: Link }: { row: DeathmatchBattleRecordRow; linkComponent?: DeathmodeLinkComponent }) {
  const { t } = useTranslation();
  const redName = renderParticipantName(row.redName, row.ownSide === 'red' ? row.ownHref : row.opponentSide === 'red' ? row.opponentHref : null, row.ownSide === 'red', Link);
  const blueName = renderParticipantName(row.blueName, row.ownSide === 'blue' ? row.ownHref : row.opponentSide === 'blue' ? row.opponentHref : null, row.ownSide === 'blue', Link);
  return <h3 className="dashboard-battle-title">{redName}<span className="dashboard-battle-title-separator">{t('dashboard.recent.vsSeparator')}</span>{blueName}</h3>;
}

function renderParticipantName(name: string, href: string | null, own: boolean, Link?: DeathmodeLinkComponent) {
  if (!href) return <span>{name}</span>;
  const className = `dashboard-battle-name-link${own ? ' is-own' : ''}`;
  return Link ? <Link className={className} href={href}>{name}</Link> : <a className={className} href={href}>{name}</a>;
}

function BattleDateMapMeta({ assetBaseUrl, dateFormatter, row }: { assetBaseUrl: string; dateFormatter: Intl.DateTimeFormat; row: DeathmatchBattleRecordRow }) {
  const { t } = useTranslation();
  const visual = MAP_THUMBNAILS[row.mapId];
  const mapName = t(`battleMap.names.${row.mapId}`, { defaultValue: row.mapId });
  return (
    <p className="battle-date-map-meta">
      <time dateTime={row.createdAt}>{dateFormatter.format(new Date(row.createdAt))}</time>
      <span className="battle-date-map-separator" aria-hidden="true">·</span>
      <span className="battle-map-label" tabIndex={0}>
        {mapName}
        <span className="battle-map-tooltip" role="tooltip">
          {visual ? <img alt="" aria-hidden="true" decoding="async" height={visual.height} loading="lazy" src={joinAssetUrl(assetBaseUrl, visual.path)} width={visual.width} /> : <span className="battle-map-tooltip-placeholder" aria-hidden="true" />}
          <strong>{mapName}</strong>
          <span>{t(`battleMap.descriptions.deathmatch.${row.mapId}`, { defaultValue: t('battleMap.previewUnavailable') })}</span>
        </span>
      </span>
    </p>
  );
}

function MetaFilter({ active, className, label, onClick }: { active: boolean; className?: string; label: string; onClick(): void }) {
  return <button type="button" className={['battle-record-meta-filter', active ? 'is-active' : '', className ?? ''].filter(Boolean).join(' ')} aria-pressed={active} onClick={onClick}>{label}</button>;
}

function LoadMore({ onLoadMore, records, recordsError, recordsStatus }: { onLoadMore(): void; records: DeathmatchBattleRecordsPage | null; recordsError: string | null; recordsStatus: RecordsStatus }) {
  const { t } = useTranslation();
  if (!recordsError && !records?.next_cursor) return null;
  return (
    <div className="character-battle-record-actions">
      {recordsError ? <p className="character-version-error" role="alert">{recordsError}</p> : null}
      {records?.next_cursor ? <Button loading={recordsStatus === 'loading'} loadingLabel={t('dashboard.records.loadingMore')} onClick={onLoadMore} size="sm" variant="secondary" tone="neutral">{t('dashboard.records.loadMore')}</Button> : null}
    </div>
  );
}

function LoadingLine({ inline = false }: { inline?: boolean }) {
  const { t } = useTranslation();
  const values = t('dashboard.records.loadingTexts', { returnObjects: true });
  const texts = Array.isArray(values) ? values.filter((value): value is string => typeof value === 'string') : [];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (texts.length < 2) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % texts.length), 1800);
    return () => window.clearInterval(timer);
  }, [texts.length]);
  return <p className={inline ? 'dashboard-empty-inline' : 'dashboard-loading'} role="status">{texts[index] ?? ''}</p>;
}

function hasFilterOption(filters: DeathmatchBattleRecordFilters, option: BattleRecordFilterOption): boolean {
  switch (option.kind) {
    case 'battleType': return filters.battleTypes.includes(option.value);
    case 'challengeRole': return filters.challengeRoles.includes(option.value);
    case 'result': return filters.results.includes(option.value);
  }
}

function formatFilterOptionLabel(option: BattleRecordFilterOption, t: ReturnType<typeof useTranslation>['t']): string {
  switch (option.kind) {
    case 'battleType': return t(`dashboard.battleType.${option.value}`);
    case 'challengeRole': return t(`dashboard.records.challengeRole.${option.value}`);
    case 'result': return t(`dashboard.result.${option.value}`);
  }
}

export type { BattleRecordResultFilter, BattleType };
