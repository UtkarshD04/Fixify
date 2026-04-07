import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Mail, Phone, Save, ArrowLeft, Edit3, Briefcase } from 'lucide-react';
import { UtilityDataContext } from '../context/UtilityContext';
import ProviderNav from '../page/ProviderNav';
import Toast from '../components/Toast';
import axios from 'axios';

const ProviderSettings = () => {
  const navigate = useNavigate();
  const { utility, setUtility } = useContext(UtilityDataContext);
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    contact: '',
    profession: '',
    profileImage: ''
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Load provider data on component mount
  useEffect(() => {
    const loadProviderData = () => {
      const currentUtilityData = sessionStorage.getItem('utilityData');
      
      if (currentUtilityData) {
        const userData = JSON.parse(currentUtilityData);
        setFormData({
          firstname: userData.fullname?.firstname || '',
          lastname: userData.fullname?.lastname || '',
          email: userData.email || '',
          contact: String(userData.contact || ''),
          profession: userData.profession || '',
          profileImage: userData.profileImage || ''
        });
        setImagePreview(userData.profileImage || '');
      }
    };
    
    loadProviderData();
  }, []);

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
      setToast({ message: 'Please fill all required fields', type: 'warning' });
      return;
    }

    setLoading(true);
    
    try {
      const currentData = JSON.parse(sessionStorage.getItem('utilityData') || '{}');
      
      const updatedUtility = {
        ...currentData,
        fullname: {
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim()
        },
        email: formData.email.trim(),
        contact: String(formData.contact || '').trim(),
        profession: formData.profession,
        profileImage: formData.profileImage,
        status: currentData.status || 'inactive' // Preserve existing status
      };
      
      console.log('Updating provider profile:', updatedUtility);

      // Update localStorage first
      sessionStorage.setItem('utilityData', JSON.stringify(updatedUtility));
      localStorage.setItem('tempProviderProfile', JSON.stringify(updatedUtility));
      setUtility(updatedUtility);
      window.dispatchEvent(new Event('storage'));

      // Save to database
      try {
        const token = sessionStorage.getItem('providerToken');
        if (token) {
          const response = await axios.put('https://fixify-major-project.onrender.com/utilities/update-profile', updatedUtility, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.status === 200) {
            console.log('Profile saved to database successfully');
          }
        }
      } catch (dbError) {
        console.log('Database save failed, but local changes preserved');
      }
      
      // Success toast and redirect to provider dashboard
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/provider-board');
      }, 2000);
    } catch (error) {
      console.error('Save failed:', error);
      setToast({ message: 'Failed to save changes. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <ProviderNav />
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full filter blur-3xl opacity-20" style={{
          background: 'radial-gradient(circle, #10b981 0%, transparent 70%)'
        }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full filter blur-3xl opacity-20" style={{
          background: 'radial-gradient(circle, #059669 0%, transparent 70%)'
        }}></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl hover:bg-white/10 transition-all mr-4 backdrop-blur-xl border border-white/20"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-5xl font-black text-white mb-2">
              Provider Settings
            </h1>
            <p className="text-gray-300 text-lg">Manage your professional profile and preferences</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-gray-800/90 rounded-3xl shadow-2xl border border-gray-700/50 p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center">
                <Camera className="w-6 h-6 mr-3 text-green-400" />
                Profile Photo
              </h3>
              
              <div className="relative inline-block mb-6">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto shadow-2xl border-4 border-gray-700">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase className="w-20 h-20 text-white" />
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-green-500 p-4 rounded-full cursor-pointer hover:bg-green-600 transition-all duration-300 shadow-xl hover:scale-110 border-4 border-gray-800">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              <p className="text-gray-300 mb-4 text-lg">
                Click the camera icon to upload a new photo
              </p>
              <p className="text-gray-400 text-sm">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-gray-800/90 rounded-3xl shadow-2xl border border-gray-700/50 p-8">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Edit3 className="w-6 h-6 mr-3 text-green-400" />
                Professional Information
              </h3>

              <div className="space-y-8">
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium text-white placeholder-gray-400"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium text-white placeholder-gray-400"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 bg-gray-600/50 border-2 border-gray-600 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium text-white placeholder-gray-400"
                      placeholder="Enter your email address"
                      required
                      readOnly
                      title="Email cannot be changed for security reasons"
                    />
                  </div>
                </div>

                {/* Contact Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Contact Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium text-white placeholder-gray-400"
                      placeholder="Enter your contact number"
                    />
                  </div>
                </div>

                {/* Profession Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">
                    Profession
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <select
                      name="profession"
                      value={formData.profession}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium text-white"
                      required
                    >
                      <option value="">Select your profession</option>
                      <option value="plumber">Plumber</option>
                      <option value="electrician">Electrician</option>
                      <option value="mechanic">Mechanic</option>
                      <option value="technician">Technician</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-6 pt-8">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 px-8 py-4 border-2 border-gray-600 text-gray-300 rounded-2xl font-bold hover:bg-gray-700/50 transition-all text-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-lg"
                  >
                    <Save className="w-6 h-6" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProviderSettings;