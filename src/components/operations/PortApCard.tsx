import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ConnectedDeviceCard } from './ConnectedDeviceCard';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { PortApTopology } from '../../types/models';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface PortApCardProps {
  portTopology: PortApTopology;
  onDisconnectDevice?: (mac: string) => void;
  defaultExpanded?: boolean;
}

export const PortApCard: React.FC<PortApCardProps> = ({
  portTopology,
  onDisconnectDevice,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Card variant="glass" style={styles.card}>
      {/* Port & AP Header */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.header}
      >
        <View style={styles.portLeft}>
          <View style={styles.rj45IconBox}>
            <MaterialCommunityIcons
              name="ethernet"
              size={22}
              color={COLORS.primaryLight}
            />
          </View>

          <View style={styles.titleInfo}>
            <View style={styles.portBadgeRow}>
              <View style={styles.portPill}>
                <Text style={styles.portPillText}>{portTopology.portName}</Text>
              </View>
              <Text style={styles.apName} numberOfLines={1}>
                {portTopology.apName}
              </Text>
            </View>
            <Text style={styles.apModelText}>
              {portTopology.apModel} • {portTopology.linkSpeed}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Badge
            label={portTopology.status.toUpperCase()}
            variant={portTopology.status === 'running' ? 'online' : 'danger'}
            size="sm"
          />
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={COLORS.textSecondary}
            style={{ marginLeft: 6 }}
          />
        </View>
      </TouchableOpacity>

      {/* Port Quick Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Total Hosts</Text>
          <Text style={styles.statValue}>{portTopology.connectedHosts}</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCol}>
          <Text style={styles.statLabel}>Paid Sessions</Text>
          <View style={styles.paidValueRow}>
            <Ionicons name="flash" size={13} color={COLORS.amber} />
            <Text style={[styles.statValue, { color: COLORS.amberLight }]}>
              {portTopology.activePaidSessions} Active
            </Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCol}>
          <Text style={styles.statLabel}>AP IP Address</Text>
          <Text style={styles.statValue}>{portTopology.ipAddress}</Text>
        </View>
      </View>

      {/* Expanded Devices List */}
      {expanded && (
        <View style={styles.deviceListContainer}>
          <View style={styles.deviceSectionHeader}>
            <Text style={styles.deviceSectionTitle}>
              CONNECTED HOSTS ({portTopology.devices.length})
            </Text>
            <Text style={styles.deviceSectionSub}>Live 1s Ticking Timers</Text>
          </View>

          {portTopology.devices.map((device) => (
            <ConnectedDeviceCard
              key={device.id}
              device={device}
              onDisconnect={onDisconnectDevice}
            />
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
  },
  portLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.xs,
  },
  rj45IconBox: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  titleInfo: {
    flex: 1,
  },
  portBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  portPill: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginRight: 6,
  },
  portPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'Courier',
  },
  apName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  apModelText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    marginTop: 4,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  paidValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderLight,
  },
  deviceListContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  deviceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  deviceSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  deviceSectionSub: {
    fontSize: 10,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
});
