// Donation submit/lookup now run through database RPCs (submit_donation,
// lookup_donation_receipt). The former admin-client server functions were removed.
export type DonationRecord = {
  id: string;
  donor_name: string;
  donor_phone: string | null;
  amount: number;
  method: string;
  purpose: string | null;
  transaction_id: string | null;
  status: string;
  donated_at: string;
  created_at: string;
};
