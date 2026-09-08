import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { StatWidget } from '../common/StatWidget';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { FinancialAnalytics } from '../../types/models';
import { formatCurrency } from '../../utils/formatters';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

interface FinancialKpiCardsProps {
  analytics?: FinancialAnalytics;
}

export const FinancialKpiCards: React.FC<FinancialKpiCardsProps> = ({ analytics }) => {
  const data = analytics || {
    todayRevenue: 3610,
    yesterdayRevenue: 3200,
    revenueGrowthPercent: 12.8,
    activeSubscribers: 131,
    hotspotSalesCount: 232,
    conversionRatePercent: 77.1,
    pppoeRevenue: 0,
    hotspotRevenue: 3610,
    averageTransactionValue: 15.56,
    currency: 'KES',
  };

  const totalRev = data.todayRevenue || 1;
  const pppoePercent = Math.round((data.pppoeRevenue / totalRev) * 100);
  const hotspotPercent = 100 - pppoePercent;

  return (
    <View style={styles.container}>
      {/* Primary KPI Grid (4 core tiles) */}
      <View style={styles.kpiRow}>
        <StatWidget
          title="Today's Collections"
          value={formatCurrency(data.todayRevenue, data.currency)}
          subtitle={`vs ${formatCurrency(data.yesterdayRevenue, data.currency)} Yday`}
          icon={<FontAwesome5 name="money-bill-wave" size={16} color={COLORS.emerald} />}
          trend={{
            value: `+${data.revenueGrowthPercent}% today`,
            isPositive: true,
          }}
          accentColor={COLORS.emerald}
        />

        <StatWidget
          title="Hotspot Sales"
          value={data.hotspotSalesCount.toLocaleString()}
          subtitle="Vouchers Issued"
          icon={<Ionicons name="ticket" size={18} color={COLORS.amber} />}
          trend={{ value: '14.2% surge', isPositive: true }}
          accentColor={COLORS.amber}
        />
      </View>

      <View style={styles.kpiRow}>
        <StatWidget
          title="Active Subscribers"
          value={data.activeSubscribers.toLocaleString()}
          subtitle="PPPoE & Static IP"
          icon={<Ionicons name="people" size={18} color={COLORS.primaryLight} />}
          trend={{ value: '99.1% Retention', isPositive: true }}
          accentColor={COLORS.primary}
        />

        <StatWidget
          title="Conversion Rate"
          value={`${data.conversionRatePercent}%`}
          subtitle="Portal -> Paid"
          icon={<MaterialCommunityIcons name="chart-line" size={18} color={COLORS.violetLight} />}
          trend={{ value: 'High Engagement', isPositive: true }}
          accentColor={COLORS.violet}
        />
      </View>

      {/* Revenue Stream Breakdown Card */}
      <Card variant="surface" style={styles.splitCard}>
        <View style={styles.splitHeader}>
          <Text style={styles.splitTitle}>Revenue Stream Breakdown</Text>
          <Text style={styles.avgTicketText}>
            Avg Ticket: {formatCurrency(data.averageTransactionValue, data.currency)}
          </Text>
        </View>

        <View style={styles.splitValuesRow}>
          <View style={styles.splitValueItem}>
            <View style={[styles.splitColorDot, { backgroundColor: COLORS.primaryLight }]} />
            <Text style={styles.splitLabel}>
              Fixed Fiber PPPoE ({pppoePercent}%)
            </Text>
            <Text style={styles.splitAmount}>
              {formatCurrency(data.pppoeRevenue, data.currency)}
            </Text>
          </View>

          <View style={styles.splitValueItem}>
            <View style={[styles.splitColorDot, { backgroundColor: COLORS.amber }]} />
            <Text style={styles.splitLabel}>
              Hotspot Passes ({hotspotPercent}%)
            </Text>
            <Text style={[styles.splitAmount, { color: COLORS.amberLight }]}>
              {formatCurrency(data.hotspotRevenue, data.currency)}
            </Text>
          </View>
        </View>

        {/* Proportional Split Bar */}
        <View style={styles.splitBarContainer}>
          <View
            style={[
              styles.splitBarSegment,
              { width: `${pppoePercent}%`, backgroundColor: COLORS.primary },
            ]}
          />
          <View
            style={[
              styles.splitBarSegment,
              { width: `${hotspotPercent}%`, backgroundColor: COLORS.amber },
            ]}
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  splitCard: {
    marginTop: SPACING.xs,
    padding: SPACING.md,
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  splitTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  avgTicketText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  splitValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  splitValueItem: {
    flex: 1,
  },
  splitColorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  splitLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  splitAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  splitBarContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceLight,
  },
  splitBarSegment: {
    height: '100%',
  },
});
