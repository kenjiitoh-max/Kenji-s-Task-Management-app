import { getLevelState, levelFromXp, stageForLevel, xpToNextLevel } from '../../src/growth/levels';

describe('growth levels', () => {
  it('converts XP and completions into levels', () => {
    expect(levelFromXp(0)).toEqual({ level: 1, xpIntoLevel: 0 });
    expect(xpToNextLevel(1)).toBe(30);
    expect(getLevelState('bird', 3)).toMatchObject({ level: 2, xpIntoLevel: 0 });
  });

  it('maps lineage stages', () => {
    expect(stageForLevel('bird', 3).name).toBe('ひよこ');
    expect(getLevelState('engineer', 0).stage.name).toBe('たまご');
    expect(getLevelState('engineer', 0).nextStage?.minLevel).toBe(3);
  });
});
