export const formatLastSeen = (lastSeen: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(lastSeen).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Last seen ${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `Last seen ${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `Last seen ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}; 