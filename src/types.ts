import type { CSSProperties, ReactNode } from 'react';

export type DeathmodeLocale = 'zh-CN' | 'en-US' | 'zh_CN' | 'en_US';
export type NormalizedDeathmodeLocale = 'zh-CN' | 'en-US';
export type DeathmodeI18nMode = 'bundled' | 'host';
export type CharacterClassId = 'warrior' | 'mage' | 'hunter';
export type ContentStatus = 'active' | 'name_violation' | 'description_violation' | 'all_violation' | 'suspended';
export type BattleType = 'practice' | 'ranked';
export type BattleStatus = 'pending' | 'running' | 'done' | 'error' | 'canceled';
export type BattleSide = 'red' | 'blue';
export type BattleResult = 'win' | 'loss' | 'draw' | 'unresolved';
export type BattleChallengeRole = 'challenger' | 'target';
export type BattleRecordResultFilter = 'win' | 'loss';

export interface ContentRemediationSummary {
  violation_type: 'name_violation' | 'description_violation' | 'all_violation';
  marked_at: string;
  submitted_at: string | null;
}

export interface EnabledCharacterClass {
  class_id: CharacterClassId;
  sort_order: number;
}

export interface DeathmatchCharacter {
  public_id: string;
  name: string;
  description: string | null;
  status: ContentStatus;
  remediation: ContentRemediationSummary | null;
  class_id: CharacterClassId;
}

export interface CharacterCreateContext {
  characterCount: number;
  maxCharacterSlots: number;
  enabledClasses: EnabledCharacterClass[];
}

export interface CharacterCreateInput {
  name: string;
  classId: CharacterClassId;
}

export interface CharacterUpdateInput {
  name?: string;
  description?: string;
}

export interface CharacterCreateDataSource {
  loadContext(locale: NormalizedDeathmodeLocale): Promise<CharacterCreateContext>;
  createCharacter(input: CharacterCreateInput, locale: NormalizedDeathmodeLocale): Promise<DeathmatchCharacter>;
  resolveErrorMessage?(error: unknown, locale: NormalizedDeathmodeLocale): Promise<string | null>;
}

export interface CharacterEditDataSource {
  loadCharacter(characterPublicId: string, locale: NormalizedDeathmodeLocale): Promise<DeathmatchCharacter>;
  updateCharacter(
    characterPublicId: string,
    input: CharacterUpdateInput,
    locale: NormalizedDeathmodeLocale
  ): Promise<DeathmatchCharacter>;
}

export interface DeathmatchBattleParticipant {
  side: BattleSide;
  kind: 'character';
  public_id: string;
  name: string;
  name_redacted?: boolean;
  rating_delta: number | null;
}

export interface DeathmatchBattle {
  public_id: string;
  share_path: string | null;
  battle_type: BattleType;
  match_source?: 'practice_random' | 'direct_challenge' | 'ranked_matchmaking';
  viewer_match_role?: 'initiator' | 'matched' | null;
  challenge_role?: BattleChallengeRole | null;
  can_revenge?: boolean;
  revenge_target?: { public_id: string; name: string } | null;
  game_mode_id: 'deathmatch';
  map_id: string;
  status: BattleStatus;
  participants: DeathmatchBattleParticipant[];
  winner_side: BattleSide | 'draw' | null;
  replay_available: boolean;
  created_at: string;
}

export interface DeathmatchBattleRecordsPage {
  battles: DeathmatchBattle[];
  next_cursor: string | null;
}

export interface DeathmatchBattleRecordFilters {
  battleTypes: BattleType[];
  challengeRoles: BattleChallengeRole[];
  results: BattleRecordResultFilter[];
}

export interface DeathmatchBattleRecordsQuery extends DeathmatchBattleRecordFilters {
  cursor?: string | null;
  limit?: number;
}

export interface DeathmatchRecentBattlesContext {
  ownedCharacterPublicIds: string[];
}

export interface DeathmatchRecentBattlesDataSource {
  loadContext(locale: NormalizedDeathmodeLocale): Promise<DeathmatchRecentBattlesContext>;
  loadBattles(
    query: DeathmatchBattleRecordsQuery,
    locale: NormalizedDeathmodeLocale
  ): Promise<DeathmatchBattleRecordsPage>;
}

export interface DeathmodeLinkProps {
  'aria-label'?: string;
  children: ReactNode;
  className?: string;
  href: string;
}

export type DeathmodeLinkComponent = (props: DeathmodeLinkProps) => ReactNode;

export interface DeathmodeModuleProps {
  className?: string;
  i18nMode?: DeathmodeI18nMode;
  linkComponent?: DeathmodeLinkComponent;
  locale?: DeathmodeLocale;
  onUnauthorized(): void;
  style?: CSSProperties;
}

export interface AgentDuelCharacterCreateProps extends DeathmodeModuleProps {
  assetBaseUrl?: string;
  backToDashboardHref?: string;
  dataSource: CharacterCreateDataSource;
  onCharacterCreated(character: DeathmatchCharacter): void;
}

export interface AgentDuelCharacterEditProps extends DeathmodeModuleProps {
  dashboardHref?: string;
  characterDetailHref?(characterPublicId: string): string;
  characterPublicId: string;
  dataSource: CharacterEditDataSource;
  onCharacterSaved(character: DeathmatchCharacter): void;
}

export interface AgentDuelDeathmatchRecentBattlesProps extends DeathmodeModuleProps {
  assetBaseUrl?: string;
  dashboardHref?: string;
  dataSource: DeathmatchRecentBattlesDataSource;
  getCharacterHref?(characterPublicId: string, view: 'owned' | 'public'): string | null;
  getReplayHref?(battle: DeathmatchBattle): string | null;
  getRevengeHref?(battle: DeathmatchBattle, ownCharacterPublicId: string): string | null;
}

export type CharacterListSubmissionStatus = 'pending_compile' | 'compiling' | 'compile_failed' | 'rejected';

export interface CharacterListLatestSubmission {
  version_no: number;
  status: CharacterListSubmissionStatus;
}

export interface CharacterListActiveCode {
  version_no: number;
  ai_model: string | null;
}

export interface CharacterListRankedResults {
  wins: number;
  draws: number;
  losses: number;
}

export interface DeathmatchCharacterListItem {
  public_id: string;
  name: string;
  status?: ContentStatus;
  class_id: CharacterClassId;
  created_at: string;
  active_code: CharacterListActiveCode | null;
  ranked_rating: number;
  ranked_results: CharacterListRankedResults;
  latest_submission: CharacterListLatestSubmission | null;
}

export type AgentDuelCharacterListProps = Omit<DeathmodeModuleProps, 'onUnauthorized'> & {
  characters: DeathmatchCharacterListItem[];
  createCharacterHref?: string;
  dashboardHref?: string;
  getCharacterHref?(characterPublicId: string): string;
  renderAiModel?(aiModel: string | null, fallbackLabel: string): ReactNode;
};

export class DeathmodeApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(status: number, code: string | null = null, message = `Deathmode request failed with status ${status}`) {
    super(message);
    this.name = 'DeathmodeApiError';
    this.status = status;
    this.code = code;
  }
}

export function readDeathmodeError(error: unknown): { status: number | null; code: string | null } {
  if (!error || typeof error !== 'object') {
    return { status: null, code: null };
  }
  const candidate = error as Record<string, unknown>;
  return {
    status: typeof candidate.status === 'number' ? candidate.status : null,
    code: typeof candidate.code === 'string' ? candidate.code : null
  };
}
