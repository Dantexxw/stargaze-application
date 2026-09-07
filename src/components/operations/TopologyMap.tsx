import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { NetworkDevice } from '../../types/models';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface TopologyMapProps {
  devices: NetworkDevice[];
}

export const TopologyMap: React.FC<TopologyMapProps> = ({ devices }) => {
  const rootDevices = devices.filter((d) => !d.parentDeviceId);
  const childDevices = (parentId: string) =>
    devices.filter((d) => d.parentDeviceId === parentId);

  return (
    <Card variant="glass" style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="sitemap" size={18} color={COLORS.violetLight} />
        <Text style={styles.title}>Topology Tree Hierarchy</Text>
      </View>

      {rootDevices.map((root) => (
        <View key={root.id} style={styles.nodeContainer}>
          {/* Level 0: Core Gateway */}
          <View style={styles.levelRow}>
            <View style={styles.nodeBoxCore}>
              <MaterialCommunityIcons name="router-wireless" size={16} color={COLORS.primaryLight} />
              <View style={styles.nodeInfo}>
                <Text style={styles.nodeTitle}>{root.name}</Text>
                <Text style={styles.nodeSub}>{root.ipAddress} • Core BGP</Text>
              </View>
              <Badge label={root.status} variant={root.status} size="sm" />
            </View>
          </View>

          {/* Connectors & Level 1 Switches/APs */}
          {childDevices(root.id).map((child) => (
            <View key={child.id} style={styles.branchContainer}>
              <View style={styles.connectorLine} />
              <View style={styles.childBox}>
                <MaterialCommunityIcons
                  name={child.type === 'switch' ? 'switch' : 'wifi'}
                  size={15}
                  color={COLORS.amber}
                />
                <View style={styles.nodeInfo}>
                  <Text style={styles.childTitle}>{child.name}</Text>
                  <Text style={styles.childSub}>
                    {child.ipAddress} • {child.connectedClients} clients
                  </Text>
                </View>
                <Badge label={child.status} variant={child.status} size="sm" />
              </View>

              {/* Level 2 Edge APs */}
              {childDevices(child.id).map((leaf) => (
                <View key={leaf.id} style={styles.subBranchContainer}>
                  <View style={styles.subConnectorLine} />
                  <View style={styles.leafBox}>
                    <Ionicons name="radio-outline" size={14} color={COLORS.cyan} />
                    <View style={styles.nodeInfo}>
                      <Text style={styles.leafTitle}>{leaf.name}</Text>
                      <Text style={styles.leafSub}>
                        {leaf.ipAddress} • {leaf.connectedClients} hotspot users
                      </Text>
                    </View>
                    <Badge label={leaf.status} variant={leaf.status} size="sm" />
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  nodeContainer: {
    marginBottom: SPACING.sm,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeBoxCore: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  nodeInfo: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  nodeSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  branchContainer: {
    marginLeft: SPACING.lg,
    marginTop: SPACING.xs,
    paddingLeft: SPACING.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.borderLight,
  },
  connectorLine: {
    position: 'absolute',
    left: 0,
    top: 14,
    width: 10,
    height: 2,
    backgroundColor: COLORS.borderLight,
  },
  childBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.borderLight,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginLeft: 6,
  },
  childTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  childSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  subBranchContainer: {
    marginLeft: SPACING.lg,
    marginTop: SPACING.xs,
    paddingLeft: SPACING.sm,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.borderLight,
  },
  subConnectorLine: {
    position: 'absolute',
    left: 0,
    top: 12,
    width: 8,
    height: 2,
    backgroundColor: COLORS.borderLight,
  },
  leafBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: 6,
    marginLeft: 6,
  },
  leafTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  leafSub: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
});
