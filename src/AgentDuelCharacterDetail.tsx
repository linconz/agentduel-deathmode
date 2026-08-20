import {
  AgentDuelAiModelLogoBadge,
  AgentDuelBadgeGallery,
  AgentDuelBattleMatchLabelBadge,
  AgentDuelBattleTypeBadge,
  AgentDuelOwnedBadgeGallery,
  type AgentDuelBadge,
  type AgentDuelOwnedBadge,
  type AgentDuelOwnedBadgeGalleryLabels
} from '@agentduel/component';
import { useId, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BattleDateMapMeta } from './BattleDateMapMeta';
import { Button, ButtonLink, DefaultLink } from './components';
import { DeathmodeI18nBoundary, normalizeLocale } from './i18n';
import type {
  BattleResult,
  BattleType,
  CharacterDetailBaseProps,
  CharacterDetailBattle,
  CharacterDetailCodeEditorProps,
  CharacterDetailCodeVersion,
  CharacterDetailCodeVersions,
  CharacterDetailGuestProfile,
  CharacterDetailGuestVersion,
  CharacterDetailOptimizationTab,
  CharacterDetailOwnerProfile,
  CharacterDetailSectionStatus,
  DeathmodeLinkComponent
} from './types';
import './styles.css';

export interface AgentDuelCharacterOwnerBasicProps extends CharacterDetailBaseProps {
  activeBattleType: BattleType;
  canStartBattle: boolean;
  character: CharacterDetailOwnerProfile;
  editHref: string;
  onBattleTypeChange(battleType: BattleType): void;
  onStartBattle(): void;
}

export interface AgentDuelCharacterGuestBasicProps extends CharacterDetailBaseProps {
  challengeHref: string;
  character: CharacterDetailGuestProfile;
  showRating?: boolean;
}

export interface AgentDuelCharacterOwnerBadgesProps extends CharacterDetailBaseProps {
  badges: readonly AgentDuelOwnedBadge[];
  onSaveDisplay(equippedBadgeKeys: readonly string[], hiddenBadgeKeys: readonly string[]): Promise<void>;
}

export interface AgentDuelCharacterGuestBadgesProps extends CharacterDetailBaseProps {
  badges: readonly AgentDuelBadge[];
}

export interface AgentDuelCharacterOwnerStatusProps extends CharacterDetailBaseProps {
  character: CharacterDetailOwnerProfile;
}

export interface AgentDuelCharacterOwnerCodeSubmissionProps extends CharacterDetailBaseProps {
  activeTab: CharacterDetailOptimizationTab;
  agentToolNotice?: ReactNode;
  apiKey: string;
  apiKeyError: string | null;
  apiKeyVisible: boolean;
  copiedApiKey: boolean;
  copiedPrompt: boolean;
  isRotatingApiKey: boolean;
  isSubmitting: boolean;
  manualSourceCode: string;
  manualSubmitError: string | null;
  manualSubmitNotice: string | null;
  prompt: string;
  renderCodeEditor?(props: CharacterDetailCodeEditorProps): ReactNode;
  showPromptGuide?: boolean;
  sourceStatus: CharacterDetailSectionStatus;
  onCopyApiKey(): void;
  onCopyPrompt(): void;
  onManualSourceCodeChange(sourceCode: string): void;
  onRotateApiKey(): void;
  onSubmitManualCode(): void;
  onTabChange(tab: CharacterDetailOptimizationTab): void;
  onToggleApiKey(): void;
}

export interface AgentDuelCharacterOwnerCodeVersionsProps extends CharacterDetailBaseProps {
  codeVersions: CharacterDetailCodeVersions | null;
  error: string | null;
  renderAiModel?(aiModel: string | null, fallbackLabel: string): ReactNode;
  settingVersionId: string | null;
  status: CharacterDetailSectionStatus;
  onRetry(): void;
  onSetCurrentVersion(versionPublicId: string): void;
}

export interface CharacterBattleRecordsSectionProps extends CharacterDetailBaseProps {
  assetBaseUrl?: string;
  battles: readonly CharacterDetailBattle[];
  error: string | null;
  getCharacterHref?(characterPublicId: string): string | null;
  getReplayHref?(battle: CharacterDetailBattle): string | null;
  getRevengeHref?(battle: CharacterDetailBattle): string | null;
  hasMore: boolean;
  moreHref?: string;
  ownerCharacterPublicId: string;
  status: CharacterDetailSectionStatus;
  onLoadMore(): void;
  onRetry?(): void;
}

