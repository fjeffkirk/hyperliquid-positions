// Utility functions

export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function formatNumber(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatUSD(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return `$${num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function getColorClass(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return 'text-white';
  return value > 0 ? 'text-green-400' : 'text-red-400';
}

// URL hash management
export function getAddressFromHash(): string | null {
  const hash = window.location.hash;
  const match = hash.match(/#addr=([^&]+)/);
  return match ? match[1] : null;
}

export function setAddressInHash(address: string): void {
  window.location.hash = `addr=${address}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

