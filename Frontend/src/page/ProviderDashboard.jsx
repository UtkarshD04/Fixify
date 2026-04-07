import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { UtilityDataContext } from "../context/UtilityContext";
import ProviderNav from "./ProviderNav";
import { 
  User, 
  MapPin, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Power, 
  TrendingUp,
  Briefcase,
  Phone,
  Activity,
  Award,
  Star,
  Zap,
  DollarSign,
  BarChart3,
  Target,
  Users,
  MessageSquare,
  Bell,
  Settings,
  Eye,
  Filter
} from "lucide-react";

let socket;

export default function ProviderDashboard() {
  const { utility: provider, isLoading: providerLoading } = useContext(UtilityDataContext);
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("inactive");
  const [analytics, setAnalytics] = useState({
    successRate: 0,
    avgResponseTime: '0h',
    avgRating: 4.8,
    earnings: { today: 0, thisWeek: 0, thisMonth: 0, total: 0 }
  });
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  
  const providerId = provider?._id;

  // Fetch provider status
  useEffect(() => {
    if (!providerId) return;
    
    const fetchProviderStatus = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/utilities/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("providerToken")}`,
            },
          }
        );
        setStatus(response.data.utility.status || "inactive");
      } catch (err) {
        console.error("❌ Failed to fetch provider status:", err);
      }
    };
    
    fetchProviderStatus();
  }, [providerId]);

  // Fetch bookings and setup socket
  useEffect(() => {
    if (!providerId) return;

    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BASE_URL;
    socket = io(socketUrl);

    socket.emit("registerProvider", providerId);

    const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, '');
    axios
      .get(`${baseUrl}/bookings/provider/${providerId}`)
      .then((res) => setBookings(res.data.bookings))
      .catch((err) => console.error("❌ Fetch bookings failed:", err));

    const handleNewBooking = (booking) => {
      if (booking.providerId === providerId) {
        setBookings((prev) => [booking, ...prev]);
      }
    };

    const handleBookingCancelled = (data) => {
      setBookings((prev) => prev.filter(b => b._id !== data.bookingId));
    };

    socket.on("newBooking", handleNewBooking);
    socket.on("bookingCancelled", handleBookingCancelled);

    return () => {
      if (socket) {
        socket.off("newBooking", handleNewBooking);
        socket.off("bookingCancelled", handleBookingCancelled);
        socket.disconnect();
        socket = null;
      }
    };
  }, [providerId]);

  // Fetch analytics data
  useEffect(() => {
    if (!providerId) return;
    
    const fetchAnalytics = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, '');
        const response = await axios.get(`${baseUrl}/admin/provider-analytics/${providerId}`);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    
    fetchAnalytics();
  }, [providerId]);

  // Update booking status
  const updateBookingStatus = async (bookingId, action) => {
    try {
      console.log(`🔄 Updating booking ${bookingId} with action: ${action}`);
      const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, '');
      const response = await axios.post(`${baseUrl}/bookings/${bookingId}/action`, { action });
      console.log('✅ Response:', response.data);
      
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: response.data.booking.status, providerId: response.data.booking.providerId } : b))
      );
    } catch (err) {
      console.error("❌ Failed to update booking:", err);
      alert('Failed to update booking status. Please try again.');
    }
  };

  // Toggle provider active/inactive
  const toggleProviderStatus = async () => {
    const newStatus = status === "active" ? "inactive" : "active";

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, '');
      const res = await axios.patch(
        `${baseUrl}/utilities/${providerId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("providerToken")}` } }
      );
      setStatus(res.data.utility.status);
    } catch (err) {
      console.error("❌ Failed to update provider status:", err);
    }
  };

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        <ProviderNav />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 rounded-full mx-auto mb-4 animate-spin" style={{borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff'}}></div>
            <p className="text-xl font-bold text-white">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate booking stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    rejected: bookings.filter(b => b.status === 'rejected').length
  };

  // Calculate earnings from real data
  const earnings = analytics.earnings;
  
  // Filtered bookings
  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <ProviderNav />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{
        background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
        animation: 'float 8s ease-in-out infinite'
      }}></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full filter blur-3xl opacity-15 animate-pulse" style={{
        background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
        animation: 'float 10s ease-in-out infinite reverse'
      }}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full filter blur-3xl opacity-20" style={{
        background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)',
        animation: 'float 12s ease-in-out infinite',
        transform: 'translate(-50%, -50%)'
      }}></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-30px) translateX(20px); }
          66% { transform: translateY(20px) translateX(-20px); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .shimmer {
          animation: shimmer 3s infinite;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 1000px 100%;
        }
      `}</style>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Profile Section */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-gray-800/95 rounded-3xl shadow-2xl border border-gray-700/20 p-8 relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="mb-6 lg:mb-0 flex-1">
                <div className="flex items-center mb-6">
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-2xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}></div>
                    <div className="relative w-20 h-20 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}>
                      {provider?.profileImage ? (
                        <img 
                          src={provider.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Briefcase className="h-10 w-10 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="ml-6">
                    <h1 className="text-4xl font-black mb-2 text-white">
                      Welcome, {provider?.fullname?.firstname || 'Provider'}!
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                        <Briefcase className="w-4 h-4 mr-2 text-green-600" />
                        <span className="font-bold text-sm text-green-900">{provider?.profession || 'N/A'}</span>
                      </div>
                      <div className="flex items-center bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                        <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                        <span className="font-semibold text-sm text-emerald-900">{provider?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Settings Button */}
                <div className="mb-4">
                  <button
                    onClick={() => window.location.href = '/provider-settings'}
                    className="flex items-center px-4 py-2 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-xl"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </button>
                </div>
                
                {/* Status Toggle */}
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center px-6 py-3 rounded-xl font-black text-white shadow-xl ${
                    status === "active" 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                      : "bg-gradient-to-r from-gray-400 to-gray-500"
                  }`}>
                    <Power className="w-5 h-5 mr-2" />
                    <span className="text-sm tracking-wider">{status.toUpperCase()}</span>
                  </div>
                  <button
                    onClick={toggleProviderStatus}
                    className="px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl text-white relative overflow-hidden group"
                    style={{
                      background: status === "active" 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}
                  >
                    <span className="relative z-10 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      {status === "active" ? "Go Inactive" : "Go Active"}
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                <div className="text-center p-4 backdrop-blur-lg bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border border-gray-300/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                  <Activity className="w-6 h-6 mx-auto mb-2 text-gray-700 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-black text-gray-800">{stats.total}</div>
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">Total</div>
                </div>
                <div className="text-center p-4 backdrop-blur-lg bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl border border-amber-300/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-amber-700 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-black text-amber-800">{stats.pending}</div>
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wide">Pending</div>
                </div>
                <div className="text-center p-4 backdrop-blur-lg bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl border border-emerald-300/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-700 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-black text-emerald-800">{stats.confirmed}</div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Confirmed</div>
                </div>
                <div className="text-center p-4 backdrop-blur-lg bg-gradient-to-br from-blue-100 to-cyan-200 rounded-2xl border border-blue-300/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                  <Star className="w-6 h-6 mx-auto mb-2 text-blue-700 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-black text-blue-800">{stats.completed}</div>
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wide">Completed</div>
                </div>
                <div className="text-center p-4 backdrop-blur-lg bg-gradient-to-br from-red-100 to-rose-200 rounded-2xl border border-red-300/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                  <XCircle className="w-6 h-6 mx-auto mb-2 text-red-700 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl font-black text-red-800">{stats.rejected}</div>
                  <div className="text-xs font-bold text-red-700 uppercase tracking-wide">Rejected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Dashboard */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-gray-800/95 rounded-3xl shadow-2xl border border-gray-700/20 p-8 relative overflow-hidden">
            <div className="absolute inset-0 shimmer pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-white flex items-center">
                  <DollarSign className="w-8 h-8 mr-3 text-green-600" />
                  Earnings Overview
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-gray-300">Live Data</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Target className="w-8 h-8 mx-auto mb-3 text-green-600" />
                  <div className="text-2xl font-black text-green-800">₹{earnings.today}</div>
                  <div className="text-sm font-bold text-green-600">Today</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <BarChart3 className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                  <div className="text-2xl font-black text-blue-800">₹{earnings.thisWeek}</div>
                  <div className="text-sm font-bold text-blue-600">This Week</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                  <div className="text-2xl font-black text-purple-800">₹{earnings.thisMonth}</div>
                  <div className="text-sm font-bold text-purple-600">This Month</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Award className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                  <div className="text-2xl font-black text-orange-800">₹{earnings.total}</div>
                  <div className="text-sm font-bold text-orange-600">Total Earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <h2 className="text-4xl font-black flex items-center text-white drop-shadow-lg">
              <div className="p-3 rounded-2xl mr-4 backdrop-blur-xl bg-white/20 border border-white/30 shadow-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              Service Requests
            </h2>
            
            {/* Filter and View Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-2">
                <Filter className="w-5 h-5 text-white" />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-transparent text-white font-bold text-sm outline-none"
                >
                  <option value="all" className="text-gray-900">All</option>
                  <option value="pending" className="text-gray-900">Pending</option>
                  <option value="confirmed" className="text-gray-900">Confirmed</option>
                  <option value="completed" className="text-gray-900">Completed</option>
                  <option value="rejected" className="text-gray-900">Rejected</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/30' : 'hover:bg-white/20'}`}
                >
                  <BarChart3 className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/30' : 'hover:bg-white/20'}`}
                >
                  <Eye className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
          
          {filteredBookings.length === 0 ? (
            <div className="backdrop-blur-xl bg-gray-800/95 rounded-3xl shadow-2xl border border-gray-700/20 p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 shimmer pointer-events-none"></div>
              <div className="relative z-10 max-w-md mx-auto">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 rounded-full blur-2xl opacity-50" style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}></div>
                  <div className="relative p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center backdrop-blur-lg bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 shadow-xl">
                    <Calendar className="w-16 h-16 text-green-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-black mb-4 text-white">No service requests yet</h3>
                <p className="mb-8 text-gray-300 text-lg">When customers book your services, they'll appear here for you to manage.</p>
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <Power className="w-5 h-5 mr-2 text-green-600" />
                  <span className="text-sm font-bold text-gray-200">
                    Make sure your status is <span className="text-green-600">ACTIVE</span> to receive bookings
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`${viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}`}>
              {filteredBookings.map((b) => (
                <div
                  key={b._id}
                  className={`backdrop-blur-xl bg-gray-800/95 rounded-2xl shadow-2xl border border-gray-700/20 p-6 hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden group ${
                    viewMode === 'list' ? 'flex items-center gap-6' : ''
                  }`}
                >
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          }}></div>
                          <div className="relative p-3 rounded-xl shadow-lg" style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          }}>
                            <Briefcase className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-black text-white">{b.category}</h3>
                          <p className="text-sm font-semibold text-gray-300">Service Request</p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`flex items-center px-3 py-2 rounded-full text-xs font-bold shadow-lg ${
                        b.status === "pending"
                          ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-300"
                          : b.status === "confirmed"
                          ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-300"
                          : b.status === "completed"
                          ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-300"
                          : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300"
                      }`}>
                        {getStatusIcon(b.status)}
                        <span className="ml-2 capitalize tracking-wide">{b.status}</span>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-4 p-4 rounded-xl backdrop-blur-lg bg-gradient-to-br from-gray-700 to-slate-700 border border-gray-600 shadow-inner">
                      <div className="flex items-center mb-3">
                        <div className="p-1.5 rounded-lg bg-gray-600 border border-gray-500">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-bold text-sm ml-2 text-gray-200">Customer Details</span>
                      </div>
                      <p className="font-bold ml-6 mb-2 text-white">
                        {b.userId?.fullname.firstname} {b.userId?.fullname.lastname}
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center ml-6">
                          <Mail className="w-3.5 h-3.5 mr-2 text-green-400" />
                          <span className="text-xs font-medium text-gray-300">{b.userId?.email}</span>
                        </div>
                        <div className="flex items-center ml-6">
                          <Phone className="w-3.5 h-3.5 mr-2 text-green-400" />
                          <span className="text-xs font-medium text-gray-300">{b.userId?.phone}</span>
                        </div>
                        <div className="flex items-center ml-6">
                          <MapPin className="w-3.5 h-3.5 mr-2 text-green-400" />
                          <span className="text-xs font-medium text-gray-300">{b.location}</span>
                        </div>
                        {b.preferredDate && (
                          <div className="flex items-center ml-6">
                            <Calendar className="w-3.5 h-3.5 mr-2 text-green-400" />
                            <span className="text-xs font-medium text-gray-300">{b.preferredDate}</span>
                          </div>
                        )}
                        {b.preferredTime && (
                          <div className="flex items-center ml-6">
                            <Clock className="w-3.5 h-3.5 mr-2 text-green-400" />
                            <span className="text-xs font-medium text-gray-300">{b.preferredTime}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {b.status === "pending" && (
                      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-600">
                        <button
                          className="flex-1 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg relative overflow-hidden group"
                          onClick={() => updateBookingStatus(b._id, "accept")}
                          style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span>Accept</span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                        <button
                          className="flex-1 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg relative overflow-hidden group"
                          onClick={() => updateBookingStatus(b._id, "reject")}
                          style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}
                        >
                          <XCircle className="w-5 h-5 mr-2" />
                          <span>Reject</span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    )}
                    
                    {b.status === "confirmed" && (
                      <div className="mt-6 pt-4 border-t border-gray-600 space-y-3">
                        <button className="w-full text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl relative overflow-hidden group" style={{background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'}}>
                          <Phone className="w-5 h-5 mr-2" />
                          <span>Contact Customer</span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                        <button
                          className="w-full text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-lg relative overflow-hidden group"
                          onClick={() => updateBookingStatus(b._id, "complete")}
                          style={{background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}}
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span>Complete Service</span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    )}
                    
                    {b.status === "completed" && (
                      <div className="mt-6 pt-4 border-t border-gray-600">
                        <div className="w-full bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 py-3 px-4 rounded-xl font-bold flex items-center justify-center border border-emerald-300 shadow-lg">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Service Completed
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Analytics */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-gray-800/95 rounded-3xl shadow-2xl border border-gray-700/20 p-8 relative overflow-hidden">
            <div className="absolute inset-0 shimmer pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-white flex items-center">
                  <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                  Performance Analytics
                </h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-full border border-slate-600">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-blue-300">{analytics.successRate > 70 ? 'Excellent' : analytics.successRate > 50 ? 'Good' : 'Growing'}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Success Rate */}
                <div className="p-6 bg-gradient-to-br from-slate-700 to-gray-700 rounded-2xl border border-slate-600 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Success Rate</h3>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2">
                    {analytics.successRate}%
                  </div>
                  <p className="text-sm text-gray-300 font-medium">Completed + Confirmed bookings</p>
                  <div className="mt-4 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                      style={{width: `${analytics.successRate}%`}}
                    ></div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="p-6 bg-gradient-to-br from-slate-700 to-gray-700 rounded-2xl border border-slate-600 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Avg Response</h3>
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2">{analytics.avgResponseTime}</div>
                  <p className="text-sm text-gray-300 font-medium">Average response time</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 bg-gray-600 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-3/4 transition-all duration-1000"></div>
                    </div>
                    <span className="text-xs font-bold text-blue-400">Fast</span>
                  </div>
                </div>

                {/* Customer Rating */}
                <div className="p-6 bg-gradient-to-br from-slate-700 to-gray-700 rounded-2xl border border-slate-600 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Rating</h3>
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2 flex items-center">
                    {analytics.avgRating}
                    <Star className="w-6 h-6 text-yellow-400 fill-current ml-2" />
                  </div>
                  <p className="text-sm text-gray-300 font-medium">Customer satisfaction</p>
                  <div className="mt-4 flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= Math.floor(analytics.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}