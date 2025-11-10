// Utility for managing saved addresses in localStorage

const STORAGE_KEY = 'hyperliquid_saved_addresses';

export interface SavedAddress {
  address: string;
  addedAt: number;
}

// Get all saved addresses
export function getSavedAddresses(): SavedAddress[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as SavedAddress[];
  } catch (error) {
    console.error('Error reading saved addresses:', error);
    return [];
  }
}

// Add a new address (avoid duplicates)
export function addSavedAddress(address: string): SavedAddress[] {
  const saved = getSavedAddresses();
  
  // Check if address already exists
  const exists = saved.some((item) => item.address.toLowerCase() === address.toLowerCase());
  if (exists) {
    // Move to front if already exists
    const filtered = saved.filter((item) => item.address.toLowerCase() !== address.toLowerCase());
    const updated = [{ address, addedAt: Date.now() }, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
  
  // Add new address to the front
  const updated = [{ address, addedAt: Date.now() }, ...saved];
  
  // Keep only the last 10 addresses
  const trimmed = updated.slice(0, 10);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return trimmed;
}

// Remove an address
export function removeSavedAddress(address: string): SavedAddress[] {
  const saved = getSavedAddresses();
  const updated = saved.filter((item) => item.address.toLowerCase() !== address.toLowerCase());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

// Clear all saved addresses
export function clearSavedAddresses(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Truncate address for display
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

