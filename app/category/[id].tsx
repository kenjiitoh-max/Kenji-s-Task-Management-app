import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Celebration } from '../../src/components/Celebration';
import { DailyActionFormModal } from '../../src/components/DailyActionFormModal';
import { DailyActionItem } from '../../src/components/DailyActionItem';
import { Fab } from '../../src/components/Fab';
import { GoalCard } from '../../src/components/GoalCard';
import { GoalFormModal } from '../../src/components/GoalFormModal';
import { useCelebration } from '../../src/hooks/useCelebration';
import { getCategory, getCategoryProgress } from '../../src/db/categories';
import { getDb } from '../../src/db/database';
import { createDailyAction, deleteDailyAction, listDailyActions, toggleDailyAction } from '../../src/db/dailyActions';
import { deleteGoal, listGoals, upsertGoal } from '../../src/db/goals';
import { Category, DailyAction, Goal, GoalTerm } from '../../src/db/types';
import { getPalette } from '../../src/theme';

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
  const celebration = useCelebration();
  const refresh = useCallback(() => {
    const db = getDb();
    setCategory(getCategory(db, categoryId));
    setGoals(listGoals(db, categoryId));
    setActions(listDailyActions(db, categoryId));
  }, [categoryId]);
  React.useEffect(() => { refresh(); }, [refresh]);
  if (!category) return null;
  const goalFor = (term: GoalTerm) => goals.find((goal) => goal.term === term);
  const toggle = (action: DailyAction) => {
    const db = getDb();
    const completed = toggleDailyAction(db, action.id);
    refresh();
    if (completed) {
      const progress = getCategoryProgress(db, categoryId);
      celebration.celebrate(progress.total > 0 && progress.completed === progress.total);
    } else celebration.uncomplete();
  };
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={24} color={palette.text} /></Pressable>
        <View style={[styles.dot, { backgroundColor: category.color }]} />
        <Text style={[styles.title, { color: palette.text }]}>{category.name}</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.content}
        data={actions}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View>
            <Text style={[styles.section, { color: palette.text }]}>ゴール</Text>
            <View style={styles.goals}>{(['short', 'medium', 'long'] as GoalTerm[]).map((term) => <GoalCard dark={dark} goal={goalFor(term)} key={term} onPress={() => setGoalTerm(term)} term={term} />)}</View>
            <Text style={[styles.section, { color: palette.text }]}>今日のデイリーアクション</Text>
            {actions.length === 0 ? <Text style={[styles.empty, { color: palette.muted }]}>今日やることを追加しましょう。</Text> : null}
          </View>
        }
        renderItem={({ item }) => <DailyActionItem action={item} accent={category.color} dark={dark} onDelete={() => Alert.alert('削除', 'このアクションを削除しますか？', [{ text: 'キャンセル' }, { text: '削除', style: 'destructive', onPress: () => { deleteDailyAction(getDb(), item.id); refresh(); } }])} onToggle={() => toggle(item)} />}
      />
      <Fab color={category.color} onPress={() => setActionModal(true)} />
      <DailyActionFormModal dark={dark} onClose={() => setActionModal(false)} onSave={(title) => { createDailyAction(getDb(), categoryId, title); refresh(); }} visible={actionModal} />
      {goalTerm ? <GoalFormModal dark={dark} goal={goalFor(goalTerm)} onClose={() => setGoalTerm(null)} onDelete={() => { const goal = goalFor(goalTerm); if (goal) deleteGoal(getDb(), goal.id); refresh(); }} onSave={(description, date) => { upsertGoal(getDb(), categoryId, goalTerm, description, date); refresh(); }} term={goalTerm} visible /> : null}
      <Celebration completeAll={celebration.completeAll} toastMessage={celebration.toastMessage} toastVisible={celebration.toastVisible} />
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
  safe: { flex: 1 },
  section: { fontSize: 22, fontWeight: '800', marginBottom: 13 },
  title: { fontSize: 22, fontWeight: '800' },
});
