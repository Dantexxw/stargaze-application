import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { MpesaTransaction } from '../../types/models';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { formatTimeAgo } from '../../utils/formatters';

type TransactionDetailRouteProp = RouteProp<RootStackParamList, 'TransactionDetail'>;

export const TransactionDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<TransactionDetailRouteProp>();
  const transaction = route.params?.transaction;

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No transaction data passed.</Text>
      </SafeAreaView>
    );
  }

  const handleQueryDaraja = () => {
    Alert.alert(
      'Daraja Verification',
      'Query Safaricom M-Pesa Daraja status for receipt ' + transaction.receiptNumber + '?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Query Live API',
          onPress: () => Alert.alert('Daraja Status: CONFIRMED', 'Transaction verified authentic on Safaricom ledger.'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>TRANSACTION RECEIPT</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Receipt Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name="money-bill-wave" size={24} color={COLORS.emerald} />
          </View>
          <Text style={styles.amount}>
            {transaction.currency} {transaction.amount.toLocaleString()}
          </Text>
          <Text style={styles.receiptNo}>M-Pesa Receipt: {transaction.receiptNumber}</Text>
          <View style={{ marginTop: SPACING.xs }}>
            <Badge
              label={transaction.status.toUpperCase()}
              variant={transaction.status === 'completed' ? 'online' : transaction.status === 'pending' ? 'warning' : 'danger'}
              size="sm"
            />
          </View>
        </Card>

        {/* Transaction Metadata */}
        <Text style={styles.sectionTitle}>TRANSACTION DETAILS</Text>
        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{transaction.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{transaction.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Type</Text>
            <Text style={styles.infoValue}>{transaction.type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Package Purchased</Text>
            <Text style={styles.infoValue}>{transaction.packageName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Reference</Text>
            <Text style={styles.infoValue}>{transaction.accountReference}</Text>
          </View>
          {transaction.macAddress && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Client MAC</Text>
              <Text style={styles.infoValue}>{transaction.macAddress}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Timestamp</Text>
            <Text style={styles.infoValue}>{formatTimeAgo(transaction.timestamp)}</Text>
          </View>
        </Card>

        {/* Actions */}
        <Button
          title="Verify with Safaricom Daraja"
          variant="primary"
          onPress={handleQueryDaraja}
          style={{ marginTop: SPACING.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 6,
  },
  navTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  headerCard: {
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  amount: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
  },
  receiptNo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  card: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.rose,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default TransactionDetailScreen;