export type AgentDuelCharacterOwnerBattleRecordsProps = CharacterBattleRecordsSectionProps;
export type AgentDuelCharacterGuestBattleRecordsProps = CharacterBattleRecordsSectionProps;

export interface AgentDuelCharacterGuestCurrentVersionProps extends CharacterDetailBaseProps {
  renderAiModel?(aiModel: string | null, fallbackLabel: string): ReactNode;
  version: CharacterDetailGuestVersion | null;
}

export function AgentDuelCharacterOwnerBasic(props: AgentDuelCharacterOwnerBasicProps) {
  return <Boundary props={props}><OwnerBasicContent {...props} /></Boundary>;
}

export function AgentDuelCharacterGuestBasic(props: AgentDuelCharacterGuestBasicProps) {
  return <Boundary props={props}><GuestBasicContent {...props} /></Boundary>;
}

export function AgentDuelCharacterOwnerBadges(props: AgentDuelCharacterOwnerBadgesProps) {
  return <Boundary props={props}><BadgeSection owned {...props} /></Boundary>;
}

export function AgentDuelCharacterGuestBadges(props: AgentDuelCharacterGuestBadgesProps) {
  return <Boundary props={props}><BadgeSection {...props} /></Boundary>;
}

export function AgentDuelCharacterOwnerStatus(props: AgentDuelCharacterOwnerStatusProps) {
  return <Boundary props={props}><OwnerStatusContent {...props} /></Boundary>;
}

export function AgentDuelCharacterOwnerCodeSubmission(props: AgentDuelCharacterOwnerCodeSubmissionProps) {
  return <Boundary props={props}><CodeSubmissionContent {...props} /></Boundary>;
}

export function AgentDuelCharacterOwnerCodeVersions(props: AgentDuelCharacterOwnerCodeVersionsProps) {
  return <Boundary props={props}><CodeVersionsContent {...props} /></Boundary>;
}

export function AgentDuelCharacterOwnerBattleRecords(props: AgentDuelCharacterOwnerBattleRecordsProps) {
  return <Boundary props={props}><BattleRecordsContent {...props} owner /></Boundary>;
}

export function AgentDuelCharacterGuestBattleRecords(props: AgentDuelCharacterGuestBattleRecordsProps) {
  return <Boundary props={props}><BattleRecordsContent {...props} /></Boundary>;
}

export function AgentDuelCharacterGuestCurrentVersion(props: AgentDuelCharacterGuestCurrentVersionProps) {
  return <Boundary props={props}><GuestVersionContent {...props} /></Boundary>;
}

function Boundary({ children, props }: { children: ReactNode; props: CharacterDetailBaseProps }) {
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  return (
    <DeathmodeI18nBoundary locale={locale} mode={props.i18nMode}>
      <div className={['agentduel-deathmode', 'character-detail-section', props.className ?? ''].filter(Boolean).join(' ')} style={props.style}>
        {children}
      </div>
    </DeathmodeI18nBoundary>
  );
}

function OwnerBasicContent({ activeBattleType, canStartBattle, character, editHref, linkComponent, onBattleTypeChange, onStartBattle }: AgentDuelCharacterOwnerBasicProps) {
  const { t } = useTranslation();
  const Link = linkComponent ?? DefaultLink;
  const titleId = useId();
  return (
    <section className="character-detail-basic" aria-labelledby={titleId}>
      <div>
        <p className="dashboard-kicker">{t('characters.detail.slot', { slot: character.slot_no })}</p>
        <div className="character-detail-title-row">
          <h1 id={titleId}>{character.name}</h1>
          <Link aria-label={t('characters.detail.editDescription')} className="character-detail-edit-link" href={editHref}>
            <PencilIcon />
          </Link>
        </div>
        <p>{character.description || t('characters.detail.noDescription')}</p>
      </div>
      <div className="character-detail-battle-launch" aria-label={t('characters.detail.battleLaunchAria')}>
        <div className="character-detail-battle-tabs" role="tablist" aria-label={t('characters.detail.battleTypeTabsAria')}>
          {(['practice', 'ranked'] as const).map((battleType) => (
            <button aria-selected={activeBattleType === battleType} key={battleType} onClick={() => onBattleTypeChange(battleType)} role="tab" type="button">
              {t(`dashboard.battleType.${battleType}`)}
            </button>
          ))}
        </div>
        <Button className="character-detail-battle-button" disabled={!canStartBattle} onClick={onStartBattle}>{t('characters.detail.startBattle')}</Button>
        {!canStartBattle ? <p>{t('characters.detail.contentRestrictedBattle')}</p> : null}
      </div>
    </section>
  );
}

