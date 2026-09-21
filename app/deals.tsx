import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from '../src/components/charts/LineChart';
import { DealLogModal } from '../src/components/DealLogModal';
import { Toast } from '../src/components/Toast';
import { commissionJpy, cumulativeByDay, dealJpy, dealKindLabels, fiscalYearOf, formatJpy, formatUsd, lootFor, nextPayout, quarterPayouts, rankFor, summarizeFiscalYear } from '../src/deals/commission';
import { getDb } from '../src/db/database';
import { addDeal, deleteDeal, listDeals, NewDeal } from '../src/db/deals';
import { localDate } from '../src/db/time';
import { Deal } from '../src/db/types';
import { getPalette, radius, shadow, textOn } from '../src/theme';

const GOLD = '#E2C069';
const GOLD_DEEP = '#B8892B';
const VAULT = '#1B1030';

const shortDate = (date: string) => `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;

export default function DealsScreen() {
  const router = useRouter();
  const dark = useColorScheme() === 'dark';
  const palette = getPalette(dark ? 'dark' : 'light');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [logOpen, setLogOpen] = useState(false);
  const [celebration, setCelebration] = useState(0);
  const [toast, setToast] = useState('');

  const refresh = useCallback(() => setDeals(listDeals(getDb())), []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const today = localDate();
  const fiscalYear = fiscalYearOf(today);
  const summary = summarizeFiscalYear(deals, fiscalYear);
  const rank = rankFor(summary.totalUsd);
  const payout = nextPayout(deals, today);
  const payouts = quarterPayouts(deals, fiscalYear, today);
  const curve = cumulativeByDay(deals, fiscalYear).map((point) => ({ x: point.date, y: point.totalUsd / 1000 }));

  const save = (deal: NewDeal) => {
    addDeal(getDb(), deal);
    refresh();
    setCelebration((value) => value + 1);
    setToast(`${lootFor(deal.amount_usd)} DEAL CLOSED! ${formatUsd(deal.amount_usd)} ／ コミッション +${formatJpy(commissionJpy({ kind: deal.kind, amount_usd: deal.amount_usd, fx_rate: deal.fx_rate }))}`);
    setTimeout(() => setToast(''), 3500);
    setTimeout(() => setCelebration(0), 6000);
  };
  const remove = (deal: Deal) => Alert.alert('この戦利品を削除しますか？', `${dealKindLabels[deal.kind]} ${formatUsd(deal.amount_usd)} (${deal.closed_on})`, [{ style: 'cancel', text: 'キャンセル' }, { onPress: () => { deleteDeal(getDb(), deal.id); refresh(); }, style: 'destructive', text: '削除' }]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons color={palette.text} name="arrow-back" size={24} /></Pressable>
        <Text style={[styles.title, { color: palette.text }]}>💰 Deal Vault</Text>
        <Pressable accessibilityLabel="ディールを記録" onPress={() => setLogOpen(true)} style={[styles.addButton, { backgroundColor: palette.gold }]}><Text style={[styles.addText, { color: textOn(palette.gold) }]}>＋ 獲得</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, shadow]}>
          <Text style={styles.heroKicker}>FY{fiscalYear} ・ 今日までのクローズ累計</Text>
          <Text style={styles.heroAmount}>{formatUsd(summary.totalUsd)}</Text>
          <Text style={styles.heroSub}>{formatJpy(summary.totalJpy)} ・ {summary.dealCount} 件</Text>
          <View style={styles.rankRow}>
            <View style={styles.medal}><Text style={styles.medalEmoji}>{rank.current.emoji}</Text></View>
            <View style={styles.rankBody}>
              <Text style={styles.rankTitle}>{rank.current.title}</Text>
              <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(3, rank.progress * 100)}%` }]} /></View>
              <Text style={styles.rankNext}>{rank.next ? `次のランク ${rank.next.emoji} ${rank.next.title} まで ${formatUsd(rank.next.minUsd - summary.totalUsd)}` : '最高ランク到達 👑'}</Text>
            </View>
          </View>
          <View style={styles.split}>
            <View style={styles.splitItem}><Text style={styles.splitLabel}>New ACV</Text><Text style={styles.splitValue}>{formatUsd(summary.newUsd)}</Text></View>
            <View style={styles.splitItem}><Text style={styles.splitLabel}>Renewal ACV</Text><Text style={styles.splitValue}>{formatUsd(summary.renewalUsd)}</Text></View>
          </View>
        </View>

        <View style={[styles.card, shadow, { backgroundColor: palette.card, borderColor: palette.gold }]}>
          <Text style={[styles.cardKicker, { color: palette.muted }]}>次の振込日 ・ {payout.label}</Text>
          <Text style={[styles.payoutDate, { color: palette.text }]}>{payout.payoutDate.replace(/-/g, '/')}</Text>
          <Text style={[styles.payoutAmount, { color: palette.gold }]}>{formatJpy(payout.commissionJpy)}</Text>
          <Text style={[styles.payoutDetail, { color: palette.muted }]}>{shortDate(payout.start)}〜{shortDate(payout.end)} クローズ分 ・ New {formatUsd(payout.newUsd)} × 8% ＋ Renewal {formatUsd(payout.renewalUsd)} × 4%</Text>
        </View>

        <View style={[styles.card, shadow, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>📈 累計の積み上げ (千 USD)</Text>
          <LineChart color={palette.gold} dark={dark} points={curve} unit="k" />
        </View>

        <View style={[styles.card, shadow, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>🗓 四半期ごとのコミッション</Text>
          {payouts.map((quarter) => (
            <View key={quarter.quarter} style={[styles.quarterRow, { borderBottomColor: palette.border }]}>
              <View>
                <Text style={[styles.quarterLabel, { color: palette.text }]}>Q{quarter.quarter} <Text style={{ color: palette.muted, fontWeight: '500' }}>{shortDate(quarter.start)}〜{shortDate(quarter.end)}</Text></Text>
                <Text style={[styles.quarterPay, { color: palette.muted }]}>{quarter.paid ? '振込済' : '振込予定'} {quarter.payoutDate.replace(/-/g, '/')} ・ {quarter.dealCount} 件</Text>
              </View>
              <Text style={[styles.quarterAmount, { color: quarter.commissionJpy > 0 ? palette.gold : palette.muted }]}>{formatJpy(quarter.commissionJpy)}</Text>
            </View>
          ))}
          <Text style={[styles.quarterTotal, { color: palette.text }]}>年度合計 {formatJpy(summary.commissionJpy)}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: palette.text }]}>🏆 戦利品</Text>
        {deals.length === 0 ? <Text style={[styles.empty, { color: palette.muted }]}>まだ戦利品がない。右上の「＋ 獲得」で最初のディールを刻もう。</Text> : deals.map((deal) => (
          <Pressable key={deal.id} onLongPress={() => remove(deal)} style={[styles.loot, shadow, { backgroundColor: palette.card, borderColor: deal.kind === 'new' ? palette.gold : palette.border }]}>
            <View style={[styles.lootIcon, { backgroundColor: palette.accentSoft }]}><Text style={styles.lootEmoji}>{lootFor(deal.amount_usd)}</Text></View>
            <View style={styles.lootBody}>
              <View style={styles.lootTop}>
                <Text style={[styles.lootAmount, { color: palette.text }]}>{formatUsd(deal.amount_usd)}</Text>
                <View style={[styles.badge, { backgroundColor: deal.kind === 'new' ? palette.gold : palette.input }]}><Text style={[styles.badgeText, { color: deal.kind === 'new' ? textOn(palette.gold) : palette.muted }]}>{deal.kind === 'new' ? 'NEW' : 'RENEWAL'}</Text></View>
              </View>
              <Text style={[styles.lootDetail, { color: palette.muted }]}>{deal.closed_on.replace(/-/g, '/')} ・ @{deal.fx_rate.toFixed(2)} ・ {formatJpy(dealJpy(deal))}</Text>
            </View>
            <Text style={[styles.lootCommission, { color: palette.gold }]}>+{formatJpy(commissionJpy(deal))}</Text>
          </Pressable>
        ))}
        {deals.length > 0 ? <Text style={[styles.hint, { color: palette.muted }]}>長押しで削除</Text> : null}
      </ScrollView>
      <DealLogModal dark={dark} onClose={() => setLogOpen(false)} onSave={save} visible={logOpen} />
      {celebration > 0 ? <ConfettiCannon key={celebration} autoStart colors={[GOLD, GOLD_DEEP, '#8B5FC7', '#FFFFFF']} count={180} fadeOut origin={{ x: Dimensions.get('window').width / 2, y: -20 }} /> : null}
      <Toast message={toast} visible={toast !== ''} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addButton: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  addText: { fontSize: 13, fontWeight: '800' },
  back: { padding: 6 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  card: { borderRadius: radius.card, borderWidth: 1, marginBottom: 14, padding: 18 },
  cardKicker: { fontSize: 12, fontWeight: '700' },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  content: { padding: 18, paddingBottom: 60 },
  empty: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  fill: { backgroundColor: GOLD, borderRadius: 4, height: 8 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  hero: { backgroundColor: VAULT, borderColor: GOLD_DEEP, borderRadius: radius.card, borderWidth: 1, marginBottom: 14, padding: 20 },
  heroAmount: { color: GOLD, fontSize: 40, fontWeight: '900', letterSpacing: -1, marginTop: 4 },
  heroKicker: { color: '#C9B8E8', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  heroSub: { color: '#C9B8E8', fontSize: 13, marginTop: 2 },
  hint: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  loot: { alignItems: 'center', borderRadius: radius.card, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 10, padding: 14 },
  lootAmount: { fontSize: 18, fontWeight: '800' },
  lootBody: { flex: 1 },
  lootCommission: { fontSize: 14, fontWeight: '800' },
  lootDetail: { fontSize: 12, marginTop: 2 },
  lootEmoji: { fontSize: 24 },
  lootIcon: { alignItems: 'center', borderRadius: 14, height: 48, justifyContent: 'center', width: 48 },
  lootTop: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  medal: { alignItems: 'center', backgroundColor: '#2B1B45', borderColor: GOLD, borderRadius: 30, borderWidth: 2, height: 60, justifyContent: 'center', width: 60 },
  medalEmoji: { fontSize: 30 },
  payoutAmount: { fontSize: 34, fontWeight: '900', marginTop: 2 },
  payoutDate: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  payoutDetail: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  quarterAmount: { fontSize: 16, fontWeight: '800' },
  quarterLabel: { fontSize: 14, fontWeight: '800' },
  quarterPay: { fontSize: 11, marginTop: 2 },
  quarterRow: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  quarterTotal: { fontSize: 14, fontWeight: '800', marginTop: 12, textAlign: 'right' },
  rankBody: { flex: 1 },
  rankNext: { color: '#C9B8E8', fontSize: 11, marginTop: 6 },
  rankRow: { alignItems: 'center', flexDirection: 'row', gap: 14, marginTop: 18 },
  rankTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  safe: { flex: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 10, marginTop: 6 },
  split: { flexDirection: 'row', gap: 12, marginTop: 18 },
  splitItem: { backgroundColor: '#2B1B45', borderRadius: 14, flex: 1, padding: 12 },
  splitLabel: { color: '#C9B8E8', fontSize: 11, fontWeight: '700' },
  splitValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 2 },
  title: { flex: 1, fontSize: 20, fontWeight: '800' },
  track: { backgroundColor: '#3B2C54', borderRadius: 4, height: 8, overflow: 'hidden' },
});
