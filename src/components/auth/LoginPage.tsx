import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setAuthData } from "../../redux/authSlice";
import { ChevronDown } from 'lucide-react';

const roles = [
  { id: "EMPLOYEE", label: "Employee" },
  { id: "MANAGER", label: "HR Manager" },
  { id: "SUPER_ADMIN", label: "Admin" },
  { id: "INSTRUCTOR", label: "Instructor" }
];

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const { signin, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    try {
      await signin({
        credentials: { email, password },
        onSuccess: (user, token) => {
          if (!user || !token) {
            toast.error("Invalid response from server!");
            return;
          }

          dispatch(setAuthData({ token, user }));

          if (user.role === "EMPLOYEE" && user.isFirstLogin) {
            navigate("/reset-password");
          } else if (user.role === "EMPLOYEE" && !user.isFirstLogin) {
            navigate("/employee");
          } else if (user.role === "MANAGER") {
            navigate("/hr");
          } else if (user.role === "SUPER_ADMIN") {
            navigate("/admin/dashboard");
          } else if (user.role === "INSTRUCTOR") {
            navigate("/instructor");
          } else {
            toast.error("Unauthorized Role!");
          }
        },
      });
    } catch (err) {
      console.error("Error during sign-in:", err);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-[480px] xl:w-[512px] bg-white dark:bg-dark-800 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Elevatics360</h1>
            <p className="text-gray-600 dark:text-gray-400">Your Learning & Development Excellence Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-left flex items-center justify-between"
              >
                <span className={selectedRole ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                  {selectedRole ? roles.find(r => r.id === selectedRole)?.label : 'Select your role'}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              
              {showRoleDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl shadow-lg">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-600 text-gray-900 dark:text-white first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => {
                        setSelectedRole(role.id);
                        setShowRoleDropdown(false);
                      }}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white"
              placeholder="Email address"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white"
              placeholder="Password"
              required
            />

            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-300/50 transition-all"
            >
              Sign in
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</Link>
          </div>
          <div className="mt-2 text-center">
            <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
            <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">Sign up</Link>
          </div>
        </div>
      </div>

      <div className="hidden lg:block flex-1 relative">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
      </div>
    </div>
  );
};

export default LoginPage;