function GuestBasicContent({ challengeHref, character, linkComponent, showRating = true }: AgentDuelCharacterGuestBasicProps) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className="character-detail-basic" aria-labelledby={titleId}>
      <div>
        <h1 id={titleId}>{character.name}</h1>
        <p className="character-detail-meta">{t(`replay.class.${character.class_id}`)}</p>
        <p>{character.description || t('characters.detail.noDescription')}</p>
      </div>
      <div className="character-detail-guest-action">
        {showRating ? <div><span>{t('characters.detail.rating')}</span><strong>{character.ranked_rating}</strong></div> : null}
        <ButtonLink className="character-detail-battle-button" href={challengeHref} linkComponent={linkComponent}>{t('characters.detail.challengeCharacter')}</ButtonLink>
      </div>
    </section>
  );
}

function BadgeSection(props: (AgentDuelCharacterOwnerBadgesProps & { owned: true }) | (AgentDuelCharacterGuestBadgesProps & { owned?: false })) {
  const { t } = useTranslation();
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  const labels = badgeLabels(t);
  return props.owned ? (
    <AgentDuelOwnedBadgeGallery badges={props.badges} labels={labels} locale={locale} onSave={props.onSaveDisplay} />
  ) : (
    <AgentDuelBadgeGallery badges={props.badges} labels={labels} locale={locale} />
  );
}

function OwnerStatusContent({ character, locale }: AgentDuelCharacterOwnerStatusProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const date = formatDate(character.updated_at, normalizeLocale(locale ?? 'zh-CN'));
  const fields = [
    [t('characters.detail.class'), t(`replay.class.${character.class_id}`)],
    [t('characters.detail.codeSource'), t(`dashboard.codeSource.${character.code_source}`)],
    [t('characters.detail.rating'), String(character.ranked_rating)],
    [t('characters.detail.matches'), String(character.ranked_matches)],
    [t('characters.detail.wins'), String(character.ranked_wins)],
    [t('characters.detail.draws'), String(character.ranked_draws)],
    [t('characters.detail.losses'), String(character.ranked_losses)],
    [t('characters.detail.updatedAt'), date]
  ];
  return (
    <section aria-labelledby={titleId}>
      <SectionHeading id={titleId} title={t('characters.detail.summaryTitle')} />
      <dl className="character-detail-stats">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </section>
  );
}

