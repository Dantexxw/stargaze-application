import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LiveCountdownClock } from './LiveCountdownClock';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { ConnectedHostDevice } from '../../types/models';
import { formatBytes } from '../../utils/formatters';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface ConnectedDeviceCardProps {
  device: ConnectedHostDevice;
  onDisconnect?: (mac: string) => void;
}

export const ConnectedDeviceCard: React.FC<ConnectedDeviceCardProps> = ({
  device,
  onDisconnect,
}) => {
  const isPaid = device.status === 'active_paid';

  const getVendorIcon = () => {
    switch (device.vendor?.toLowerCase()) {
      case 'apple':
        return <Ionicons name="logo-apple" size={18} color={COLORS.text} />;
      case 'samsung':
      case 'infinix':
      case 'tecno':
      case 'xiaomi':
      case 'oppo':
      case 'vivo':
      case 'android':
        return <MaterialCommunityIcons name="cellphone" size={18} color={COLORS.cyan} />;
      default:
        return <MaterialCommunityIcons name="devices" size={18} color={COLORS.textSecondary} />;
    }
  };

  const handleKickPress = () => {
    Alert.alert(
      'Disconnect Hotspot Client',
      `Terminate session for ${device.hostname} (${device.macAddress})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Kick Client',
          style: 'destructive',
          onPress: () => onDisconnect && onDisconnect(device.macAddress),
        },
      ]
    );
  };

  return (
    <Card style={styles.card}>
      {/* Header with Hostname & Status */}
      <View style={styles.header}>
        <View style={styles.hostBlock}>
          <View style={styles.vendorIconBox}>{getVendorIcon()}</View>
          <View style={styles.hostTextContainer}>
            <Text style={styles.hostname} numberOfLines={1}>
              {device.hostname}
            </Text>
            <Text style={styles.subDetailText}>
              {device.ipAddress} • {device.macAddress}
            </Text>
          </View>
        </View>

        {isPaid ? (
          <Badge
            label={device.username || 'ACTIVE'}
            variant="online"
            size="sm"
          />
        ) : (
          <Badge label="CONNECTED" variant="neutral" size="sm" />
        )}
      </View>

      {/* Paid Session Package Badge */}
      <View style={styles.sessionRow}>
        {device.sessionPlan && (
          <View
            style={[
              styles.sessionPlanBadge,
              isPaid ? styles.sessionPlanPaid : styles.sessionPlanUnpaid,
            ]}
          >
            <Ionicons
              name="flash"
              size={12}
              color={isPaid ? COLORS.amber : COLORS.textMuted}
            />
            <Text
              style={[
                styles.sessionPlanText,
                { color: isPaid ? COLORS.amberLight : COLORS.textSecondary },
              ]}
            >
              {device.sessionPlan}
            </Text>
          </View>
        )}

        {device.signalDbm && (
          <View style={styles.signalBadge}>
            <Ionicons
              name={device.signalDbm > -65 ? 'wifi' : 'wifi-outline'}
              size={13}
              color={device.signalDbm > -65 ? COLORS.emerald : COLORS.amber}
            />
            <Text style={styles.signalText}>{device.signalDbm} dBm</Text>
          </View>
        )}
      </View>

      {/* Live 1-Second Countdown Clock & Dynamic Progress Bar */}
      <LiveCountdownClock
        expiresAt={device.expiresAt}
        totalDurationSeconds={device.totalDurationSeconds}
        initialRemainingSeconds={device.remainingSeconds}
        isActivePaid={isPaid}
      />

      {/* Traffic Statistics & Actions */}
      <View style={styles.footer}>
        <View style={styles.trafficRow}>
          <View style={styles.trafficStat}>
            <Ionicons name="arrow-down" size={12} color={COLORS.emerald} />
            <Text style={styles.trafficValue}>
              {formatBytes(device.rxBytes)}
            </Text>
          </View>
          <View style={styles.trafficDivider} />
          <View style={styles.trafficStat}>
            <Ionicons name="arrow-up" size={12} color={COLORS.cyan} />
            <Text style={styles.trafficValue}>
              {formatBytes(device.txBytes)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleKickPress}
          style={styles.kickButton}
        >
          <Ionicons name="log-out-outline" size={14} color={COLORS.rose} />
          <Text style={styles.kickButtonText}>Kick</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  hostBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.xs,
  },
  vendorIconBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  hostTextContainer: {
    flex: 1,
  },
  hostname: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  subDetailText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'Courier',
    marginTop: 2,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  sessionPlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  sessionPlanPaid: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
  },
  sessionPlanUnpaid: {
    backgroundColor: COLORS.surfaceLight,
  },
  sessionPlanText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  trafficRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trafficStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trafficDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.sm,
  },
  trafficValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
  },
  kickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  kickButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.rose,
    marginLeft: 3,
  },
});
