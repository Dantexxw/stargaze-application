import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { NetworkDevice } from '../../types/models';
import { formatBandwidth } from '../../utils/formatters';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface DeviceCardProps {
  device: NetworkDevice;
  onPress: () => void;
  onRebootPress?: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onPress,
  onRebootPress,
}) => {
  const getDeviceIcon = () => {
    switch (device.type) {
      case 'mikrotik_router':
        return <MaterialCommunityIcons name="router-wireless" size={22} color={COLORS.primaryLight} />;
      case 'ubiquiti_ap':
        return <Ionicons name="wifi" size={22} color={COLORS.cyan} />;
      case 'switch':
        return <MaterialCommunityIcons name="switch" size={22} color={COLORS.amber} />;
      default:
        return <MaterialCommunityIcons name="access-point" size={22} color={COLORS.textSecondary} />;
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.iconContainer}>{getDeviceIcon()}</View>
            <View style={styles.nameBlock}>
              <Text style={styles.deviceName} numberOfLines={1}>
                {device.name}
              </Text>
              <Text style={styles.modelName}>{device.model}</Text>
            </View>
          </View>
          <Badge label={device.status.toUpperCase()} variant={device.status} size="sm" />
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>IP Address</Text>
            <Text style={styles.infoValue}>{device.ipAddress}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Uptime</Text>
            <Text style={styles.infoValue}>{device.uptime}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Clients</Text>
            <Text style={styles.infoValue}>{device.connectedClients}</Text>
          </View>
        </View>

        <View style={styles.telemetryRow}>
          {/* CPU Load */}
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryLabel}>CPU</Text>
            <View style={styles.telemetryBar}>
              <View
                style={[
                  styles.telemetryFill,
                  {
                    width: `${device.cpuLoadPercent}%`,
                    backgroundColor:
                      device.cpuLoadPercent > 80
                        ? COLORS.rose
                        : device.cpuLoadPercent > 50
                        ? COLORS.amber
                        : COLORS.emerald,
                  },
                ]}
              />
            </View>
            <Text style={styles.telemetryText}>{device.cpuLoadPercent}%</Text>
          </View>

          {/* Traffic */}
          <View style={styles.trafficItem}>
            <Ionicons name="swap-vertical" size={14} color={COLORS.textSecondary} />
            <Text style={styles.trafficText}>
              ↓ {formatBandwidth(device.rxRateMbps)} | ↑ {formatBandwidth(device.txRateMbps)}
            </Text>
          </View>
        </View>

        {device.location && (
          <View style={styles.footer}>
            <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {device.location}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
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
    flex: 1,
    marginRight: SPACING.sm,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  nameBlock: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  modelName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  infoCol: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  telemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  telemetryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  telemetryBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  telemetryFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  telemetryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 6,
  },
  trafficItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trafficText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
});