function CodeSubmissionContent(props: AgentDuelCharacterOwnerCodeSubmissionProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const maskedKey = props.apiKey.length <= 8 ? '••••••••' : `${props.apiKey.slice(0, 4)}${'•'.repeat(Math.min(20, props.apiKey.length - 8))}${props.apiKey.slice(-4)}`;
  return (
    <section aria-labelledby={titleId}>
      <SectionHeading id={titleId} title={t('characters.detail.submitCodeTitle')} />
      <div className="character-detail-code-layout">
        <div className="character-detail-api-key">
          <div className="character-detail-api-key-label-row">
            <label>{t('characters.detail.apiKeyLabel')}</label>
            <button
              aria-label={props.apiKeyVisible ? t('characters.detail.hideApiKey') : t('characters.detail.showApiKey')}
              aria-pressed={props.apiKeyVisible}
              className="character-detail-api-key-eye"
              onClick={props.onToggleApiKey}
              type="button"
            >
              <EyeIcon />
            </button>
          </div>
          <input aria-label={t('characters.detail.apiKeyLabel')} readOnly value={props.apiKeyVisible ? props.apiKey : maskedKey} />
          <div className="character-detail-actions">
            <Button onClick={props.onCopyApiKey} size="sm" tone="neutral" variant="secondary">{props.copiedApiKey ? t('characters.detail.copied') : t('characters.detail.copyApiKey')}</Button>
            <Button loading={props.isRotatingApiKey} loadingLabel={t('characters.detail.rotatingApiKey')} onClick={props.onRotateApiKey} size="sm" tone="neutral" variant="secondary">{t('characters.detail.rotateApiKey')}</Button>
          </div>
          {props.apiKeyError ? <p className="character-detail-error" role="alert">{props.apiKeyError}</p> : null}
        </div>
        <div className="character-detail-editor-panel">
          {props.showPromptGuide && props.activeTab === 'auto' ? (
            <div className="character-detail-notice">
              <span>{t('characters.detail.promptGuide.badge')}</span>
              <strong>{t('characters.detail.promptGuide.title')}</strong>
              <p>{t('characters.detail.promptGuide.copy')}</p>
            </div>
          ) : null}
          {props.activeTab === 'auto' ? props.agentToolNotice : null}
          <div className="character-detail-editor-toolbar">
            <div className="character-detail-editor-tabs" role="tablist" aria-label={t('characters.detail.optimizationTabsAria')}>
              {(['auto', 'manual'] as const).map((tab) => <button aria-selected={props.activeTab === tab} key={tab} onClick={() => props.onTabChange(tab)} role="tab" type="button">{t(`characters.detail.${tab === 'auto' ? 'autoOptimization' : 'manualOptimization'}`)}</button>)}
            </div>
            {props.activeTab === 'auto' ? (
              <Button onClick={props.onCopyPrompt} size="sm" tone="neutral" variant="secondary">{props.copiedPrompt ? t('characters.detail.promptCopied') : t('characters.detail.copyPrompt')}</Button>
            ) : (
              <Button disabled={props.sourceStatus !== 'ready' || !props.manualSourceCode.trim()} loading={props.isSubmitting} loadingLabel={t('characters.detail.submittingManual')} onClick={props.onSubmitManualCode} size="sm" tone="neutral" variant="secondary">{t('characters.detail.submitManual')}</Button>
            )}
          </div>
          {props.activeTab === 'auto' ? <pre className="character-detail-prompt">{props.prompt}</pre> : <SourceEditor {...props} />}
        </div>
      </div>
    </section>
  );
}

function SourceEditor(props: AgentDuelCharacterOwnerCodeSubmissionProps) {
  const { t } = useTranslation();
  if (props.sourceStatus === 'loading') return <p>{t('characters.detail.sourceLoading')}</p>;
  if (props.sourceStatus === 'error') return <p className="character-detail-error">{t('characters.detail.sourceFailed')}</p>;
  if (props.sourceStatus !== 'ready') return <p>{t('characters.detail.noCurrentSource')}</p>;
  const editorProps: CharacterDetailCodeEditorProps = {
    ariaLabel: t('characters.detail.manualOptimization'),
    onChange: props.onManualSourceCodeChange,
    readOnly: false,
    value: props.manualSourceCode
  };
  return (
    <>
      <div className="character-detail-code-editor">
        {props.renderCodeEditor ? props.renderCodeEditor(editorProps) : <textarea aria-label={editorProps.ariaLabel} onChange={(event) => editorProps.onChange(event.target.value)} value={editorProps.value} />}
      </div>
      {props.manualSubmitNotice ? <p className="character-detail-success" role="status">{props.manualSubmitNotice}</p> : null}
      {props.manualSubmitError ? <p className="character-detail-error" role="alert">{props.manualSubmitError}</p> : null}
    </>
  );
}

function CodeVersionsContent(props: AgentDuelCharacterOwnerCodeVersionsProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  const versions = useMemo(() => [...(props.codeVersions?.compiled_versions ?? [])]
    .filter((version) => version.is_available)
    .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at))
    .slice(0, 10), [props.codeVersions]);
  return (
    <section aria-labelledby={titleId}>
      <SectionHeading id={titleId} title={t('characters.detail.codeVersionsTitle')} />
      {props.status === 'loading' ? <p>{t('characters.detail.codeVersionsLoading')}</p> : null}
      {props.status === 'error' ? <ErrorWithRetry message={t('characters.detail.codeVersionsFailed')} onRetry={props.onRetry} /> : null}
      {props.status === 'ready' ? (
        <>
          {props.codeVersions?.latest_submission ? <LatestSubmission locale={locale} version={props.codeVersions.latest_submission} /> : null}
          {versions.length === 0 ? <p>{t('characters.detail.noCompiledVersions')}</p> : (
            <ol className="character-detail-version-grid">
              {versions.map((version) => <li key={version.public_id}><VersionCard {...props} locale={locale} version={version} /></li>)}
            </ol>
          )}
          {props.error ? <p className="character-detail-error" role="alert">{props.error}</p> : null}
        </>
      ) : null}
    </section>
  );
}

