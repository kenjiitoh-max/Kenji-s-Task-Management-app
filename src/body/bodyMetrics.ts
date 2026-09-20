import { Sex } from '../db/types';

export interface Stage {
  key: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export interface NextStep {
  targetLabel: string;
  targetWeightKg: number;
  deltaKg: number;
  message: string;
}

export interface BodyStatus {
  bmi: number;
  bmiStage: Stage;
  fatStage: Stage | null;
  idealWeightKg: number;
  next: NextStep | null;
}

const bmiStages: { max: number; stage: Stage }[] = [
  { max: 18.5, stage: { key: 'under', label: '低体重', emoji: '🍃', color: '#A5D8FF', description: '軽やかだけど少しエネルギー不足。栄養をしっかり取ろう。' } },
  { max: 25, stage: { key: 'normal', label: '標準体重', emoji: '🏃', color: '#B2F2BB', description: '心も体も軽やか。動きやすく、服もきれいに着こなせる状態。' } },
  { max: 30, stage: { key: 'obese1', label: '肥満(1度)', emoji: '🚶', color: '#FFE08A', description: 'あと一歩で標準に。ウエスト周りがすっきりし始める段階。' } },
  { max: 35, stage: { key: 'obese2', label: '肥満(2度)', emoji: '🧘', color: '#FFC9A8', description: '体が少し重い状態。動くとすぐ息が上がりやすい。' } },
  { max: Infinity, stage: { key: 'obese3', label: '肥満(3度以上)', emoji: '🛌', color: '#FFB3B3', description: '健康リスクが高い状態。少しずつ体を動かしていこう。' } },
];

const fatStages: Record<Sex, { max: number; stage: Stage }[]> = {
  male: [
    { max: 10, stage: { key: 'low', label: '低い', emoji: '🧊', color: '#A5D8FF', description: 'アスリート級の引き締まり。' } },
    { max: 20, stage: { key: 'normal', label: '標準', emoji: '💪', color: '#B2F2BB', description: 'うっすら筋肉のラインが見える健康的な体。' } },
    { max: 25, stage: { key: 'high', label: 'やや高い', emoji: '🍩', color: '#FFE08A', description: 'お腹まわりに少し余裕がある状態。' } },
    { max: Infinity, stage: { key: 'veryhigh', label: '高い', emoji: '🍔', color: '#FFB3B3', description: '体脂肪が多め。食事と運動のバランスを見直そう。' } },
  ],
  female: [
    { max: 20, stage: { key: 'low', label: '低い', emoji: '🧊', color: '#A5D8FF', description: 'アスリート級の引き締まり。' } },
    { max: 30, stage: { key: 'normal', label: '標準', emoji: '💪', color: '#B2F2BB', description: 'しなやかで健康的な体。' } },
    { max: 35, stage: { key: 'high', label: 'やや高い', emoji: '🍩', color: '#FFE08A', description: 'お腹まわりに少し余裕がある状態。' } },
    { max: Infinity, stage: { key: 'veryhigh', label: '高い', emoji: '🍔', color: '#FFB3B3', description: '体脂肪が多め。食事と運動のバランスを見直そう。' } },
  ],
};

export function calcBmi(weightKg: number, heightCm: number): number {
  const meters = heightCm / 100;
  return weightKg / (meters * meters);
}

export function weightForBmi(bmi: number, heightCm: number): number {
  const meters = heightCm / 100;
  return bmi * meters * meters;
}

export function bmiStage(bmi: number): Stage {
  return bmiStages.find((entry) => bmi < entry.max)!.stage;
}

export function fatStage(bodyFatPct: number, sex: Sex): Stage {
  return fatStages[sex].find((entry) => bodyFatPct < entry.max)!.stage;
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function getBodyStatus(weightKg: number, bodyFatPct: number | null, heightCm: number, sex: Sex): BodyStatus {
  const bmi = calcBmi(weightKg, heightCm);
  const stage = bmiStage(bmi);
  const idealWeightKg = weightForBmi(22, heightCm);
  let next: NextStep | null = null;
  if (bmi >= 25) {
    const boundary = bmi >= 35 ? 35 : bmi >= 30 ? 30 : 25;
    const target = bmiStage(boundary - 0.01);
    const targetWeightKg = Math.floor(weightForBmi(boundary, heightCm) * 10 - 1) / 10;
    const deltaKg = round1(weightKg - targetWeightKg);
    next = { targetLabel: target.label, targetWeightKg, deltaKg, message: `あと ${deltaKg} kg 痩せると「${target.label}」${target.emoji} に。${target.description}` };
  } else if (bmi < 18.5) {
    const targetWeightKg = weightForBmi(18.5, heightCm);
    const deltaKg = round1(targetWeightKg - weightKg);
    next = { targetLabel: '標準体重', targetWeightKg: round1(targetWeightKg), deltaKg, message: `あと ${deltaKg} kg 増やすと「標準体重」🏃 に。` };
  } else if (bmi > 22.05) {
    const deltaKg = round1(weightKg - idealWeightKg);
    next = { targetLabel: '適正体重', targetWeightKg: round1(idealWeightKg), deltaKg, message: `あと ${deltaKg} kg で適正体重 (BMI 22) ✨。体がいちばん軽く感じるライン。` };
  }
  return {
    bmi: round1(bmi),
    bmiStage: stage,
    fatStage: bodyFatPct === null ? null : fatStage(bodyFatPct, sex),
    idealWeightKg: round1(idealWeightKg),
    next,
  };
}

/** 体脂肪率が target になったときの体重 (除脂肪体重は一定と仮定) */
export function weightAtBodyFat(weightKg: number, bodyFatPct: number, targetPct: number): number {
  const lean = weightKg * (1 - bodyFatPct / 100);
  return round1(lean / (1 - targetPct / 100));
}

export function nextFatStep(weightKg: number, bodyFatPct: number, sex: Sex): string | null {
  const stages = fatStages[sex];
  const index = stages.findIndex((entry) => bodyFatPct < entry.max);
  if (index <= 1) return null;
  const boundary = stages[index - 1].max;
  const target = stages[index - 1].stage;
  const targetWeight = weightAtBodyFat(weightKg, bodyFatPct, boundary - 0.1);
  return `体脂肪率 ${boundary}% を切ると「${target.label}」${target.emoji} に。体重は約 ${targetWeight} kg。`;
}
