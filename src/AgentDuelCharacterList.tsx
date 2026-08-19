import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Breadcrumbs, ButtonLink, DefaultLink } from './components';
import { DeathmodeI18nBoundary, normalizeLocale } from './i18n';
import type {
  AgentDuelCharacterListProps,
  CharacterListLatestSubmission,
  DeathmatchCharacterListItem,
  DeathmodeLinkComponent
} from './types';
import './styles.css';

export function AgentDuelCharacterList(props: AgentDuelCharacterListProps) {
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  return (
    <DeathmodeI18nBoundary locale={locale} mode={props.i18nMode}>
      <CharacterListContent {...props} normalizedLocale={locale} />
    </DeathmodeI18nBoundary>
  );
}

function CharacterListContent({
  characters,
  className,
  createCharacterHref = '/characters/new',
  dashboardHref = '/dashboard',
  getCharacterHref = defaultCharacterHref,
  linkComponent,
  normalizedLocale,
  renderAiModel,
  style
}: AgentDuelCharacterListProps & { normalizedLocale: 'zh-CN' | 'en-US' }) {
  const { t } = useTranslation();
  const pending = characters.filter(isPendingSubmission);
  const problems = characters.filter(isProblemSubmission);
  const rootClassName = ['agentduel-deathmode', 'deathmode-character-list', className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={rootClassName} style={style}>
      <Breadcrumbs
        ariaLabel={t('dashboard.modePage.breadcrumbAria')}
        items={[
          { href: dashboardHref, label: t('dashboard.sidebar.overview') },
          { label: t('dashboard.sidebar.deathmatch') },
          { label: t('dashboard.sidebar.characters') }
        ]}
        linkComponent={linkComponent}
      />
      <section className="mode-list-heading" aria-labelledby="deathmode-character-list-title">
        <div>
          <p className="dashboard-kicker">{t('dashboard.sidebar.deathmatch')}</p>
          <h1 id="deathmode-character-list-title">{t('dashboard.sidebar.characters')}</h1>
          <p>{t('dashboard.modePage.charactersCopy')}</p>
        </div>
        <ButtonLink href={createCharacterHref} linkComponent={linkComponent} variant="secondary">
          {t('dashboard.characters.create')}
        </ButtonLink>
      </section>
      {pending.length > 0 ? (
        <SubmissionSection
          characters={pending}
          getCharacterHref={getCharacterHref}
          linkComponent={linkComponent}
          title={t('dashboard.modePage.compiling')}
        />
      ) : null}
      {problems.length > 0 ? (
        <SubmissionSection
          characters={problems}
          getCharacterHref={getCharacterHref}
          linkComponent={linkComponent}
          problem
          title={t('dashboard.attention.title')}
        />
      ) : null}
      <section className="mode-list-section" aria-labelledby="deathmode-character-list-section-title">
        <div className="dashboard-section-heading">
          <h2 id="deathmode-character-list-section-title">{t('dashboard.sidebar.characters')}</h2>
          <span className="mode-list-count">{characters.length}</span>
        </div>
        {characters.length === 0 ? (
          <div className="mode-list-empty"><p>{t('dashboard.characters.empty')}</p></div>
        ) : (
          <div className="mode-list-rows">
            {characters.map((character) => (
              <CharacterRow
                character={character}
                dateLocale={normalizedLocale}
                getCharacterHref={getCharacterHref}
                key={character.public_id}
                linkComponent={linkComponent}
                renderAiModel={renderAiModel}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SubmissionSection({
  characters,
  getCharacterHref,
  linkComponent: Link = DefaultLink,
  problem = false,
  title
}: {
  characters: DeathmatchCharacterListItem[];
  getCharacterHref(characterPublicId: string): string;
  linkComponent?: DeathmodeLinkComponent;
  problem?: boolean;
  title: string;
}) {
  const { t } = useTranslation();
  return (
    <section className={`mode-list-submission-section${problem ? ' is-problem' : ''}`} aria-label={title}>
      <div className="dashboard-section-heading"><h2>{title}</h2></div>
      <div className="mode-list-submission-rows">
        {characters.map((character) => {
          const submission = character.latest_submission;
          if (!submission) return null;
          return (
            <Link className="mode-list-submission-row" href={getCharacterHref(character.public_id)} key={character.public_id}>
              <span>{character.name}</span>
              <span>v{submission.version_no}</span>
              <strong>{t(`dashboard.submission.${submission.status}`)}</strong>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CharacterRow({
  character,
  dateLocale,
  getCharacterHref,
  linkComponent: Link = DefaultLink,
  renderAiModel
}: {
  character: DeathmatchCharacterListItem;
  dateLocale: 'zh-CN' | 'en-US';
  getCharacterHref(characterPublicId: string): string;
  linkComponent?: DeathmodeLinkComponent;
  renderAiModel?: AgentDuelCharacterListProps['renderAiModel'];
}) {
  const { t } = useTranslation();
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium' }),
    [dateLocale]
  );
  const results = character.ranked_results;
  const fallbackModelLabel = t('dashboard.modePage.unknownModel');

  return (
    <Link
      className="mode-list-row"
      href={getCharacterHref(character.public_id)}
      aria-label={t('dashboard.characters.openDetail', { name: character.name })}
    >
      <div className="mode-list-identity">
        <h3>{character.name}</h3>
        <p>{t(`replay.class.${character.class_id}`)} · {dateFormatter.format(new Date(character.created_at))}</p>
      </div>
      <div className="mode-list-metrics">
        <div className="mode-list-state">
          <span>{t('dashboard.modePage.status')}</span>
          {character.status !== undefined && character.status !== 'active' ? (
            <strong className="mode-list-content-status">{t(`dashboard.remediation.status.${character.status}`)}</strong>
          ) : character.active_code ? (
            <strong className="mode-list-active-code">
              <span>v{character.active_code.version_no}</span>
              {renderAiModel
                ? renderAiModel(character.active_code.ai_model, fallbackModelLabel)
                : <span>{character.active_code.ai_model?.trim() || fallbackModelLabel}</span>}
            </strong>
          ) : <strong>{t('dashboard.codeSource.default')}</strong>}
        </div>
        <div>
          <span>{t('dashboard.modePage.record')}</span>
          <strong>{results.wins}/{results.draws}/{results.losses}</strong>
        </div>
        <div>
          <span>{t('dashboard.stats.rating')}</span>
          <strong>{character.ranked_rating}</strong>
        </div>
      </div>
      <svg className="mode-list-arrow" viewBox="0 0 10 12" aria-hidden="true" focusable="false">
        <path d="M2 1.5L8 6L2 10.5Z" fill="currentColor" />
      </svg>
    </Link>
  );
}

function defaultCharacterHref(characterPublicId: string): string {
  return `/characters/${characterPublicId}`;
}

function isPendingSubmission(character: DeathmatchCharacterListItem): boolean {
  const submission = character.latest_submission;
  return submission !== null
    && (submission.status === 'pending_compile' || submission.status === 'compiling')
    && isNewerThanActive(submission, character);
}

function isProblemSubmission(character: DeathmatchCharacterListItem): boolean {
  const submission = character.latest_submission;
  return submission !== null
    && (submission.status === 'compile_failed' || submission.status === 'rejected')
    && isNewerThanActive(submission, character);
}

function isNewerThanActive(
  submission: CharacterListLatestSubmission,
  character: DeathmatchCharacterListItem
): boolean {
  return character.active_code === null || submission.version_no > character.active_code.version_no;
}
