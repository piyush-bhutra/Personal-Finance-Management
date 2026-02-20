/**
 * Utility function to export a JSON array to a CSV file.
 * Automatically handles null/undefined values and escapes commas/quotes.
 *
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Desired filename without .csv extension
 */
export const exportToCSV = (data, filename) => {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);

    // Build CSV string
    const csvContent = [
        // Header row
        headers.join(','),
        // Data rows
        ...data.map(row =>
            headers.map(header => {
                let cell = row[header];
                if (cell === null || cell === undefined) cell = '';
                // Convert to string and handle escaping for CSV
                cell = String(cell).replace(/"/g, '""');
                // Enclose in quotes if it contains commas, quotes, or newlines
                if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(',')
        )
    ].join('\n');

    // Create a Blob from the CSV string
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
