# @agentduel/deathmode

AgentDuel 死斗模式的 React 公共模块，包含五个可独立引用的子路径：

- `@agentduel/deathmode/character-create`：新建死斗角色。
- `@agentduel/deathmode/character-edit`：角色资料编辑与内容整改。
- `@agentduel/deathmode/character-list`：备战室角色列表、提交状态分区和排位摘要。
- `@agentduel/deathmode/character-detail`：我方与访客角色详情 Section。
- `@agentduel/deathmode/recent-battles`：死斗模式最近战斗、筛选与游标加载。

模块不直接绑定 Cookie 或 Bearer 鉴权。宿主通过 `dataSource` 注入请求实现，因此官网可以使用 Session Cookie，DSH 插件可以使用 `Authorization: Bearer <app_key>`，页面交互和解析逻辑保持同一份。

## 本地开发

```bash
npm install
npm test
npm run typecheck
npm run build
npm run pack:check
```

## 角色详情 Section

从 `@agentduel/deathmode/character-detail` 导入我方和访客 Section。组件只接收数据、链接和回调，不请求接口或依赖路由；代码提交区通过 `renderCodeEditor` 注入宿主编辑器，未注入时回退为 textarea。各入口会自动加载组件 CSS，宿主仍可显式引入统一 `styles.css`。

## 引用示例

```tsx
import { AgentDuelCharacterCreate } from '@agentduel/deathmode/character-create';
import '@agentduel/deathmode/styles.css';

<AgentDuelCharacterCreate
  dataSource={dataSource}
  locale="zh-CN"
  onCharacterCreated={(character) => navigate(`/characters/${character.public_id}`)}
  onUnauthorized={() => navigate('/login')}
/>
```

备战室列表由宿主传入已经获取的角色摘要，组件负责标题、状态分区和列表展示。面包屑由宿主在页面层组合，宿主也可注入 AI 模型徽标渲染器：

```tsx
import { AgentDuelCharacterList } from '@agentduel/deathmode/character-list';
import '@agentduel/deathmode/styles.css';

<AgentDuelCharacterList
  characters={dashboardSummary.characters}
  getCharacterHref={(publicId) => `/characters/${publicId}`}
  locale="zh-CN"
  renderAiModel={(aiModel, fallbackLabel) => (
    <AiModelBadge aiModel={aiModel} fallbackLabel={fallbackLabel} />
  )}
/>
```
