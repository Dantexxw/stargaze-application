import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { MpesaTransaction } from '../../types/models';
import { formatCurrency, formatTimeAgo } from '../../utils/formatters';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface LiveMpesaTransactionRowProps {
  transaction: MpesaTransaction;
  onPress?: () => void;
  onGrantBonusPress?: (macAddress?: string, phone?: string) => void;
}

export const LiveMpesaTransactionRow: React.FC<LiveMpesaTransactionRowProps> = ({
  transaction,
  onPress,
  onGrantBonusPress,
}) => {
  const isSuccess = transaction.status === 'completed';
  const isPending = transaction.status === 'pending';

  const handleRowPress = () => {
    if (onPress) {
      onPress();
      return;
    }
    Alert.alert(
      `M-Pesa Receipt: ${transaction.receiptNumber}`,
      `Customer: ${transaction.customerName}\nPhone: ${transaction.phoneNumber}\nAmount: ${formatCurrency(
        transaction.amount,
        transaction.currency
      )}\nPlan: ${transaction.packageName}\nMAC: ${
        transaction.macAddress || 'N/A'
      }\nStatus: ${transaction.status.toUpperCase()}\nReference: ${
        transaction.accountReference
      }`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Grant Bonus Time to MAC',
          onPress: () =>
            onGrantBonusPress &&
            onGrantBonusPress(transaction.macAddress, transaction.phoneNumber),
        },
      ]
    );
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handleRowPress}>
      <Card style={styles.card}>
        {/* Header: Phone & Receipt Code vs Amount & Status */}
        <View style={styles.header}>
          <View style={styles.leftBlock}>
            <View style={styles.receiptCodeRow}>
              <View style={styles.mpesaIconSmall}>
                <FontAwesome5 name="mobile-alt" size={12} color={COLORS.emerald} />
              </View>
              <Text style={styles.receiptCode}>{transaction.receiptNumber}</Text>
              <Text style={styles.phoneText}>• {transaction.phoneNumber}</Text>
            </View>
            <Text style={styles.customerName}>{transaction.customerName}</Text>
          </View>

          <View style={styles.rightBlock}>
            <Text
              style={[
                styles.amountText,
                { color: isSuccess ? COLORS.emerald : isPending ? COLORS.amber : COLORS.rose },
              ]}
            >
              {formatCurrency(transaction.amount, transaction.currency)}
            </Text>
            <Badge
              label={transaction.status.toUpperCase()}
              variant={isSuccess ? 'online' : isPending ? 'warning' : 'danger'}
              size="sm"
            />
          </View>
        </View>

        {/* Plan Purchased & MAC Address details */}
        <View style={styles.detailRow}>
          <View style={styles.planBadge}>
            <Ionicons name="flash" size={11} color={COLORS.amber} />
            <Text style={styles.planText}>{transaction.packageName}</Text>
          </View>

          {transaction.macAddress && (
            <View style={styles.macBadge}>
              <Ionicons name="hardware-chip-outline" size={11} color={COLORS.cyan} />
              <Text style={styles.macText}>{transaction.macAddress}</Text>
            </View>
          )}
        </View>

        {/* Footer: Timestamp & Account Reference */}
        <View style={styles.footer}>
          <Text style={styles.refText}>Ref: {transaction.accountReference}</Text>
          <View style={styles.timeBlock}>
            <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.timeText}>{formatTimeAgo(transaction.timestamp)}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    marginVertical: 4,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  leftBlock: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  receiptCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  mpesaIconSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  receiptCode: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
    fontFamily: 'Courier',
    letterSpacing: 0.5,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginLeft: 4,
  },
  customerName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rightBlock: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  planText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.amberLight,
    marginLeft: 3,
  },
  macBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.25)',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  macText: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: COLORS.cyan,
    marginLeft: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  refText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 3,
  },
});
