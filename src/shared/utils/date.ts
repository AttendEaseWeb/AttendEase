export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  try {
    if (timeString.includes(':')) {
      const [h, m] = timeString.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
    }
    return timeString;
  } catch {
    return timeString;
  }
}

export function formatDateTime(dateTimeString: string): string {
  try {
    const d = new Date(dateTimeString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateTimeString;
  }
}

export function isTimePast(timeIsoString: string): boolean {
  return new Date(timeIsoString).getTime() < Date.now();
}
