import { useTranslation } from 'react-i18next';
import { joinAssetUrl } from './characterModel';

const MAP_THUMBNAILS: Readonly<Record<string, { path: string; width: number; height: number }>> = {
  default_arena: { path: '/resources/v1/map/thumb/basic-map-small.png', width: 190, height: 116 },
  reedbank_ruins: { path: '/resources/v1/map/thumb/reedbank-ruins-small.png', width: 180, height: 116 },
  thicket_maze: { path: '/resources/v1/map/thumb/thicket-maze-small.png', width: 180, height: 116 },
  four_corners_ruins: { path: '/resources/v1/map/thumb/four-corners-ruins-small.png', width: 180, height: 116 }
};

export interface BattleDateMapMetaProps {
  assetBaseUrl?: string;
  createdAt: string;
  dateFormatter: Intl.DateTimeFormat;
  mapId: string;
}

export function BattleDateMapMeta({
  assetBaseUrl = 'https://www.agentduel.app',
  createdAt,
  dateFormatter,
  mapId
}: BattleDateMapMetaProps) {
  const { t } = useTranslation();
  const visual = MAP_THUMBNAILS[mapId];
  const mapName = t(`battleMap.names.${mapId}`, { defaultValue: mapId });
  return (
    <p className="battle-date-map-meta">
      <time dateTime={createdAt}>{dateFormatter.format(new Date(createdAt))}</time>
      <span className="battle-date-map-separator" aria-hidden="true">·</span>
      <span className="battle-map-label" tabIndex={0}>
        {mapName}
        <span className="battle-map-tooltip" role="tooltip">
          {visual ? <img alt="" aria-hidden="true" decoding="async" height={visual.height} loading="lazy" src={joinAssetUrl(assetBaseUrl, visual.path)} width={visual.width} /> : <span className="battle-map-tooltip-placeholder" aria-hidden="true" />}
          <strong>{mapName}</strong>
          <span>{t(`battleMap.descriptions.deathmatch.${mapId}`, { defaultValue: t('battleMap.previewUnavailable') })}</span>
        </span>
      </span>
    </p>
  );
}
