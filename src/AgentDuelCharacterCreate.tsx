import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Breadcrumbs, Button, ButtonLink } from './components';
import {
  createCharacterClassOptions,
  getCharacterNameHelpParams,
  getDefaultCharacterClassId,
  isCharacterNameValid,
  joinAssetUrl,
  type CharacterClassOption,
  type CharacterSkillProfile
} from './characterModel';
import { DeathmodeI18nBoundary, normalizeLocale } from './i18n';
import type { AgentDuelCharacterCreateProps, CharacterClassId } from './types';
import { readDeathmodeError } from './types';
import './styles.css';

type Status = 'loading' | 'ready' | 'error';

export function AgentDuelCharacterCreate(props: AgentDuelCharacterCreateProps) {
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  return (
    <DeathmodeI18nBoundary locale={locale} mode={props.i18nMode}>
      <CharacterCreateContent {...props} normalizedLocale={locale} />
    </DeathmodeI18nBoundary>
  );
}

function CharacterCreateContent({
  assetBaseUrl = 'https://www.agentduel.app',
  backToDashboardHref = '/dashboard',
  className,
  dataSource,
  linkComponent,
  normalizedLocale,
  onCharacterCreated,
  onUnauthorized,
  style
}: AgentDuelCharacterCreateProps & { normalizedLocale: 'zh-CN' | 'en-US' }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('loading');
  const [context, setContext] = useState<{ characterCount: number; maxCharacterSlots: number } | null>(null);
  const [classOptions, setClassOptions] = useState<CharacterClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<CharacterClassId>('warrior');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setStatus('loading');
    setFormError(null);
    try {
      const nextContext = await dataSource.loadContext(normalizedLocale);
      const nextOptions = createCharacterClassOptions(nextContext.enabledClasses);
      setContext(nextContext);
      setClassOptions(nextOptions);
      setSelectedClassId(getDefaultCharacterClassId(nextOptions));
      setStatus('ready');
    } catch (error) {
      if (readDeathmodeError(error).status === 401) {
        onUnauthorized();
        return;
      }
      setStatus('error');
    }
  }, [dataSource, normalizedLocale, onUnauthorized]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedOption = useMemo(
    () => classOptions.find((option) => option.classId === selectedClassId) ?? classOptions[0],
    [classOptions, selectedClassId]
  );
  const canCreateCharacter = context !== null && context.characterCount < context.maxCharacterSlots;
  const remainingSlots = context ? Math.max(0, context.maxCharacterSlots - context.characterCount) : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!selectedOption?.isAvailable || !canCreateCharacter) return;
    if (!isCharacterNameValid(name)) {
      setFormError(t('characters.create.form.errors.invalidName'));
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const character = await dataSource.createCharacter({
        name: name.trim(),
        classId: selectedOption.classId
      }, normalizedLocale);
      onCharacterCreated(character);
    } catch (error) {
      if (readDeathmodeError(error).status === 401) {
        onUnauthorized();
        return;
      }
      const localizedMessage = await dataSource.resolveErrorMessage?.(error, normalizedLocale);
      setFormError(localizedMessage ?? t('characters.create.form.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={['agentduel-deathmode', 'deathmode-character-create', className ?? ''].filter(Boolean).join(' ')} style={style}>
      {status === 'loading' ? <div className="dashboard-loading" role="status"><p>{t('characters.create.loading')}</p></div> : null}
      {status === 'error' ? (
        <section className="dashboard-error" aria-labelledby="character-create-error-title">
          <p className="dashboard-kicker">{t('characters.create.error.kicker')}</p>
          <h1 id="character-create-error-title">{t('characters.create.error.title')}</h1>
          <p>{t('characters.create.error.copy')}</p>
          <Button onClick={() => void load()} variant="secondary" tone="neutral">{t('characters.create.error.retry')}</Button>
        </section>
      ) : null}
      {status === 'ready' && context ? (
        <>
          <Breadcrumbs
            ariaLabel={t('characters.create.breadcrumbAria')}
            items={[{ label: t('dashboard.sidebar.dashboard'), href: backToDashboardHref }, { label: t('characters.create.title') }]}
            linkComponent={linkComponent}
          />
          <section className="character-create-hero" aria-labelledby="character-create-title">
            <div>
              <p className="dashboard-kicker">{t('characters.create.kicker')}</p>
              <h1 id="character-create-title">{t('characters.create.title')}</h1>
              <p>{t('characters.create.copy')}</p>
            </div>
            <dl className="character-create-slots" aria-label={t('characters.create.slotsAria')}>
              <div><dt>{t('characters.create.remainingSlots')}</dt><dd>{remainingSlots}</dd></div>
            </dl>
          </section>
          {!canCreateCharacter ? (
            <section className="character-create-full" aria-labelledby="character-create-full-title">
              <h2 id="character-create-full-title">{t('characters.create.full.title')}</h2>
              <p>{t('characters.create.full.copy')}</p>
              <ButtonLink href={backToDashboardHref} linkComponent={linkComponent} size="sm" variant="secondary" tone="neutral">
                {t('characters.create.full.backToDashboard')}
              </ButtonLink>
            </section>
          ) : (
            <>
              <section className="dashboard-section" aria-labelledby="character-create-class-title">
                <div className="dashboard-section-heading"><h2 id="character-create-class-title">{t('characters.create.classSelectionTitle')}</h2></div>
                <div className="character-class-grid" role="radiogroup" aria-label={t('characters.create.classSelectionAria')}>
                  {classOptions.map((option) => (
                    <CharacterClassButton
                      assetBaseUrl={assetBaseUrl}
                      isSelected={selectedOption?.classId === option.classId}
                      key={option.classId}
                      option={option}
                      onSelect={setSelectedClassId}
                    />
                  ))}
                </div>
              </section>
              {selectedOption ? (
                <section className="character-create-layout" aria-labelledby="character-create-profile-title">
                  <CharacterClassProfilePanel option={selectedOption} />
                  <CharacterCreateForm
                    formError={formError}
                    isDisabled={!selectedOption.isAvailable}
                    isSubmitting={isSubmitting}
                    name={name}
                    onNameChange={setName}
                    onSubmit={handleSubmit}
                  />
                </section>
              ) : null}
            </>
          )}
        </>
      ) : null}
    </div>
  );
}

function CharacterClassButton({
  assetBaseUrl,
  isSelected,
  option,
  onSelect
}: {
  assetBaseUrl: string;
  isSelected: boolean;
  option: CharacterClassOption;
  onSelect(classId: CharacterClassId): void;
}) {
  const { t } = useTranslation();
  const profile = option.profile;
  return (
    <button
      className="character-class-option"
      disabled={!option.isAvailable}
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(option.classId)}
    >
      <span className="character-class-option-art" aria-hidden="true"><img src={joinAssetUrl(assetBaseUrl, profile.logoUrl)} alt="" /></span>
      <span className="character-class-option-copy">
        <strong>{t(`characters.create.classes.${profile.i18nKey}.name`)}</strong>
        <span>{t(`characters.create.classes.${profile.i18nKey}.tagline`)}</span>
      </span>
      {!option.isAvailable ? <span className="character-class-unavailable">{t('characters.create.classUnavailable')}</span> : null}
    </button>
  );
}

