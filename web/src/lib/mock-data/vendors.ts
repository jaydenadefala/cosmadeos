import * as React from "react";

/**
 * Mock Vendors dataset + shared store — Operations sidebar
 * (05 Department Operating Systems/Operations/operations-operating-system.md:
 * "Universal Object Layout applies to Vendor..."). This is the real
 * reference Bills.vendorName should have used from the start — Finance's
 * Bills store predates this workspace, so it's being migrated to reference
 * `vendorId` now that Vendor exists (see bills.ts).
 */
export const VENDOR_CATEGORIES = [
  "Equipment Supplier",
  "Logistics",
  "Professional Services",
  "Facilities",
  "Software",
  "Utilities",
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export type VendorStatus = "Active" | "Inactive";

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  contactName: string;
  contactEmail: string;
  phone: string;
  status: VendorStatus;
  notes: string;
  archived: boolean;
}

const seedVendors: Vendor[] = [
  {
    id: "vendor-lagos-business-park",
    name: "Lagos Business Park Ltd.",
    category: "Facilities",
    contactName: "Femi Adeyemi",
    contactEmail: "leasing@lagosbusinesspark.example",
    phone: "+234 803 555 0201",
    status: "Active",
    notes: "Landlord for the Lagos operating office. Lease renews annually each July.",
    archived: false,
  },
  {
    id: "vendor-eko-electricity",
    name: "Eko Electricity Distribution",
    category: "Utilities",
    contactName: "Customer Service",
    contactEmail: "support@ekedp.example",
    phone: "+234 700 555 0202",
    status: "Active",
    notes: "Regional power utility.",
    archived: false,
  },
  {
    id: "vendor-vercel",
    name: "Vercel Inc.",
    category: "Software",
    contactName: "Billing Team",
    contactEmail: "billing@vercel.example",
    phone: "",
    status: "Active",
    notes: "Hosting for internal tools.",
    archived: false,
  },
  {
    id: "vendor-adekunle-legal",
    name: "Adekunle & Co. Legal Services",
    category: "Professional Services",
    contactName: "Adekunle Bello",
    contactEmail: "abello@adekunlelegal.example",
    phone: "+234 803 555 0204",
    status: "Active",
    notes: "Corporate and regulatory counsel.",
    archived: false,
  },
  {
    id: "vendor-medparts-supply",
    name: "MedParts Supply Co.",
    category: "Equipment Supplier",
    contactName: "Ngozi Eze",
    contactEmail: "sales@medpartssupply.example",
    phone: "+234 803 555 0205",
    status: "Active",
    notes: "Primary supplier for ventilator replacement parts and calibration tools.",
    archived: false,
  },
  {
    id: "vendor-swift-logistics",
    name: "Swift Logistics Nigeria",
    category: "Logistics",
    contactName: "Emeka Obi",
    contactEmail: "dispatch@swiftlogistics.example",
    phone: "+234 803 555 0206",
    status: "Inactive",
    notes: "Previous freight partner — replaced by in-house fleet in 2026.",
    archived: false,
  },
];

let state: Vendor[] = seedVendors;
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

export function useVendors(): Vendor[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getVendorById(id: string): Vendor | undefined {
  return state.find((v) => v.id === id);
}

export function addVendor(input: {
  name: string;
  category: VendorCategory;
  contactName: string;
  contactEmail: string;
  phone: string;
  notes: string;
}): Vendor {
  const vendor: Vendor = {
    id: `vendor-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    ...input,
    status: "Active",
    archived: false,
  };
  state = [vendor, ...state];
  notify();
  return vendor;
}

export function updateVendor(
  id: string,
  updates: Partial<Pick<Vendor, "name" | "category" | "contactName" | "contactEmail" | "phone" | "notes">>,
) {
  state = state.map((v) => (v.id === id ? { ...v, ...updates } : v));
  notify();
}

export function setVendorStatus(id: string, status: VendorStatus) {
  state = state.map((v) => (v.id === id ? { ...v, status } : v));
  notify();
}

export function duplicateVendor(id: string): Vendor | undefined {
  const source = state.find((v) => v.id === id);
  if (!source) return undefined;
  const copy: Vendor = {
    ...source,
    id: `${source.id}-copy-${Date.now()}`,
    name: `${source.name} (Copy)`,
    archived: false,
  };
  state = [copy, ...state];
  notify();
  return copy;
}

export function archiveVendors(ids: string[]) {
  state = state.map((v) => (ids.includes(v.id) ? { ...v, archived: true } : v));
  notify();
}

export function restoreVendor(id: string) {
  state = state.map((v) => (v.id === id ? { ...v, archived: false } : v));
  notify();
}

export function deleteVendor(id: string) {
  state = state.filter((v) => v.id !== id);
  notify();
}
