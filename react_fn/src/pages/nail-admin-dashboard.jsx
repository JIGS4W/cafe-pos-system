import React, { useState } from 'react';
import { 
  Home, Calendar, Scissors, Image, Star, Menu, X, 
  DollarSign, Users, TrendingUp, Eye, Check, XCircle,
  Plus, Edit2, Trash2, Upload, Clock, MapPin
} from 'lucide-react';

// Mock Data
const mockBookings = [
  {
    id: 'BK001',
    customerName: 'AppleJK',
    service: 'Gel Polish',
    date: '2026-02-03',
    time: '10:00 AM',
    price: 350,
    status: 'Waiting Verification',
    paymentSlip: 'https://images.unsplash.com/photo-1554224311-beee460c201f?w=400',
  },
  {
    id: 'BK002',
    customerName: 'Sarah Chen',
    service: 'PVC Extension',
    date: '2026-02-03',
    time: '02:00 PM',
    price: 800,
    status: 'Confirmed',
    paymentSlip: 'https://images.unsplash.com/photo-1554224311-beee460c201f?w=400',
  },
  {
    id: 'BK003',
    customerName: 'Emma Wilson',
    service: 'Nail Art Premium',
    date: '2026-02-02',
    time: '11:30 AM',
    price: 650,
    status: 'Completed',
    paymentSlip: null,
  },
  {
    id: 'BK004',
    customerName: 'Lisa Park',
    service: 'Gel Polish',
    date: '2026-02-04',
    time: '09:00 AM',
    price: 350,
    status: 'Pending',
    paymentSlip: null,
  },
];

const mockServices = [
  { id: 1, name: 'Gel Polish', price: 350, duration: 60, active: true },
  { id: 2, name: 'PVC Extension', price: 800, duration: 120, active: true },
  { id: 3, name: 'Nail Art Premium', price: 650, duration: 90, active: true },
  { id: 4, name: 'Manicure Basic', price: 250, duration: 45, active: true },
  { id: 5, name: 'Pedicure Spa', price: 500, duration: 75, active: false },
];

const mockSchedule = [
  { date: '2026-02-03', time: '09:00 AM', status: 'Available' },
  { date: '2026-02-03', time: '10:00 AM', status: 'Booked', customer: 'AppleJK' },
  { date: '2026-02-03', time: '11:00 AM', status: 'Available' },
  { date: '2026-02-03', time: '12:00 PM', status: 'Busy' },
  { date: '2026-02-03', time: '01:00 PM', status: 'Available' },
  { date: '2026-02-03', time: '02:00 PM', status: 'Booked', customer: 'Sarah Chen' },
  { date: '2026-02-03', time: '03:00 PM', status: 'Available' },
  { date: '2026-02-03', time: '04:00 PM', status: 'Busy' },
];

