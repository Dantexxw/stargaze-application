import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { SupportTicket, TicketStatus, TicketPriority } from '../../types/models';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatTimeAgo } from '../../utils/formatters';

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'ST-9481',
    title: 'Core Fiber Drop Cable Severed',
    description: 'Underground conduit near Ring Road feeder damaged by drainage trenching. 38 subscribers offline.',
    category: 'FIBER_CUT',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    customerName: 'Commercial Plaza Core',
    customerPhone: '+254 711 000 001',
    location: 'Westlands Sector 4',
    latitude: -1.267,
    longitude: 36.804,
    assignedTechnicianId: 'tech-1',
    assignedTechnicianName: 'Kelvin NOC Tech',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tkt-002',
    ticketNumber: 'ST-9482',
    title: 'Hotspot AP Intermittent Packet Loss',
    description: 'EAP225 Outdoor AP rebooting under heavy 5GHz client load. Ping jitter exceeding 180ms.',
    category: 'AP_OFFLINE',
    priority: 'HIGH',
    status: 'ASSIGNED',
    customerName: 'Bustani Gardens AP',
    customerPhone: '+254 722 555 123',
    location: 'East Wing Pole #12',
    latitude: -1.272,
    longitude: 36.812,
    assignedTechnicianId: 'tech-1',
    assignedTechnicianName: 'Kelvin NOC Tech',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tkt-003',
    ticketNumber: 'ST-9483',
    title: 'PPPoE Provisioning & ONU Optical Alignment',
    description: 'New fiber subscriber installation. Signal level currently -28.4 dBm, requires splice cleanup.',
    category: 'NEW_INSTALLATION',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    customerName: 'Heritage Heights Apt 4B',
    customerPhone: '+254 733 444 888',
    location: 'Parklands Avenue',
    latitude: -1.262,
    longitude: 36.818,
    assignedTechnicianId: 'tech-2',
    assignedTechnicianName: 'Field Team Alpha',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    resolutionNotes: 'Optical splice re-aligned, signal normalized to -19.2 dBm.',
  },
];

export const SupportTicketsScreen: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus>('ALL');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleUpdateStatus = (ticketId: string, currentStatus: TicketStatus) => {
    const nextStatus: TicketStatus =
      currentStatus === 'ASSIGNED'
        ? 'IN_PROGRESS'
        : currentStatus === 'IN_PROGRESS'
        ? 'RESOLVED'
        : 'CLOSED';

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus, updatedAt: new Date().toISOString() } : t))
    );
    Alert.alert('Status Updated', 'Ticket marked as ' + nextStatus.replace('_', ' ') + '.');
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.ticketNumber.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return COLORS.rose;
      case 'HIGH':
        return COLORS.amber;
      case 'MEDIUM':
        return COLORS.primaryLight;
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="SUPPORT & DISPATCH"
        subtitle="Field Work Orders, Fault Escalations & Customer CRM"
      />

      {/* Filter Tabs */}
      <View style={styles.filterStrip}>
        {(['ALL', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setStatusFilter(filter)}
            style={[styles.filterPill, statusFilter === filter && styles.filterPillActive]}
          >
            <Text
              style={[styles.filterText, statusFilter === filter && styles.filterTextActive]}
            >
              {filter === 'ALL' ? 'All Tickets' : filter.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={COLORS.textSecondary} />
        <TextInput
          placeholder="Search ticket #, subscriber or area..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryLight}
          />
        }
      >
        {filteredTickets.map((t) => (
          <Card key={t.id} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <View style={styles.ticketNumberBadge}>
                <Text style={styles.ticketNumberText}>{t.ticketNumber}</Text>
              </View>
              <View style={styles.badgesRow}>
                <View
                  style={[
                    styles.priorityPill,
                    { backgroundColor: 'rgba(244, 63, 94, 0.15)', borderColor: getPriorityColor(t.priority) },
                  ]}
                >
                  <Text style={[styles.priorityText, { color: getPriorityColor(t.priority) }]}>
                    {t.priority}
                  </Text>
                </View>
                <Badge
                  label={t.status.replace('_', ' ')}
                  variant={t.status === 'RESOLVED' ? 'online' : t.status === 'IN_PROGRESS' ? 'warning' : 'info'}
                  size="sm"
                />
              </View>
            </View>

            <Text style={styles.ticketTitle}>{t.title}</Text>
            <Text style={styles.ticketDescription}>{t.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={13} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{t.customerName}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="call-outline" size={13} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{t.customerPhone}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{t.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{formatTimeAgo(t.createdAt)}</Text>
              </View>
            </View>

            {t.resolutionNotes && (
              <View style={styles.resolutionBox}>
                <Ionicons name="checkmark-done" size={14} color={COLORS.emerald} />
                <Text style={styles.resolutionText}>{t.resolutionNotes}</Text>
              </View>
            )}

            <View style={styles.actionFooter}>
              <View style={styles.assignedBlock}>
                <MaterialCommunityIcons name="account-wrench" size={14} color={COLORS.primaryLight} />
                <Text style={styles.assignedName}>{t.assignedTechnicianName}</Text>
              </View>

              {t.status !== 'CLOSED' && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleUpdateStatus(t.id, t.status)}
                >
                  <Text style={styles.actionBtnText}>
                    {t.status === 'ASSIGNED' ? 'Start Dispatch' : t.status === 'IN_PROGRESS' ? 'Resolve' : 'Close'}
                  </Text>
                  <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterStrip: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.xs,
  },
  filterPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryLight,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.xs,
    marginLeft: SPACING.xs,
    color: COLORS.text,
    fontSize: 12,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  ticketCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ticketNumberBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  ticketNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  priorityPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  resolutionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  resolutionText: {
    fontSize: 11,
    color: COLORS.emerald,
    flex: 1,
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  assignedBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assignedName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default SupportTicketsScreen;
