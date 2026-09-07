import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { COLORS, SPACING, RADIUS } from '../../theme/Theme';
import { useSpeedtest } from '../../hooks/useSpeedtest';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface SpeedtestModalProps {
  visible: boolean;
  onClose: () => void;
  targetDeviceName?: string;
  onAttachToTicket?: (result: any) => void;
}

export const SpeedtestModal: React.FC<SpeedtestModalProps> = ({
  visible,
  onClose,
  targetDeviceName = 'Current Access Point / Hotspot Gateway',
  onAttachToTicket,
}) => {
  const {
    isRunning,
    stage,
    currentSpeed,
    ping,
    jitter,
    downloadSpeed,
    uploadSpeed,
    result,
    startSpeedtest,
    reset,
  } = useSpeedtest();

  const handleShare = async () => {
    if (!result) return;
    try {
      await Share.share({
        message: `[STARGAZE SPEEDTEST VERIFICATION]\nTarget: ${targetDeviceName}\nDownload: ${result.downloadMbps} Mbps\nUpload: ${result.uploadMbps} Mbps\nPing: ${result.pingMs} ms (Jitter: ${result.jitterMs} ms)\nServer: ${result.serverLocation}\nStatus: ${result.rating}\nVerified at: ${new Date(result.timestamp).toLocaleTimeString()}`,
      });
    } catch {
      // Ignored
    }
  };

  const getStageTitle = () => {
    switch (stage) {
      case 'PING':
        return 'Testing Latency & Jitter...';
      case 'DOWNLOAD':
        return 'Measuring Download Speed...';
      case 'UPLOAD':
        return 'Measuring Upload Speed...';
      case 'COMPLETE':
        return 'Speedtest Completed';
      default:
        return 'Ready for Field Test';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Card variant="glow" glowColor={COLORS.primaryGlow} style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.speedIconBox}>
                <Ionicons name="speedometer" size={20} color={COLORS.primaryLight} />
              </View>
              <View>
                <Text style={styles.title}>Field Bandwidth Speedtest</Text>
                <Text style={styles.targetSub} numberOfLines={1}>{targetDeviceName}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                reset();
                onClose();
              }}
              style={styles.closeBtn}
              disabled={isRunning}
            >
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            {/* Speedometer Gauge Display */}
            <View style={styles.gaugeContainer}>
              <View style={styles.gaugeCircle}>
                <Text style={styles.gaugeValue}>
                  {stage === 'DOWNLOAD' || stage === 'UPLOAD'
                    ? currentSpeed
                    : stage === 'COMPLETE'
                    ? downloadSpeed
                    : '--'}
                </Text>
                <Text style={styles.gaugeUnit}>Mbps</Text>
                <Text style={styles.stageLabel}>{getStageTitle()}</Text>
              </View>
            </View>

            {/* Live Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Ionicons name="arrow-down" size={14} color={COLORS.emerald} />
                  <Text style={styles.metricTitle}>DOWNLOAD</Text>
                </View>
                <Text style={[styles.metricValue, { color: COLORS.emerald }]}>
                  {downloadSpeed ? `${downloadSpeed} Mbps` : isRunning && stage === 'DOWNLOAD' ? `${currentSpeed} Mbps` : '--'}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Ionicons name="arrow-up" size={14} color={COLORS.cyan} />
                  <Text style={styles.metricTitle}>UPLOAD</Text>
                </View>
                <Text style={[styles.metricValue, { color: COLORS.cyan }]}>
                  {uploadSpeed ? `${uploadSpeed} Mbps` : isRunning && stage === 'UPLOAD' ? `${currentSpeed} Mbps` : '--'}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Ionicons name="swap-vertical" size={14} color={COLORS.amber} />
                  <Text style={styles.metricTitle}>PING / JITTER</Text>
                </View>
                <Text style={[styles.metricValue, { color: COLORS.amber }]}>
                  {ping ? `${ping}ms / ${jitter}ms` : '--'}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Ionicons name="server-outline" size={14} color={COLORS.primaryLight} />
                  <Text style={styles.metricTitle}>GATEWAY</Text>
                </View>
                <Text style={[styles.metricValue, { color: COLORS.text }]} numberOfLines={1}>
                  NBO Core IXP
                </Text>
              </View>
            </View>

            {/* Completed Rating Banner */}
            {result && (
              <View style={styles.ratingCard}>
                <View style={styles.ratingLeft}>
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.emerald} />
                  <View style={{ marginLeft: SPACING.sm }}>
                    <Text style={styles.ratingTitle}>SLA Verified: {result.rating}</Text>
                    <Text style={styles.ratingSub}>
                      Bandwidth satisfies Gigabit Hotspot / PPPoE Tier.
                    </Text>
                  </View>
                </View>
                <Badge label="VERIFIED" variant="online" size="sm" />
              </View>
            )}
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            {!isRunning && !result && (
              <Button
                title="Start Speedtest"
                variant="primary"
                onPress={startSpeedtest}
                icon={<Ionicons name="play" size={16} color="#FFFFFF" />}
              />
            )}

            {isRunning && (
              <Button
                title="Testing Bandwidth..."
                variant="secondary"
                onPress={() => {}}
                disabled
                loading
              />
            )}

            {result && (
              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={handleShare}
                >
                  <Ionicons name="share-social-outline" size={16} color={COLORS.text} />
                  <Text style={styles.shareBtnText}>Share Report</Text>
                </TouchableOpacity>

                <Button
                  title="Test Again"
                  variant="primary"
                  onPress={startSpeedtest}
                  style={{ flex: 1, marginLeft: SPACING.sm }}
                />
              </View>
            )}
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
  speedIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
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
    maxHeight: 450,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  gaugeCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: COLORS.primaryLight,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  gaugeValue: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.text,
    fontFamily: 'Courier',
  },
  gaugeUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginTop: -4,
  },
  stageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
  ratingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ratingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  ratingSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footer: {
    marginTop: SPACING.lg,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 6,
  },
});

export default SpeedtestModal;