const mockGallery = [
  { id: 1, url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', caption: 'Pastel French Tips' },
  { id: 2, url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400', caption: 'Rose Gold Glitter' },
  { id: 3, url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400', caption: 'Floral Nail Art' },
  { id: 4, url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400', caption: 'Marble Effect' },
  { id: 5, url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400', caption: 'Ombre Pink' },
  { id: 6, url: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=400', caption: 'Minimalist Design' },
];

const mockReviews = [
  { id: 1, customerName: 'AppleJK', rating: 5, comment: 'Amazing service! The nail art was perfect and the artist was very professional.', date: '2026-01-28' },
  { id: 2, customerName: 'Sarah Chen', rating: 5, comment: 'Love my new nails! Very clean studio and friendly staff.', date: '2026-01-25' },
  { id: 3, customerName: 'Emma Wilson', rating: 4, comment: 'Great work but had to wait a bit longer than expected. Overall satisfied!', date: '2026-01-20' },
  { id: 4, customerName: 'Lisa Park', rating: 5, comment: 'Best nail salon in town! Highly recommend the gel polish service.', date: '2026-01-15' },
];

const NailArtistDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookings, setBookings] = useState(mockBookings);
  const [services, setServices] = useState(mockServices);
  const [schedule, setSchedule] = useState(mockSchedule);
  const [gallery, setGallery] = useState(mockGallery);
  const [reviews] = useState(mockReviews);
  
  // Modal states
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  // Booking actions
  const handleViewSlip = (slip) => {
    setSelectedSlip(slip);
    setShowSlipModal(true);
  };

  const handleApproveBooking = (bookingId) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'Confirmed' } : b
    ));
  };

  const handleRejectBooking = (bookingId) => {
    if (confirm('Are you sure you want to reject this booking?')) {
      setBookings(bookings.filter(b => b.id !== bookingId));
    }
  };

  // Schedule actions
  const toggleScheduleStatus = (index) => {
    const updatedSchedule = [...schedule];
    const slot = updatedSchedule[index];
    if (slot.status !== 'Booked') {
      slot.status = slot.status === 'Available' ? 'Busy' : 'Available';
      setSchedule(updatedSchedule);
    }
  };

  // Service actions
  const handleSaveService = (serviceData) => {
    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? { ...s, ...serviceData } : s));
    } else {
      setServices([...services, { id: Date.now(), ...serviceData, active: true }]);
    }
    setShowServiceModal(false);
    setEditingService(null);
  };

  const handleDeleteService = (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const toggleServiceActive = (id) => {
    setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  // Calculate stats
  const todayBookings = bookings.filter(b => b.date === '2026-02-03').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'Completed' || b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.price, 0);
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-cream-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 border-b border-rose-100">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                  Nail Studio
                </h1>
                <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-rose-50 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} className="text-rose-400" /> : <Menu size={20} className="text-rose-400" />}
            </button>
          </div>
        </div>

        <nav className="p-4">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-rose-50'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
          {/* Dashboard Overview */}
          {activeMenu === 'dashboard' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-rose-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Today's Bookings</p>
                      <p className="text-3xl font-bold text-gray-800">{todayBookings}</p>
                    </div>
                    <div className="bg-rose-100 p-4 rounded-xl">
                      <Calendar className="text-rose-400" size={28} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-pink-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-800">฿{totalRevenue}</p>
                    </div>
                    <div className="bg-pink-100 p-4 rounded-xl">
                      <DollarSign className="text-pink-400" size={28} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-amber-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Shop Rating</p>
                      <p className="text-3xl font-bold text-gray-800">{avgRating} ⭐</p>
                    </div>
                    <div className="bg-amber-100 p-4 rounded-xl">
                      <Star className="text-amber-400" size={28} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Customer</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Service</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date & Time</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map(booking => (
                        <tr key={booking.id} className="border-b border-gray-100 hover:bg-rose-50 transition-colors">
                          <td className="py-3 px-4">{booking.customerName}</td>
                          <td className="py-3 px-4">{booking.service}</td>
                          <td className="py-3 px-4">{booking.date} {booking.time}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'Waiting Verification' ? 'bg-yellow-100 text-yellow-700' :
                              booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Booking Management */}
          {activeMenu === 'bookings' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Booking Management</h2>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-rose-200">
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Booking ID</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Customer</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Service</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date & Time</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Price</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Payment</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(booking => (
                        <tr key={booking.id} className="border-b border-gray-100 hover:bg-rose-50 transition-colors">
                          <td className="py-3 px-4 font-semibold text-rose-600">{booking.id}</td>
                          <td className="py-3 px-4">{booking.customerName}</td>
                          <td className="py-3 px-4">{booking.service}</td>
                          <td className="py-3 px-4">{booking.date}<br/><span className="text-sm text-gray-500">{booking.time}</span></td>
                          <td className="py-3 px-4 font-semibold">฿{booking.price}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'Waiting Verification' ? 'bg-yellow-100 text-yellow-700' :
                              booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {booking.paymentSlip ? (
                              <button
                                onClick={() => handleViewSlip(booking.paymentSlip)}
                                className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium"
                              >
                                <Eye size={16} />
                                View Slip
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">No slip</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {booking.status === 'Waiting Verification' && (
                                <button
                                  onClick={() => handleApproveBooking(booking.id)}
                                  className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <Check size={18} />
                                </button>
                              )}
                              {booking.status !== 'Completed' && (
                                <button
                                  onClick={() => handleRejectBooking(booking.id)}
                                  className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Management */}
          {activeMenu === 'schedule' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Schedule Management</h2>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-rose-400 rounded"></div>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span>Busy</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {schedule.map((slot, index) => (
                    <div
                      key={index}
                      onClick={() => toggleScheduleStatus(index)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        slot.status === 'Available' 
                          ? 'bg-green-50 border-green-300 hover:bg-green-100' 
                          : slot.status === 'Booked'
                          ? 'bg-rose-50 border-rose-300 cursor-not-allowed'
                          : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">{slot.time}</span>
                        <Clock size={16} className="text-gray-500" />
                      </div>
                      <div className="text-sm">
                        <span className={`font-semibold ${
                          slot.status === 'Available' ? 'text-green-600' :
                          slot.status === 'Booked' ? 'text-rose-600' :
                          'text-gray-600'
                        }`}>
                          {slot.status}
                        </span>
                        {slot.customer && (
                          <p className="text-xs text-gray-600 mt-1">Customer: {slot.customer}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">Click on a time slot to toggle between Available and Busy (Booked slots cannot be changed)</p>
              </div>
            </div>
          )}

          {/* Service Management */}
          {activeMenu === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Service Menu</h2>
                <button
                  onClick={() => {
                    setEditingService(null);
                    setShowServiceModal(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-pink-400 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus size={20} />
                  Add Service
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <div key={service.id} className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-rose-400">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{service.name}</h3>
                        <p className="text-2xl font-bold text-rose-600 mt-2">฿{service.price}</p>
                        <p className="text-sm text-gray-500 mt-1">{service.duration} minutes</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingService(service);
                            setShowServiceModal(true);
                          }}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Active Status</span>
                      <button
                        onClick={() => toggleServiceActive(service.id)}
                        className={`px-4 py-1 rounded-full text-xs font-semibold transition-colors ${
                          service.active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {service.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {activeMenu === 'gallery' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Portfolio Gallery</h2>
                <button
                  onClick={() => setShowGalleryModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-rose-400 to-pink-400 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  <Upload size={20} />
                  Upload Photo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map(photo => (
                  <div key={photo.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <img src={photo.url} alt={photo.caption} className="w-full h-64 object-cover" />
                    <div className="p-4">
                      <p className="text-gray-700 font-medium">{photo.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeMenu === 'reviews' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{review.customerName}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-500">({review.rating}/5)</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Slip Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Payment Slip</h3>
              <button
                onClick={() => setShowSlipModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <img src={selectedSlip} alt="Payment Slip" className="w-full rounded-xl" />
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <ServiceModal
          service={editingService}
          onSave={handleSaveService}
          onClose={() => {
            setShowServiceModal(false);
            setEditingService(null);
          }}
        />
      )}

      {/* Gallery Upload Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Upload Photo</h3>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
                <input type="file" accept="image/*" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Caption</label>
                <input type="text" placeholder="Enter photo caption" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="w-full bg-gradient-to-r from-rose-400 to-pink-400 text-white py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Service Modal Component
const ServiceModal = ({ service, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    price: service?.price || '',
    duration: service?.duration || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {service ? 'Edit Service' : 'Add New Service'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Service Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Gel Polish"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (THB)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
              placeholder="350"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Minutes)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              placeholder="60"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white py-3 rounded-xl hover:shadow-lg transition-all"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NailArtistDashboard;
