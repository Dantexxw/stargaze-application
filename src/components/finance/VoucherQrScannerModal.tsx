import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { COLORS, SPACING, RADIUS } from '../../theme/Theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface VoucherQrScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onRedeemVoucher?: (code: string) => Promise<void>;
}

export const VoucherQrScannerModal: React.FC<VoucherQrScannerModalProps> = ({
  visible,
  onClose,
  onRedeemVoucher,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [targetMac, setTargetMac] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleRedeemVoucher = async (scannedCode: string) => {
    if (!scannedCode.trim()) {
      Alert.alert('Missing Code', 'Please enter a valid voucher code.');
      return;
    }
    setProcessing(true);

    try {
      if (onRedeemVoucher) {
        await onRedeemVoucher(scannedCode.trim());
      }
      Alert.alert(
        '✅ Voucher Authorized',
        `Voucher ${scannedCode.trim()} has been successfully authorized.`
      );
      setManualCode('');
      onClose();
    } catch {
      Alert.alert('Redemption Failed', 'Invalid or already consumed voucher code.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Card variant="glow" glowColor={COLORS.primaryGlow} style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconBox}>
                <Ionicons name="qr-code" size={20} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.title}>Scan QR Voucher Card</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Point your camera at the physical scratch voucher or enter the code manually to bind internet time.
          </Text>

          {/* Camera Viewfinder Frame */}
          <View style={styles.cameraFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            <View style={styles.centerScanner}>
              <Ionicons name="scan-outline" size={64} color="rgba(99, 102, 241, 0.4)" />
              <Text style={styles.scanHint}>Align QR code inside the viewfinder</Text>
            </View>
          </View>

          {/* Manual Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Enter Printed Voucher Code</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="keypad-outline" size={18} color={COLORS.textSecondary} />
              <TextInput
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="STAR-XXXX-XXXX"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                style={[styles.input, styles.monoInput]}
              />
            </View>
          </View>

          {/* Submit Action */}
          <Button
            title="Redeem Voucher"
            variant="primary"
            onPress={() => handleRedeemVoucher(manualCode)}
            loading={processing}
            disabled={!manualCode.trim()}
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  cameraFrame: {
    height: 180,
    backgroundColor: 'rgba(11, 15, 25, 0.9)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: SPACING.md,
  },
  cornerTL: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  cornerTR: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  centerScanner: {
    alignItems: 'center',
  },
  scanHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: SPACING.xs,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    marginLeft: SPACING.sm,
  },
  monoInput: {
    fontFamily: 'Courier',
    fontWeight: '700',
  },
});

export default VoucherQrScannerModal;
