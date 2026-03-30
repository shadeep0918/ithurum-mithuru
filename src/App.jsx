import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, Wallet, TrendingDown, Target, 
  Utensils, ShoppingCart, Coffee, Clock, 
  PlusCircle, Users, Activity
} from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
const ACCESS_KEY = 'mithuru2026';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  
  // App State
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Settings State (Persisted in localStorage)
  const [partnerA, setPartnerA] = useState(() => localStorage.getItem('partnerA') || 'Partner A');
  const [partnerB, setPartnerB] = useState(() => localStorage.getItem('partnerB') || 'Partner B');
  const [incomeA, setIncomeA] = useState(() => Number(localStorage.getItem('incomeA')) || 50000);
  const [incomeB, setIncomeB] = useState(() => Number(localStorage.getItem('incomeB')) || 50000);
  const [savingsTarget, setSavingsTarget] = useState(() => Number(localStorage.getItem('savingsTarget')) || 20000);
  
  // Form State
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paidBy, setPaidBy] = useState(partnerA);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [tab, setTab] = useState('dashboard'); // dashboard, add, history, settings
  const [historyFilter, setHistoryFilter] = useState('All'); // All, This Month, Last 7 Days

  // Update localStorage when settings change
  useEffect(() => {
    localStorage.setItem('partnerA', partnerA);
    localStorage.setItem('partnerB', partnerB);
    localStorage.setItem('incomeA', incomeA);
    localStorage.setItem('incomeB', incomeB);
    localStorage.setItem('savingsTarget', savingsTarget);
    if (![partnerA, partnerB].includes(paidBy)) {
      setPaidBy(partnerA);
    }
  }, [partnerA, partnerB, incomeA, incomeB, savingsTarget]);

  // Fetch initial data
  const fetchExpenses = async () => {
    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') return;
    setLoading(true);
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchExpenses();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (keyInput === ACCESS_KEY) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid Access Key");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!item || !amount) return;
    
    const newExpense = {
      timestamp: new Date().toISOString(),
      item,
      amount: Number(amount),
      category,
      paidBy,
      date
    };
    
    // Optimistic UI Update
    setExpenses(prev => [newExpense, ...prev]);
    setTab('dashboard');
    setItem('');
    setAmount('');
    
    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
      alert("Please configure your Google Apps Script URL to save data.");
      return;
    }

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(newExpense),
        headers: { "Content-Type": "text/plain" }
      });
      // Optionally re-fetch to ensure sync
    } catch (error) {
      console.error("Error saving expense: ", error);
    }
  };

  const totalIncome = incomeA + incomeB;
  
  // Calculations
  const calculations = useMemo(() => {
    const totalExp = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const splitA = expenses.filter(e => e.paidBy === partnerA).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const splitB = expenses.filter(e => e.paidBy === partnerB).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    
    // Who owes who? (assuming they split 50/50 of the total expenses)
    const halfExp = totalExp / 2;
    const aOwes = halfExp - splitA; // if positive, A needs to pay B. if negative, B needs to pay A.
    
    // Category Breakdown
    const categories = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});

    return {
      totalExp,
      splitA,
      splitB,
      aOwes,
      categories,
      balance: totalIncome - totalExp,
      targetProgress: ((totalIncome - totalExp) / savingsTarget) * 100
    };
  }, [expenses, totalIncome, savingsTarget, partnerA, partnerB]);

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Food': return <Utensils className="w-5 h-5 text-orange-500" />;
      case 'Grocery': return <ShoppingCart className="w-5 h-5 text-green-500" />;
      case 'Drink': return <Coffee className="w-5 h-5 text-brown-500" />;
      default: return <Activity className="w-5 h-5 text-teal-600" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="bg-teal-50 p-4 rounded-full">
              <Lock className="w-8 h-8 text-teal" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-charcoal mb-2">ඉතුරුම් මිතුරු</h1>
          <p className="text-gray-500 text-center mb-8">Shared Expense Tracker</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Access Key"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal bg-gray-50"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-teal text-white py-3 rounded-xl font-medium hover:bg-teal-600 transition duration-200"
              style={{ backgroundColor: 'var(--color-teal)' }}
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 max-w-md mx-auto bg-gray-50 shadow-sm overflow-hidden relative">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-charcoal">ඉතුරුම් මිතුරු</h1>
            <p className="text-sm text-gray-500">Shared Budget</p>
          </div>
          <div className="bg-sage-light text-sage-dark p-2 rounded-full cursor-pointer hover:bg-sage transition" onClick={fetchExpenses}>
            <Activity className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {tab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-teal-dark to-teal text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white opacity-10 w-24 h-24 rounded-full blur-xl"></div>
              <p className="text-teal-light text-sm font-medium mb-1">Total Balance</p>
              <h2 className="text-3xl font-bold font-mono tracking-tight mb-4">Rs. {calculations.balance.toLocaleString()}</h2>
              <div className="flex items-center space-x-2 text-sm text-teal-100 bg-black bg-opacity-20 inline-flex px-3 py-1.5 rounded-full">
                <Target className="w-4 h-4" />
                <span>Goal: Rs. {savingsTarget.toLocaleString()}</span>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-500 font-medium">Budget Used</span>
                <span className="font-bold text-teal">{((calculations.totalExp / totalIncome) * 100).toFixed(1)}%</span>
              </div>
              <progress 
                value={calculations.totalExp} 
                max={totalIncome} 
                className="w-full h-3 rounded-full overflow-hidden" 
              />
              <div className="flex justify-between mt-3 text-xs text-gray-400">
                <span>Total Budget: {totalIncome.toLocaleString()}</span>
                <span>Expenses: {calculations.totalExp.toLocaleString()}</span>
              </div>
            </div>

            {/* Split View */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
              <h3 className="text-sm font-bold text-charcoal mb-4 border-b border-gray-100 pb-2">Who owes who?</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{partnerA} Paid</p>
                  <p className="font-bold text-sm text-charcoal">Rs. {calculations.splitA.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{partnerB} Paid</p>
                  <p className="font-bold text-sm text-charcoal">Rs. {calculations.splitB.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-teal-50 p-3 rounded-xl flex items-center justify-between">
                <span className="text-xs font-medium text-teal-dark">Settlement (50/50 Split)</span>
                <span className="font-bold text-sm text-teal">
                  {calculations.aOwes > 0 
                    ? `${partnerA} owes Rs. ${calculations.aOwes.toLocaleString()}` 
                    : calculations.aOwes < 0 
                      ? `${partnerB} owes Rs. ${Math.abs(calculations.aOwes).toLocaleString()}` 
                      : 'All settled up!'}
                </span>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
              <h3 className="text-sm font-bold text-charcoal mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {Object.entries(calculations.categories).map(([cat, amt]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600">{cat}</span>
                      <span className="font-bold text-gray-800">Rs. {amt.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-teal h-1.5 rounded-full transition-all duration-500" style={{ width: `${(amt / calculations.totalExp) * 100}%`, backgroundColor: cat === 'Food' ? '#f97316' : cat === 'Grocery' ? '#22c55e' : cat === 'Drink' ? '#b45309' : '#0d9488' }}></div>
                    </div>
                  </div>
                ))}
                {Object.keys(calculations.categories).length === 0 && <p className="text-xs text-gray-400">No data to display.</p>}
              </div>
            </div>
            
            {/* Recent list summary */}
            <div>
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-charcoal">Recent Activity</h3>
                 <button onClick={() => setTab('history')} className="text-teal text-sm font-medium">View All</button>
               </div>
               <div className="space-y-3">
                 {expenses.slice(0, 3).map((exp, i) => (
                   <div key={i} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-gray-50">
                     <div className="flex items-center space-x-3">
                       <div className="bg-gray-50 p-2 rounded-xl">
                         {getCategoryIcon(exp.category)}
                       </div>
                       <div>
                         <p className="font-medium text-sm text-charcoal">{exp.item}</p>
                         <p className="text-xs text-gray-400">{new Date(exp.date).toLocaleDateString()} • {exp.paidBy}</p>
                       </div>
                     </div>
                     <span className="font-bold text-sm text-red-500">-Rs.{exp.amount}</span>
                   </div>
                 ))}
                 {expenses.length === 0 && <p className="text-center text-sm text-gray-400 py-4">No recent expenses logged.</p>}
               </div>
            </div>
          </div>
        )}

        {tab === 'add' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-charcoal mb-6">Log Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">What did you buy?</label>
                <input required type="text" value={item} onChange={e => setItem(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 outline-none focus:ring-teal-light" placeholder="e.g. Dinner at Cafe" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1.5">Amount (Rs)</label>
                  <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 outline-none focus:ring-teal-light" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1.5">Date</label>
                  <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 outline-none focus:ring-teal-light" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 outline-none focus:ring-teal-light">
                  <option value="Food">Food / Dining</option>
                  <option value="Drink">Drinks / Coffee</option>
                  <option value="Grocery">Groceries</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Who Paid?</label>
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setPaidBy(partnerA)} className={`flex-1 py-3 rounded-xl font-medium transition ${paidBy === partnerA ? 'bg-teal text-white border-transparent' : 'bg-white text-gray-600 border border-gray-200'}`} style={paidBy === partnerA ? {backgroundColor: 'var(--color-teal)'} : {}}>
                    {partnerA}
                  </button>
                  <button type="button" onClick={() => setPaidBy(partnerB)} className={`flex-1 py-3 rounded-xl font-medium transition ${paidBy === partnerB ? 'bg-sage-dark text-white border-transparent' : 'bg-white text-gray-600 border border-gray-200'}`} style={paidBy === partnerB ? {backgroundColor: 'var(--color-sage-dark)'} : {}}>
                    {partnerB}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full mt-4 py-3.5 rounded-xl text-white font-bold shadow-md hover:opacity-90 transition active:scale-95" style={{backgroundColor: 'var(--color-teal)'}}>
                Save Expense
              </button>
            </form>
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-4 animate-fade-in pb-10">
            <h2 className="text-xl font-bold text-charcoal mb-2">Expense History</h2>
            
            {/* Filter */}
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'This Month', 'Last 7 Days'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setHistoryFilter(filter)} 
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${historyFilter === filter ? 'bg-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  style={historyFilter === filter ? { backgroundColor: 'var(--color-teal)' } : {}}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {expenses.filter(exp => {
                if (historyFilter === 'All') return true;
                const expDate = new Date(exp.date);
                const today = new Date();
                if (historyFilter === 'This Month') {
                  return expDate.getMonth() === today.getMonth() && expDate.getFullYear() === today.getFullYear();
                }
                if (historyFilter === 'Last 7 Days') {
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(today.getDate() - 7);
                  return expDate >= sevenDaysAgo;
                }
                return true;
              }).map((exp, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-50 p-2 rounded-xl">
                      {getCategoryIcon(exp.category)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-charcoal">{exp.item}</p>
                      <p className="text-xs text-gray-400">{new Date(exp.date).toLocaleDateString()} • {exp.paidBy}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-red-500">-Rs.{exp.amount}</span>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-center text-sm text-gray-400 py-8">No expenses found matching the filter.</p>}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-6 animate-fade-in pb-10">
            <h2 className="text-xl font-bold text-charcoal">App Settings</h2>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 space-y-4">
              <h3 className="font-bold text-sm text-teal pb-2 border-b border-gray-100">Partner Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Partner A Name</label>
                  <input type="text" value={partnerA} onChange={e => setPartnerA(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-teal" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Partner B Name</label>
                  <input type="text" value={partnerB} onChange={e => setPartnerB(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-teal" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 space-y-4">
              <h3 className="font-bold text-sm text-teal pb-2 border-b border-gray-100">Monthly Incomes</h3>
              <div>
                <label className="text-xs text-gray-500 block mb-1">{partnerA}'s Income</label>
                <input type="number" value={incomeA} onChange={e => setIncomeA(Number(e.target.value))} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-teal" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">{partnerB}'s Income</label>
                <input type="number" value={incomeB} onChange={e => setIncomeB(Number(e.target.value))} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-teal" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 space-y-4">
              <h3 className="font-bold text-sm text-teal pb-2 border-b border-gray-100">Goals</h3>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Monthly Savings Target</label>
                <input type="number" value={savingsTarget} onChange={e => setSavingsTarget(Number(e.target.value))} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:ring-1 focus:ring-teal" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-20">
        <button onClick={() => setTab('dashboard')} className={`flex flex-col items-center p-2 transition ${tab === 'dashboard' ? 'text-teal' : 'text-gray-400'}`}>
          <Wallet className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => setTab('history')} className={`flex flex-col items-center p-2 transition ${tab === 'history' ? 'text-teal' : 'text-gray-400'}`}>
          <Clock className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">History</span>
        </button>
        <button onClick={() => setTab('add')} className="flex flex-col items-center justify-center -mt-8 relative z-30 transition hover:scale-105">
          <div className="bg-teal text-white p-3 rounded-full shadow-lg shadow-teal-500/30" style={{backgroundColor: 'var(--color-teal)'}}>
            <PlusCircle className="w-7 h-7" />
          </div>
        </button>
        <button onClick={() => setTab('settings')} className={`flex flex-col items-center p-2 transition ${tab === 'settings' ? 'text-teal' : 'text-gray-400'}`}>
          <Users className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
