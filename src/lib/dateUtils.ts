/**
 * Date formatting utilities for Arabic (Egyptian) locale
 */

/**
 * Format date to Arabic format with time in 12-hour system
 * Example: "17 فبراير 2026 – 8:38 مساءً"
 */
export function formatArabicDateTime(dateString: string | undefined): string {
    if (!dateString) return '-';

    const date = new Date(dateString);

    // Format date part
    const datePart = date.toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Format time part in 12-hour format
    const timePart = date.toLocaleTimeString('ar-EG', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    return `${datePart} – ${timePart}`;
}

/**
 * Format date only (without time)
 * Example: "17 فبراير 2026"
 */
export function formatArabicDate(dateString: string | undefined): string {
    if (!dateString) return '-';

    const date = new Date(dateString);

    return date.toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Format time only in 12-hour format
 * Example: "8:38 مساءً"
 */
export function formatArabicTime(dateString: string | undefined): string {
    if (!dateString) return '-';

    const date = new Date(dateString);

    return date.toLocaleTimeString('ar-EG', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Format day name in Arabic
 * Example: "الخميس"
 */
export function getArabicDayName(date: Date): string {
    return date.toLocaleDateString('ar-EG', { weekday: 'long' });
}

/**
 * Format month name in Arabic
 * Example: "فبراير"
 */
export function getArabicMonthName(date: Date): string {
    return date.toLocaleDateString('ar-EG', { month: 'long' });
}

/**
 * Get short day names for calendar headers
 * Returns: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
 */
export function getArabicDayNames(): string[] {
    const days = [];
    const baseDate = new Date(2026, 0, 4); // Saturday, Jan 4, 2026

    for (let i = 0; i < 7; i++) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + i);
        days.push(date.toLocaleDateString('ar-EG', { weekday: 'long' }));
    }

    return days;
}

/**
 * Format time range in Arabic
 * Example: "2 ظهرًا - 4 عصرًا"
 */
export function formatArabicTimeRange(startDate: string | undefined, endDate: string | undefined): string {
    if (!startDate || !endDate) return '-';

    const start = formatArabicTime(startDate);
    const end = formatArabicTime(endDate);

    return `${start} - ${end}`;
}

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

/**
 * Get hour label for calendar header in 12-hour Arabic format
 * Example: 14 => "2 عصراً"
 */
export function getHourLabel12Arabic(hour: number): string {
    const time24 = `${hour.toString().padStart(2, '0')}:00`;
    return format12HourArabic(time24);
}
