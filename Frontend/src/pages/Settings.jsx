import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Mail, Phone, Save, ArrowLeft, Edit3 } from 'lucide-react';
import { UserDataContext } from '../context/UserContext';
import { UtilityDataContext } from '../context/UtilityContext';
import NavLinkContent from './NavLinkContent';
import { showToast } from '../utils/toast.js';
import axios from 'axios';

const Settings = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);
  const { utility, setUtility } = useContext(UtilityDataContext);
  
  // Only for regular users, not providers
  const currentUserData = localStorage.getItem('userData');
  const currentUtilityData = localStorage.getItem('utilityData');
  
  // Redirect providers to their own settings page
  useEffect(() => {
    if (currentUtilityData && !currentUserData) {
      navigate('/provider-settings');
      return;
    }
  }, [navigate, currentUtilityData, currentUserData]);
  
  const isProvider = false; // This page is only for users
  const currentUser = user;
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    profileImage: ''
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);


  // Load current user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      let userData = null;
      
      if (isProvider && currentUtilityData) {
        userData = JSON.parse(currentUtilityData);
      } else if (!isProvider && currentUserData) {
        userData = JSON.parse(currentUserData);
      }
      
      if (userData) {
        setFormData({
          firstname: userData.fullname?.firstname || '',
          lastname: userData.fullname?.lastname || '',
          email: userData.email || '',
          phone: userData.phone || userData.contact || '',
          profileImage: userData.profileImage || ''
        });
        setImagePreview(userData.profileImage || '');
      }
    };
    
    loadUserData();
  }, [isProvider, currentUserData, currentUtilityData]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          profileImage: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.firstname || !formData.lastname || !formData.email) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    setLoading(true);
    
    try {
      // Get current user data from localStorage
      const currentData = isProvider 
        ? JSON.parse(localStorage.getItem('utilityData') || '{}')
        : JSON.parse(localStorage.getItem('userData') || '{}');
      
      const updatedUser = {
        ...currentData,
        fullname: {
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim()
        },
        email: formData.email.trim(),
        [isProvider ? 'contact' : 'phone']: formData.phone.trim(),
        profileImage: formData.profileImage
      };

      // Update localStorage first
      if (isProvider) {
        localStorage.setItem('utilityData', JSON.stringify(updatedUser));
        setUtility(updatedUser);
      } else {
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      // Force context update
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 100);

      // Save to database
      try {
        const token = localStorage.getItem('userToken');
        if (token) {
          const baseUrl = 'https://fixify-major-project.onrender.com';
          const endpoint = isProvider 
            ? `${baseUrl}/utilities/update-profile`
            : `${baseUrl}/users/update-profile`;
          
          const response = await axios.put(endpoint, updatedUser, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.status === 200) {
            console.log('Profile saved to database successfully');
          }
        }
      } catch (apiError) {
        console.error('Database save failed:', apiError);
        // Still continue with local save
      }
      
      // Success toast and redirect to dashboard
      showToast('Profile updated successfully!', 'success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Save failed:', error);
      showToast('Failed to save changes. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <NavLinkContent />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl hover:bg-white/60 transition-all mr-4"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#0047AB] to-[#10B981] bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-center">
                <Camera className="w-5 h-5 mr-2" />
                Profile Photo
              </h3>
              
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-[#0047AB] to-[#10B981] flex items-center justify-center mx-auto shadow-2xl border-4 border-white">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-[#10B981] p-3 rounded-full cursor-pointer hover:bg-[#059669] transition-all duration-300 shadow-lg hover:scale-110">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              
           
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Edit3 className="w-5 h-5 mr-2" />
                Personal Information
              </h3>

              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent transition-all font-medium"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent transition-all font-medium"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent transition-all font-medium bg-gray-50"
                      placeholder="Enter your email address"
                      required
                      readOnly
                      title="Email cannot be changed for security reasons"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent transition-all font-medium"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-[#0047AB] to-[#10B981] text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;