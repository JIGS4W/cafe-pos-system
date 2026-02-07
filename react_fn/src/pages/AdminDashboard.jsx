import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  // State
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  
  // Forms
  const [newCatName, setNewCatName] = useState('');
  const [newP, setNewP] = useState({ name: '', price: '', category_id: null, has_sweetness: false, icon: '' });
  
  // UI Controls
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHistoryStats, setShowHistoryStats] = useState(false);
  const [expandedDates, setExpandedDates] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteData, setDeleteData] = useState({});

  // Fetch Helper
  const fetchAuth = async (url, options = {}) => {
    const headers = { ...options.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
        return null;
      }
      return res;
    } catch (e) { console.error(e); return null; }
  };

  // Load Data
  const loadData = async () => {
    try {
      const [cRes, pRes, oRes, sRes] = await Promise.all([
        fetchAuth('/api/categories'),
        fetchAuth('/api/products'),
        fetchAuth('/api/orders'),
        fetchAuth('/api/daily-sales')
      ]);
      
      if(cRes) setCategories(await cRes.json());
      if(pRes) setProducts(await pRes.json());
      if(oRes) {
        const newOrders = await oRes.json();
        // Preserve 'showNote' state
        setOrders(prev => newOrders.map(no => ({
          ...no,
          showNote: prev.find(p => p.id === no.id)?.showNote || false
        })));
      }
      if(sRes) setDailySales(await sRes.json());
    } catch (e) { console.error("Load Error", e); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Computed Values
  const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  
  const todayTotal = useMemo(() => 
    dailySales.find(d => d.sale_date === todayDate)?.total || 0, 
  [dailySales, todayDate]);

  const todayOrders = useMemo(() => 
    orders.filter(o => o.created_at && o.created_at.startsWith(todayDate)), 
  [orders, todayDate]);

  const todayCategoryStats = useMemo(() => {
    const stats = {};
    todayOrders.forEach(o => {
      o.items?.forEach(item => {
        const p = products.find(prod => prod.name === item.name);
        const cat = p ? p.category_name : 'อื่นๆ';
        stats[cat] = (stats[cat] || 0) + Number(item.qty || item.quantity || 1);
      });
    });
    return stats;
  }, [todayOrders, products]);

  const historyStats = useMemo(() => {
    if(!dailySales.length) return { total: 0, avg: 0, max: 0 };
    const totals = dailySales.map(d => Number(d.total));
    const total = totals.reduce((a, b) => a + b, 0);
    return {
      total,
      avg: Math.round(total / totals.length),
      max: Math.max(...totals)
    };
  }, [dailySales]);

  // Methods
  const getDayStats = (dateStr) => {
    const stats = {};
    const dayOrders = orders.filter(o => o.created_at && o.created_at.startsWith(dateStr));
    dayOrders.forEach(o => {
      o.items?.forEach(item => {
        const p = products.find(prod => prod.name === item.name);
        const cat = p ? p.category_name : 'อื่นๆ';
        const qty = Number(item.qty || item.quantity || 1);
        const total = (Number(item.price) || 0) * qty;
        
        if(!stats[cat]) stats[cat] = { count: 0, total: 0 };
        stats[cat].count += qty;
        stats[cat].total += total;
      });
    });
    return stats;
  };

  const handleDelete = async () => {
    let url = `/api/${deleteData.type === 'product' ? 'products' : deleteData.type === 'category' ? 'categories' : 'orders'}/${deleteData.id}`;
    await fetchAuth(url, { method: 'DELETE' });
    setShowDeleteModal(false);
    loadData();
  };

  const handleAddProduct = async () => {
    if(!newP.name || !newP.price || !newP.category_id) return alert('กรอกข้อมูลให้ครบ');
    await fetchAuth('/api/products', {
      method: 'POST',
      body: JSON.stringify({ ...newP, icon: newP.icon || '☕' })
    });
    setNewP({ name: '', price: '', category_id: newP.category_id, has_sweetness: false, icon: '' });
    loadData();
  };

  const handleAddCategory = async () => {
    if(!newCatName) return;
    await fetchAuth('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: newCatName })
    });
    setNewCatName('');
    loadData();
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  const formatDate = (d) => { if(!d) return '-'; const [y,m,da] = d.split('-'); return `${da}/${m}/${y}`; };

  return (
    <div className="bg-gray-100 p-6 min-h-screen font-sans">
      {/* Logout Loader */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 bg-white/95 flex flex-col items-center justify-center">
          <div className="text-6xl animate-bounce">☕</div>
          <div className="mt-4 text-gray-600 font-bold">กำลังออกจากระบบ...</div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-[popIn_0.2s_ease-out]">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4"><span className="text-3xl">⚠️</span></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ยืนยันการลบ?</h3>
            <p className="text-gray-600 text-sm mb-6">{deleteData.message}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl font-bold hover:bg-gray-200">ยกเลิก</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200">ยืนยันลบ</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-2xl shadow-sm gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">☕ Admin Dashboard</h1>
            <p className="text-xs text-gray-400 mt-1">จัดการร้านกาแฟของคุณได้ที่นี่ (Secure Mode)</p>
          </div>
          <button onClick={() => { setIsLoggingOut(true); localStorage.removeItem('adminToken'); setTimeout(() => navigate('/login'), 1500); }} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow transition hover:shadow-lg flex items-center gap-2">
            <span>🚪</span> ออกจากระบบ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Today Stats */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-blue-100 mb-1 text-sm font-medium">รายรับวันนี้ ({formatDate(todayDate)})</div>
                  <div className="text-5xl font-bold mb-3">{todayTotal.toLocaleString()}.-</div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-xs bg-white/20 px-3 py-1 rounded-full"><span>🛒</span> {todayOrders.length} ออเดอร์</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <button onClick={() => setShowStats(!showStats)} className="w-full flex justify-between items-center text-sm font-bold bg-white/10 hover:bg-white/20 py-2 px-3 rounded-lg transition">
                  <span className="flex items-center gap-2">📊 ยอดขายตามหมวดหมู่</span>
                  <span className={`transform transition-transform duration-200 ${showStats ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {showStats && (
                  <div className="mt-2 space-y-1 bg-black/10 rounded-lg p-2 max-h-40 overflow-y-auto animate-[slideDown_0.3s_ease-out]">
                    {Object.entries(todayCategoryStats).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm px-2 py-1 border-b border-white/10 last:border-0">
                        <span className="text-blue-100">{k}</span>
                        <span className="font-bold bg-white text-blue-800 px-2 rounded-md text-xs">{v} ชิ้น</span>
                      </div>
                    ))}
                    {Object.keys(todayCategoryStats).length === 0 && <div className="text-center text-xs text-blue-200 py-2">ไม่มีข้อมูล</div>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Daily Sales Table */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-6 border border-gray-100 h-64 flex flex-col relative">
            <div className="mb-3 shrink-0">
              <button onClick={() => setShowHistoryStats(!showHistoryStats)} className="w-full flex justify-between items-center text-sm font-bold bg-gray-50 hover:bg-gray-100 py-2 px-3 rounded-lg transition border border-gray-200">
                <span className="flex items-center gap-2">📅 สรุปยอดขายย้อนหลัง</span>
                <span className={`transform transition-transform duration-200 ${showHistoryStats ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showHistoryStats && (
                <div className="mt-2 space-y-1 bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-inner text-sm animate-[slideDown_0.3s_ease-out]">
                  <div className="flex justify-between border-b border-gray-200 pb-1"><span className="text-gray-500">รวมรายรับ</span><span className="font-bold text-green-700">{historyStats.total.toLocaleString()}.-</span></div>
                  <div className="flex justify-between border-b border-gray-200 pb-1"><span className="text-gray-500">เฉลี่ยต่อวัน</span><span className="font-bold text-blue-600">~{historyStats.avg.toLocaleString()}.-</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">ยอดสูงสุด</span><span className="font-bold text-orange-600">{historyStats.max.toLocaleString()}.-</span></div>
                </div>
              )}
            </div>
            <div className="overflow-y-auto flex-1 pr-1">
              <table className="w-full text-sm">
                <thead className="bg-white sticky top-0 z-10 shadow-sm text-gray-500 text-left">
                  <tr><th className="pb-2 pl-2">วันที่</th><th className="text-right pb-2 pr-2">ยอดขายรวม</th><th className="w-8"></th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dailySales.length > 0 ? dailySales.map(day => (
                    <React.Fragment key={day.sale_date}>
                      <tr onClick={() => setExpandedDates(prev => prev.includes(day.sale_date) ? prev.filter(d => d !== day.sale_date) : [...prev, day.sale_date])} className="cursor-pointer hover:bg-gray-50 transition group">
                        <td className="py-2 pl-2 text-gray-600 font-medium">{formatDate(day.sale_date)}</td>
                        <td className="py-2 pr-2 text-right font-bold text-gray-800">{Number(day.total).toLocaleString()}.-</td>
                        <td className="text-center text-gray-400"><span className={`inline-block transition-transform duration-200 ${expandedDates.includes(day.sale_date) ? 'rotate-180' : ''}`}>▼</span></td>
                      </tr>
                      {expandedDates.includes(day.sale_date) && (
                        <tr className="bg-gray-100 border-b border-gray-200 shadow-inner animate-[slideDown_0.3s_ease-out]">
                          <td colSpan="3" className="p-3 pl-5">
                            <p className="text-xs font-bold text-gray-500 mb-2">🏷️ รายละเอียดตามหมวดหมู่</p>
                            <div className="space-y-1">
                              {Object.entries(getDayStats(day.sale_date)).map(([cat, stat]) => (
                                <div key={cat} className="flex justify-between text-xs border-b border-gray-200 pb-1 last:border-0">
                                  <div className="flex gap-2"><span className="text-gray-600">{cat}</span><span className="bg-blue-100 text-blue-700 px-1.5 rounded text-[10px] font-bold">x{stat.count}</span></div>
                                  <span className="font-bold text-gray-800">{stat.total.toLocaleString()}.-</span>
                                </div>
                              ))}
                              {Object.keys(getDayStats(day.sale_date)).length === 0 && <div className="text-center text-xs text-gray-400">ไม่มีข้อมูล</div>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )) : <tr><td colSpan="3" className="text-center py-4 text-gray-400">ไม่พบข้อมูล</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ... Rest of the UI (Menu Management & Orders) remains mostly same structure ... */}
        {/* เพื่อความกระชับ ขออนุญาตละส่วนจัดการเมนูและออเดอร์ด้านล่างไว้ (Logic เหมือนกับที่เขียนให้ข้างบน แต่แปลงเป็น React JSX) */}
        {/* หากต้องการส่วนนี้ด้วย บอกได้เลยครับ จะ Gen ต่อให้ครับ */}
        
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
                    <h2 className="text-xl font-bold mb-5 text-orange-600 flex items-center gap-2"><span>🍔</span> จัดการเมนู</h2>
                    {/* Categories */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">หมวดหมู่สินค้า</label>
                        <div className="flex gap-2 mb-3">
                            <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="ชื่อหมวดหมู่ใหม่..." className="flex-1 text-sm p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"/>
                            <button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg text-sm font-bold shadow transition">เพิ่ม</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(c => (
                                <div key={c.id} className="bg-white px-3 py-1.5 rounded-lg border text-sm text-gray-700 shadow-sm flex items-center gap-2">
                                    {c.name} <button onClick={()=>setDeleteData({type:'category',id:c.id,message:`ลบหมวดหมู่ '${c.name}'?`}) || setShowDeleteModal(true)} className="text-gray-400 hover:text-red-500 w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-50 transition">×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Add Product Form */}
                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-orange-200 text-orange-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg">NEW ITEM</div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div><label className="text-xs font-bold text-gray-500 ml-1">ชื่อเมนู</label><input value={newP.name} onChange={e=>setNewP({...newP, name:e.target.value})} className="w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:border-orange-500"/></div>
                            <div><label className="text-xs font-bold text-gray-500 ml-1">ราคา (บาท)</label><input type="number" value={newP.price} onChange={e=>setNewP({...newP, price:e.target.value})} className="w-full p-2.5 border rounded-lg text-sm focus:outline-none focus:border-orange-500"/></div>
                        </div>
                        <div className="flex items-center gap-2 mb-4 bg-white/50 p-2 rounded-lg border border-orange-100">
                            <input type="checkbox" id="sweet" checked={newP.has_sweetness} onChange={e=>setNewP({...newP, has_sweetness:e.target.checked})} className="w-4 h-4 text-orange-600 rounded"/>
                            <label htmlFor="sweet" className="text-sm text-gray-700 cursor-pointer">เมนูนี้ปรับความหวานได้</label>
                        </div>
                        <div className="mb-4">
                            <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">เลือกหมวดหมู่</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(c => (
                                    <label key={c.id} className={`cursor-pointer px-3 py-1.5 rounded-lg border text-sm transition select-none ${newP.category_id === c.id ? 'bg-orange-500 text-white border-orange-600 shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                                        <input type="radio" className="hidden" checked={newP.category_id === c.id} onChange={()=>setNewP({...newP, category_id:c.id})} /> {c.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4"><label className="text-xs font-bold text-gray-500 ml-1">รูปภาพ</label><input value={newP.icon} onChange={e=>setNewP({...newP, icon:e.target.value})} placeholder="ใส่ลิงก์รูปภาพ (https://...)" className="w-full p-2.5 border rounded-lg text-sm"/></div>
                        <button onClick={handleAddProduct} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-md transition transform active:scale-95">+ บันทึกเมนูใหม่</button>
                    </div>
                    {/* Products Table */}
                    <div className="overflow-y-auto max-h-[500px] pr-2">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10"><tr><th className="text-left py-2 px-3">สินค้า</th><th className="text-right py-2 px-3">ราคา</th><th className="text-right py-2 px-3">จัดการ</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition group">
                                        <td className="py-3 px-3 flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                                                {p.icon && p.icon.startsWith('http') ? <img src={p.icon} className="w-full h-full object-cover"/> : <span className="text-2xl">{p.icon}</span>}
                                            </div>
                                            <div><div className="font-bold text-gray-800">{p.name}</div><div className="text-xs text-gray-400">{p.category_name}</div></div>
                                        </td>
                                        <td className="text-right font-bold text-gray-700">{p.price}.-</td>
                                        <td className="text-right px-3"><button onClick={()=>setDeleteData({type:'product',id:p.id,message:`ลบเมนู '${p.name}'?`}) || setShowDeleteModal(true)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition">🗑️</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Orders Column */}
            <div className="col-span-12 lg:col-span-5">
                <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <h2 className="text-xl font-bold text-green-700 flex items-center gap-2"><span>🔔</span> ออเดอร์ล่าสุด</h2>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full animate-pulse">{orders.length} รายการ</span>
                    </div>
                    <div className="overflow-y-auto max-h-[800px] flex-1 space-y-4 pr-1">
                        {orders.length > 0 ? orders.map(o => (
                            <div key={o.id} className="border border-green-200 rounded-xl p-4 bg-green-50/50 hover:shadow-md transition duration-300 relative">
                                <div className="flex justify-between items-start mb-3 border-b border-green-200 pb-2">
                                    <div><span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">Queue #{o.id}</span><span className="text-xs text-gray-500 ml-2">🕒 {formatTime(o.created_at)}</span></div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xl font-extrabold text-green-700">{Number(o.total).toLocaleString()}.-</div>
                                        <button onClick={()=>setOrders(prev=>prev.map(po=>po.id===o.id?{...po,showNote:!po.showNote}:po))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-green-200/50 transition text-gray-400 hover:text-green-700">
                                            <span className={`transform transition-transform duration-200 text-sm ${o.showNote?'rotate-180':''}`}>▼</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-3">
                                    {o.items && o.items.map((item,i) => (
                                        <div key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg border border-green-100">
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-gray-700">{item.name}</div>
                                                {item.sweetness && <span className="text-[10px] text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">หวาน {item.sweetness}</span>}
                                                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 rounded">x{item.qty || item.quantity || 1}</span>
                                            </div>
                                            <div className="text-gray-500 font-medium">{((Number(item.price)||0) * (Number(item.qty || item.quantity)||1)).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                                {o.showNote && <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-800 shadow-inner animate-[slideDown_0.2s_ease-out]"><div className="text-xs font-bold text-yellow-600 mb-1">💬 ข้อความจากลูกค้า:</div>{o.note || 'ไม่มีข้อความระบุ'}</div>}
                                <div className="flex justify-end pt-2 border-t border-green-200/50">
                                    <button onClick={()=>setDeleteData({type:'order',id:o.id,message:`ต้องการลบออเดอร์ Queue #${o.id}?`}) || setShowDeleteModal(true)} className="text-xs font-bold text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-400 transition flex items-center gap-1">🗑️ ลบออเดอร์</button>
                                </div>
                            </div>
                        )) : <div className="flex flex-col items-center justify-center h-48 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl"><span className="text-4xl mb-2 opacity-50">😴</span><p class="text-sm">ยังไม่มีออเดอร์เข้ามา</p></div>}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}