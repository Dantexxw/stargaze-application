import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  DimensionValue,
} from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { EmergencyAlert, FieldTechnician, PortApTopology } from '../../types/models';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface DispatchMapViewProps {
  alerts: EmergencyAlert[];
  technicians: FieldTechnician[];
  ports: PortApTopology[];
  onDispatchTech: (alert: EmergencyAlert) => void;
}

export const DispatchMapView: React.FC<DispatchMapViewProps> = ({
  alerts,
  technicians,
  ports,
  onDispatchTech,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<EmergencyAlert | PortApTopology | null>(
    alerts[0] || ports[0] || null
  );

  const openExternalNavigation = (lat: number, lng: number, label: string) => {
    const scheme = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });

    Linking.canOpenURL(scheme)
      .then((supported) => {
        if (supported) {
          Linking.openURL(scheme);
        } else {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
      })
      .catch(() => {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      });
  };

  return (
    <View style={styles.container}>
      {/* Dark Styled Visual GPS Radar View */}
      <Card variant="glow" style={styles.mapCanvasCard}>
        <View style={styles.mapHeader}>
          <View style={styles.mapTitleRow}>
            <Ionicons name="map" size={18} color={COLORS.primaryLight} />
            <Text style={styles.mapTitle}>GIS Topology & Field GPS Dispatch</Text>
          </View>
          <View style={styles.liveGpsBadge}>
            <View style={styles.gpsDot} />
            <Text style={styles.gpsText}>GPS LOCK (NAIROBI)</Text>
          </View>
        </View>

        {/* Visual Map Canvas Grid */}
        <View style={styles.visualGrid}>
          {/* Grid lines */}
          <View style={styles.gridLineHorizontal} />
          <View style={styles.gridLineVertical} />
          <View style={styles.radarRingOuter} />
          <View style={styles.radarRingInner} />

          {/* Core Gateway Pin (Center) */}
          <View style={[styles.mapPin, styles.gatewayPin, { top: '46%', left: '46%' }]}>
            <MaterialCommunityIcons name="server-network" size={14} color="#FFFFFF" />
            <Text style={styles.pinLabel}>Core Gateway</Text>
          </View>

          {/* Access Point Pins */}
          {ports.map((p, idx) => {
            const isAlert = alerts.some((a) => a.portName === p.portName);
            const positions: Array<{ top: DimensionValue; left: DimensionValue }> = [
              { top: '22%', left: '72%' },
              { top: '68%', left: '26%' },
              { top: '30%', left: '20%' },
            ];
            const pos = positions[idx % positions.length];

            return (
              <TouchableOpacity
                key={p.portId}
                activeOpacity={0.8}
                onPress={() => setSelectedTarget(p)}
                style={[
                  styles.mapPin,
                  isAlert ? styles.alertPin : styles.apPin,
                  pos,
                ]}
              >
                <Ionicons
                  name={isAlert ? 'warning' : 'wifi'}
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={[styles.pinLabel, isAlert && { color: COLORS.rose }]}>
                  {p.portName}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Technician GPS Pins */}
          {technicians.map((t, idx) => {
            const techPositions: Array<{ top: DimensionValue; left: DimensionValue }> = [
              { top: '35%', left: '60%' },
              { top: '75%', left: '65%' },
              { top: '15%', left: '40%' },
            ];
            const pos = techPositions[idx % techPositions.length];

            return (
              <View
                key={t.id}
                style={[styles.mapPin, styles.techPin, pos]}
              >
                <FontAwesome5 name="motorcycle" size={10} color="#0B0F19" />
                <Text style={[styles.pinLabel, { color: COLORS.amberLight }]}>
                  {t.name.split(' ')[0]} ({t.distanceKm}km)
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Core Router</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.emerald }]} />
            <Text style={styles.legendText}>Online AP</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.rose }]} />
            <Text style={styles.legendText}>Disconnected AP</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.amber }]} />
            <Text style={styles.legendText}>Technician</Text>
          </View>
        </View>
      </Card>

      {/* Target Details Card & 1-Tap Google Maps Navigation */}
      {selectedTarget && (
        <Card style={styles.targetCard}>
          <View style={styles.targetHeader}>
            <View style={styles.targetTitleBox}>
              <Text style={styles.targetTitle}>
                {'apName' in selectedTarget ? selectedTarget.apName : 'Target Device'}
              </Text>
              <Text style={styles.targetLocation}>
                {selectedTarget.location}
              </Text>
            </View>

            <Badge
              label={'status' in selectedTarget ? selectedTarget.status.toUpperCase() : 'ALERT'}
              variant={'severity' in selectedTarget ? 'danger' : 'online'}
              size="sm"
            />
          </View>

          <View style={styles.coordRow}>
            <Ionicons name="location-sharp" size={14} color={COLORS.primaryLight} />
            <Text style={styles.coordText}>
              GPS Coordinates: {selectedTarget.latitude || -1.286389},{' '}
              {selectedTarget.longitude || 36.817223}
            </Text>
          </View>

          <View style={styles.targetActions}>
            <Button
              title="Navigate in Google / Apple Maps"
              variant="primary"
              onPress={() =>
                openExternalNavigation(
                  selectedTarget.latitude || -1.286389,
                  selectedTarget.longitude || 36.817223,
                  'apName' in selectedTarget ? selectedTarget.apName : 'AP Site'
                )
              }
              icon={<Ionicons name="navigate" size={16} color="#FFFFFF" />}
              style={styles.navBtn}
            />

            {'severity' in selectedTarget && (
              <Button
                title="Dispatch SMS"
                variant="danger"
                onPress={() => onDispatchTech(selectedTarget as EmergencyAlert)}
                icon={<Ionicons name="paper-plane" size={15} color="#FFFFFF" />}
                style={{ marginTop: SPACING.xs }}
              />
            )}
          </View>
        </Card>
      )}

      {/* Nearby Field Technicians List */}
      <Text style={styles.techSectionTitle}>FIELD RESPONDERS ON PATROL</Text>
      {technicians.map((tech) => (
        <Card key={tech.id} style={styles.techItemCard}>
          <View style={styles.techHeader}>
            <View style={styles.techInfoBlock}>
              <Text style={styles.techItemName}>{tech.name}</Text>
              <Text style={styles.techRoleText}>
                {tech.role} • {tech.phone}
              </Text>
            </View>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{tech.distanceKm} km</Text>
            </View>
          </View>

          <View style={styles.techFooter}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${tech.phone}`)}
              style={styles.techActionCall}
            >
              <Ionicons name="call" size={13} color={COLORS.emerald} />
              <Text style={styles.techActionCallText}>Call Tech</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                openExternalNavigation(tech.latitude, tech.longitude, tech.name)
              }
              style={styles.techActionNav}
            >
              <Ionicons name="navigate" size={13} color={COLORS.primaryLight} />
              <Text style={styles.techActionNavText}>Track GPS</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  mapCanvasCard: {
    padding: SPACING.md,
    backgroundColor: '#080C16',
    borderColor: COLORS.borderLight,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 6,
  },
  liveGpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
    marginRight: 4,
  },
  gpsText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.emerald,
  },
  visualGrid: {
    height: 220,
    backgroundColor: '#05070E',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  radarRingOuter: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  radarRingInner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  gatewayPin: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryLight,
    borderWidth: 1.5,
  },
  apPin: {
    backgroundColor: COLORS.emeraldDark,
    borderColor: COLORS.emeraldLight,
    borderWidth: 1.5,
  },
  alertPin: {
    backgroundColor: COLORS.roseDark,
    borderColor: COLORS.rose,
    borderWidth: 2,
  },
  techPin: {
    backgroundColor: COLORS.amber,
    borderColor: COLORS.amberLight,
    borderWidth: 1.5,
  },
  pinLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 3,
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  targetCard: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  targetTitleBox: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  targetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  targetLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  coordText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontFamily: 'Courier',
    marginLeft: 4,
  },
  targetActions: {
    marginTop: SPACING.xs,
  },
  navBtn: {
    backgroundColor: COLORS.primary,
  },
  techSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  techItemCard: {
    marginBottom: SPACING.xs,
    padding: SPACING.sm,
  },
  techHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techInfoBlock: {
    flex: 1,
  },
  techItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  techRoleText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  distanceBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.amber,
  },
  techFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  techActionCall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    marginRight: SPACING.sm,
  },
  techActionCallText: {
    fontSize: 11,
    color: COLORS.emerald,
    fontWeight: '700',
    marginLeft: 4,
  },
  techActionNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  techActionNavText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '700',
    marginLeft: 4,
  },
});
