import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Book, Users, Tag, Plus, LogOut, HelpCircle, Settings } from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
  { label: "Manajemen Buku", path: "/admin/books", icon: <Book className="w-5 h-5 mr-2" /> },
  { label: "Manajemen User", path: "/admin/users", icon: <Users className="w-5 h-5 mr-2" /> },
  { label: "Manajemen Genre", path: "/admin/genres", icon: <Tag className="w-5 h-5 mr-2" /> },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  // Dummy admin info
  const admin = {
    name: "Admin Smart Library",
    avatar: "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff&size=128"
  };
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6 flex flex-col justify-between">
      <div>
        {/* Admin Info */}
        <div className="flex flex-col items-center mb-8">
          <img src={admin.avatar} alt="Admin" className="w-16 h-16 rounded-full shadow mb-2" />
          <span className="font-semibold text-primary-700 text-lg">{admin.name}</span>
          <span className="text-xs text-gray-400">Administrator</span>
        </div>
        {/* Divider */}
        <div className="border-b mb-4" />
        {/* Section Title */}
        <div className="uppercase text-xs text-gray-400 font-bold mb-2 px-2 tracking-wider">Menu Utama</div>
        {/* Navigation */}
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-150 group relative
                      ${isActive ? "bg-primary-100 text-primary-700 border-l-4 border-primary-600 shadow" : "text-gray-700 hover:bg-primary-50 hover:text-primary-700"}
                    `}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.icon}
                    <span className="flex-1 whitespace-nowrap">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Quick Action */}
        <Link
          to="/admin/books/add"
          className="mt-6 flex items-center justify-center w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg shadow transition-all duration-150"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Buku
        </Link>
        {/* Divider */}
        <div className="border-b my-6" />
      </div>
      {/* Footer Links */}
      <div className="flex flex-col gap-2 text-xs text-gray-500">
        <Link to="/help" className="flex items-center hover:text-primary-600 transition-colors"><HelpCircle className="w-4 h-4 mr-1" /> Bantuan</Link>
        <Link to="/settings" className="flex items-center hover:text-primary-600 transition-colors"><Settings className="w-4 h-4 mr-1" /> Pengaturan</Link>
        <button className="flex items-center hover:text-red-600 transition-colors" onClick={() => { localStorage.clear(); window.location.href = '/sign-in'; }}><LogOut className="w-4 h-4 mr-1" /> Keluar</button>
        <div className="mt-2 text-center text-gray-300">&copy; {new Date().getFullYear()} SmartLibrary</div>
      </div>
    </aside>
  );
};

export default AdminSidebar; 