import ExcelJS from 'exceljs';

import type { PourRecord, TruckingTicketRecord } from '../records';

const XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

type TicketWorkbookExport = {
  buffer: Buffer;
  contentType: string;
  filename: string;
};

export async function buildTicketsWorkbook(
  pour: PourRecord,
  tickets: TruckingTicketRecord[]
): Promise<TicketWorkbookExport> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TracPour';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('Tickets', {
    views: [{ state: 'frozen', ySplit: 8 }],
  });

  worksheet.columns = [
    { key: 'ticketNumber', width: 18 },
    { key: 'truckLabel', width: 16 },
    { key: 'deliveredAt', width: 22 },
    { key: 'yardage', width: 12 },
    { key: 'status', width: 14 },
    { key: 'downloadUrl', width: 28 },
    { key: 'createdAt', width: 22 },
  ];

  addMetadataRows(worksheet, pour);
  addTicketRows(worksheet, tickets);

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(buffer),
    contentType: XLSX_CONTENT_TYPE,
    filename: `${sanitizeFilename(pour.name)}-tickets.xlsx`,
  };
}

function addMetadataRows(worksheet: ExcelJS.Worksheet, pour: PourRecord) {
  worksheet.addRow(['Pour', pour.name]);
  worksheet.addRow(['Pour ID', pour.id]);
  worksheet.addRow(['Started At', formatDateForCell(pour.started_at)]);
  worksheet.addRow(['Expected Yardage', pour.expected_yardage]);
  worksheet.addRow(['Supplier', pour.supplier_name ?? '']);
  worksheet.addRow(['Supplier Order', pour.supplier_order_number ?? '']);
  worksheet.addRow([]);

  for (let rowNumber = 1; rowNumber <= 6; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    row.getCell(1).font = { bold: true };
    row.getCell(1).alignment = { horizontal: 'right' };
  }
}

function addTicketRows(worksheet: ExcelJS.Worksheet, tickets: TruckingTicketRecord[]) {
  const headerRow = worksheet.addRow([
    'Ticket #',
    'Truck',
    'Delivered At',
    'Yardage',
    'Status',
    'Download',
    'Created At',
  ]);

  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7EEF8' },
    };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF9AA8BA' } },
    };
  });

  tickets.forEach((ticket) => {
    const row = worksheet.addRow({
      ticketNumber: ticket.ticket_number ?? '',
      truckLabel: ticket.truck_label ?? '',
      deliveredAt: formatDateForCell(ticket.delivered_at),
      yardage: ticket.yardage ?? '',
      status: ticket.status,
      downloadUrl: ticket.download_url
        ? {
            text: 'Open ticket',
            hyperlink: ticket.download_url,
          }
        : '',
      createdAt: formatDateForCell(ticket.created_at),
    });

    row.getCell('deliveredAt').numFmt = 'm/d/yyyy h:mm AM/PM';
    row.getCell('createdAt').numFmt = 'm/d/yyyy h:mm AM/PM';
    row.getCell('yardage').numFmt = '0.00';

    if (ticket.download_url) {
      row.getCell('downloadUrl').font = {
        color: { argb: 'FF1D4ED8' },
        underline: true,
      };
    }
  });
}

function formatDateForCell(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date;
}

function sanitizeFilename(value: string) {
  const sanitized = value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return sanitized || 'pour';
}
