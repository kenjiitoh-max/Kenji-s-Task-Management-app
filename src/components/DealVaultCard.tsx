import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fiscalYearOf, formatJpy, formatUsd, nextPayout, rankFor, summarizeFiscalYear } from '../deals/commission';
import { Deal } from '../db/types';
import { getPalette, radius, shadow } from '../theme';

export function DealVaultCard({ deals, today, dark, onPress }: { deals: Deal[]; today: string; dark: boolean; onPress: () => void }) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const summary = summarizeFiscalYear(deals, fiscalYearOf(today));
  const rank = rankFor(summary.totalUsd);
  const payout = nextPayout(deals, today);
  return (
    <Pressable accessibilityLabel="Deal Vault を開く" onPress={onPress} style={[styles.card, shadow, { borderColor: palette.gold }]}>
      <Text style={styles.emoji}>{rank.current.emoji}</Text>
      <View style={styles.body}>
        <Text style={styles.title}>Deal Vault ・ {rank.current.title}</Text>
        <Text style={styles.amount}>{formatUsd(summary.totalUsd)}<Text style={styles.small}> FY{summary.fiscalYear} 累計</Text></Text>
        <Text style={styles.payout}>次の振込 {payout.payoutDate.replace(/-/g, '/')} → {formatJpy(payout.commissionJpy)}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  amount: { color: '#E2C069', fontSize: 22, fontWeight: '900', marginTop: 2 },
  body: { flex: 1 },
  card: { alignItems: 'center', backgroundColor: '#1B1030', borderRadius: radius.card, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 14, padding: 16 },
  chevron: { color: '#E2C069', fontSize: 26, fontWeight: '300' },
  emoji: { fontSize: 30 },
  payout: { color: '#C9B8E8', fontSize: 12, marginTop: 4 },
  small: { color: '#C9B8E8', fontSize: 12, fontWeight: '600' },
  title: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
});
