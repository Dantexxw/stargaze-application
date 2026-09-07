export function formatCurrency(amount: number, currency: string = 'KES'): string {
  if (currency === 'KES') {
    return `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatBandwidth(mbps: number): string {
  if (mbps >= 1000) {
    return `${(mbps / 1000).toFixed(2)} Gbps`;
  }
  return `${mbps.toFixed(1)} Mbps`;
}

export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

/**
 * Validates and formats phone numbers to international Kenyan format (+254 7XX XXX XXX)
 */
export function formatKenyaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) {
    return `+254 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `+254 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
  }
  if (digits.length === 9) {
    return `+254 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }
  return phone;
}

export function validateKenyaPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return (
    (digits.startsWith('254') && digits.length === 12) ||
    (digits.startsWith('0') && digits.length === 10) ||
    (digits.length === 9 && ['7', '1'].includes(digits[0]))
  );
}
