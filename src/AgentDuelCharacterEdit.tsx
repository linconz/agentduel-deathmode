import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Breadcrumbs, Button, ButtonLink } from './components';
import { createCharacterUpdateInput, getCharacterEditFormState } from './characterEditModel';
import { DeathmodeI18nBoundary, normalizeLocale } from './i18n';
import type { AgentDuelCharacterEditProps, DeathmatchCharacter } from './types';
import { readDeathmodeError } from './types';
import './styles.css';

type Status = 'loading' | 'ready' | 'error';

export function AgentDuelCharacterEdit(props: AgentDuelCharacterEditProps) {
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  return (
    <DeathmodeI18nBoundary locale={locale} mode={props.i18nMode}>
      <CharacterEditContent {...props} normalizedLocale={locale} />
    </DeathmodeI18nBoundary>
  );
}

function CharacterEditContent({
  characterDetailHref = (publicId) => `/characters/${publicId}`,
  characterPublicId,
  className,
  dashboardHref = '/dashboard',
  dataSource,
  linkComponent,
  normalizedLocale,
  onCharacterSaved,
  onUnauthorized,
  style
}: AgentDuelCharacterEditProps & { normalizedLocale: 'zh-CN' | 'en-US' }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('loading');
  const [character, setCharacter] = useState<DeathmatchCharacter | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!characterPublicId) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    setFormError(null);
    try {
      const nextCharacter = await dataSource.loadCharacter(characterPublicId, normalizedLocale);
      setCharacter(nextCharacter);
      setName(nextCharacter.name);
      setDescription(nextCharacter.description ?? '');
      setStatus('ready');
    } catch (error) {
      if (readDeathmodeError(error).status === 401) {
        onUnauthorized();
        return;
      }
      setStatus('error');
    }
  }, [characterPublicId, dataSource, normalizedLocale, onUnauthorized]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!character) return;

    const submission = createCharacterUpdateInput(character, name, description);
    if (submission.error || !submission.input) {
      setFormError(t(`characters.edit.errors.${submission.error ?? 'saveFailed'}`));
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const nextCharacter = await dataSource.updateCharacter(character.public_id, submission.input, normalizedLocale);
      onCharacterSaved(nextCharacter);
    } catch (error) {
      if (readDeathmodeError(error).status === 401) {
        onUnauthorized();
        return;
      }
      setFormError(t('characters.edit.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }

  const rootClassName = ['agentduel-deathmode', 'deathmode-character-edit', className ?? ''].filter(Boolean).join(' ');
  if (status === 'loading') {
    return <div className={rootClassName} style={style}><div className="dashboard-loading" role="status"><p>{t('characters.detail.loading')}</p></div></div>;
  }
  if (status === 'error' || !character) {
    return (
      <div className={rootClassName} style={style}>
        <section className="dashboard-error" aria-labelledby="character-detail-error-title">
          <p className="dashboard-kicker">{t('characters.detail.error.kicker')}</p>
          <h1 id="character-detail-error-title">{t('characters.detail.error.title')}</h1>
          <p>{t('characters.detail.error.copy')}</p>
          <Button onClick={() => void load()} variant="secondary" tone="neutral">{t('characters.detail.error.retry')}</Button>
        </section>
      </div>
    );
  }

  return (
    <div className={rootClassName} style={style}>
      <CharacterEditForm
        character={character}
        characterDetailHref={characterDetailHref(character.public_id)}
        dashboardHref={dashboardHref}
        description={description}
        formError={formError}
        isSaving={isSaving}
        linkComponent={linkComponent}
        name={name}
        onDescriptionChange={setDescription}
        onNameChange={setName}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function CharacterEditForm({
  character,
  characterDetailHref,
  dashboardHref,
  description,
  formError,
  isSaving,
  linkComponent,
  name,
  onDescriptionChange,
  onNameChange,
  onSubmit
}: {
  character: DeathmatchCharacter;
  characterDetailHref: string;
  dashboardHref: string;
  description: string;
  formError: string | null;
  isSaving: boolean;
  linkComponent: AgentDuelCharacterEditProps['linkComponent'];
  name: string;
  onDescriptionChange(value: string): void;
  onNameChange(value: string): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
}) {
  const { t } = useTranslation();
  const breadcrumbs = useMemo(() => [
    { label: t('dashboard.sidebar.dashboard'), href: dashboardHref },
    { label: character.name, href: characterDetailHref },
    { label: t('characters.edit.title') }
  ], [character.name, characterDetailHref, dashboardHref, t]);
  const {
    hasRequiredChange,
    isDescriptionInvalid,
    isNameInvalid,
    isSuspended,
    requiresName
  } = getCharacterEditFormState(character, name, description);

  return (
    <>
      <Breadcrumbs ariaLabel={t('characters.edit.breadcrumbAria')} items={breadcrumbs} linkComponent={linkComponent} />
      <section className="character-detail-hero" aria-labelledby="character-edit-title">
        <div>
          <p className="dashboard-kicker">{t('characters.edit.kicker')}</p>
          <h1 id="character-edit-title">{t('characters.edit.title')}</h1>
          <p>{t('characters.edit.copy')}</p>
          {character.status !== 'active' ? (
            <p className="content-remediation-inline-notice" role="status">
              {isSuspended
                ? t('characters.edit.suspendedNotice')
                : character.remediation?.submitted_at
                  ? t('characters.edit.submittedNotice')
                  : t('characters.edit.requiredNotice')}
            </p>
          ) : null}
        </div>
      </section>
      <section className="dashboard-section character-edit-section" aria-labelledby="character-edit-form-title">
        <div className="dashboard-section-heading"><h2 id="character-edit-form-title">{t('characters.edit.formTitle')}</h2></div>
        <form className="character-edit-form" onSubmit={onSubmit}>
          <label className="character-create-field">
            <span>{t('characters.edit.nameLabel')}</span>
            <input
              disabled={isSaving || isSuspended}
              maxLength={10}
              onChange={(event) => onNameChange(event.target.value)}
              readOnly={!requiresName}
              required={requiresName}
              value={name}
            />
            <small className={isNameInvalid ? 'is-invalid' : undefined}>
              {requiresName ? t('characters.edit.nameRemediationHelp') : t('characters.edit.nameImmutableHelp')}
            </small>
          </label>
          <label className="character-create-field">
            <span>{t('characters.edit.descriptionLabel')}</span>
            <textarea
              disabled={isSaving || isSuspended}
              maxLength={300}
              onChange={(event) => onDescriptionChange(event.target.value)}
              rows={6}
              value={description}
            />
            <small className={isDescriptionInvalid ? 'is-invalid' : undefined}>{t('characters.edit.descriptionHelp', { count: description.length })}</small>
          </label>
          {formError ? <p className="character-create-form-error" role="alert">{formError}</p> : null}
          <div className="character-edit-actions">
            <ButtonLink href={characterDetailHref} linkComponent={linkComponent} variant="secondary" tone="neutral">{t('characters.edit.cancel')}</ButtonLink>
            <Button
              disabled={isDescriptionInvalid || isNameInvalid || !hasRequiredChange || isSuspended}
              loading={isSaving}
              loadingLabel={t('characters.edit.saving')}
              type="submit"
            >
              {character.status === 'active' ? t('characters.edit.save') : t('characters.edit.submitRemediation')}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
