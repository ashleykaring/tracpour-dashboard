import type { SupplierOrder } from '../domain';
import type { PourRecord } from '../records';

export function getSupplierOrderForPour(pour: PourRecord): SupplierOrder | null {
  if (!pour.supplier_order_number) {
    return null;
  }

  // TODO: Replace this mock with a backend supplier integration. The real service should use
  // supplier_order_number plus stored contractor/supplier credentials to pull ordered quantity,
  // batched-to-date quantity, mix design, truck/delivery status, ETA, and ticket/delivery data
  // from a Command Alkon-style ready-mix supplier API.
  return {
    id: `${pour.id}-supplier-order`,
    pourId: pour.id,
    orderNumber: pour.supplier_order_number,
    supplierName: pour.supplier_name ?? 'Demo Ready-Mix',
    platform: pour.supplier_platform ?? 'Command Alkon-style API',
    mixDesign: '4000 PSI',
    orderedYardage: 344,
    batchedYardage: 47.5,
    trucksEnRoute: 2,
    nextTruckEtaMinutes: 12,
    lastSyncedAt: new Date().toISOString(),
  };
}
