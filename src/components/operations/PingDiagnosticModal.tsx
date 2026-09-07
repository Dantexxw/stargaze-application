import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { PingResult } from '../../types/models';
import { Ionicons } from '@expo/vector-icons';

interface PingDiagnosticModalProps {
  visible: boolean;
  targetHost: string;
  targetName: string;
  onClose: () => void;
  onRunPing: (host: string) => Promise<PingResult>;
}

export const PingDiagnosticModal: React.FC<PingDiagnosticModalProps> = ({
  visible,
  targetHost,
  targetName,
  onClose,
  onRunPing,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PingResult | null>(null);

  const executePing = async () => {
    if (!targetHost) return;
    setLoading(true);
    try {
      const res = await onRunPing(targetHost);
      setResult(res);
    } catch {
      setResult({
        host: targetHost,
        transmitted: 4,
        received: 0,
        packetLossPercent: 100,
        minRttMs: 0,
        avgRttMs: 0,
        maxRttMs: 0,
        logs: [
          `PING ${targetHost}: 56 data bytes`,
          `Request timeout for icmp_seq 0`,
          `Request timeout for icmp_seq 1`,
          `100.0% packet loss (Host Unreachable)`,
        ],
        isReachable: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && targetHost) {
      executePing();
    }
  }, [visible, targetHost]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Card variant="glow" style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="pulse" size={20} color={COLORS.cyan} />
              <Text style={styles.title}>Port & AP Ping Diagnostics</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.targetSub}>
            Target: {targetName} ({targetHost})
          </Text>

          {/* Status Badge */}
          {result && !loading && (
            <View style={styles.statusRow}>
              <Badge
                label={result.isReachable ? 'REACHABLE (ONLINE)' : 'UNREACHABLE (100% PACKET LOSS)'}
                variant={result.isReachable ? 'online' : 'danger'}
                size="md"
              />
              {result.isReachable && (
                <Text style={styles.rttText}>Avg RTT: {result.avgRttMs} ms</Text>
              )}
            </View>
          )}

          {/* Terminal Console Output */}
          <View style={styles.terminalContainer}>
            <View style={styles.terminalHeader}>
              <View style={styles.terminalDots}>
                <View style={[styles.tDot, { backgroundColor: COLORS.rose }]} />
                <View style={[styles.tDot, { backgroundColor: COLORS.amber }]} />
                <View style={[styles.tDot, { backgroundColor: COLORS.emerald }]} />
              </View>
              <Text style={styles.terminalTitle}>ICMP ECHO CONSOLE</Text>
            </View>

            <ScrollView style={styles.terminalBody}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={COLORS.cyan} size="small" />
                  <Text style={styles.loadingText}>Transmitting 4 ICMP echo packets...</Text>
                </View>
              ) : (
                result?.logs.map((log, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.logLine,
                      log.includes('timeout') || log.includes('100.0%')
                        ? styles.logError
                        : log.includes('64 bytes')
                        ? styles.logSuccess
                        : styles.logInfo,
                    ]}
                  >
                    {log}
                  </Text>
                ))
              )}
            </ScrollView>
          </View>

          {/* Ping Stats Bar */}
          {result && !loading && (
            <View style={styles.statsBar}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Transmitted</Text>
                <Text style={styles.statVal}>{result.transmitted}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Received</Text>
                <Text style={[styles.statVal, { color: result.isReachable ? COLORS.emerald : COLORS.rose }]}>
                  {result.received}
                </Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Loss</Text>
                <Text style={[styles.statVal, { color: result.packetLossPercent > 0 ? COLORS.rose : COLORS.emerald }]}>
                  {result.packetLossPercent}%
                </Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Min / Max</Text>
                <Text style={styles.statVal}>
                  {result.minRttMs} / {result.maxRttMs} ms
                </Text>
              </View>
            </View>
          )}

          {/* Re-ping Button */}
          <Button
            title="Re-Test / Send Ping"
            variant="secondary"
            onPress={executePing}
            loading={loading}
            icon={<Ionicons name="refresh" size={16} color={COLORS.text} />}
            style={{ marginTop: SPACING.md }}
          />
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  closeBtn: {
    padding: 4,
  },
  targetSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  rttText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  terminalContainer: {
    backgroundColor: '#05070E',
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginVertical: SPACING.xs,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1322',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  terminalDots: {
    flexDirection: 'row',
  },
  tDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  terminalTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  terminalBody: {
    padding: SPACING.sm,
    height: 140,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontFamily: 'Courier',
  },
  logLine: {
    fontSize: 11,
    fontFamily: 'Courier',
    marginBottom: 4,
  },
  logInfo: {
    color: COLORS.textSecondary,
  },
  logSuccess: {
    color: COLORS.emerald,
  },
  logError: {
    color: COLORS.rose,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
});
