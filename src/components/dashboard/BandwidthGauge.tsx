import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { formatBandwidth } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

interface BandwidthGaugeProps {
  downloadMbps: number;
  uploadMbps: number;
  peakMbps: number;
  totalTransferredGB: number;
  onSpeedtestPress?: () => void;
}

export const BandwidthGauge: React.FC<BandwidthGaugeProps> = ({
  downloadMbps,
  uploadMbps,
  peakMbps,
  totalTransferredGB,
  onSpeedtestPress,
}) => {
  const downloadPercent = Math.min(Math.round((downloadMbps / peakMbps) * 100), 100);
  const uploadPercent = Math.min(Math.round((uploadMbps / peakMbps) * 100), 100);

  return (
    <Card variant="glow" glowColor={COLORS.primaryGlow} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="speedometer" size={18} color={COLORS.primaryLight} />
          <Text style={styles.title}>Real-Time Throughput</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.peakLabel}>Cap: {formatBandwidth(peakMbps)}</Text>
          {onSpeedtestPress && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onSpeedtestPress}
              style={styles.speedtestBadge}
            >
              <Ionicons name="flash" size={11} color="#FFFFFF" />
              <Text style={styles.speedtestBadgeText}>Speedtest</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Download Meter */}
      <View style={styles.meterContainer}>
        <View style={styles.meterHeader}>
          <View style={styles.meterTitleRow}>
            <Ionicons name="arrow-down-circle" size={16} color={COLORS.emerald} />
            <Text style={styles.meterLabel}>Download (IN)</Text>
          </View>
          <Text style={[styles.meterValue, { color: COLORS.emerald }]}>
            {formatBandwidth(downloadMbps)}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${downloadPercent}%`, backgroundColor: COLORS.emerald },
            ]}
          />
        </View>
      </View>

      {/* Upload Meter */}
      <View style={styles.meterContainer}>
        <View style={styles.meterHeader}>
          <View style={styles.meterTitleRow}>
            <Ionicons name="arrow-up-circle" size={16} color={COLORS.cyan} />
            <Text style={styles.meterLabel}>Upload (OUT)</Text>
          </View>
          <Text style={[styles.meterValue, { color: COLORS.cyan }]}>
            {formatBandwidth(uploadMbps)}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${uploadPercent}%`, backgroundColor: COLORS.cyan },
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Ionicons name="cloud-download-outline" size={14} color={COLORS.textSecondary} />
        <Text style={styles.footerText}>
          Total Aggregated Payload Today: {totalTransferredGB.toLocaleString()} GB
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedtestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginLeft: 8,
  },
  speedtestBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 3,
    letterSpacing: 0.3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  peakLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  meterContainer: {
    marginBottom: SPACING.md,
  },
  meterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  meterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meterLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  meterValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
});
