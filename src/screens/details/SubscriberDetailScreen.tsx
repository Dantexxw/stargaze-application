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
import { Subscriber } from '../../types/models';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatTimeAgo } from '../../utils/formatters';

type SubscriberDetailRouteProp = RouteProp<RootStackParamList, 'SubscriberDetail'>;

export const SubscriberDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SubscriberDetailRouteProp>();
  const subscriber = route.params?.subscriber;

  if (!subscriber) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No subscriber data passed.</Text>
      </SafeAreaView>
    );
  }

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Session',
      'Force disconnect PPPoE session for ' + subscriber.name + '?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => Alert.alert('Command Sent', 'Subscriber session cleared from FreeRADIUS & MikroTik.'),
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
        <Text style={styles.navTitle}>SUBSCRIBER DETAILS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={COLORS.primaryLight} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>{subscriber.name}</Text>
              <Text style={styles.accountNumber}>{subscriber.accountNumber}</Text>
            </View>
            <Badge
              label={subscriber.status.toUpperCase()}
              variant={subscriber.status === 'active' ? 'online' : 'danger'}
              size="sm"
            />
          </View>
        </Card>

        {/* Connection Specs */}
        <Text style={styles.sectionTitle}>SERVICE & CONNECTIVITY</Text>
        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan</Text>
            <Text style={styles.infoValue}>{subscriber.planName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Connection Type</Text>
            <Text style={styles.infoValue}>{subscriber.type.toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Speed Profile</Text>
            <Text style={[styles.infoValue, { color: COLORS.emerald }]}>
              {subscriber.bandwidthProfile}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>IP Address</Text>
            <Text style={styles.infoValue}>{subscriber.ipAddress || 'Dynamic (Radius)'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MAC Address</Text>
            <Text style={styles.infoValue}>{subscriber.macAddress || 'Assigned on Login'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expiry Date</Text>
            <Text style={styles.infoValue}>{subscriber.expiryDate ? formatTimeAgo(subscriber.expiryDate) : 'Never'}</Text>
          </View>
        </Card>

        {/* Contact Specs */}
        <Text style={styles.sectionTitle}>BILLING & CONTACT</Text>
        <Card style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{subscriber.phone || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Balance</Text>
            <Text style={[styles.infoValue, { color: subscriber.balance < 0 ? COLORS.rose : COLORS.text }]}>
              KES {subscriber.balance}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Data Used</Text>
            <Text style={styles.infoValue}>{subscriber.dataUsedGB} GB</Text>
          </View>
        </Card>

        {/* Actions */}
        <Button
          title="Disconnect Live Session"
          variant="danger"
          onPress={handleDisconnect}
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
  profileCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  accountNumber: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
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

export default SubscriberDetailScreen;
