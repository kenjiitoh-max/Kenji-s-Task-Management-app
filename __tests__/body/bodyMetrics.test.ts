import { fatStage, getBodyStatus, nextFatStep } from '../../src/body/bodyMetrics';

describe('body metrics', () => {
  it('calculates BMI stages and next steps', () => {
    const obese = getBodyStatus(80, null, 170, 'male');
    expect(obese.bmi).toBe(27.7);
    expect(obese.bmiStage.label).toBe('肥満(1度)');
    expect(obese.next?.targetLabel).toBe('標準体重');
    expect(obese.next?.deltaKg).toBeCloseTo(7.8, 1);

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
});