function LatestSubmission({ locale, version }: { locale: string; version: CharacterDetailCodeVersion }) {
  const { t } = useTranslation();
  return (
    <article className="character-detail-latest-submission">
      <div><strong>{t('characters.detail.versionNo', { version: version.version_no })}</strong><p>{version.change_summary || t('characters.detail.noChangeSummary')}</p></div>
      <div><span>{t(`characters.detail.codeVersionStatus.${version.status}`)}</span><time>{formatDate(version.completed_at ?? version.created_at, locale)}</time></div>
      {version.diagnostics.length > 0 ? <details><summary>{t('characters.detail.viewDiagnostics', { count: version.diagnostics.length })}</summary><ol>{version.diagnostics.map((item, index) => <li key={`${item.stage}:${item.code}:${index}`}>{formatDiagnostic(item)} {item.message}</li>)}</ol></details> : null}
    </article>
  );
}

function VersionCard(props: AgentDuelCharacterOwnerCodeVersionsProps & { locale: string; version: CharacterDetailCodeVersion }) {
  const { t } = useTranslation();
  const version = props.version;
  return (
    <article className={`character-detail-version-card${version.is_current ? ' is-current' : ''}`}>
      <div className="character-version-card-header"><strong>{t('characters.detail.versionNo', { version: version.version_no })}</strong>{version.is_current ? <span>{t('characters.detail.currentVersion')}</span> : null}</div>
      <p>{version.change_summary || t('characters.detail.noChangeSummary')}</p>
      <div className="character-detail-version-meta">{props.renderAiModel?.(version.ai_model, t('characters.detail.unknownModel')) ?? <AgentDuelAiModelLogoBadge aiModel={version.ai_model} fallbackLabel={t('characters.detail.unknownModel')} />}<time>{formatDate(version.completed_at ?? version.created_at, props.locale)}</time></div>
      <Button disabled={version.is_current} loading={props.settingVersionId === version.public_id} loadingLabel={t('characters.detail.settingCurrent')} onClick={() => props.onSetCurrentVersion(version.public_id)} size="sm" variant="secondary" width="full">{version.is_current ? t('characters.detail.currentVersion') : t('characters.detail.setCurrentVersion')}</Button>
    </article>
  );
}

function GuestVersionContent({ renderAiModel, version }: AgentDuelCharacterGuestCurrentVersionProps) {
  const { t } = useTranslation();
  const titleId = useId();
  if (!version) return null;
  return (
    <section aria-labelledby={titleId}>
      <SectionHeading id={titleId} title={t('characters.detail.publicVersionTitle')} />
      <article className="character-detail-public-version"><div><strong>{t('characters.detail.versionNo', { version: version.version_no })}</strong>{renderAiModel?.(version.ai_model, t('characters.detail.unknownModel')) ?? <AgentDuelAiModelLogoBadge aiModel={version.ai_model} fallbackLabel={t('characters.detail.unknownModel')} />}</div><p>{version.change_summary || t('characters.detail.noChangeSummary')}</p></article>
    </section>
  );
}

