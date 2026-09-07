import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { COLORS, SPACING, RADIUS } from '../../theme/Theme';
import { WifiSignalMetrics } from '../../types/models';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface WifiSignalAnalyzerModalProps {
  visible: boolean;
  onClose: () => void;
  apName?: string;
  apModel?: string;
}

export const WifiSignalAnalyzerModal: React.FC<WifiSignalAnalyzerModalProps> = ({
  visible,
  onClose,
  apName = 'EAP225-Outdoor-NBO-04',
  apModel = 'TP-Link Omada Gigabit AP',
}) => {
  const [selectedBand, setSelectedBand] = useState<2.4 | 5.0>(5.0);

  // Simulated live spectrum data
  const metrics: WifiSignalMetrics = {
    ssid: 'STARGAZE-HOTSPOT-5G',
    bssid: '74:83:C2:AA:BB:CC',
    rssiDbm: selectedBand === 5.0 ? -54 : -68,
    qualityPercent: selectedBand === 5.0 ? 92 : 74,
    frequencyGhz: selectedBand,
    channel: selectedBand === 5.0 ? 36 : 6,
    channelWidthMhz: selectedBand === 5.0 ? 80 : 20,
    interferenceLevel: selectedBand === 5.0 ? 'LOW' : 'HIGH',
    status: selectedBand === 5.0 ? 'OPTIMAL' : 'DEGRADED',
  };

  const getRssiColor = (rssi: number) => {
    if (rssi >= -60) return COLORS.emerald;
    if (rssi >= -75) return COLORS.amber;
    return COLORS.rose;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Card variant="glow" glowColor={COLORS.primaryGlow} style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconBox}>
                <Ionicons name="wifi" size={20} color={COLORS.cyan} />
              </View>
              <View>
                <Text style={styles.title}>Wi-Fi Spectrum & Signal Analyzer</Text>
                <Text style={styles.targetSub}>{apName} ({apModel})</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            {/* Band Selector Toggle */}
            <View style={styles.bandToggle}>
              <TouchableOpacity
                onPress={() => setSelectedBand(2.4)}
                style={[styles.bandBtn, selectedBand === 2.4 && styles.bandBtnActive]}
              >
                <Text style={[styles.bandBtnText, selectedBand === 2.4 && styles.bandBtnTextActive]}>
                  2.4 GHz (Long Range)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedBand(5.0)}
                style={[styles.bandBtn, selectedBand === 5.0 && styles.bandBtnActive]}
              >
                <Text style={[styles.bandBtnText, selectedBand === 5.0 && styles.bandBtnTextActive]}>
                  5.0 GHz (Gigabit High-Density)
                </Text>
              </TouchableOpacity>
            </View>

            {/* RSSI Signal Gauge Card */}
            <View style={styles.signalCard}>
              <View style={styles.signalHeader}>
                <Text style={styles.signalLabel}>RECEIVED SIGNAL STRENGTH (RSSI)</Text>
                <Badge
                  label={metrics.status}
                  variant={metrics.status === 'OPTIMAL' ? 'online' : 'warning'}
                  size="sm"
                />
              </View>

              <View style={styles.rssiRow}>
                <Text style={[styles.rssiValue, { color: getRssiColor(metrics.rssiDbm) }]}>
                  {metrics.rssiDbm} dBm
                </Text>
                <Text style={styles.rssiPercent}>{metrics.qualityPercent}% Quality</Text>
              </View>

              {/* RSSI Bar */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${metrics.qualityPercent}%`,
                      backgroundColor: getRssiColor(metrics.rssiDbm),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Spectrum Parameters */}
            <View style={styles.specsGrid}>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Operating Channel</Text>
                <Text style={styles.specVal}>Channel {metrics.channel}</Text>
              </View>

              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Channel Width</Text>
                <Text style={styles.specVal}>{metrics.channelWidthMhz} MHz</Text>
              </View>

              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Interference Level</Text>
                <Text
                  style={[
                    styles.specVal,
                    {
                      color:
                        metrics.interferenceLevel === 'LOW'
                          ? COLORS.emerald
                          : COLORS.rose,
                    },
                  ]}
                >
                  {metrics.interferenceLevel}
                </Text>
              </View>

              <View style={styles.specBox}>
                <Text style={styles.specLabel}>BSSID (Radio MAC)</Text>
                <Text style={[styles.specVal, styles.monoText]}>{metrics.bssid}</Text>
              </View>
            </View>

            {/* AI Channel Recommendation */}
            <View style={styles.recommendBox}>
              <View style={styles.recommendHeader}>
                <Ionicons name="bulb-outline" size={16} color={COLORS.amber} />
                <Text style={styles.recommendTitle}>RF Engineer Recommendation</Text>
              </View>
              <Text style={styles.recommendText}>
                {selectedBand === 2.4
                  ? 'Channel 6 is experiencing 42% co-channel interference from neighboring CPEs. Recommend shifting AP radio to Channel 1 (2412 MHz).'
                  : '5 GHz spectrum is clean with zero adjacent interference on 80 MHz channel 36. Maximum throughput is unconstrained.'}
              </Text>
            </View>
          </ScrollView>

          {/* Close Action */}
          <View style={{ marginTop: SPACING.md }}>
            <Button title="Done" variant="secondary" onPress={onClose} />
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  targetSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  scrollArea: {
    maxHeight: 460,
  },
  bandToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    padding: 3,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  bandBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  bandBtnActive: {
    backgroundColor: COLORS.primary,
  },
  bandBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  bandBtnTextActive: {
    color: '#FFFFFF',
  },
  signalCard: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  rssiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginVertical: SPACING.sm,
  },
  rssiValue: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'Courier',
  },
  rssiPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  barTrack: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  specBox: {
    width: '48%',
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  specLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  specVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  monoText: {
    fontFamily: 'Courier',
    fontSize: 11,
  },
  recommendBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recommendTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.amber,
    marginLeft: 4,
  },
  recommendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});

export default WifiSignalAnalyzerModal;
