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
import { FiberPowerReading } from '../../types/models';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface FiberPowerDiagnosticModalProps {
  visible: boolean;
  onClose: () => void;
  subscriberName?: string;
  accountNumber?: string;
}

export const FiberPowerDiagnosticModal: React.FC<FiberPowerDiagnosticModalProps> = ({
  visible,
  onClose,
  subscriberName = 'Brian Omondi (Apex Heights, Apt 4B)',
  accountNumber = 'PPPOE-BO-092',
}) => {
  const [reading, setReading] = useState<FiberPowerReading>({
    onuId: 'ONU-GPON-0492',
    customerName: subscriberName,
    accountNumber,
    oltName: 'HUAWEI-MA5800-CORE-01',
    ponPort: 'gpon-olt 0/1/4:12',
    rxOpticalPowerDbm: -19.4,
    txOpticalPowerDbm: 2.3,
    laserBiasCurrentMa: 14.2,
    temperatureCelsius: 38.5,
    voltageVolts: 3.28,
    status: 'HEALTHY',
    distanceMeters: 412,
  });

  const getPowerColor = (rx: number) => {
    if (rx >= -24 && rx <= -14) return COLORS.emerald; // Optimal (-15 to -24 dBm)
    if (rx > -27 && rx < -24) return COLORS.amber;    // Marginal
    return COLORS.rose;                               // Bent fiber / LOS (< -27 dBm)
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card variant="glow" glowColor={COLORS.primaryGlow} style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconBox}>
                <Ionicons name="flash-outline" size={20} color={COLORS.emerald} />
              </View>
              <View>
                <Text style={styles.title}>GPON / ONU Optical Power Monitor</Text>
                <Text style={styles.targetSub}>{accountNumber} • {reading.ponPort}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            {/* Primary Optical RX Power Card */}
            <View style={styles.powerCard}>
              <View style={styles.powerCardHeader}>
                <Text style={styles.powerCardLabel}>RX OPTICAL POWER (DOWNLINK)</Text>
                <Badge label={reading.status} variant="online" size="sm" />
              </View>

              <View style={styles.powerValueRow}>
                <Text style={[styles.powerValue, { color: getPowerColor(reading.rxOpticalPowerDbm) }]}>
                  {reading.rxOpticalPowerDbm} dBm
                </Text>
                <Text style={styles.powerRange}>Target: -15.0 to -24.0 dBm</Text>
              </View>

              {/* Graphical Scale */}
              <View style={styles.scaleBarTrack}>
                <View
                  style={[
                    styles.scaleBarFill,
                    {
                      width: '75%',
                      backgroundColor: getPowerColor(reading.rxOpticalPowerDbm),
                    },
                  ]}
                />
              </View>
            </View>

            {/* ONU Optical Laser Telemetry Grid */}
            <View style={styles.specsGrid}>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>TX Optical Power</Text>
                <Text style={styles.specVal}>+{reading.txOpticalPowerDbm} dBm</Text>
              </View>

              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Fiber Distance</Text>
                <Text style={styles.specVal}>{reading.distanceMeters} meters</Text>
              </View>

              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Laser Bias Current</Text>
                <Text style={styles.specVal}>{reading.laserBiasCurrentMa} mA</Text>
              </View>

              <View style={styles.specBox}>
                <Text style={styles.specLabel}>ONU Temperature</Text>
                <Text style={styles.specVal}>{reading.temperatureCelsius} °C</Text>
              </View>

              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Supply Voltage</Text>
                <Text style={styles.specVal}>{reading.voltageVolts} V</Text>
              </View>

              <View style={styles.specBox}>
                <Text style={styles.specLabel}>OLT Core Switch</Text>
                <Text style={[styles.specVal, { fontSize: 11 }]} numberOfLines={1}>
                  {reading.oltName}
                </Text>
              </View>
            </View>

            {/* Diagnostic Interpretation */}
            <View style={styles.diagBox}>
              <View style={styles.diagHeader}>
                <Ionicons name="checkmark-done-circle" size={16} color={COLORS.emerald} />
                <Text style={styles.diagTitle}>Optical Link Health: Optimal</Text>
              </View>
              <Text style={styles.diagText}>
                The drop cable insertion loss is within standard ITU-T G.984 GPON tolerances. No fiber macro-bends or splice reflections detected.
              </Text>
            </View>
          </ScrollView>

          <View style={{ marginTop: SPACING.md }}>
            <Button title="Close Diagnostics" variant="secondary" onPress={onClose} />
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
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
  powerCard: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  powerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  powerCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  powerValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginVertical: SPACING.sm,
  },
  powerValue: {
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'Courier',
  },
  powerRange: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  scaleBarTrack: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  scaleBarFill: {
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
  diagBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  diagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  diagTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.emerald,
    marginLeft: 4,
  },
  diagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});

export default FiberPowerDiagnosticModal;
