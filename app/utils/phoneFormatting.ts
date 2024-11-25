// app/utils/phoneFormatting.ts

export function formatPhoneNumber(phoneNumber: string | number | undefined | null, country: string): string {
    // Handle null/undefined
    if (!phoneNumber) {
      return '';
    }
  
    // Convert to string if it's a number
    const phoneStr = String(phoneNumber);
  
    // Remove all non-digit characters
    const digits = phoneStr.replace(/\D/g, '');
  
    // Common country codes
    const COUNTRY_CODES: { [key: string]: string } = {
      'India': '91',
      'United Kingdom': '44',
      'United States': '1',
      'China': '86',
      'Japan': '81',
      'Australia': '61',
      'Germany': '49',
      'France': '33',
      'Canada': '1',
    };
  
    const countryCode = COUNTRY_CODES[country] || '1';
    console.log('Country:', country, 'Code:', countryCode); // Debug log
  
    // If already has plus sign, return as is
    if (phoneStr.startsWith('+')) {
      return phoneStr;
    }
  
    // If starts with 00, replace with +
    if (digits.startsWith('00')) {
      return '+' + digits.substring(2);
    }
  
    // If starts with 0, remove it and add country code
    if (digits.startsWith('0')) {
      return '+' + countryCode + digits.substring(1);
    }
  
    // If no leading 0, just add country code
    return '+' + countryCode + digits;
  }
  
  export function validatePhoneNumber(phoneNumber: string | number | undefined | null): boolean {
    if (!phoneNumber) {
      return false;
    }
    
    const phoneStr = String(phoneNumber);
    const digits = phoneStr.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }