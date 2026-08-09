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
