import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ExerciseBest, NewWorkoutSet } from '../db/workouts';
import { getPalette, textOn } from '../theme';
import { BodyPart, bodyParts, exercises, findExercise } from '../workout/exercises';
import { ModalShell } from './ModalShell';

function Stepper({ label, value, onChange, step, min, dark, unit }: { label: string; value: string; onChange: (value: string) => void; step: number; min: number; dark: boolean; unit: string }) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const bump = (delta: number) => { const next = Math.max(min, Math.round((Number(value) || 0) * 100 + delta * 100) / 100); onChange(String(next)); };
  return (
    <View style={styles.stepper}>
      <Text style={[styles.label, { color: palette.muted }]}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable accessibilityLabel={`${label}を減らす`} onPress={() => bump(-step)} style={[styles.stepButton, { backgroundColor: palette.input }]}><Text style={[styles.stepText, { color: palette.text }]}>−</Text></Pressable>
        <TextInput keyboardType="decimal-pad" onChangeText={onChange} selectTextOnFocus style={[styles.stepInput, { backgroundColor: palette.input, color: palette.text }]} value={value} />
        <Pressable accessibilityLabel={`${label}を増やす`} onPress={() => bump(step)} style={[styles.stepButton, { backgroundColor: palette.input }]}><Text style={[styles.stepText, { color: palette.text }]}>＋</Text></Pressable>
      </View>
      <Text style={[styles.unit, { color: palette.muted }]}>{unit}</Text>
    </View>
  );
}

export function WorkoutLogModal({ visible, dark, recent, lastSet, bestFor, onClose, onSave }: {
  visible: boolean;
  dark: boolean;
  recent: string[];
  lastSet: (exercise: string) => NewWorkoutSet | null;
  bestFor: (exercise: string) => ExerciseBest | null;
  onClose: () => void;
  onSave: (set: NewWorkoutSet) => void;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [part, setPart] = useState<BodyPart | 'recent'>(recent.length ? 'recent' : '胸');
  const [exercise, setExercise] = useState<string | null>(null);
  const [weight, setWeight] = useState('20');
  const [reps, setReps] = useState('10');
  const [sets, setSets] = useState('3');
  const [error, setError] = useState('');
  useEffect(() => { if (visible) { setExercise(null); setPart(recent.length ? 'recent' : '胸'); setError(''); } }, [recent.length, visible]);
  const choices = useMemo(() => part === 'recent' ? recent.map((name) => findExercise(name) ?? { name, part: '全身' as BodyPart }) : exercises.filter((entry) => entry.part === part), [part, recent]);
  const pick = (name: string) => {
    setExercise(name);
    const previous = lastSet(name);
    const bodyweight = findExercise(name)?.bodyweight;
    setWeight(previous ? String(previous.weight_kg) : bodyweight ? '0' : '20');
    setReps(previous ? String(previous.reps) : '10');
    setSets(previous ? String(previous.sets) : '3');
  };
  const save = () => {
    if (!exercise) return;
    const parsed = { exercise, weight_kg: Number(weight), reps: Number(reps), sets: Number(sets) };
    if (!Number.isFinite(parsed.weight_kg) || parsed.weight_kg < 0 || parsed.weight_kg > 500) return setError('重量は0〜500kgで入力してください。');
    if (!Number.isInteger(parsed.reps) || parsed.reps < 1 || parsed.reps > 200) return setError('回数は1〜200で入力してください。');
    if (!Number.isInteger(parsed.sets) || parsed.sets < 1 || parsed.sets > 20) return setError('セット数は1〜20で入力してください。');
    onSave(parsed);
    onClose();
  };
  const best = exercise ? bestFor(exercise) : null;
  return (
    <ModalShell dark={dark} onClose={onClose} title={exercise ? exercise : '種目を選ぶ'} visible={visible}>
      {exercise ? (
        <View>
          <Pressable onPress={() => setExercise(null)}><Text style={[styles.change, { color: palette.primary }]}>← 種目を変える</Text></Pressable>
          {best ? <Text style={[styles.best, { color: palette.muted }]}>自己ベスト: {best.weight_kg}kg × {best.reps}回 ({best.date})</Text> : <Text style={[styles.best, { color: palette.muted }]}>初めての種目。今日が自己ベストになる。</Text>}
          <View style={styles.steppers}>
            <Stepper dark={dark} label="重量" min={0} onChange={(value) => { setWeight(value); setError(''); }} step={2.5} unit="kg" value={weight} />
            <Stepper dark={dark} label="回数" min={1} onChange={(value) => { setReps(value); setError(''); }} step={1} unit="回" value={reps} />
            <Stepper dark={dark} label="セット" min={1} onChange={(value) => { setSets(value); setError(''); }} step={1} unit="set" value={sets} />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={save} style={[styles.save, { backgroundColor: palette.primary }]}><Text style={[styles.saveText, { color: textOn(palette.primary) }]}>記録する</Text></Pressable>
        </View>
      ) : (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.parts}>
            <View style={styles.partsRow}>
              {recent.length ? <Pressable onPress={() => setPart('recent')} style={[styles.chip, { backgroundColor: part === 'recent' ? palette.primary : palette.input }]}><Text style={[styles.chipText, { color: part === 'recent' ? textOn(palette.primary) : palette.text }]}>最近</Text></Pressable> : null}
              {bodyParts.map((entry) => <Pressable key={entry} onPress={() => setPart(entry)} style={[styles.chip, { backgroundColor: part === entry ? palette.primary : palette.input }]}><Text style={[styles.chipText, { color: part === entry ? textOn(palette.primary) : palette.text }]}>{entry}</Text></Pressable>)}
            </View>
          </ScrollView>
          <View style={styles.grid}>
            {choices.map((entry) => <Pressable key={entry.name} onPress={() => pick(entry.name)} style={[styles.exercise, { backgroundColor: palette.input }]}><Text style={[styles.exerciseText, { color: palette.text }]}>{entry.name}</Text></Pressable>)}
          </View>
        </View>
      )}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  best: { fontSize: 13, marginBottom: 16 },
  change: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 13, fontWeight: '700' },
  error: { color: '#D95F59', fontSize: 13, marginBottom: 14 },
  exercise: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  exerciseText: { fontSize: 15, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 7 },
  parts: { marginBottom: 14 },
  partsRow: { flexDirection: 'row', gap: 8 },
  save: { alignItems: 'center', borderRadius: 14, padding: 15 },
  saveText: { fontSize: 16, fontWeight: '700' },
  stepButton: { alignItems: 'center', borderRadius: 10, height: 40, justifyContent: 'center', width: 40 },
  stepInput: { borderRadius: 10, flex: 1, fontSize: 18, fontWeight: '700', height: 40, textAlign: 'center' },
  stepText: { fontSize: 20, fontWeight: '700' },
  stepper: { flex: 1 },
  stepperRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  steppers: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  unit: { fontSize: 11, marginTop: 4, textAlign: 'center' },
});
