import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import NavLinkContent from "./NavLinkContent";
import DashboardHeroShimmer from "../components/DashboardHeroShimmer";
import { Calendar, Clock, User, MapPin, Phone, Mail, Star, TrendingUp, CheckCircle, XCircle, AlertCircle, MessageSquare } from "lucide-react";

export default function UserDashboard() {
  const { user, isLoading: userLoading } = useContext(UserDataContext);
  const [bookings, setBookings] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ bookingId: '', rating: 5, comment: '' });
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Force shimmer display for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setDashboardLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const userId = user?._id;

  // Fetch user bookings
  useEffect(() => {
    if (!userId) return;

    const fetchBookings = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, '');
        const res = await axios.get(
          `${baseUrl}/bookings/user/${userId}`
        );
        const bookingsData = res.data.bookings || res.data || [];
        setBookings(bookingsData);
      } catch (err) {
        console.error("❌ Failed to fetch bookings:", err);
         setBookings([]); 
      } finally {
        // Don't set loading false here, let the timer handle it
      }
    };

    fetchBookings();
  }, [userId]);

  // Cancel a booking
  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, '');
      await axios.post(
        `${baseUrl}/bookings/${bookingId}/action`,
        { action: "cancel" }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
      );
    } catch (err) {
      console.error("❌ Failed to cancel booking:", err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  // Submit feedback
  const submitFeedback = async () => {
    if (!feedbackData.comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        alert('Please login to submit feedback');
        return;
      }

      const booking = bookings.find(b => b._id === feedbackData.bookingId);
      const submitData = {
        userId: userId,
        bookingId: feedbackData.bookingId,
        rating: feedbackData.rating,
        comment: feedbackData.comment.trim(),
        serviceCategory: booking?.serviceCategory || booking?.category || 'general'
      };

      console.log('Submitting feedback:', submitData);

      const baseUrl = import.meta.env.VITE_BASE_URL.replace(/\/$/, '');
      const response = await axios.post(
        `${baseUrl}/feedback/submit`,
        submitData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Feedback response:', response.data);

      setShowFeedbackModal(false);
      setFeedbackData({ bookingId: '', rating: 5, comment: '' });
      alert('Feedback submitted successfully!');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      alert(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    }
  };

  // Open feedback modal
  const openFeedbackModal = (bookingId) => {
    console.log('Opening feedback modal for booking:', bookingId);
    setFeedbackData({ bookingId, rating: 5, comment: '' });
    setShowFeedbackModal(true);
    console.log('Modal state set to true');
  };

  if (userLoading) {
    return (
      <div className="min-h-screen relative" style={{
        background: 'linear-gradient(135deg, #0047AB 0%, #007B89 25%, #10B981 50%, #007B89 75%, #0047AB 100%)'
      }}>
        <NavLinkContent />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: '#10B981' }}></div>
            <p className="text-lg font-semibold text-white">Loading your dashboard...</p>
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
    rejected: bookings.filter(b => b.status === 'rejected').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #0047AB 0%, #007B89 25%, #10B981 50%, #007B89 75%, #0047AB 100%)'
    }}>
      <NavLinkContent />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full filter blur-3xl opacity-40" style={{
          background: 'radial-gradient(circle, #10B981 0%, transparent 70%)'
        }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full filter blur-3xl opacity-40" style={{
          background: 'radial-gradient(circle, #0047AB 0%, transparent 70%)'
        }}></div>
        <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full filter blur-3xl opacity-35" style={{
          background: 'radial-gradient(circle, #007B89 0%, transparent 70%)'
        }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full filter blur-3xl opacity-35" style={{
          background: 'radial-gradient(circle, #10B981 0%, transparent 70%)'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full filter blur-3xl opacity-30" style={{
          background: 'radial-gradient(circle, #0047AB 0%, transparent 70%)'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          {dashboardLoading ? (
            <DashboardHeroShimmer />
          ) : (
            <div className="backdrop-blur-2xl rounded-[2rem] p-8 relative" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-3xl shadow-xl mr-4 backdrop-blur-xl border border-white/50" style={{
                    background: 'linear-gradient(135deg, #0047AB 0%, #10B981 100%)',
                    boxShadow: '0 10px 40px rgba(16,185,129,0.6)'
                  }}>
                    <User className="h-8 w-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-1 tracking-tight">
                      Welcome back, {user?.fullname?.firstname || 'User'}!
                    </h1>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="font-medium">{user?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="text-center p-4 backdrop-blur-xl rounded-2xl border border-gray-200/50" style={{
                  background: 'rgba(249, 250, 251, 0.8)'
                }}>
                  <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                  <div className="text-xs text-gray-600 font-semibold">Total</div>
                </div>
                <div className="text-center p-4 backdrop-blur-xl rounded-2xl border border-amber-200/50" style={{
                  background: 'rgba(254, 243, 199, 0.8)'
                }}>
                  <div className="text-2xl font-bold text-amber-800">{stats.pending}</div>
                  <div className="text-xs text-amber-700 font-semibold">Pending</div>
                </div>
                <div className="text-center p-4 backdrop-blur-xl rounded-2xl border border-emerald-200/50" style={{
                  background: 'rgba(209, 250, 229, 0.8)'
                }}>
                  <div className="text-2xl font-bold text-emerald-800">{stats.confirmed}</div>
                  <div className="text-xs text-emerald-700 font-semibold">Confirmed</div>
                </div>
                <div className="text-center p-4 backdrop-blur-xl rounded-2xl border border-blue-200/50" style={{
                  background: 'rgba(219, 234, 254, 0.8)'
                }}>
                  <div className="text-2xl font-bold text-blue-800">{stats.completed}</div>
                  <div className="text-xs text-blue-700 font-semibold">Completed</div>
                </div>
                <div className="text-center p-4 backdrop-blur-xl rounded-2xl border border-red-200/50" style={{
                  background: 'rgba(254, 226, 226, 0.8)'
                }}>
                  <div className="text-2xl font-bold text-red-800">{stats.rejected}</div>
                  <div className="text-xs text-red-700 font-semibold">Rejected</div>
                </div>
                <div className="text-center p-4 backdrop-blur-xl rounded-2xl border border-gray-300/50" style={{
                  background: 'rgba(229, 231, 235, 0.8)'
                }}>
                  <div className="text-2xl font-bold text-gray-800">{stats.cancelled}</div>
                  <div className="text-xs text-gray-700 font-semibold">Cancelled</div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Bookings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center tracking-tight">
              <Calendar className="w-8 h-8 mr-3 text-[#0047AB]" strokeWidth={2.5} />
              Your Bookings
            </h2>
          </div>
          
          {bookings.length === 0 ? (
            <div className="backdrop-blur-2xl rounded-[2rem] p-12 text-center relative" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <div className="max-w-md mx-auto">
                <div className="p-8 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center backdrop-blur-xl border border-green-300/50" style={{
                  background: 'rgba(16, 185, 129, 0.25)',
                  boxShadow: '0 10px 40px rgba(16,185,129,0.4)'
                }}>
                  <Calendar className="w-16 h-16 text-green-500" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No bookings yet</h3>
                <p className="text-gray-600 mb-8">Start by booking your first service and we'll show all your appointments here.</p>
                <button 
                  onClick={() => window.location.href = '/services'}
                  className="px-8 py-4 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105" style={{
                  background: 'linear-gradient(135deg, #0047AB 0%, #10B981 100%)',
                  boxShadow: '0 10px 40px rgba(16,185,129,0.6)'
                }}>
                  Book Your First Service
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="group relative backdrop-blur-2xl rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl overflow-hidden border-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.8)',
                    borderColor: b.status === 'pending' ? '#f59e0b' : b.status === 'confirmed' ? '#10b981' : b.status === 'completed' ? '#3b82f6' : b.status === 'rejected' ? '#ef4444' : '#6b7280'
                  }}
                >
                  {/* Status Badge - Top Right */}
                  <div className="absolute top-6 right-6 z-10">
                    <div className="px-4 py-2 rounded-full text-xs font-bold border-2 shadow-lg backdrop-blur-xl" style={{
                      backgroundColor: b.status === "pending" ? 'rgba(254, 243, 199, 0.9)' : b.status === "confirmed" ? 'rgba(209, 250, 229, 0.9)' : b.status === "completed" ? 'rgba(219, 234, 254, 0.9)' : b.status === "rejected" ? 'rgba(254, 226, 226, 0.9)' : 'rgba(229, 231, 235, 0.9)',
                      borderColor: b.status === 'pending' ? '#f59e0b' : b.status === 'confirmed' ? '#10b981' : b.status === 'completed' ? '#3b82f6' : b.status === 'rejected' ? '#ef4444' : '#6b7280',
                      color: b.status === 'pending' ? '#92400e' : b.status === 'confirmed' ? '#065f46' : b.status === 'completed' ? '#1e40af' : b.status === 'rejected' ? '#991b1b' : '#374151'
                    }}>
                      <div className="flex items-center">
                        {getStatusIcon(b.status)}
                        <span className="ml-2 capitalize tracking-wide">{b.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Header */}
                  <div className="mb-6 relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="p-4 rounded-3xl shadow-xl mr-4 backdrop-blur-xl border-2" style={{
                        background: `linear-gradient(135deg, ${b.status === 'pending' ? '#f59e0b' : b.status === 'confirmed' ? '#10b981' : b.status === 'completed' ? '#3b82f6' : b.status === 'rejected' ? '#ef4444' : '#6b7280'} 0%, ${b.status === 'pending' ? '#d97706' : b.status === 'confirmed' ? '#059669' : b.status === 'completed' ? '#2563eb' : b.status === 'rejected' ? '#dc2626' : '#4b5563'} 100%)`,
                        boxShadow: `0 15px 40px ${b.status === 'pending' ? 'rgba(245, 158, 11, 0.4)' : b.status === 'confirmed' ? 'rgba(16, 185, 129, 0.4)' : b.status === 'completed' ? 'rgba(59, 130, 246, 0.4)' : b.status === 'rejected' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(107, 114, 128, 0.4)'}`,
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}>
                        <Calendar className="h-8 w-8 text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-1">{b.serviceCategory?.charAt(0).toUpperCase() + b.serviceCategory?.slice(1) || 'Service'}</h3>
                        <p className="text-sm text-gray-500 font-semibold tracking-wide">Professional Service</p>
                      </div>
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="mb-6 p-6 rounded-3xl border-2 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 relative z-10" style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
                    borderColor: 'rgba(16, 185, 129, 0.2)'
                  }}>
                    <div className="flex items-center mb-3">
                      <User className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="font-semibold text-gray-800">Provider:</span>
                    </div>
                    {b.providerId ? (
                      <>
                        <p className="text-gray-900 font-medium ml-6 mb-2">
                          {b.providerId.fullname.firstname} {b.providerId.fullname.lastname}
                        </p>
                        <div className="flex items-center ml-6 mb-2">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600 text-sm">{b.providerId.email}</span>
                        </div>
                        <div className="flex items-center ml-6">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600 text-sm">{b.providerId.contact}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-600 ml-6">Not assigned yet</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {b.status === "pending" && (
                    <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <button
                        className="w-full text-white py-3 px-6 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          boxShadow: '0 10px 40px rgba(239,68,68,0.6)'
                        }}
                        onClick={() => cancelBooking(b._id)}
                      >
                        <XCircle className="w-5 h-5 mr-2" strokeWidth={2.5} />
                        Cancel Booking
                      </button>
                    </div>
                  )}
                  
                  {b.status === "confirmed" && (
                    <div className="mt-6 pt-4 space-y-3" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => alert(`Booking Details:\nService: ${b.serviceCategory}\nProvider: ${b.providerId?.fullname?.firstname} ${b.providerId?.fullname?.lastname}\nStatus: ${b.status}`)}
                          className="flex-1 text-white py-3 px-4 rounded-2xl font-bold transition-all duration-300 text-sm" style={{
                          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                          boxShadow: '0 8px 30px rgba(59,130,246,0.6)'
                        }}>
                          View Details
                        </button>
                        <button 
                          onClick={() => window.open(`tel:${b.providerId?.contact}`)}
                          className="flex-1 text-white py-3 px-4 rounded-2xl font-bold transition-all duration-300 text-sm" style={{
                          background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                          boxShadow: '0 8px 30px rgba(16,185,129,0.6)'
                        }}>
                          Contact
                        </button>
                      </div>
                      <button
                        className="w-full text-white py-3 px-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          boxShadow: '0 10px 40px rgba(239,68,68,0.6)'
                        }}
                        onClick={() => cancelBooking(b._id)}
                      >
                        <XCircle className="w-5 h-5 mr-2" strokeWidth={2.5} />
                        Cancel Booking
                      </button>
                    </div>
                  )}
                  
                  {b.status === "rejected" && (
                    <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <div className="text-center p-4 rounded-2xl border backdrop-blur-xl" style={{
                        background: 'rgba(254, 226, 226, 0.8)',
                        borderColor: 'rgba(239,68,68,0.3)'
                      }}>
                        <p className="text-red-700 font-medium text-sm mb-3">
                          This booking was declined by the provider
                        </p>
                        <button 
                          onClick={() => window.location.href = '/services'}
                          className="w-full text-white py-3 px-4 rounded-2xl font-bold transition-all duration-300 text-sm" style={{
                          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                          boxShadow: '0 8px 30px rgba(59,130,246,0.6)'
                        }}>
                          Book Another Provider
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {b.status === "completed" && (
                    <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <button
                        className="w-full text-white py-3 px-6 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                          boxShadow: '0 10px 40px rgba(59,130,246,0.6)'
                        }}
                        onClick={() => {
                          console.log('Feedback button clicked for booking:', b._id);
                          openFeedbackModal(b._id);
                        }}
                      >
                        <MessageSquare className="w-5 h-5 mr-2" strokeWidth={2.5} />
                        Add Feedback
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="backdrop-blur-2xl rounded-[2rem] p-8 max-w-md w-full mx-4" style={{
            background: 'rgba(255, 255, 255, 0.98)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.5)'
          }}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Add Your Feedback</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                    className={`text-3xl transition-all duration-200 ${star <= feedbackData.rating ? 'text-amber-400 scale-110' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
              <textarea
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full p-4 border rounded-2xl focus:outline-none font-medium backdrop-blur-xl transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderColor: 'rgba(59,130,246,0.3)',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
                }}
                rows="4"
                placeholder="Share your experience..."
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 px-4 py-3 border rounded-2xl font-bold transition-all duration-300 hover:bg-gray-50"
                style={{ borderColor: 'rgba(0,0,0,0.2)' }}
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="flex-1 px-4 py-3 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  boxShadow: '0 10px 40px rgba(59,130,246,0.6)'
                }}
                disabled={!feedbackData.comment.trim()}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}