import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useCountdown } from '../../hooks/useCountdown';

interface LiveCountdownClockProps {
  expiresAt?: string;
  totalDurationSeconds?: number;
  initialRemainingSeconds?: number;
  isActivePaid: boolean;
}

export const LiveCountdownClock: React.FC<LiveCountdownClockProps> = ({
  expiresAt,
  totalDurationSeconds = 86400,
  initialRemainingSeconds,
  isActivePaid,
}) => {
  const {
    formattedTime,
    percentRemaining,
    isExpired,
    pulse,
    themeColor,
  } = useCountdown({
    expiresAt,
    initialRemainingSeconds,
    totalDurationSeconds,
    isActivePaid,
  });

  if (!isActivePaid) {
    return (
      <View style={styles.unpaidContainer}>
        <View style={styles.unpaidDot} />
        <Text style={styles.unpaidText}>Pending Captive Login</Text>
      </View>
    );
  }

  if (isExpired) {
    return (
      <View style={styles.expiredContainer}>
        <Ionicons name="time-outline" size={13} color={COLORS.rose} />
        <Text style={styles.expiredText}>Session Expired</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ticking Time Header */}
      <View style={styles.timerHeader}>
        <View
          style={[
            styles.timerBadge,
            {
              backgroundColor: themeColor.bgColor,
              borderColor: themeColor.borderColor,
            },
          ]}
        >
          <View
            style={[
              styles.pulsingIndicator,
              {
                backgroundColor: themeColor.color,
                opacity: pulse ? 1 : 0.45,
              },
            ]}
          />
          <Text style={[styles.timerText, { color: themeColor.color }]}>
            ⌛ {formattedTime} left
          </Text>
        </View>

        <Text style={[styles.percentText, { color: themeColor.color }]}>
          {percentRemaining}%
        </Text>
      </View>

      {/* Dynamic Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentRemaining}%`,
              backgroundColor: themeColor.color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 4,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  pulsingIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Courier',
    letterSpacing: 0.3,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 5,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  unpaidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  unpaidDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    marginRight: 6,
  },
  unpaidText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  expiredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  expiredText: {
    fontSize: 11,
    color: COLORS.rose,
    fontWeight: '700',
    marginLeft: 4,
  },
});

export default LiveCountdownClock;
