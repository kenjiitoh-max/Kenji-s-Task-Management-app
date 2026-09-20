import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Celebration } from '../../src/components/Celebration';
import { BodyProfileModal } from '../../src/components/BodyProfileModal';
import { BodyRecordModal } from '../../src/components/BodyRecordModal';
import { BodyStatusCard } from '../../src/components/BodyStatusCard';
import { BookshelfCard } from '../../src/components/BookshelfCard';
import { CharacterCard } from '../../src/components/CharacterCard';
import { DailyActionFormModal } from '../../src/components/DailyActionFormModal';
import { DailyActionItem } from '../../src/components/DailyActionItem';
import { Fab } from '../../src/components/Fab';
import { GoalCard } from '../../src/components/GoalCard';
import { GoalFormModal } from '../../src/components/GoalFormModal';
import { StampCard } from '../../src/components/StampCard';
import { WorkoutCard } from '../../src/components/WorkoutCard';
import { WorkoutLogModal } from '../../src/components/WorkoutLogModal';
import { useCelebration } from '../../src/hooks/useCelebration';
import { applyActionTemplate, createActionTemplate, deleteActionTemplate, listActionTemplates } from '../../src/db/actionTemplates';
import { getCategory, getCategoryProgress } from '../../src/db/categories';
import { getDb } from '../../src/db/database';
import { countCompletions, createDailyAction, deleteDailyAction, ensureDailyReset, listCompletionDates, listDailyActions, toggleDailyAction } from '../../src/db/dailyActions';
import { getBodyProfile, getLatestBodyRecord, listBodyRecords, saveBodyProfile, upsertBodyRecord } from '../../src/db/bodyRecords';
import { localDate } from '../../src/db/time';
import { subscribe } from '../../src/db/dailyResetEvents';
import { deleteGoal, listGoals, upsertGoal } from '../../src/db/goals';
import { ActionTemplate, BodyProfile, BodyRecord, Category, DailyAction, Goal, GoalTerm, WorkoutSet } from '../../src/db/types';
import { addWorkoutSet, deleteWorkoutSet, ExerciseBest, getExerciseBest, getLastSet, isPersonalRecord, listExerciseBests, listWorkoutSets, NewWorkoutSet, recentExercises } from '../../src/db/workouts';
import { currentStreak } from '../../src/growth/history';
import { getLevelState, isLineage } from '../../src/growth/levels';
import { hasStamp, milestoneFor } from '../../src/growth/stamps';
import { randomQuote } from '../../src/quotes/dailyQuote';
import { getPalette } from '../../src/theme';

