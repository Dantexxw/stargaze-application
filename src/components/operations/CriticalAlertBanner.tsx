import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { EmergencyAlert } from '../../types/models';
import { formatTimeAgo } from '../../utils/formatters';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface CriticalAlertBannerProps {
  alert: EmergencyAlert;
  onAcknowledge: (alertId: string) => Promise<void>;
  onDispatchTech: (alert: EmergencyAlert) => void;
  onPingPort: (alert: EmergencyAlert) => void;
  onOpenMap?: (alert: EmergencyAlert) => void;
}

export const CriticalAlertBanner: React.FC<CriticalAlertBannerProps> = ({
  alert,
  onAcknowledge,
  onDispatchTech,
  onPingPort,
  onOpenMap,
}) => {
  const [pulse, setPulse] = useState(true);
  const [acking, setAcking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 750);
    return () => clearInterval(interval);
  }, []);

  const handleAck = async () => {
    setAcking(true);
    try {
      await onAcknowledge(alert.id);
      Alert.alert('Alert Acknowledged', 'Alarm silenced and logged.');
    } catch {
      Alert.alert('Error', 'Could not acknowledge alert.');
    } finally {
      setAcking(false);
    }
  };

  return (
    <Card variant="glow" glowColor={COLORS.roseGlow} style={styles.card}>
      {/* Top Banner Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.pulseRing,
              {
                borderColor: COLORS.rose,
                opacity: pulse ? 1 : 0.6,
                transform: [{ scale: pulse ? 1.05 : 1 }],
              },
            ]}
          >
            <Ionicons name="warning" size={22} color={COLORS.rose} />
          </View>
          <View style={styles.headerTextContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.alertTitle}>CRITICAL: AP DISCONNECTED</Text>
              <View style={styles.liveAlarmPill}>
                <View style={styles.alarmDot} />
                <Text style={styles.alarmText}>ACTIVE ALARM</Text>
              </View>
            </View>
            <Text style={styles.timeSinceText}>
              Disconnected: {formatTimeAgo(alert.disconnectTime)}
            </Text>
          </View>
        </View>
      </View>

      {/* Disconnected AP Hardware Specs */}
      <View style={styles.specsGrid}>
        <View style={styles.specBox}>
          <Text style={styles.specLabel}>Router Port</Text>
          <View style={styles.specValueRow}>
            <MaterialCommunityIcons name="ethernet" size={14} color={COLORS.rose} />
            <Text style={[styles.specValue, { color: COLORS.rose }]}>
              {alert.portName}
            </Text>
          </View>
        </View>

        <View style={styles.specBox}>
          <Text style={styles.specLabel}>AP Hardware Model</Text>
          <Text style={styles.specValue} numberOfLines={1}>
            {alert.apModel}
          </Text>
        </View>

        <View style={styles.specBox}>
          <Text style={styles.specLabel}>MAC Address</Text>
          <Text style={[styles.specValue, styles.monoText]}>
            {alert.macAddress}
          </Text>
        </View>

        <View style={styles.specBox}>
          <Text style={styles.specLabel}>Physical Location</Text>
          <Text style={styles.specValue} numberOfLines={1}>
            {alert.location}
          </Text>
        </View>
      </View>

      {/* 3 Core Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleAck}
          disabled={acking}
          style={[styles.actionBtn, styles.ackBtn]}
        >
          <Ionicons name="checkmark-done" size={16} color={COLORS.emerald} />
          <Text style={[styles.actionBtnText, { color: COLORS.emerald }]}>
            {acking ? 'Silencing...' : 'Acknowledge'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onDispatchTech(alert)}
          style={[styles.actionBtn, styles.dispatchBtn]}
        >
          <Ionicons name="paper-plane" size={15} color="#FFFFFF" />
          <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
            Dispatch Tech
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onPingPort(alert)}
          style={[styles.actionBtn, styles.pingBtn]}
        >
          <Ionicons name="pulse" size={15} color={COLORS.cyan} />
          <Text style={[styles.actionBtnText, { color: COLORS.cyan }]}>
            Test / Ping
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map GPS Navigation Trigger */}
      {onOpenMap && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onOpenMap(alert)}
          style={styles.mapShortcut}
        >
          <Ionicons name="navigate-circle-outline" size={16} color={COLORS.primaryLight} />
          <Text style={styles.mapShortcutText}>
            View AP GPS Location & Technician Dispatch Route
          </Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.primaryLight} />
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#160B12', // Dark crimson tint
    borderColor: 'rgba(244, 63, 94, 0.45)',
    borderWidth: 1.5,
    marginVertical: SPACING.xs,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pulseRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244, 63, 94, 0.18)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.rose,
    letterSpacing: 0.5,
    marginRight: 6,
  },
  liveAlarmPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.25)',
    borderColor: COLORS.rose,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  alarmDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.rose,
    marginRight: 4,
  },
  alarmText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.rose,
  },
  timeSinceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },
  specBox: {
    width: '48%',
    marginBottom: 6,
  },
  specLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 1,
  },
  specValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monoText: {
    fontFamily: 'Courier',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginHorizontal: 3,
    borderWidth: 1,
  },
  ackBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  dispatchBtn: {
    backgroundColor: COLORS.roseDark,
    borderColor: COLORS.rose,
    shadowColor: COLORS.rose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  pingBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
  mapShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 63, 94, 0.2)',
  },
  mapShortcutText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '600',
    flex: 1,
    marginHorizontal: 6,
  },
});
