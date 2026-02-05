import * as XLSX from 'xlsx';

export function monitoringReport(data, fileName = 'monitoring.xlsx') {
  if (!Array.isArray(data) || data.length === 0) return;
  const formattedData = data.map((row) => ({
    'Case ID': row.caseId,
    'Case Number': row.caseNumber,
    'Owner Name': row.ownerName,
    Origin: row.origin,
    'Supplier Segment': row.supplierSegment,
    Type: row.type,
    'Full Name': row.fullName,
    'Phone Number': row.phoneNumber,
    Email: row.email,
    Substatus: row.substatus,
    Agent: row?.assignedAgent?.fullname ?? 'Unassigned',
    'Agent Group': row.assignedAgent?.call_center ?? 'Unassigned',
    'Attempts Today': row.attempts1,
    'Attempts Yesterday': row.attempts2,
    'Attempts 2 Days Ago': row.attempts3,
    'Total Attempts': row.totalAttempts,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Monitoring');

  XLSX.writeFile(workbook, fileName);
}