function shouldShowQuote(): boolean {
  return Math.random() < 1 / 3;
}

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = Number(id);
  const dark = useColorScheme() === 'dark';
  const palette = getPalette(dark ? 'dark' : 'light');
  const [category, setCategory] = useState<Category | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [actions, setActions] = useState<DailyAction[]>([]);
  const [goalTerm, setGoalTerm] = useState<GoalTerm | null>(null);
  const [actionModal, setActionModal] = useState(false);
  const [recordModal, setRecordModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [latest, setLatest] = useState<BodyRecord | null>(null);
  const [records, setRecords] = useState<BodyRecord[]>([]);
  const [profile, setProfile] = useState<BodyProfile>({ height_cm: null, sex: 'male' });
  const [completions, setCompletions] = useState(0);
  const [workoutModal, setWorkoutModal] = useState(false);
  const [todaySets, setTodaySets] = useState<WorkoutSet[]>([]);
  const [bests, setBests] = useState<ExerciseBest[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [pulseKey, setPulseKey] = useState(0);
  const [stampDates, setStampDates] = useState<string[]>([]);
  const [stampPulse, setStampPulse] = useState(0);
  const [templates, setTemplates] = useState<ActionTemplate[]>([]);
  const celebration = useCelebration();
  const refresh = useCallback(() => {
    const db = getDb();
    ensureDailyReset(db);
    setCategory(getCategory(db, categoryId));
    setGoals(listGoals(db, categoryId));
    setActions(listDailyActions(db, categoryId));
    setStampDates(listCompletionDates(db, categoryId));
    setTemplates(listActionTemplates(db, categoryId));
    setLatest(getLatestBodyRecord(db));
    setRecords(listBodyRecords(db, 7));
    setProfile(getBodyProfile(db));
    const current = getCategory(db, categoryId);
    setCompletions(isLineage(current?.kind) ? countCompletions(db, categoryId) : 0);
    if (current?.kind === 'athlete') {
      setTodaySets(listWorkoutSets(db, categoryId));
      setBests(listExerciseBests(db, categoryId));
      setRecent(recentExercises(db, categoryId));
    }
  }, [categoryId]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  useEffect(() => subscribe(refresh), [refresh]);
  if (!category) return null;
  const goalFor = (term: GoalTerm) => goals.find((goal) => goal.term === term);
  const logWorkout = (set: NewWorkoutSet) => {
    const db = getDb();
    const previousBest = getExerciseBest(db, categoryId, set.exercise);
    const before = getLevelState('athlete', countCompletions(db, categoryId));
    const { firstOfDay } = addWorkoutSet(db, categoryId, set);
    const after = getLevelState('athlete', countCompletions(db, categoryId));
    refresh();
    setPulseKey((key) => key + 1);
    const record = isPersonalRecord(previousBest, set);
    const levelMessage = after.level > before.level ? after.stage.name !== before.stage.name ? `進化！ ${after.stage.emoji} ${after.stage.name} になった！` : `レベルアップ！ Lv.${after.level}` : undefined;
    const message = levelMessage ?? (record ? `自己ベスト更新！ ${set.exercise} ${set.weight_kg}kg` : firstOfDay ? '今日のトレ開始！ +10 XP' : undefined);
    if (message) celebration.celebrate(false, message);
  };
  const toggle = (action: DailyAction) => {
    const db = getDb();
    const hadStampToday = hasStamp(listCompletionDates(db, categoryId), localDate());
    const before = isLineage(category.kind) ? getLevelState(category.kind, countCompletions(db, categoryId)) : null;
    const completed = toggleDailyAction(db, action.id);
    const after = isLineage(category.kind) ? getLevelState(category.kind, countCompletions(db, categoryId)) : null;
    refresh();
    if (completed) {
      const progress = getCategoryProgress(db, categoryId);
      setPulseKey((key) => key + 1);
      const allComplete = progress.total > 0 && progress.completed === progress.total;
      const levelMessage = before && after && after.level > before.level ? after.stage.name !== before.stage.name ? `進化！ ${after.stage.emoji} ${after.stage.name} になった！` : `レベルアップ！ Lv.${after.level}` : undefined;
      let milestoneMessage: string | undefined;
      let stampMessage: string | undefined;
      if (!hadStampToday) {
        setStampPulse((key) => key + 1);
        const streak = currentStreak(listCompletionDates(db, categoryId), localDate());
        const milestone = milestoneFor(streak);
        milestoneMessage = milestone ? `🎉 ${milestone.emoji} ${streak}日連続！「${milestone.title}」を獲得！` : undefined;
        stampMessage = milestoneMessage ? undefined : `スタンプGET！ 🔥${streak}日連続`;
      }
      const baseMessage = levelMessage || milestoneMessage || stampMessage;
      const quote = !allComplete && !baseMessage && shouldShowQuote() ? randomQuote() : null;
      const quoteMessage = quote && quote.textJa.length <= 40 ? `「${quote.textJa}」— ${quote.authorJa}` : undefined;
      celebration.celebrate(allComplete, baseMessage || quoteMessage, Boolean(milestoneMessage));
    } else celebration.uncomplete();
  };
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={24} color={palette.text} /></Pressable>
        <View style={[styles.dot, { backgroundColor: category.color }]} />
        <Text style={[styles.title, { color: palette.text }]}>{category.name}</Text>
        <Pressable accessibilityLabel="履歴を開く" onPress={() => router.push(`/history/${id}`)} style={styles.historyButton}><Ionicons color={palette.text} name="stats-chart-outline" size={22} /></Pressable>
      </View>
      <FlatList
        contentContainerStyle={styles.content}
        data={actions}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View>
            {category.kind === 'weight' ? <BodyStatusCard accent={category.color} dark={dark} latest={latest} onEditProfile={() => setProfileModal(true)} onRecord={() => setRecordModal(true)} profile={profile} records={records} /> : isLineage(category.kind) ? <CharacterCard accent={category.color} completions={completions} dark={dark} lineage={category.kind} pulseKey={pulseKey} /> : null}
            {category.kind === 'reader' ? <BookshelfCard accent={category.color} categoryId={categoryId} dark={dark} onPress={() => router.push(`/books/${id}`)} /> : null}
            {category.kind === 'athlete' ? <WorkoutCard accent={category.color} bests={bests} dark={dark} onDelete={(set) => Alert.alert('削除', `${set.exercise} の記録を削除しますか？`, [{ text: 'キャンセル' }, { text: '削除', style: 'destructive', onPress: () => { deleteWorkoutSet(getDb(), set.id); refresh(); } }])} onLog={() => setWorkoutModal(true)} today={todaySets} /> : null}
            <StampCard accent={category.color} dark={dark} dates={stampDates} pulseKey={stampPulse} today={localDate()} />
            <Text style={[styles.section, { color: palette.text }]}>ゴール</Text>
            <View style={styles.goals}>{(['short', 'medium', 'long'] as GoalTerm[]).map((term) => <GoalCard dark={dark} goal={goalFor(term)} key={term} onPress={() => setGoalTerm(term)} term={term} />)}</View>
            <Text style={[styles.section, { color: palette.text }]}>今日のデイリーアクション</Text>
            {actions.length === 0 ? <Text style={[styles.empty, { color: palette.muted }]}>今日やることを追加しましょう。</Text> : null}
          </View>
        }
        renderItem={({ item }) => <DailyActionItem action={item} accent={category.color} dark={dark} onDelete={() => Alert.alert('削除', 'このアクションを削除しますか？', [{ text: 'キャンセル' }, { text: '削除', style: 'destructive', onPress: () => { deleteDailyAction(getDb(), item.id); refresh(); } }])} onToggle={() => toggle(item)} />}
      />
      <Fab color={category.color} onPress={() => setActionModal(true)} />
      <DailyActionFormModal accent={category.color} dark={dark} onApplyTemplate={(template) => { applyActionTemplate(getDb(), template.id); refresh(); }} onClose={() => setActionModal(false)} onDeleteTemplate={(template) => { deleteActionTemplate(getDb(), template.id); refresh(); }} onSave={(title) => { createDailyAction(getDb(), categoryId, title); refresh(); }} onSaveTemplate={(title) => { createActionTemplate(getDb(), categoryId, title); refresh(); }} templates={templates} visible={actionModal} />
      {category.kind === 'athlete' ? <WorkoutLogModal bestFor={(exercise) => getExerciseBest(getDb(), categoryId, exercise)} dark={dark} lastSet={(exercise) => getLastSet(getDb(), categoryId, exercise)} onClose={() => setWorkoutModal(false)} onSave={logWorkout} recent={recent} visible={workoutModal} /> : null}
      <BodyRecordModal dark={dark} onClose={() => setRecordModal(false)} onSave={(date, weight, fat) => { upsertBodyRecord(getDb(), date, weight, fat); refresh(); }} record={records.find((record) => record.date === localDate()) || null} visible={recordModal} />
      <BodyProfileModal dark={dark} onClose={() => setProfileModal(false)} onSave={(height, sex) => { saveBodyProfile(getDb(), { height_cm: height, sex }); refresh(); }} profile={profile} visible={profileModal} />
      {goalTerm ? <GoalFormModal dark={dark} goal={goalFor(goalTerm)} onClose={() => setGoalTerm(null)} onDelete={() => { const goal = goalFor(goalTerm); if (goal) deleteGoal(getDb(), goal.id); refresh(); }} onSave={(description, date) => { upsertGoal(getDb(), categoryId, goalTerm, description, date); refresh(); }} term={goalTerm} visible /> : null}
      <Celebration big={celebration.big} celebrationId={celebration.celebrationId} completeAll={celebration.completeAll} toastMessage={celebration.toastMessage} toastVisible={celebration.toastVisible} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { marginRight: 12, padding: 4 },
  content: { padding: 20, paddingBottom: 110 },
  dot: { borderRadius: 7, height: 14, marginRight: 10, width: 14 },
  empty: { fontSize: 14, marginBottom: 12, marginTop: 2 },
  goals: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  header: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 18, paddingTop: 15 },
  historyButton: { padding: 6 },
  safe: { flex: 1 },
  section: { fontSize: 22, fontWeight: '800', marginBottom: 13 },
  title: { fontSize: 22, fontWeight: '800' },
});
