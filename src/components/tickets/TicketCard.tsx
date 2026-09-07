import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { COLORS, SPACING, RADIUS } from '../../theme/Theme';
import { SupportTicket } from '../../types/models';
import { formatTimeAgo } from '../../utils/formatters';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface TicketCardProps {
  ticket: SupportTicket;
  onSelect: (ticket: SupportTicket) => void;
  onCallCustomer?: (phone: string) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onSelect,
  onCallCustomer,
}) => {
  const getPriorityBadge = () => {
    switch (ticket.priority) {
      case 'CRITICAL':
        return <Badge label="CRITICAL" variant="danger" size="sm" />;
      case 'HIGH':
        return <Badge label="HIGH" variant="warning" size="sm" />;
      case 'MEDIUM':
        return <Badge label="MEDIUM" variant="neutral" size="sm" />;
      default:
        return <Badge label="LOW" variant="neutral" size="sm" />;
    }
  };

  const getStatusColor = () => {
    switch (ticket.status) {
      case 'ASSIGNED':
        return COLORS.amber;
      case 'EN_ROUTE':
        return COLORS.cyan;
      case 'IN_PROGRESS':
        return COLORS.primaryLight;
      case 'RESOLVED':
      case 'CLOSED':
        return COLORS.emerald;
      default:
        return COLORS.textMuted;
    }
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => onSelect(ticket)}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.ticketNumRow}>
            <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
            {getPriorityBadge()}
          </View>
          <View style={[styles.statusBadge, { borderColor: getStatusColor() }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {ticket.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Title & Description */}
        <Text style={styles.title}>{ticket.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {ticket.description}
        </Text>

        {/* Customer & Location Details */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{ticket.customerName}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={12} color={COLORS.rose} />
            <Text style={styles.infoText} numberOfLines={1}>{ticket.location}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.timeText}>Created {formatTimeAgo(ticket.createdAt)}</Text>

          <View style={styles.actionRow}>
            {onCallCustomer && (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => onCallCustomer(ticket.customerPhone)}
              >
                <Ionicons name="call" size={12} color={COLORS.emerald} />
                <Text style={styles.callBtnText}>Call Customer</Text>
              </TouchableOpacity>
            )}

            <View style={styles.viewBtn}>
              <Text style={styles.viewBtnText}>Work Order</Text>
              <Ionicons name="chevron-forward" size={12} color={COLORS.primaryLight} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryLight,
    fontFamily: 'Courier',
    marginRight: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  infoText: {
    fontSize: 11,
    color: COLORS.text,
    marginLeft: 4,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginRight: 8,
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emerald,
    marginLeft: 4,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginRight: 2,
  },
});

export default TicketCard;
