// Indian Currency (INR) Utility Functions

/**
 * Format amount in Indian Rupees with proper formatting
 * Example: 100000 -> ₹1,00,000
 */
export const formatINR = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  // Convert to Indian number format (lakhs, crores)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return formatter.format(amount);
};

/**
 * Format amount with fixed decimal places
 * Example: 1000.5 -> ₹1,000.50
 */
export const formatINRFixed = (amount: number, decimals: number = 2): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `₹${(0).toFixed(decimals)}`;
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return formatter.format(amount);
};

/**
 * Format amount in words (Indian style)
 * Example: 125000 -> "One Lakh Twenty Five Thousand"
 */
export const amountInWords = (amount: number): string => {
  if (isNaN(amount) || amount === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    }
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
  };

  const convert = (n: number): string => {
    if (n === 0) return 'Zero';

    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;

    let result = '';

    if (crore > 0) {
      result += convertLessThanOneThousand(crore) + ' Crore';
    }
    if (lakh > 0) {
      result += (result ? ' ' : '') + convertLessThanOneThousand(lakh) + ' Lakh';
    }
    if (thousand > 0) {
      result += (result ? ' ' : '') + convertLessThanOneThousand(thousand) + ' Thousand';
    }
    if (remainder > 0) {
      result += (result ? ' ' : '') + convertLessThanOneThousand(remainder);
    }

    return result;
  };

  return convert(Math.floor(amount)) + ' Rupees' + (amount % 1 !== 0 ? ' and ' + Math.round((amount % 1) * 100) + ' Paise' : '');
};

/**
 * Convert amount to paise (for Razorpay)
 * Razorpay expects amount in paise (₹1 = 100 paise)
 */
export const toPaise = (amountInRupees: number): number => {
  return Math.round(amountInRupees * 100);
};

/**
 * Convert paise to rupees
 */
export const toRupees = (amountInPaise: number): number => {
  return amountInPaise / 100;
};

/**
 * Calculate platform fee (25% default)
 */
export const calculatePlatformFee = (amount: number, percentage: number = 25): number => {
  return Math.round(amount * (percentage / 100));
};

/**
 * Calculate friend earnings (75% default)
 */
export const calculateFriendEarnings = (amount: number, percentage: number = 75): number => {
  return Math.round(amount * (percentage / 100));
};

/**
 * Calculate total amount with platform fee
 */
export const calculateTotalAmount = (hourlyRate: number, hours: number, platformFeePercent: number = 25): {
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  friendEarnings: number;
} => {
  const subtotal = hourlyRate * hours;
  const platformFee = calculatePlatformFee(subtotal, platformFeePercent);
  const totalAmount = subtotal + platformFee;
  const friendEarnings = calculateFriendEarnings(subtotal, 100 - platformFeePercent);

  return {
    subtotal,
    platformFee,
    totalAmount,
    friendEarnings
  };
};

/**
 * Get hourly rate range for display
 */
export const getHourlyRateRange = (): { min: number; max: number } => {
  return { min: 500, max: 5000 };
};

/**
 * Format hourly rate display
 */
export const formatHourlyRate = (rate: number): string => {
  return `₹${rate}/hr`;
};

/**
 * Currency configuration for India
 */
export const currencyConfig = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee',
  locale: 'en-IN',
  // Razorpay specific
  razorpay: {
    currency: 'INR',
    name: 'SnapCofriend India',
    description: 'Companion Booking Payment',
    themeColor: '#F97316'
  }
};

export default {
  formatINR,
  formatINRFixed,
  amountInWords,
  toPaise,
  toRupees,
  calculatePlatformFee,
  calculateFriendEarnings,
  calculateTotalAmount,
  getHourlyRateRange,
  formatHourlyRate,
  currencyConfig
};
