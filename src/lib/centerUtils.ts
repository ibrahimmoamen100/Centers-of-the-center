/**
 * Helper utilities for center data display
 */

/**
 * Localize stage names from English to Arabic
 */
export const getStageLabel = (stage: string): string => {
    const stageLabels: Record<string, string> = {
        'preparatory': 'المرحلة الإعدادية',
        'secondary': 'المرحلة الثانوية',
        'المرحلة الإعدادية': 'المرحلة الإعدادية',
        'المرحلة الثانوية': 'المرحلة الثانوية',
    };
    return stageLabels[stage] || stage;
};

/**
 * Format location as: Governorate - Area - Address
 */
export const formatLocation = (governorate?: string, area?: string, address?: string): string => {
    const parts = [];

    if (governorate) parts.push(governorate);
    if (area) parts.push(area);
    if (address) parts.push(address);

    return parts.join(' - ') || 'غير محدد';
};

/**
 * Format working hours display with opening and closing times
 */
export const formatWorkingHoursDisplay = (
    openingTime?: string,
    closingTime?: string,
    fallbackText?: string
): string => {
    if (openingTime && closingTime) {
        return `من ${format12HourArabic(openingTime)} إلى ${format12HourArabic(closingTime)}`;
    }
    return fallbackText || 'غير محدد';
};

/**
 * Convert 24-hour time string to 12-hour Arabic format
 * Example: "14:30" => "2:30 عصراً", "09:00" => "9 صباحاً"
 */
export function format12HourArabic(time24: string): string {
    if (!time24 || !time24.includes(':')) return time24;

    const [hourStr, minuteStr] = time24.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    if (isNaN(hour) || isNaN(minute)) return time24;

    let period = '';
    let hour12 = hour;

    if (hour === 0) {
        hour12 = 12;
        period = 'منتصف الليل';
    } else if (hour < 12) {
        period = 'صباحاً';
    } else if (hour === 12) {
        period = 'ظهراً';
    } else {
        hour12 = hour - 12;
        if (hour < 17) {
            period = 'عصراً';
        } else {
            period = 'مساءً';
        }
    }

    // Format: "2:30 عصراً" or "9 صباحاً" (omit :00 for cleaner look)
    if (minute === 0) {
        return `${hour12} ${period}`;
    }

    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
}
