
export interface Transaction {
  date: string;
  particulars: string;
  payments: number | null;
  receipts: number | null;
  balance: string;
}
