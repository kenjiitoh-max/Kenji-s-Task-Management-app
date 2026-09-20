import { getLevelState, isLineage, levelFromXp, Lineage, lineages, stageForLevel, xpToNextLevel } from '../../src/growth/levels';

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
    expect(stageForLevel('reader', 6).name).toBe('フクロウ');
    expect(stageForLevel('athlete', 20).name).toBe('マンバ');
  });

  it('treats every non-weight kind as a lineage', () => {
    expect(isLineage('reader')).toBe(true);
    expect(isLineage('athlete')).toBe(true);
    expect(isLineage('weight')).toBe(false);
    expect(isLineage(null)).toBe(false);
    for (const lineage of Object.keys(lineages) as Lineage[]) {
      expect(lineages[lineage][0].minLevel).toBe(1);
      expect(lineages[lineage]).toHaveLength(7);
    }
  });
});
