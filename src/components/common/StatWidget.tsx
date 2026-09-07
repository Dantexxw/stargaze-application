import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

interface StatWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = COLORS.primary,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}>
          {icon}
        </View>
      </View>

      <Text style={styles.value}>{value}</Text>

      <View style={styles.footer}>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: trend.isPositive
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(244, 63, 94, 0.15)',
              },
            ]}
          >
            <Text
              style={[
                styles.trendText,
                { color: trend.isPositive ? COLORS.emerald : COLORS.rose },
              ]}
            >
              {trend.isPositive ? '↑ ' : '↓ '}
              {trend.value}
            </Text>
          </View>
        )}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    marginHorizontal: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginVertical: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    flexWrap: 'wrap',
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginRight: 6,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
