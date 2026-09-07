import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface QuickActionsProps {
  onGenerateVoucher: () => void;
  onRebootGateway: () => void;
  onSendSmsBlast: () => void;
  onOpenTopology: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onGenerateVoucher,
  onRebootGateway,
  onSendSmsBlast,
  onOpenTopology,
}) => {
  const actions = [
    {
      id: 'voucher',
      title: 'Issue Voucher',
      icon: <Ionicons name="ticket" size={22} color={COLORS.primaryLight} />,
      bgColor: 'rgba(99, 102, 241, 0.15)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      onPress: onGenerateVoucher,
    },
    {
      id: 'reboot',
      title: 'Quick Reboot',
      icon: <Ionicons name="reload" size={22} color={COLORS.amber} />,
      bgColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      onPress: onRebootGateway,
    },
    {
      id: 'sms',
      title: 'SMS Alert',
      icon: <Ionicons name="chatbubble-ellipses" size={22} color={COLORS.emerald} />,
      bgColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      onPress: onSendSmsBlast,
    },
    {
      id: 'topology',
      title: 'AP Topology',
      icon: <MaterialCommunityIcons name="sitemap" size={22} color={COLORS.violetLight} />,
      bgColor: 'rgba(139, 92, 246, 0.15)',
      borderColor: 'rgba(139, 92, 246, 0.3)',
      onPress: onOpenTopology,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
      <View style={styles.grid}>
        {actions.map((act) => (
          <TouchableOpacity
            key={act.id}
            activeOpacity={0.75}
            onPress={act.onPress}
            style={[
              styles.actionButton,
              { backgroundColor: act.bgColor, borderColor: act.borderColor },
            ]}
          >
            <View style={styles.iconWrapper}>{act.icon}</View>
            <Text style={styles.actionTitle}>{act.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    width: '23%',
    aspectRatio: 0.9,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
  },
  iconWrapper: {
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
});
