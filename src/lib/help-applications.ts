export type HelpStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "completed"
  | "rejected";

export type HelpApplication = {
  id: string;
  name: string;
  phone: string;
  type: string;
  amount: string;
  reason: string;
  address: string;
  fileCount: number;
  status: HelpStatus;
  createdAt: number;
};

const KEY = "cf_help_apps_v1";

function read(): HelpApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HelpApplication[]) : [];
  } catch {
    return [];
  }
}

function write(list: HelpApplication[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function generateAppId(): string {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CF-${y}${m}-${rand}`;
}

export function saveApplication(
  app: Omit<HelpApplication, "id" | "status" | "createdAt"> & {
    id?: string;
    status?: HelpStatus;
  },
): HelpApplication {
  const record: HelpApplication = {
    ...app,
    id: app.id ?? generateAppId(),
    status: app.status ?? "pending",
    createdAt: Date.now(),
  };
  const list = read();
  list.unshift(record);
  write(list);
  return record;
}

export function findApplication(id: string): HelpApplication | null {
  const needle = id.trim().toUpperCase();
  if (!needle) return null;
  return read().find((a) => a.id.toUpperCase() === needle) ?? null;
}

export const STATUS_LABELS: Record<HelpStatus, string> = {
  pending: "জমা হয়েছে",
  under_review: "যাচাই চলছে",
  approved: "অনুমোদিত",
  completed: "সম্পন্ন",
  rejected: "প্রত্যাখ্যাত",
};

export const STATUS_STEPS: HelpStatus[] = [
  "pending",
  "under_review",
  "approved",
  "completed",
];