import * as React from "react";

/**
 * Mock Inventory dataset + shared store — Operations sidebar
 * (05 Department Operating Systems/Operations/operations-operating-system.md).
 * CLAUDE.md's Operations action set names "Receive Inventory" explicitly —
 * a real mutator that increases on-hand quantity, not a decorative button.
 */
export const INVENTORY_CATEGORIES = ["Equipment Parts", "Consumables", "Tools", "Office Supplies"] as const;
export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  sku: string;
  quantity: number;
  reorderThreshold: number;
  location: string;
  archived: boolean;
}

export function stockStatus(item: InventoryItem): StockStatus {
  if (item.quantity <= 0) return "Out of Stock";
  if (item.quantity <= item.reorderThreshold) return "Low Stock";
  return "In Stock";
}

const seedItems: InventoryItem[] = [
  {
    id: "inv-calibration-kit",
    name: "Calibration Toolkit",
    category: "Tools",
    sku: "TK-1001",
    quantity: 8,
    reorderThreshold: 3,
    location: "Lagos Warehouse — Shelf A2",
    archived: false,
  },
  {
    id: "inv-ventilator-battery",
    name: "Ventilator Backup Battery Pack",
    category: "Equipment Parts",
    sku: "BP-2044",
    quantity: 4,
    reorderThreshold: 5,
    location: "Lagos Warehouse — Shelf B1",
    archived: false,
  },
  {
    id: "inv-sensor-probes",
    name: "SpO2 Sensor Probes (box of 10)",
    category: "Consumables",
    sku: "SP-3390",
    quantity: 22,
    reorderThreshold: 10,
    location: "Lagos Warehouse — Shelf C4",
    archived: false,
  },
  {
    id: "inv-tubing-kits",
    name: "Ventilator Tubing Kits",
    category: "Consumables",
    sku: "TB-4410",
    quantity: 0,
    reorderThreshold: 15,
    location: "Lagos Warehouse — Shelf C5",
    archived: false,
  },
  {
    id: "inv-printer-paper",
    name: "Thermal Printer Paper Rolls",
    category: "Office Supplies",
    sku: "OP-5501",
    quantity: 60,
    reorderThreshold: 20,
    location: "Lagos Office — Supply Closet",
    archived: false,
  },
];

let state: InventoryItem[] = seedItems;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useInventoryItems(): InventoryItem[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addInventoryItem(input: {
  name: string;
  category: InventoryCategory;
  sku: string;
  quantity: number;
  reorderThreshold: number;
  location: string;
}): InventoryItem {
  const item: InventoryItem = { id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...input, archived: false };
  state = [item, ...state];
  notify();
  return item;
}

/** CLAUDE.md's Operations action set: "Receive Inventory." */
export function receiveInventory(id: string, quantityReceived: number) {
  state = state.map((i) => (i.id === id ? { ...i, quantity: i.quantity + quantityReceived } : i));
  notify();
}

export function adjustInventoryQuantity(id: string, newQuantity: number) {
  state = state.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, newQuantity) } : i));
  notify();
}

export function archiveInventoryItems(ids: string[]) {
  state = state.map((i) => (ids.includes(i.id) ? { ...i, archived: true } : i));
  notify();
}

export function deleteInventoryItem(id: string) {
  state = state.filter((i) => i.id !== id);
  notify();
}
