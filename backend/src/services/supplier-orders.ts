import type { SupplierOrder } from '../domain';
import type { PourRecord } from '../records';

export function getSupplierOrderForPour(pour: PourRecord): SupplierOrder | null {
  if (!pour.supplier_order_number || !pour.supplier_plant_id) {
    return null;
  }

  // TODO: Replace this mock with a backend supplier integration. The real service should use
  // supplier_plant_id/supplier_name plus supplier_order_number to choose the correct supplier API
  // connector, then pull ordered quantity, batched-to-date quantity, mix design, truck/delivery
  // status, ETA, and ticket/delivery data. CEMEX can map to CEMEX Go, CalPortland/Vulcan can map
  // to Command Alkon-style connectors when applicable, and Other can fall back to manual entry.
  return {
    id: `${pour.id}-supplier-order`,
    pourId: pour.id,
    orderNumber: pour.supplier_order_number,
    supplierName: pour.supplier_name ?? 'Other',
    supplierPlantName: pour.supplier_plant_name ?? undefined,
    platform: formatSupplierPlatform(pour.supplier_platform),
    mixDesign: '4000 PSI',
    orderedYardage: 344,
    batchedYardage: 47.5,
    trucksEnRoute: 2,
    nextTruckEtaMinutes: 12,
    lastSyncedAt: new Date().toISOString(),
  };
}

function formatSupplierPlatform(platform: string | null) {
  if (platform === 'cemex_go_mock') {
    return 'CEMEX Go-style API mock';
  }

  if (platform === 'manual') {
    return 'Manual / No API connected';
  }

  return 'Command Alkon-style API mock';
}
