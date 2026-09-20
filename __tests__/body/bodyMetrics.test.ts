import { bmiStage, calcBmi, fatStage, getBodyStatus, nextFatStep, weightForBmi } from '../../src/body/bodyMetrics';

describe('body metrics', () => {
  it('calculates BMI stages and next steps', () => {
    const obese = getBodyStatus(80, null, 170, 'male');
    expect(obese.bmi).toBe(27.7);
    expect(obese.bmiStage.label).toBe('肥満(1度)');
    expect(obese.next?.targetLabel).toBe('標準体重');
    expect(obese.next?.deltaKg).toBeCloseTo(7.9, 1);

    const normal = getBodyStatus(60, null, 170, 'male');
    expect(normal.bmiStage.label).toBe('標準体重');
    expect(normal.next).toBeNull();

    const under = getBodyStatus(50, null, 170, 'male');
    expect(under.bmiStage.label).toBe('低体重');
    expect(under.next?.targetLabel).toBe('標準体重');
  });

  it('uses sex-specific body fat stages', () => {
    expect(fatStage(22, 'male').label).toBe('やや高い');
    expect(fatStage(22, 'female').label).toBe('標準');
    expect(nextFatStep(80, 27, 'male')).toContain('25%');
  });

  it('places boundary targets inside the next BMI stage', () => {
    const boundaries = [
      { bmi: 27, target: 25, label: '標準体重' },
      { bmi: 30, target: 30, label: '肥満(1度)' },
      { bmi: 35, target: 35, label: '肥満(2度)' },
    ];
    for (const boundary of boundaries) {
      const status = getBodyStatus(weightForBmi(boundary.bmi, 175), null, 175, 'male');
      const targetWeight = status.next?.targetWeightKg;
      expect(targetWeight).toBeDefined();
      expect(calcBmi(targetWeight!, 175)).toBeLessThan(boundary.target);
      expect(bmiStage(calcBmi(targetWeight!, 175)).label).toBe(boundary.label);
    }
  });
});