function CharacterClassProfilePanel({ option }: { option: CharacterClassOption }) {
  const { t } = useTranslation();
  const profile = option.profile;
  return (
    <article className="character-profile-panel" aria-labelledby="character-create-profile-title">
      <div className="character-profile-heading">
        <div><p className="dashboard-kicker">{t('characters.create.profileKicker')}</p><h2 id="character-create-profile-title">{t(`characters.create.classes.${profile.i18nKey}.name`)}</h2></div>
        {!option.isAvailable ? <span className="character-class-unavailable">{t('characters.create.classUnavailable')}</span> : null}
      </div>
      <dl className="character-profile-stats" aria-label={t('characters.create.profileStatsAria')}>
        <div><dt>{t('characters.create.stats.hp')}</dt><dd>{profile.hp}</dd></div>
        <div><dt>{t('characters.create.stats.actionPoints')}</dt><dd>{profile.actionPoints}</dd></div>
        <div><dt>{t('characters.create.stats.basicAttackRange')}</dt><dd>{formatRange(profile.basicAttackRange, t)}</dd></div>
      </dl>
      <div className="character-profile-role"><h3>{t('characters.create.combatTitle')}</h3><p>{t(`characters.create.classes.${profile.i18nKey}.combat`)}</p></div>
      <div className="character-skill-list" aria-label={t('characters.create.skillsTitle')}>
        {profile.skills.map((skill) => <CharacterSkillRow profileKey={profile.i18nKey} skill={skill} key={skill.skillId} />)}
      </div>
    </article>
  );
}

