// src/dictionaries/index.ts
// ここで各チャンネルの辞書を登録し、外部から利用できるようにします。

import { SKILL_DETERMINISTIC, SKILL_STYLE, SKILL_AI_CONTEXT, SKILL_CONSISTENCY, SKILL_FORMATTING } from './skill-kakutoku';
import { NAKANO_DETERMINISTIC, NAKANO_STYLE, NAKANO_AI_CONTEXT, NAKANO_CONSISTENCY, NAKANO_FORMATTING } from './nakano-shiki';

export type AppProfile = {
  id: string;
  name: string;
  formatting: {
    fullWidthSpaceToHalf: boolean;
    consecutiveSpacesToOne: boolean;
    fullWidthNumbersToHalf: boolean;
    fullWidthSymbolsToHalf: boolean;
    halfWidthSymbolsToFull: boolean;
    halfWidthKatakanaToFull: boolean;
  };
  deterministic: { pattern: RegExp; correct: string; reason: string }[];
  style: { pattern: RegExp; correct: string; reason: string }[];
  aiContext: string;
  consistency: any[];
};

export const PROFILES: Record<string, AppProfile> = {
  'skill-kakutoku': {
    id: 'skill-kakutoku',
    name: 'スキル獲得',
    formatting: SKILL_FORMATTING,
    deterministic: SKILL_DETERMINISTIC,
    style: SKILL_STYLE,
    aiContext: SKILL_AI_CONTEXT,
    consistency: SKILL_CONSISTENCY,
  },
  'nakano-shiki': {
    id: 'nakano-shiki',
    name: '中野式',
    formatting: NAKANO_FORMATTING,
    deterministic: NAKANO_DETERMINISTIC,
    style: NAKANO_STYLE,
    aiContext: NAKANO_AI_CONTEXT,
    consistency: NAKANO_CONSISTENCY,
  }
};

// 現在のビルドモード
export const APP_MODE = import.meta.env.VITE_APP_MODE || 'master';
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'TelopGuard';

// 現在のモードで利用可能なプロファイルのリスト
const modes = APP_MODE.split(',').map((m: string) => m.trim());
const filteredProfiles = modes.map((m: string) => PROFILES[m]).filter(Boolean);

export const AVAILABLE_PROFILES = modes.includes('master') 
  ? Object.values(PROFILES) 
  : filteredProfiles.length > 0 ? filteredProfiles : [Object.values(PROFILES)[0]];