function BattleRecordsContent(props: CharacterBattleRecordsSectionProps & { owner?: boolean }) {
  const { t } = useTranslation();
  const titleId = useId();
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  const assetBaseUrl = props.assetBaseUrl ?? 'https://www.agentduel.app';
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  return (
    <section aria-labelledby={titleId}>
      <SectionHeading id={titleId} title={t('characters.detail.battleRecordsTitle')} action={props.moreHref ? <ButtonLink href={props.moreHref} linkComponent={props.linkComponent} size="sm" variant="secondary">{t('dashboard.recent.more')}</ButtonLink> : null} />
      {props.status === 'loading' && props.battles.length === 0 ? <p>{t('characters.detail.battleRecordsLoading')}</p> : null}
      {props.status === 'error' && props.battles.length === 0 ? <ErrorWithRetry message={t('characters.detail.battleRecordsFailed')} onRetry={props.onRetry} /> : null}
      {props.status !== 'loading' && props.battles.length === 0 ? <p>{t('characters.detail.noBattleRecords')}</p> : null}
      <div className="dashboard-open-list">{props.battles.map((battle) => <BattleRow assetBaseUrl={assetBaseUrl} battle={battle} dateFormatter={dateFormatter} key={battle.public_id} owner={props.owner === true} props={props} />)}</div>
      {props.error ? <p className="character-detail-error" role="alert">{props.error}</p> : null}
      {props.hasMore ? <div className="character-battle-record-actions"><Button loading={props.status === 'loading'} loadingLabel={t('characters.detail.loadingMoreBattleRecords')} onClick={props.onLoadMore} size="sm" variant="secondary">{t('characters.detail.loadMoreBattleRecords')}</Button></div> : null}
    </section>
  );
}

function BattleRow({ assetBaseUrl, battle, dateFormatter, owner, props }: { assetBaseUrl: string; battle: CharacterDetailBattle; dateFormatter: Intl.DateTimeFormat; owner: boolean; props: CharacterBattleRecordsSectionProps }) {
  const { t } = useTranslation();
  const own = battle.participants.find((item) => item.public_id === props.ownerCharacterPublicId);
  const red = battle.participants.find((item) => item.side === 'red');
  const blue = battle.participants.find((item) => item.side === 'blue');
  const result = getResult(battle, own?.side ?? null);
  const replayHref = props.getReplayHref?.(battle) ?? null;
  const revengeHref = props.getRevengeHref?.(battle) ?? null;
  const matchLabel = owner ? getMatchLabel(battle) : null;
  const replayLabel = battle.status === 'pending' || battle.status === 'running' ? t('dashboard.active.waiting') : t('dashboard.actions.viewReplay');
  return (
    <article className="dashboard-battle-row battle-record-row">
      <div>
        <h3 className="dashboard-battle-title"><Participant participant={red} props={props} /><span className="dashboard-battle-title-separator">{t('dashboard.recent.vsSeparator')}</span><Participant participant={blue} props={props} /></h3>
        <BattleDateMapMeta assetBaseUrl={assetBaseUrl} createdAt={battle.created_at} dateFormatter={dateFormatter} mapId={battle.map_id} />
      </div>
      <div className="dashboard-battle-meta"><AgentDuelBattleTypeBadge battleType={battle.battle_type} label={t(`dashboard.battleType.${battle.battle_type}`)} />{matchLabel ? <AgentDuelBattleMatchLabelBadge label={t(matchLabel.key)} tone={matchLabel.tone} tooltip={t(matchLabel.tooltip)} /> : null}<strong className={`is-${result}`}>{t(`dashboard.result.${result}`)}</strong>{battle.battle_type === 'ranked' && own?.rating_delta !== null && own?.rating_delta !== undefined ? <strong className={own.rating_delta >= 0 ? 'is-rating-gain' : 'is-rating-loss'}>{t('dashboard.recent.ratingDelta', { delta: own.rating_delta > 0 ? `+${own.rating_delta}` : own.rating_delta })}</strong> : null}</div>
      <div className="dashboard-battle-row-actions">{revengeHref ? <ButtonLink className="character-battle-launch-button battle-revenge-list-button" href={revengeHref} linkComponent={props.linkComponent} size="sm" variant="secondary">{t('dashboard.challenge.revenge')}</ButtonLink> : null}{replayHref ? <ButtonLink href={replayHref} linkComponent={props.linkComponent} size="sm" variant="secondary">{replayLabel}</ButtonLink> : <span className="dashboard-muted-action">{t('dashboard.recent.replayUnavailable')}</span>}</div>
    </article>
  );
}

function Participant({ participant, props }: { participant: CharacterDetailBattle['participants'][number] | undefined; props: CharacterBattleRecordsSectionProps }) {
  const { t } = useTranslation();
  const Link = props.linkComponent ?? DefaultLink;
  if (!participant) return <span>{t('characters.detail.unknownOpponent')}</span>;
  const href = participant.name_redacted ? null : props.getCharacterHref?.(participant.public_id) ?? null;
  const className = `dashboard-battle-name-link${participant.public_id === props.ownerCharacterPublicId ? ' is-own' : ''}`;
  return href ? <Link className={className} href={href}>{participant.name}</Link> : <span>{participant.name}</span>;
}