function CharacterSkillRow({ profileKey, skill }: { profileKey: string; skill: CharacterSkillProfile }) {
  const { t } = useTranslation();
  return (
    <div className="character-skill-row">
      <div><strong>{t(`characters.create.skills.${profileKey}.${skill.i18nKey}.name`)}</strong><code>{skill.skillId}</code></div>
      <dl>
        <div><dt>{t('characters.create.skillMeta.cost')}</dt><dd>{skill.cost}</dd></div>
        <div><dt>{t('characters.create.skillMeta.range')}</dt><dd>{formatRange(skill.range, t)}</dd></div>
        <div><dt>{t('characters.create.skillMeta.cooldown')}</dt><dd>{skill.cooldown}</dd></div>
      </dl>
      <p>{t(`characters.create.skills.${profileKey}.${skill.i18nKey}.effect`)}</p>
    </div>
  );
}

function CharacterCreateForm({
  formError,
  isDisabled,
  isSubmitting,
  name,
  onNameChange,
  onSubmit
}: {
  formError: string | null;
  isDisabled: boolean;
  isSubmitting: boolean;
  name: string;
  onNameChange(value: string): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
}) {
  const { t } = useTranslation();
  const nameHelp = getCharacterNameHelpParams(name);
  const isNameValid = isCharacterNameValid(name);
  return (
    <form className="character-create-form" onSubmit={onSubmit}>
      <div><p className="dashboard-kicker">{t('characters.create.form.kicker')}</p><h2>{t('characters.create.form.title')}</h2></div>
      <label className="character-create-field">
        <span>{t('characters.create.form.nameLabel')}</span>
        <input
          aria-invalid={nameHelp.isInvalid}
          disabled={isDisabled || isSubmitting}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={t('characters.create.form.namePlaceholder')}
          value={name}
        />
        <small className={nameHelp.isInvalid ? 'is-invalid' : undefined}>{t('characters.create.form.nameHelp', { count: nameHelp.count, max: nameHelp.max })}</small>
        <small>{t('characters.create.form.nameImmutableHelp')}</small>
      </label>
      {isDisabled ? <p className="character-create-form-error">{t('characters.create.form.errors.classUnavailable')}</p> : null}
      {formError ? <p className="character-create-form-error" role="alert">{formError}</p> : null}
      <Button disabled={isDisabled || !isNameValid} loading={isSubmitting} loadingLabel={t('characters.create.form.creating')} type="submit" width="full">
        {t('characters.create.form.create')}
      </Button>
    </form>
  );
}

function formatRange(range: string, t: ReturnType<typeof useTranslation>['t']): string {
  if (range === 'self') return t('characters.create.range.self');
  if (range === 'self-1') return t('characters.create.range.selfAround');
  return t('characters.create.range.cells', { range });
}
