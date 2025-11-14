
import React from 'react';
import { Transaction } from '../types';

interface StatementTableProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number | null) => {
  if (amount === null || typeof amount === 'undefined') {
    return <span className="text-slate-400 dark:text-slate-500">-</span>;
  }
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const StatementTable: React.FC<StatementTableProps> = ({ transactions }) => {
  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-md ring-1 ring-slate-200 dark:ring-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-700/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Particulars
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Payments
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Receipts
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Balance
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {transactions.map((tx, index) => (
            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{tx.date}</td>
              <td className="px-6 py-4 whitespace-normal text-sm text-slate-800 dark:text-slate-200 font-medium max-w-xs">{tx.particulars}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-red-600 dark:text-red-400">{formatCurrency(tx.payments)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-green-600 dark:text-green-400">{formatCurrency(tx.receipts)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-slate-600 dark:text-slate-400">{tx.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatementTable;
