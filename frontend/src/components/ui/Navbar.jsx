import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <span className="font-bold text-gray-900 text-lg">Ethara</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.name}
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {user?.role}
          </span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 font-medium transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}