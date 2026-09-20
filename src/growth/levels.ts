import { CategoryKind } from '../db/types';

export const XP_PER_ACTION = 10;

export interface CharacterStage {
  minLevel: number;
  name: string;
  emoji: string;
  flavor: string;
}

export type Lineage = Exclude<CategoryKind, 'weight'>;

export function isLineage(kind: CategoryKind | null | undefined): kind is Lineage {
  return kind != null && kind !== 'weight';
}

export const lineages: Record<Lineage, CharacterStage[]> = {
  bird: [
    { minLevel: 1, name: 'たまご', emoji: '🥚', flavor: '英語の旅はここから。まずは毎日ひとつ。' },
    { minLevel: 3, name: 'ひよこ', emoji: '🐣', flavor: '殻を破った！簡単なフレーズが口から出てくる。' },
    { minLevel: 6, name: 'ことり', emoji: '🐤', flavor: '毎日の積み上げで羽が生えてきた。' },
    { minLevel: 10, name: 'はばたき鳥', emoji: '🐦', flavor: '短い会話ならもう飛べる。' },
    { minLevel: 15, name: 'オウム', emoji: '🦜', flavor: 'ネイティブの表現をどんどん真似できる。' },
    { minLevel: 20, name: 'ハクチョウ', emoji: '🦢', flavor: '流れるように英語が出てくる優雅さ。' },
    { minLevel: 30, name: 'イーグル', emoji: '🦅', flavor: '世界のどこでも自由に羽ばたける。' },
  ],
  engineer: [
    { minLevel: 1, name: 'たまご', emoji: '🥚', flavor: 'エンジニアへの第一歩。まずは触ってみよう。' },
    { minLevel: 3, name: '見習い', emoji: '🐣', flavor: 'Hello, World! コードが動く喜びを知った。' },
    { minLevel: 6, name: 'ジュニア', emoji: '🧑‍💻', flavor: '小さな機能なら自分で作れる。' },
    { minLevel: 10, name: 'ビルダー', emoji: '🛠️', flavor: 'アプリをまるごと組み上げられる。' },
    { minLevel: 15, name: 'ハッカー', emoji: '🚀', flavor: 'Devinと組んで開発スピードが爆上がり。' },
    { minLevel: 20, name: 'シニア', emoji: '🧙', flavor: '設計もレビューもお任せ。チームの柱。' },
    { minLevel: 30, name: 'レジェンド', emoji: '👑', flavor: '作りたいものを何でも形にできる存在。' },
  ],
  reader: [
    { minLevel: 1, name: 'しおり', emoji: '🔖', flavor: '最初の1ページを開いた。旅はここから。' },
    { minLevel: 3, name: 'ひなフクロウ', emoji: '🐣', flavor: '毎日少しずつ。本を開くのが習慣になってきた。' },
    { minLevel: 6, name: 'フクロウ', emoji: '🦉', flavor: '夕方の読書が一日の楽しみに。' },
    { minLevel: 10, name: '本の虫', emoji: '📖', flavor: 'ジャンルを跨いで読めるようになった。' },
    { minLevel: 15, name: '学者', emoji: '🎓', flavor: '読んだことを人に語れる。' },
    { minLevel: 20, name: '賢者', emoji: '🧙', flavor: '本と本がつながり、自分の考えが生まれる。' },
    { minLevel: 30, name: '図書館の主', emoji: '🏛️', flavor: '頭の中に図書館がある。何でも引き出せる。' },
  ],
  athlete: [
    { minLevel: 1, name: 'もやし', emoji: '🌱', flavor: 'まずは体を動かす。たった1回から。' },
    { minLevel: 3, name: 'ルーキー', emoji: '🤾', flavor: '筋肉痛が成長の証。続けるのが一番強い。' },
    { minLevel: 6, name: 'トレーニー', emoji: '🏋️', flavor: 'フォームが固まって重量が上がってきた。' },
    { minLevel: 10, name: 'ファイター', emoji: '🥊', flavor: '体が変わってきたのが鏡でわかる。' },
    { minLevel: 15, name: 'アスリート', emoji: '🏃', flavor: '体力も気力も別次元に。' },
    { minLevel: 20, name: 'マンバ', emoji: '🐍', flavor: '朝4時のトレーニングも苦じゃない。Mamba Mentality。' },
    { minLevel: 30, name: 'レジェンド', emoji: '🏆', flavor: 'トレをしないと一日が始まらない。体は一生の相棒。' },
  ],
};

/** レベル n から n+1 に必要な XP。少しずつ重くなる */
export function xpToNextLevel(level: number): number {
  return 30 + (level - 1) * 10;
}

export interface LevelState {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForLevel: number;
  progress: number;
  stage: CharacterStage;
  nextStage: CharacterStage | null;
}

export function xpFromCompletions(count: number): number {
  return count * XP_PER_ACTION;
}

export function levelFromXp(totalXp: number): { level: number; xpIntoLevel: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining };
}

export function stageForLevel(lineage: Lineage, level: number): CharacterStage {
  const stages = lineages[lineage];
  return [...stages].reverse().find((stage) => level >= stage.minLevel) ?? stages[0];
}

export function getLevelState(lineage: Lineage, completions: number): LevelState {
  const totalXp = xpFromCompletions(completions);
  const { level, xpIntoLevel } = levelFromXp(totalXp);
  const xpForLevel = xpToNextLevel(level);
  const stage = stageForLevel(lineage, level);
  const nextStage = lineages[lineage].find((entry) => entry.minLevel > level) ?? null;
  return { level, totalXp, xpIntoLevel, xpForLevel, progress: xpIntoLevel / xpForLevel, stage, nextStage };
}
