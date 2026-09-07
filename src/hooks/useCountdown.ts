import { useState, useEffect } from 'react';
import { COLORS } from '../theme/Theme';

export interface UseCountdownProps {
  expiresAt?: string;
  initialRemainingSeconds?: number;
  totalDurationSeconds?: number;
  isActivePaid: boolean;
}

export interface CountdownResult {
  formattedTime: string;
  remainingSeconds: number;
  percentRemaining: number;
  isExpired: boolean;
  pulse: boolean;
  themeColor: {
    color: string;
    bgColor: string;
    borderColor: string;
  };
}

export const useCountdown = ({
  expiresAt,
  initialRemainingSeconds,
  totalDurationSeconds = 86400,
  isActivePaid,
}: UseCountdownProps): CountdownResult => {
  const calculateRemaining = (): number => {
    if (!isActivePaid) return 0;
    if (expiresAt) {
      const diffMs = new Date(expiresAt).getTime() - Date.now();
      return Math.max(Math.floor(diffMs / 1000), 0);
    }
    return initialRemainingSeconds || 0;
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemaining);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!isActivePaid) {
      setRemainingSeconds(0);
      return;
    }

    // Set initial
    setRemainingSeconds(calculateRemaining());

    // 1-second ticking interval
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (expiresAt) {
          const diffMs = new Date(expiresAt).getTime() - Date.now();
          return Math.max(Math.floor(diffMs / 1000), 0);
        }
        return Math.max(prev - 1, 0);
      });
      setPulse((p) => !p);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isActivePaid]);

  const isExpired = isActivePaid && remainingSeconds <= 0;

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime = `${hours.toString().padStart(2, '0')}h ${minutes
    .toString()
    .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

  const total = totalDurationSeconds || Math.max(remainingSeconds, 3600);
  const percentRemaining = isActivePaid
    ? Math.min(Math.max(Math.round((remainingSeconds / total) * 100), 1), 100)
    : 0;

  const getThemeColor = () => {
    if (percentRemaining > 50) {
      return {
        color: COLORS.emerald,
        bgColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
      };
    }
    if (percentRemaining >= 25) {
      return {
        color: COLORS.amber,
        bgColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
      };
    }
    return {
      color: COLORS.rose,
      bgColor: 'rgba(244, 63, 94, 0.2)',
      borderColor: 'rgba(244, 63, 94, 0.4)',
    };
  };

  return {
    formattedTime,
    remainingSeconds,
    percentRemaining,
    isExpired,
    pulse,
    themeColor: getThemeColor(),
  };
};

export default useCountdown;
