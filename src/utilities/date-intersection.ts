export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export const checkDateIntersection = (date1: DateRange, date2: DateRange) => {
    if (
        (date1.startDate <= date2.endDate && date1.endDate >= date2.startDate) ||
        (date2.startDate <= date1.endDate && date2.endDate >= date1.startDate)
    ) {
        return true;
    }
    
    return false;
}