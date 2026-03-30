import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Minus, TrendingDown, TrendingUp,
  Wallet, PieChart as PieChartIcon, Clock, Lock,
  ChevronDown, Settings
} from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhO1YR8Ubwy3o97ddTA4D58feYAmIiFv2JxmlO4It7JsRlk-7FA5NnUb5I25nnDZKM/exec';
const ACCESS_KEY = 'mithuru2026';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('home'); // home, stats, history

  // Add Form State
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('expense'); // 'income' | 'expense'
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isAuthenticated) {
      if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        fetchData();
      } else {
        // Start with empty data
        setExpenses([]);
      }
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const data = await res.json();

      // Map existing records to the new format (assuming positive amounts but categorizing based on name or category)
      const formatted = data.map(d => ({
        ...d,
        type: d.category === 'Income' ? 'income' : 'expense'
      }));
      setExpenses(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const inc = expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const exp = expenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    return { income: inc, expense: exp, balance: inc - exp };
  }, [expenses]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (keyInput === ACCESS_KEY) setIsAuthenticated(true);
    else alert("Invalid Access Key");
  };

  const openForm = (type) => {
    setFormType(type);
    setItem('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!item || !amount) return;

    const newRecord = {
      timestamp: new Date().toISOString(),
      item,
      amount: Number(amount),
      category: formType === 'income' ? 'Income' : 'Expense', // Simple categorization
      paidBy: 'Self',
      date,
      type: formType
    };

    setExpenses(prev => [newRecord, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    setShowForm(false);

    if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify(newRecord),
          headers: { "Content-Type": "text/plain" }
        });
      } catch (err) { console.error(err); }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 font-sans text-slate-800">
        <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-sm text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-slate-700" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Login</h1>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">Secure Vault</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)} placeholder="Access Key" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-200 text-center font-bold tracking-widest" />
            <button type="submit" className="w-full bg-[#1e293b] text-white py-4 rounded-2xl font-bold tracking-wider hover:opacity-90 transition">ENTER</button>
          </form>
        </div>
      </div>
    );
  }

  // Helper date formatter: MAR 19
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-24 relative">
      <div className="max-w-md mx-auto pt-8 px-5">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-extrabold text-[#1e293b]">ඉතුරුම් මිතුරු</h1>
          </div>
        </div>

        {tab === 'home' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {/* Balance Card */}
            <div className="bg-white rounded-[32px] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.03)] mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>

              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Available Balance</p>
              <h1 className="text-4xl font-extrabold text-[#1e293b] mb-8">Rs. {totals.balance.toLocaleString()}</h1>

              <div className="h-px bg-slate-100 mb-6 w-full"></div>

              <div className="flex justify-between items-center relative z-10">
                <div className="w-1/2">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Income</span>
                  </div>
                  <p className="text-[17px] font-extrabold text-[#10b981]">Rs. {totals.income.toLocaleString()}</p>
                </div>

                <div className="w-1/2 pl-4 border-l border-slate-100">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Total Expenses</span>
                  </div>
                  <p className="text-[17px] font-extrabold text-[#ef4444]">Rs. {totals.expense.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Monthly / Custom Stats Card */}
            <div className="bg-white rounded-[32px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] mb-6 border border-slate-50">
              <div className="flex justify-between items-center mb-5">
                <div className="bg-slate-50 flex p-1 rounded-full">
                  <button className="px-5 py-2 rounded-full bg-white shadow-sm text-xs font-bold text-indigo-600 tracking-wide uppercase">Monthly</button>
                  <button className="px-5 py-2 rounded-full text-xs font-bold text-slate-500 tracking-wide uppercase">Custom</button>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-full flex items-center space-x-2 cursor-pointer">
                  <span className="text-xs font-extrabold text-slate-700">Mar 2026</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#ecfdf5] border border-[#d1fae5] rounded-3xl p-5">
                  <p className="text-[10px] font-bold text-[#059669] tracking-widest uppercase mb-1">Income</p>
                  <h3 className="text-xl font-extrabold text-[#059669]">Rs. {totals.income.toLocaleString()}</h3>
                </div>
                <div className="bg-[#fff1f2] border border-[#ffe4e6] rounded-3xl p-5">
                  <p className="text-[10px] font-bold text-[#e11d48] tracking-widest uppercase mb-1">Expenses</p>
                  <h3 className="text-xl font-extrabold text-[#e11d48]">Rs. {totals.expense.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => openForm('income')} className="bg-[#ecfdf5] border border-[#d1fae5] rounded-[32px] p-6 flex flex-col items-center justify-center transition-transform hover:scale-95 active:scale-90">
                <div className="w-14 h-14 rounded-full bg-[#d1fae5] flex items-center justify-center mb-4">
                  <Plus className="w-7 h-7 text-[#059669]" />
                </div>
                <span className="text-[#059669] text-sm font-extrabold tracking-widest uppercase">INCOME</span>
              </button>

              <button onClick={() => openForm('expense')} className="bg-[#fff1f2] border border-[#ffe4e6] rounded-[32px] p-6 flex flex-col items-center justify-center transition-transform hover:scale-95 active:scale-90">
                <div className="w-14 h-14 rounded-full bg-[#ffe4e6] flex items-center justify-center mb-4">
                  <Minus className="w-7 h-7 text-[#e11d48]" />
                </div>
                <span className="text-[#e11d48] text-sm font-extrabold tracking-widest uppercase">EXPENSE</span>
              </button>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6">Transactions</h2>
            <div className="space-y-3">
              {expenses.map((exp, i) => (
                <div key={i} className="bg-white rounded-3xl p-4 flex items-center justify-between shadow-[0_2px_15px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-slate-50 transition border border-slate-50">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${exp.type === 'income' ? 'bg-[#ecfdf5]' : 'bg-[#fff1f2]'}`}>
                      {exp.type === 'income' ? (
                        <TrendingUp className="w-6 h-6 text-[#10b981]" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-[#ef4444]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-extrabold text-lg capitalize">{exp.item}</h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{formatDate(exp.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-extrabold text-lg ${exp.type === 'income' ? 'text-[#10b981]' : 'text-slate-800'}`}>
                      {exp.type === 'income' ? '+' : '-'}{Number(exp.amount).toFixed(2)}
                    </p>
                    <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest mt-0.5">Tap to edit</p>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-center font-bold text-slate-400 py-10">No transactions recorded yet.</p>}
            </div>
          </div>
        )}

      </div>

      {/* Unified Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex space-x-12 z-40 border border-slate-100 items-center justify-center">
        <button onClick={() => setTab('home')} className={`flex flex-col items-center p-1 transition-colors ${tab === 'home' ? 'text-[#1e293b]' : 'text-slate-300'}`}>
          <Wallet className="w-7 h-7" />
        </button>
        <button onClick={() => setTab('history')} className={`flex flex-col items-center p-1 transition-colors ${tab === 'history' ? 'text-[#1e293b]' : 'text-slate-300'}`}>
          <Clock className="w-7 h-7" />
        </button>
      </div>

      {/* Overlay Add Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 relative z-10 shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8"></div>

            <h2 className="text-2xl font-extrabold text-slate-800 mb-8 capitalize text-center">
              Add {formType}
            </h2>

            <form onSubmit={submitForm} className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Amount</p>
                <div className="flex items-center justify-center text-5xl font-extrabold text-slate-800 border-b-2 border-slate-100 pb-3">
                  <span className="text-2xl mr-2 text-slate-400">Rs.</span>
                  <input required autoFocus type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-48 bg-transparent text-center outline-none border-none p-0 focus:ring-0" placeholder="0" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-4 mb-2 block">Description</label>
                <input required type="text" value={item} onChange={e => setItem(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-200 font-bold" placeholder={formType === 'income' ? 'e.g. Salary' : 'e.g. Dinner, Rent'} />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-4 mb-2 block">Date</label>
                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-200 font-bold text-slate-600" />
              </div>

              <button type="submit" className={`w-full text-white py-5 rounded-[28px] font-extrabold tracking-widest text-sm uppercase shadow-lg shadow-${formType === 'income' ? 'emerald' : 'rose'}-500/30 transition-transform active:scale-95`} style={{ backgroundColor: formType === 'income' ? '#059669' : '#e11d48' }}>
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
