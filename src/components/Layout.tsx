import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  Repeat, 
  Leaf, 
  BarChart3,
  User,
  ChevronRight,
  Target,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '数据看板' },
  { path: '/seeds', icon: Sprout, label: '种子库' },
  { path: '/endangered', icon: ShieldAlert, label: '濒危品种专区' },
  { path: '/exchange', icon: Repeat, label: '交换大厅' },
  { path: '/tasks', icon: Target, label: '复壮任务' },
  { path: '/planting', icon: Leaf, label: '种植记录' },
  { path: '/statistics', icon: BarChart3, label: '统计分析' },
];

export default function Layout() {
  const { currentUser } = useAppStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream-100 flex">
      <aside className="w-64 bg-gradient-to-b from-forest-800 to-forest-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-forest-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold">种子银行</h1>
              <p className="text-xs text-forest-300">老品种保育平台</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-forest-600 text-white shadow-md'
                    : 'text-forest-200 hover:bg-forest-700 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-forest-700">
          <div 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-forest-700 cursor-pointer transition-colors"
            onClick={() => navigate('/profile')}
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-forest-300">
                {currentUser.role === 'admin' ? '管理员' : '种植者'}
              </p>
            </div>
            <User className="w-4 h-4 text-forest-400" />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
