import React, { useState } from 'react';
import { Transaction } from '../types';
import { Landmark, ArrowUpRight, ArrowDownLeft, FileText, PlusCircle, HelpCircle, CheckCircle } from 'lucide-react';

interface WalletSystemProps {
  transactions: Transaction[];
  currentUserBalance: number;
  onAddFunds: (amount: number, reason: string) => void;
  onDeductFunds: (amount: number, reason: string) => boolean;
  role?: string;
}

export default function WalletSystem({
  transactions,
  currentUserBalance,
  onAddFunds,
  onDeductFunds,
  role
}: WalletSystemProps) {
  const [addingFunds, setAddingFunds] = useState('');
  const [fundingReason, setFundingReason] = useState('Manual Refresher Credit Assign');
  const [showInvoiceMock, setShowInvoiceMock] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(addingFunds);
    if (!parsed || parsed <= 0) {
      alert('Deposit amount must be greater than zero.');
      return;
    }

    onAddFunds(parsed, fundingReason || 'Assigned Wallet Credits through Stripe Gateway');
    
    // Generate an instant mockup invoice
    const referenceId = `REF-STRIPE-${Date.now().toString().substring(7)}`;
    setLastInvoice({
      id: referenceId,
      amount: parsed,
      type: 'credit',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      tax_fee: (parsed * 0.03 + 0.30).toFixed(2), // 3% + 0.30 fee
      gateway: 'Stripe Direct Billing v3',
      status: 'Paid / Settled'
    });
    
    setAddingFunds('');
    setShowInvoiceMock(true);
  };

  return (
    <div id="wallet-system-section" className="space-y-6">
      
      {/* Top Banner stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/60 backdrop-blur border border-indigo-500/10 p-6 rounded-2xl relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Your Wallet Balance</p>
              <h3 className="text-3xl font-extrabold text-slate-100 font-mono mt-2">
                {role === 'super_admin' || role === 'owner' ? 'Unlimited Credits' : `${currentUserBalance.toFixed(2)} Credits`}
              </h3>
            </div>
            <Landmark className="w-8 h-8 text-indigo-400 opacity-60" />
          </div>
          <p className="text-[11px] text-slate-500">
            Available currency credits to redeem single/bulk keys.
          </p>
        </div>

        {/* Deposit Funds Form */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 md:col-span-2 relative overflow-hidden shadow-xl">
          <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4 text-purple-400" />
            Inject Digital Core Credits
          </h4>

          <form onSubmit={handleDeposit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-2">Refill Amount (Credits)</label>
              <input
                id="deposit-amount-input"
                type="number"
                min="5"
                max="5000"
                placeholder="150"
                value={addingFunds}
                onChange={(e) => setAddingFunds(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-2">gateway reference descriptor</label>
              <input
                id="deposit-reason-input"
                type="text"
                placeholder="PayPal or Bank Wire desc"
                value={fundingReason}
                onChange={(e) => setFundingReason(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 p-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                id="execute-deposit-btn"
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white rounded-xl text-xs font-semibold hover:bg-purple-600 transition"
              >
                Deposit Credits
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Ledger history transactions */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Central Double-Ledger Transaction Entries
        </h3>

        {/* Mobile View Ledger cards */}
        <div className="block md:hidden space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 italic">No transactions cataloged yet.</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="bg-[#08080c]/60 p-4 rounded-xl border border-slate-850 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-slate-400 font-bold text-[10px] bg-slate-950 px-2.5 py-0.5 rounded border border-slate-850">
                    {tx.referenceId}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{tx.timestamp}</span>
                </div>
                
                <div className="text-slate-300">
                  <span className="text-slate-500 font-medium">Operator:</span> <span className="font-bold text-slate-200">{tx.username}</span>
                </div>
                <div className="text-slate-450 leading-relaxed text-[11px]">
                  <span className="text-slate-500 font-medium">Details:</span> {tx.reason}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-950">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Amount Impact</span>
                  <span className={`inline-flex items-center gap-1 font-bold font-mono text-sm ${
                    tx.type === 'credit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tx.type === 'credit' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount.toFixed(2)} Credits
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View Tabular Ledger */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold text-[10px] uppercase">
                <th className="px-4 py-3">REF Signature</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Transaction details</th>
                <th className="px-4 py-3">Balance impact</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-950/20 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-400">
                    {tx.referenceId}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-200">
                    {tx.username}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {tx.reason}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 font-bold font-mono ${
                      tx.type === 'credit' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.type === 'credit' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount.toFixed(2)} Credits
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 font-mono">
                    {tx.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INVOICE OVERLAY */}
      {showInvoiceMock && lastInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-extrabold text-slate-200 text-sm">Invoice Payment Approved</h4>
              <p className="text-[11px] text-slate-500">Stripe Invoicing Portal ID: {lastInvoice.id}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant:</span>
                <span className="text-slate-300 font-bold">Rainbow VIP Group Inc</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Gate:</span>
                <span className="text-indigo-400 font-semibold">{lastInvoice.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Credit Refill:</span>
                <span className="text-slate-300">{lastInvoice.amount.toFixed(2)} Credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processing Fees:</span>
                <span className="text-slate-300">{lastInvoice.tax_fee} Credits</span>
              </div>
              <div className="border-t border-slate-900 pt-2 flex justify-between font-bold text-slate-200">
                <span>Total Settled:</span>
                <span className="text-pink-400">{(lastInvoice.amount + parseFloat(lastInvoice.tax_fee)).toFixed(2)} Credits</span>
              </div>
            </div>

            <button
              id="close-invoice-btn"
              onClick={() => setShowInvoiceMock(false)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white rounded-xl text-xs font-semibold"
            >
              Acknowledge Settled Entry
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
