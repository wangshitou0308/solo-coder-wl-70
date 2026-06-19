import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  Sprout, 
  Repeat, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Target,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { taskStatusLabels, taskStatusColors } from '../types';
import { useAppStore } from '../store/useAppStore';

const COLORS = ['#52804e', '#c9a227', '#719d6d', '#e18a00', '#9bbd98', '#ba6103', '#ccb98e'];

function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color,
  bgColor 
}: { 
  icon: React.ElementType; 
  title: string; 
  value: number; 
  subtitle: string; 
  color: string;
  bgColor: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`${bgColor} rounded-2xl p-6 shadow-card hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2 font-serif">{displayValue}</p>
          <p className="text-xs text-white/70 mt-2">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center backdrop-blur-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { getStats, seeds, exchanges, plantingRecords, conservationTasks } = useAppStore();
  const navigate = useNavigate();
  const stats = getStats();
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  const monthlyExchanges = exchanges.filter(e => {
    const date = new Date(e.createdAt);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  }).length;

  const recentSeeds = seeds.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-forest-800">数据看板</h1>
        <p className="text-forest-600 mt-1">社区种子银行保育概览</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Sprout}
          title="在库品种数"
          value={stats.totalSeeds}
          subtitle="涵盖7大物种分类"
          color="bg-white/20"
          bgColor="bg-gradient-to-br from-forest-500 to-forest-700"
        />
        <StatCard
          icon={Repeat}
          title="本月交换次数"
          value={monthlyExchanges}
          subtitle="种子在社区中流动"
          color="bg-white/20"
          bgColor="bg-gradient-to-br from-amber-500 to-amber-700"
        />
        <StatCard
          icon={Users}
          title="活跃种植者"
          value={stats.activeGrowers}
          subtitle="共同参与保育行动"
          color="bg-white/20"
          bgColor="bg-gradient-to-br from-forest-400 to-forest-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="濒危品种"
          value={stats.endangeredSeeds}
          subtitle="三年以上未更新"
          color="bg-white/20"
          bgColor="bg-gradient-to-br from-amber-600 to-amber-800"
        />
        <StatCard
          icon={Target}
          title="待复壮品种"
          value={stats.pendingRejuvenationSeeds}
          subtitle="急需保育行动"
          color="bg-white/20"
          bgColor="bg-gradient-to-br from-red-500 to-red-700"
        />
        <StatCard
          icon={Activity}
          title="进行中任务"
          value={stats.activeTasks}
          subtitle="正在执行保育任务"
          color="bg-white/20"
          bgColor="bg-gradient-to-br from-forest-500 to-forest-700"
        />
        <StatCard
          icon={CheckCircle}
          title="完成任务数"
          value={stats.completedTasks}
          subtitle="成功完成保育任务"
          color="bg-white/20"
          bgColor="bg-gradient-to-br from-amber-500 to-amber-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-bold text-forest-800">物种分布</h3>
            <span className="text-sm text-forest-500">按种类统计</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.speciesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                >
                  {stats.speciesDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-bold text-forest-800">年度趋势</h3>
            <div className="flex items-center gap-2 text-sm text-forest-500">
              <TrendingUp className="w-4 h-4" />
              <span>近5年数据</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.yearlyTrend} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="year" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -4px rgba(0,0,0,0.15)'
                  }} 
                />
                <Legend />
                <Bar dataKey="entries" name="入库量" fill="#52804e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exchanges" name="交换量" fill="#c9a227" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-bold text-forest-800">最近入库</h3>
            <Calendar className="w-5 h-5 text-forest-400" />
          </div>
          <div className="space-y-3">
            {recentSeeds.map((seed) => (
              <div 
                key={seed.id}
                onClick={() => navigate(`/seeds/${seed.id}`)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                  {seed.photos[0] && (
                    <img 
                      src={seed.photos[0].url} 
                      alt={seed.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-forest-800 truncate">{seed.name}</p>
                  <p className="text-xs text-forest-500">{seed.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-600">{seed.quantity}g</p>
                  <p className="text-xs text-forest-400">{seed.collectYear}年</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-bold text-forest-800">贡献排行</h3>
            <Users className="w-5 h-5 text-forest-400" />
          </div>
          <div className="space-y-4">
            {stats.topContributors.map((user, index) => (
              <div key={user.name} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0 ? 'bg-amber-500' :
                  index === 1 ? 'bg-forest-400' :
                  index === 2 ? 'bg-amber-700' :
                  'bg-cream-400'
                }`}>
                  {index + 1}
                </div>
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-forest-800">{user.name}</p>
                </div>
                <p className="text-sm font-bold text-amber-600">{user.count} 份</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card lg:col-span-3 cursor-pointer hover:shadow-hover transition-all duration-300" onClick={() => navigate('/tasks')}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif font-bold text-forest-800">保育任务动态</h3>
            <Activity className="w-5 h-5 text-forest-400" />
          </div>
          <div className="space-y-3">
            {[...conservationTasks]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-forest-800 truncate">{task.title}</p>
                    <p className="text-xs text-forest-500 mt-1">{task.seedName}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${taskStatusColors[task.status]}`}
                  >
                    {taskStatusLabels[task.status]}
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-forest-400">截止日期</p>
                    <p className="text-sm font-medium text-forest-600">{task.deadline}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
