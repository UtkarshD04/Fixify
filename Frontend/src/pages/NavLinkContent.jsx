import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu as MenuIcon, X as XIcon, User, ChevronDown, Settings } from "lucide-react";
import { UserDataContext } from "../context/UserContext";
import { UtilityDataContext } from "../context/UtilityContext";
import LiveCity from "../components/LiveCity";

const NavLinkContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, setUser } = useContext(UserDataContext);
  const { utility, setUtility } = useContext(UtilityDataContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("providerToken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("userData");
    localStorage.removeItem("utilityData");
    setUser(null);
    setUtility(null);
    setIsMenuOpen(false);
    navigate("/");
  };

  // ✅ Decide who is logged in (check localStorage for current session type)
  const currentUtilityData = localStorage.getItem('utilityData');
  const currentUserData = localStorage.getItem('userData');
  const userToken = localStorage.getItem('userToken');
  const providerToken = localStorage.getItem('providerToken');

  const isProvider = !!providerToken && !!currentUtilityData && !!utility?.email;
  const isUser = !!userToken && !!currentUserData && !!user?.email;
  const isGuest = !isProvider && !isUser;

  const WrenchIcon = (props) => (
    <svg {...props} width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );

  const MapPinIcon = (props) => (
    <svg {...props} width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  return (
    <header className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-[#10B981]/20">
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        
        {/* Enhanced Logo */}
        <Link to={isProvider ? "/provider-landing" : "/"} className="text-3xl font-bold flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-[#0047AB] to-[#10B981] rounded-xl shadow-lg">
            <WrenchIcon className="h-8 w-8 text-white" />
          </div>
          <span className="bg-gradient-to-r from-[#0047AB] to-[#10B981] bg-clip-text text-transparent font-black tracking-tight">Fixify</span>
        </Link>

        {/* Enhanced Desktop Menu */}
        <div className="hidden md:flex flex-1 justify-center space-x-2">
          <Link to={isProvider ? "/provider-landing" : "/"} className="px-6 py-3 rounded-xl hover:bg-[#10B981]/10 hover:text-[#0047AB] font-semibold text-lg transition-all duration-300 transform hover:scale-105">Home</Link>

          {/* Services only for user or guest (not provider) */}
          {(isUser || isGuest) && (
            <Link to="/serviceInfo" className="px-6 py-3 rounded-xl hover:bg-[#10B981]/10 hover:text-[#0047AB] font-semibold text-lg transition-all duration-300 transform hover:scale-105">Services</Link>
          )}

          {/* Show Dashboard only if normal user logged in */}
          {isUser && (
            <Link to="/dashboard" className="px-6 py-3 rounded-xl hover:bg-[#10B981]/10 hover:text-[#0047AB] font-semibold text-lg transition-all duration-300 transform hover:scale-105">Dashboard</Link>
          )}

          {/* About Us - Always visible */}
          <Link to="/about" className="px-6 py-3 rounded-xl hover:bg-[#10B981]/10 hover:text-[#0047AB] font-semibold text-lg transition-all duration-300 transform hover:scale-105">About Us</Link>

          {/* Show Provider only if provider logged in */}
          {isProvider && !isGuest && (
            <Link to="/provider-board" className="px-6 py-3 rounded-xl hover:bg-[#10B981]/10 hover:text-[#0047AB] font-semibold text-lg transition-all duration-300 transform hover:scale-105">Provider</Link>
          )}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Show LiveCity only if logged in */}
          {(isUser || isProvider) && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPinIcon className="w-4 h-4 text-gray-500" />
              <Link to="/choose-address" className="font-medium"><LiveCity /></Link>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
          )}

          {/* User Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-[#10B981]/10 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-[#0047AB] to-[#10B981] rounded-full flex items-center justify-center overflow-hidden">
                {(isUser && user?.profileImage) || (isProvider && utility?.profileImage) ? (
                  <img 
                    src={isUser ? user.profileImage : utility.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-[#10B981]/20 py-3 z-50 animate-fade-in">
                {isUser || isProvider ? (
                  <>
                    <div className="px-5 py-3 border-b-2 border-[#10B981]/10 mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#0047AB] to-[#10B981] rounded-full flex items-center justify-center overflow-hidden">
                          {(isUser && user?.profileImage) || (isProvider && utility?.profileImage) ? (
                            <img 
                              src={isUser ? user.profileImage : utility.profileImage} 
                              alt="Profile" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {isUser ? user?.fullname?.firstname : utility?.fullname?.firstname} {isUser ? user?.fullname?.lastname : utility?.fullname?.lastname}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {isUser ? user?.email : utility?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const settingsRoute = isProvider ? '/provider-settings' : '/settings';
                        navigate(settingsRoute);
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#10B981]/10 hover:to-[#0047AB]/10 hover:text-[#0047AB] transition-all duration-300 rounded-xl mx-2 mb-1"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      <span className="font-medium">Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center px-5 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 rounded-xl mx-2 font-medium"
                    >
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/about" 
                      className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#10B981]/10 hover:to-[#0047AB]/10 hover:text-[#0047AB] transition-all duration-300 rounded-xl mx-2 mb-1 font-medium"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link 
                      to="/login" 
                      className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#10B981]/10 hover:to-[#0047AB]/10 hover:text-[#0047AB] transition-all duration-300 rounded-xl mx-2 mb-2 font-medium"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <div className="px-2">
                      <Link 
                        to="/signup" 
                        className="block px-4 py-3 text-sm text-white bg-gradient-to-r from-[#0047AB] to-[#10B981] rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-center font-bold"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Mobile User Icon */}
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="p-2 rounded-xl hover:bg-[#10B981]/10 transition-all duration-300"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-[#0047AB] to-[#10B981] rounded-full flex items-center justify-center overflow-hidden">
              {(isUser && user?.profileImage) || (isProvider && utility?.profileImage) ? (
                <img 
                  src={isUser ? user.profileImage : utility.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:bg-gray-100">
            {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Enhanced Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl shadow-2xl border-t border-gray-200/50 animate-fade-in-down">
          <div className="flex flex-col items-start p-6 space-y-3">
            <Link to={isProvider ? "/provider-landing" : "/"} className="w-full py-3 px-4 rounded-xl hover:bg-[#10B981]/10 hover:text-[#0047AB] font-semibold transition-all duration-300">Home</Link>

            {/* Services only if not provider */}
            {(isUser || isGuest) && (
              <Link to="/serviceInfo" className="w-full py-3 px-4 rounded-xl hover:bg-[#10B981]/10 hover:text-[#0047AB] font-semibold transition-all duration-300">Services</Link>
            )}

            {/* User only */}
            {isUser && (
              <Link to="/dashboard" className="w-full py-3 px-4 rounded-xl hover:bg-[#10B981]/10 hover:text-[#0047AB] font-semibold transition-all duration-300">Dashboard</Link>
            )}

            {/* About Us - Always visible in mobile */}
            <Link to="/about" className="w-full py-3 px-4 rounded-xl hover:bg-[#10B981]/10 hover:text-[#0047AB] font-semibold transition-all duration-300">About Us</Link>

            {/* Provider only */}
            {isProvider && !isGuest && (
              <Link to="/provider-board" className="w-full py-3 px-4 rounded-xl hover:bg-[#10B981]/10 hover:text-[#0047AB] font-semibold transition-all duration-300">Provider</Link>
            )}

            {/* Mobile User Menu */}
            {isUserMenuOpen && (
              <div className="pt-4 mt-4 border-t-2 border-[#10B981]/20 w-full bg-white/50 backdrop-blur-sm rounded-2xl p-4 border-2 border-[#10B981]/10">
                {isUser || isProvider ? (
                  <>
                    <div className="px-4 py-3 mb-4 bg-gradient-to-r from-[#10B981]/10 to-[#0047AB]/10 rounded-2xl border border-[#10B981]/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#0047AB] to-[#10B981] rounded-full flex items-center justify-center overflow-hidden">
                          {(isUser && user?.profileImage) || (isProvider && utility?.profileImage) ? (
                            <img 
                              src={isUser ? user.profileImage : utility.profileImage} 
                              alt="Profile" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {isUser ? user?.fullname?.firstname : utility?.fullname?.firstname} {isUser ? user?.fullname?.lastname : utility?.fullname?.lastname}
                          </p>
                          <p className="text-xs text-gray-500">
                            {isUser ? user?.email : utility?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const settingsRoute = isProvider ? '/provider-settings' : '/settings';
                        navigate(settingsRoute);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-[#10B981]/10 hover:to-[#0047AB]/10 hover:text-[#0047AB] font-semibold transition-all duration-300 block mb-2 border border-transparent hover:border-[#10B981]/20 flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </button>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }} 
                      className="w-full text-left py-3 px-4 rounded-xl hover:bg-red-50 hover:text-red-600 font-semibold transition-all duration-300 border border-transparent hover:border-red-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/about" 
                      className="w-full py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-[#10B981]/10 hover:to-[#0047AB]/10 hover:text-[#0047AB] font-semibold transition-all duration-300 block mb-2 border border-transparent hover:border-[#10B981]/20"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link 
                      to="/login" 
                      className="w-full py-3 px-4 rounded-xl hover:bg-gradient-to-r hover:from-[#10B981]/10 hover:to-[#0047AB]/10 hover:text-[#0047AB] font-semibold transition-all duration-300 block mb-3 border border-transparent hover:border-[#10B981]/20"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      className="w-full text-center bg-gradient-to-r from-[#0047AB] to-[#10B981] text-white px-4 py-3 rounded-xl hover:shadow-lg hover:scale-105 font-bold transition-all duration-300 border-2 border-[#10B981]/30"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}

            {(isUser || isProvider) && (
              <div className="flex items-center space-x-2 pt-4 text-gray-600">
                <MapPinIcon className="w-4 h-4 text-gray-500" />
                <span className="font-medium"><LiveCity /></span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default NavLinkContent;