import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

interface RevenueSummaryProps {
  todayRevenue: number;
  revenueTarget: number;
  currency: string;
}

export const RevenueSummary: React.FC<RevenueSummaryProps> = ({
  todayRevenue,
  revenueTarget,
  currency,
}) => {
  const percentAchieved = Math.min(Math.round((todayRevenue / revenueTarget) * 100), 100);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={18} color={COLORS.amber} />
          </View>
          <View>
            <Text style={styles.title}>Today's M-Pesa Collections</Text>
            <Text style={styles.subtitle}>Direct STK Push & C2B Paybill</Text>
          </View>
        </View>
        <View style={styles.percentBadge}>
          <Text style={styles.percentText}>{percentAchieved}% of Target</Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amountText}>{formatCurrency(todayRevenue, currency)}</Text>
        <Text style={styles.targetText}>/ {formatCurrency(revenueTarget, currency)}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentAchieved}%` }]} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  percentBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.amber,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: SPACING.xs,
  },
  amountText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  targetText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginTop: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.amber,
    borderRadius: RADIUS.full,
  },
});
