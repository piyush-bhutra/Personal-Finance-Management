/** Return the first day of a month given any date */
const startOfMonth = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
};

/** Return an array of month-start dates from startDate up to (and including) today */
const monthsBetween = (startDate, endDate) => {
    const months = [];
    const start = startOfMonth(startDate);
    const end = startOfMonth(endDate);
    const cursor = new Date(start);
    while (cursor <= end) {
        months.push(new Date(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
};

/**
 * Compute the current value of an entry using compound monthly growth.
 * rate: annual % (e.g. 12 = 12%/year → 1% per month)
 * ageMonths: how many complete months since the entry date
 */
const compoundValue = (principal, annualRatePct, ageMonths) => {
    if (!annualRatePct || annualRatePct <= 0) return principal;
    const monthlyRate = annualRatePct / 100 / 12;
    return principal * Math.pow(1 + monthlyRate, ageMonths);
};

module.exports = {
    startOfMonth,
    monthsBetween,
    compoundValue
};
