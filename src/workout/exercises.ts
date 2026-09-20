export type BodyPart = '胸' | '背中' | '脚' | '肩' | '腕' | '体幹' | '全身';

export interface Exercise {
  name: string;
  part: BodyPart;
  bodyweight?: boolean;
}

export const bodyParts: BodyPart[] = ['胸', '背中', '脚', '肩', '腕', '体幹', '全身'];

export const exercises: Exercise[] = [
  { name: 'ベンチプレス', part: '胸' },
  { name: 'ダンベルプレス', part: '胸' },
  { name: 'インクラインベンチプレス', part: '胸' },
  { name: 'チェストプレス', part: '胸' },
  { name: 'プッシュアップ', part: '胸', bodyweight: true },
  { name: 'デッドリフト', part: '背中' },
  { name: 'ラットプルダウン', part: '背中' },
  { name: '懸垂', part: '背中', bodyweight: true },
  { name: 'ベントオーバーロウ', part: '背中' },
  { name: 'シーテッドロウ', part: '背中' },
  { name: 'スクワット', part: '脚' },
  { name: 'レッグプレス', part: '脚' },
  { name: 'レッグエクステンション', part: '脚' },
  { name: 'レッグカール', part: '脚' },
  { name: 'ブルガリアンスクワット', part: '脚' },
  { name: 'ショルダープレス', part: '肩' },
  { name: 'サイドレイズ', part: '肩' },
  { name: 'アーノルドプレス', part: '肩' },
  { name: 'バーベルカール', part: '腕' },
  { name: 'ダンベルカール', part: '腕' },
  { name: 'トライセプスエクステンション', part: '腕' },
  { name: 'ディップス', part: '腕', bodyweight: true },
  { name: 'プランク', part: '体幹', bodyweight: true },
  { name: 'アブローラー', part: '体幹', bodyweight: true },
  { name: 'クランチ', part: '体幹', bodyweight: true },
  { name: 'クリーン', part: '全身' },
  { name: 'ケトルベルスイング', part: '全身' },
];

export function findExercise(name: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.name === name);
}
