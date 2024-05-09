export function countDays(startDate: Date, endDate: Date) {
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();

    const differenceMs = endMs - startMs;

    const daysDifference = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

    return daysDifference;
}