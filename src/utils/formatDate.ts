export const formatDate = (date: Date) => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    const h = date.getHours();
    const min = date.getMinutes();
    return `${(d < 10 ? '0' : '')}${d}/${(m < 10 ? '0' : '')}${m}/${y} ${(h < 10 ? '0' : '')}${h}:${(min < 10 ? '0' : '')}${min}`;
};


