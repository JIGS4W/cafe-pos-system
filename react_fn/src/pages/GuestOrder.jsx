import React, { useState, useEffect, useMemo } from 'react';

export default function GuestOrder() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showCart, setShowCart] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [orderNote, setOrderNote] = useState('');
  const [currentQueue, setCurrentQueue] = useState(null);
  const [currentP, setCurrentP] = useState(null); // สินค้าที่กำลังเลือก Option
  const [sweetLevel, setSweetLevel] = useState('ปกติ');

  const fetchAPI = async (url, options={}) => {
    try {
      const res = await fetch(url, options);
      return await res.json();
    } catch (e) { return null; }
  };

  const loadData = async () => {
    const [c, p] = await Promise.all([
      fetchAPI('/api/categories'),
      fetchAPI('/api/products')
    ]);
    if(c) setCategories(c);
    if(p) setProducts(p);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategory ? p.category_id === selectedCategory : true;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const openOptionModal = (product) => {
    if (product.has_sweetness) {
      setCurrentP(product);
      setSweetLevel('ปกติ');
    } else {
      addToCart(product);
    }
  };

  const confirmAddToCart = () => {
    addToCart(currentP, sweetLevel);
    setCurrentP(null);
  };

  const addToCart = (product, sweetness = null) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.sweetness === sweetness);
      if (existing) {
        return prev.map(item => (item.id === product.id && item.sweetness === sweetness) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, sweetness }];
    });
  };

  const updateQty = (index, change) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart[index].quantity += change;
      if (newCart[index].quantity <= 0) newCart.splice(index, 1);
      return newCart;
    });
  };

  const submitOrder = async () => {
    if(cart.length === 0) return;
    const payload = { items: cart, total: cartTotal, note: orderNote };
    const res = await fetchAPI('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if(res && res.success) {
      setCurrentQueue(res.id);
      setShowOrderModal(false);
      setShowSuccessModal(true);
      setCart([]);
      setOrderNote('');
      setTimeout(() => setShowSuccessModal(false), 3000);
    } else {
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="bg-gray-50 h-screen flex flex-col font-sans overflow-hidden">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full animate-[popIn_0.3s_ease-out]">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">สั่งอาหารสำเร็จ!</h2>
            <p className="text-gray-500 mb-4">คิวของคุณคือ</p>
            <div className="text-5xl font-extrabold text-green-600 mb-6">#{currentQueue}</div>
            <p className="text-sm text-gray-400">กรุณารอเรียกคิวสักครู่...</p>
          </div>
        </div>
      )}

      {/* Option Modal */}
      {currentP && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
          <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-3xl p-6 animate-[slideDown_0.3s_reverse]">
            <h3 className="text-xl font-bold text-gray-800 mb-4">ระดับความหวาน 🍬</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['ไม่หวาน', 'หวานน้อย', 'ปกติ', 'หวานมาก'].map(level => (
                <button 
                  key={level}
                  onClick={() => setSweetLevel(level)}
                  className={`py-3 rounded-xl border font-bold transition ${sweetLevel === level ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 hover:bg-orange-50'}`}
                >
                  {level}
                </button>
              ))}
            </div>
            <button onClick={confirmAddToCart} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg">ยืนยัน</button>
          </div>
        </div>
      )}

      {/* Order Confirm Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="p-4 border-b flex justify-between items-center shadow-sm">
            <h2 className="text-xl font-bold">สรุปรายการสั่งซื้อ</h2>
            <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b pb-4">
                <div>
                  <div className="font-bold text-lg text-gray-800">{item.name}</div>
                  {item.sweetness && <div className="text-sm text-orange-600">หวาน: {item.sweetness}</div>}
                  <div className="text-gray-500">{item.price}.-</div>
                </div>
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => updateQty(i, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow text-orange-600 font-bold">-</button>
                  <span className="font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(i, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow text-green-600 font-bold">+</button>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <label className="text-sm font-bold text-gray-500 mb-2 block">ข้อความถึงร้านค้า (ถ้ามี)</label>
              <textarea 
                value={orderNote}
                onChange={e => setOrderNote(e.target.value)}
                className="w-full bg-gray-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="เช่น ไม่ใส่ผัก, แยกน้ำแข็ง..."
                rows="3"
              ></textarea>
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500">ยอดรวมทั้งหมด</span>
              <span className="text-2xl font-extrabold text-gray-800">{cartTotal.toLocaleString()}.-</span>
            </div>
            <button onClick={submitOrder} className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-orange-700 transition">ยืนยันการสั่งซื้อ</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-none p-4 bg-white shadow-sm z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Cafe POS ☕</h1>
            <p className="text-xs text-gray-400">สั่งง่าย ได้ไว อร่อยถูกใจ</p>
          </div>
          {/* Cart Icon */}
          <button onClick={() => setShowOrderModal(true)} className="relative p-2">
            <div className="text-3xl">🛍️</div>
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{cartCount}</span>}
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเมนู..." 
            className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition"
          />
          <span className="absolute left-3 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex-none px-4 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide bg-white border-b">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-bold mr-2 transition ${selectedCategory === null ? 'bg-gray-800 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
        >
          ทั้งหมด
        </button>
        {categories.map(c => (
          <button 
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold mr-2 transition ${selectedCategory === c.id ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(p => (
            <div key={p.id} onClick={() => openOptionModal(p)} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 active:scale-95 transition cursor-pointer">
              <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center text-4xl">
                {p.icon && p.icon.startsWith('http') ? <img src={p.icon} className="w-full h-full object-cover" /> : p.icon || '☕'}
              </div>
              <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{p.name}</h3>
              <p className="text-xs text-gray-400 mb-2">{p.category_name}</p>
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-orange-600">{p.price}.-</span>
                <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">+</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Bar (If items in cart) */}
      {cartCount > 0 && !showOrderModal && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button onClick={() => setShowOrderModal(true)} className="w-full bg-gray-900 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center animate-[popIn_0.3s_ease-out]">
            <div className="flex items-center gap-3">
              <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{cartCount}</span>
              <span className="font-bold">ดูตะกร้าสินค้า</span>
            </div>
            <span className="font-bold text-lg">{cartTotal.toLocaleString()}.-</span>
          </button>
        </div>
      )}
    </div>
  );
}