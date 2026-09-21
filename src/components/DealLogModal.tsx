import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { commissionJpy, commissionRates, dealKindLabels, dealKinds, formatJpy } from '../deals/commission';
import { fetchUsdJpy } from '../deals/fx';
import { NewDeal } from '../db/deals';
import { localDate } from '../db/time';
import { DealKind } from '../db/types';
import { getPalette, textOn } from '../theme';
import { ModalShell } from './ModalShell';

const shiftDate = (date: string, days: number) => {
  const [y, m, d] = date.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + days));
};

export function DealLogModal({ visible, dark, onClose, onSave }: { visible: boolean; dark: boolean; onClose: () => void; onSave: (deal: NewDeal) => void }) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [kind, setKind] = useState<DealKind>('new');
  const [amount, setAmount] = useState('');
  const [closedOn, setClosedOn] = useState(localDate());
  const [rate, setRate] = useState('');
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [rateError, setRateError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setKind('new'); setAmount(''); setClosedOn(localDate()); setError('');
  }, [visible]);

  useEffect(() => {
    if (!visible || !/^\d{4}-\d{2}-\d{2}$/.test(closedOn)) return;
    let cancelled = false;
    setFetching(true); setRateError(''); setRateDate(null);
    fetchUsdJpy(closedOn)
      .then((quote) => { if (!cancelled) { setRate(String(quote.rate)); setRateDate(quote.rateDate); } })
      .catch(() => { if (!cancelled) setRateError('レートを自動取得できませんでした。手入力してください。'); })
      .finally(() => { if (!cancelled) setFetching(false); });
    return () => { cancelled = true; };
  }, [closedOn, visible]);

  const amountUsd = Number(amount.replace(/,/g, ''));
  const fxRate = Number(rate);
  const preview = Number.isFinite(amountUsd) && amountUsd > 0 && Number.isFinite(fxRate) && fxRate > 0 ? commissionJpy({ kind, amount_usd: amountUsd, fx_rate: fxRate }) : null;

  const save = () => {
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) return setError('金額 (USD) を入力してください。');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(closedOn)) return setError('日付は YYYY-MM-DD で入力してください。');
    if (!Number.isFinite(fxRate) || fxRate <= 0) return setError('為替レートを入力してください。');
    onSave({ kind, amount_usd: amountUsd, closed_on: closedOn, fx_rate: fxRate, fx_date: rateDate ?? closedOn });
    onClose();
  };

  return (
    <ModalShell dark={dark} onClose={onClose} title="ディールを獲得" visible={visible}>
      <View style={styles.chips}>
        {dealKinds.map((entry) => (
          <Pressable key={entry} onPress={() => setKind(entry)} style={[styles.chip, { backgroundColor: kind === entry ? palette.primary : palette.input }]}>
            <Text style={[styles.chipText, { color: kind === entry ? textOn(palette.primary) : palette.text }]}>{dealKindLabels[entry]} · {Math.round(commissionRates[entry] * 100)}%</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.label, { color: palette.muted }]}>ACV (USD)</Text>
      <View style={[styles.amountRow, { backgroundColor: palette.input }]}>
        <Text style={[styles.dollar, { color: palette.gold }]}>$</Text>
        <TextInput autoFocus keyboardType="decimal-pad" onChangeText={setAmount} placeholder="0" placeholderTextColor={palette.muted} style={[styles.amount, { color: palette.text }]} value={amount} />
      </View>
      <Text style={[styles.label, { color: palette.muted }]}>クローズ日</Text>
      <View style={styles.dateRow}>
        <Pressable accessibilityLabel="前日" onPress={() => setClosedOn((d) => shiftDate(d, -1))} style={[styles.stepButton, { backgroundColor: palette.input }]}><Text style={[styles.stepText, { color: palette.text }]}>−</Text></Pressable>
        <TextInput keyboardType="numbers-and-punctuation" onChangeText={setClosedOn} style={[styles.dateInput, { backgroundColor: palette.input, color: palette.text }]} value={closedOn} />
        <Pressable accessibilityLabel="翌日" onPress={() => setClosedOn((d) => shiftDate(d, 1))} style={[styles.stepButton, { backgroundColor: palette.input }]}><Text style={[styles.stepText, { color: palette.text }]}>＋</Text></Pressable>
      </View>
      <Text style={[styles.label, { color: palette.muted }]}>為替 (USD/JPY) {fetching ? '取得中…' : rateDate ? `· ${rateDate} のレート` : ''}</Text>
      <View style={styles.rateRow}>
        <TextInput keyboardType="decimal-pad" onChangeText={(value) => { setRate(value); setRateDate(null); }} style={[styles.rateInput, { backgroundColor: palette.input, color: palette.text }]} value={rate} />
        {fetching ? <ActivityIndicator color={palette.primary} /> : null}
      </View>
      {rateError ? <Text style={[styles.hint, { color: palette.muted }]}>{rateError}</Text> : null}
      {preview !== null ? <Text style={[styles.preview, { color: palette.gold }]}>コミッション見込み {formatJpy(preview)}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={save} style={[styles.save, { backgroundColor: palette.gold }]}><Text style={[styles.saveText, { color: textOn(palette.gold) }]}>🏆 獲得を記録</Text></Pressable>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  amount: { flex: 1, fontSize: 30, fontWeight: '800', paddingVertical: 12 },
  amountRow: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 6, paddingHorizontal: 14 },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  chipText: { fontSize: 13, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  dateInput: { borderRadius: 12, flex: 1, fontSize: 16, fontWeight: '600', padding: 12, textAlign: 'center' },
  dateRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  dollar: { fontSize: 26, fontWeight: '800' },
  error: { color: '#D9534F', fontSize: 13, marginTop: 10 },
  hint: { fontSize: 12, marginTop: 6 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 14 },
  preview: { fontSize: 16, fontWeight: '800', marginTop: 14, textAlign: 'center' },
  rateInput: { borderRadius: 12, flex: 1, fontSize: 16, fontWeight: '600', padding: 12 },
  rateRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  save: { alignItems: 'center', borderRadius: 14, marginTop: 16, padding: 16 },
  saveText: { fontSize: 16, fontWeight: '800' },
  stepButton: { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 },
  stepText: { fontSize: 20, fontWeight: '700' },
});