function SectionHeading({ action, id, title }: { action?: ReactNode; id: string; title: string }) {
  return <div className="character-detail-section-heading"><h2 id={id}>{title}</h2>{action}</div>;
}

function ErrorWithRetry({ message, onRetry }: { message: string; onRetry?(): void }) {
  const { t } = useTranslation();
  return <div><p className="character-detail-error" role="alert">{message}</p>{onRetry ? <Button onClick={onRetry} size="sm" variant="secondary">{t('characters.detail.error.retry')}</Button> : null}</div>;
}

function PencilIcon() {
  return (
    <svg aria-hidden="true" fill="none" focusable="false" viewBox="0 0 24 24">
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function badgeLabels(t: ReturnType<typeof useTranslation>['t']): AgentDuelOwnedBadgeGalleryLabels {
  return {
    title: t('badges.title'), equippedTitle: t('badges.visibility.equippedTitle'), hiddenTitle: t('badges.visibility.hiddenTitle'),
    count: (count) => t('badges.count', { count }), awardedAt: (date) => t('badges.awardedAt', { date }), edit: t('badges.visibility.edit'), save: t('badges.visibility.save'), cancel: t('badges.visibility.cancel'), saving: t('common.processing'), hide: t('badges.visibility.hide'), show: t('badges.visibility.show'), visitorHint: t('badges.visibility.visitorHint'), equippedDropEmpty: t('badges.visibility.equippedDropEmpty'), hiddenDropEmpty: t('badges.visibility.hiddenDropEmpty'), saveFailed: t('badges.visibility.saveFailed'), dragInstructions: t('badges.visibility.dragInstructions'), dragStarted: (name) => t('badges.visibility.dragStarted', { name }), dragOverEquipped: (name) => t('badges.visibility.dragOverEquipped', { name }), dragOverHidden: (name) => t('badges.visibility.dragOverHidden', { name }), draggedToEquipped: (name) => t('badges.visibility.draggedToEquipped', { name }), draggedToHidden: (name) => t('badges.visibility.draggedToHidden', { name }), dragCancelled: t('badges.visibility.dragCancelled')
  };
}

function getResult(battle: CharacterDetailBattle, ownSide: 'red' | 'blue' | null): BattleResult {
  if (battle.winner_side === 'draw') return 'draw';
  if (!battle.winner_side || !ownSide) return 'unresolved';
  return battle.winner_side === ownSide ? 'win' : 'loss';
}

function getMatchLabel(battle: CharacterDetailBattle): { key: string; tooltip: string; tone: 'challenger' | 'random' | 'system' | 'target' } | null {
  if (battle.match_source === 'direct_challenge') return battle.challenge_role === 'target'
    ? { key: 'dashboard.matchLabel.directChallengeReceived', tooltip: 'dashboard.matchLabelTooltip.directChallengeReceived', tone: 'target' }
    : { key: 'dashboard.matchLabel.directChallengeStarted', tooltip: 'dashboard.matchLabelTooltip.directChallengeStarted', tone: 'challenger' };
  if (battle.match_source === 'ranked_matchmaking' && battle.viewer_match_role === 'matched') return { key: 'dashboard.matchLabel.systemMatch', tooltip: 'dashboard.matchLabelTooltip.rankedSystemMatched', tone: 'system' };
  if (battle.match_source === 'practice_random' || battle.match_source === 'ranked_matchmaking') return { key: 'dashboard.matchLabel.randomMatch', tooltip: battle.battle_type === 'ranked' ? 'dashboard.matchLabelTooltip.rankedRandomStarted' : 'dashboard.matchLabelTooltip.practiceRandomStarted', tone: 'random' };
  return null;
}

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

function formatDiagnostic(item: { line: number | null; column: number | null; code: string | null }): string {
  const location = item.line === null ? '' : `L${item.line}${item.column === null ? '' : `:${item.column}`}`;
  return [location, item.code].filter(Boolean).join(' · ');
}
