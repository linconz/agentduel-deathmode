# @agentduel/deathmode

AgentDuel 死斗模式的 React 公共模块，包含三个可独立引用的子路径：

- `@agentduel/deathmode/character-create`：新建死斗角色。
- `@agentduel/deathmode/character-edit`：角色资料编辑与内容整改。
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
