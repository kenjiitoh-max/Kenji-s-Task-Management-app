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
    { minLevel: 1, name: 'こねこ', emoji: '🐱', flavor: '英語の旅はここから。ABC を口ずさむ小さなトラ。' },
    { minLevel: 3, name: 'トラの子', emoji: '🐯', flavor: '縞が出てきた！簡単なフレーズが口から出てくる。' },
    { minLevel: 6, name: 'わかトラ', emoji: '🎧', flavor: 'ヘッドホンで毎日リスニング。耳が英語に慣れてきた。' },
    { minLevel: 10, name: 'ハンター', emoji: '🛂', flavor: 'パスポート片手に短い会話ならもう狩れる。' },
    { minLevel: 15, name: 'タイガー', emoji: '🐅', flavor: 'ネイティブの表現をどんどん真似できる。' },
    { minLevel: 20, name: 'ホワイトタイガー', emoji: '❄️', flavor: '流れるように英語が出てくる、氷のような落ち着き。' },
    { minLevel: 30, name: 'キングタイガー', emoji: '👑', flavor: '世界のどこでも通じる。言葉のジャングルの王。' },
  ],
  engineer: [
    { minLevel: 1, name: 'たまご', emoji: '🥚', flavor: 'v0.1 のたまご。エンジニアへの第一歩、まずは触ってみよう。' },
    { minLevel: 3, name: 'ドラゴンの子', emoji: '🐣', flavor: 'Hello, World! 殻を破ってコードが動く喜びを知った。' },
    { minLevel: 6, name: 'ワイバーン', emoji: '🐉', flavor: '翼が生えた。小さな機能なら自分で作れる。' },
    { minLevel: 10, name: 'ビルダー', emoji: '💻', flavor: 'ノート PC を抱えてアプリをまるごと組み上げる。' },
    { minLevel: 15, name: 'ハッカー', emoji: '🔥', flavor: 'Devinと組んで炎のような開発スピード。' },
    { minLevel: 20, name: 'エルダー', emoji: '🐲', flavor: '設計もレビューもお任せ。古龍の知恵。' },
    { minLevel: 30, name: 'レジェンド', emoji: '👑', flavor: '金色の竜。作りたいものを何でも形にできる存在。' },
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
    { minLevel: 1, name: 'ベビーゴリラ', emoji: '🍌', flavor: 'まずは体を動かす。バナナ片手にたった1回から。' },
    { minLevel: 3, name: 'ルーキー', emoji: '🦍', flavor: '筋肉痛が成長の証。続けるのが一番強い。' },
    { minLevel: 6, name: 'トレーニー', emoji: '🏋️', flavor: 'ダンベルを握る手が慣れてきた。重量が上がる。' },
    { minLevel: 10, name: 'ファイター', emoji: '🥊', flavor: '体が変わってきたのが鏡でわかる。' },
    { minLevel: 15, name: 'アスリート', emoji: '🏅', flavor: 'メダル級の体力と気力。別次元に。' },
    { minLevel: 20, name: 'シルバーバック', emoji: '🦍', flavor: '銀の背は群れのリーダーの証。朝4時のトレも苦じゃない。' },
    { minLevel: 30, name: 'キングコング', emoji: '🏆', flavor: 'トレをしないと一日が始まらない。体は一生の相棒。' },
  ],
  sales: [
    { minLevel: 1, name: 'こじし', emoji: '🐱', flavor: '営業の旅はここから。まずは一件、声をかける。' },
    { minLevel: 3, name: 'ルーキー', emoji: '👔', flavor: 'ネクタイを締めた。挨拶と名刺交換は板についた。' },
    { minLevel: 6, name: 'ハンター', emoji: '🎯', flavor: 'たてがみが伸びてきた。見込み客を自分で見つけられる。' },
    { minLevel: 10, name: 'クローザー', emoji: '💼', flavor: 'ブリーフケース片手に商談を締められる。' },
    { minLevel: 15, name: 'エース', emoji: '🦁', flavor: '金のネクタイ。数字はチームの先頭。' },
    { minLevel: 20, name: 'キング', emoji: '💰', flavor: '大きなたてがみ。紹介が紹介を生む。' },
    { minLevel: 30, name: 'セールスの王', emoji: '👑', flavor: '百獣の王。どんな相手とも対等に、堂々と。' },
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
