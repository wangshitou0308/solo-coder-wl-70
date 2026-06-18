import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { 
  BarChart3, 
  AlertTriangle, 
  Trophy,
  Flame,
  TrendingUp,
  Sprout,
  Users,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const COLORS = ['#52804e', '#c9a227', '#719d6d', '#e18a00', '#9bbd98', '#ba6103', '#ccb98e'];

export default function Statistics() {
  const { getStats, seeds, plantingRecords, users } = useAppStore();
  const stats = getStats();

  const heirloomCount = seeds.filter(s => s.varietyType === 'heirloom').length;
  const localCount = seeds.filter(s => s.varietyType === 'local').length;
  const wildCount = seeds.filter(s => s.varietyType === 'wild').length;
  const hybridCount = seeds.filter(s => s.varietyType === 'hybrid').length;

  const varietyTypeData = [
    { name: '老品种', value: heirloomCount },
    { name: '地方农家种', value: localCount },
    { name: '野生近缘种', value: wildCount },
    { name: '杂交种', value: hybridCount },
  ];

  const endangeredSeeds = seeds.filter(s => {
    const lastUpdate = new Date(s.lastUpdateDate);
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    return lastUpdate < threeYearsAgo || s.isEndangered;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-forest-800">统计分析</h1>
        <p className="text-forest-600 mt-1">全面了解社区种子银行保育状况</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-forest-600" />
            </div>
            <p className="text-sm text-forest-500">收藏品种总数</p>
          </div>
          <p className="text-3xl font-bold text-forest-800 font-serif">{seeds.length}</p>
          <p className="text-xs text-forest-400 mt-2">涵盖 {stats.speciesDistribution.length} 大物种分类</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm text-forest-500">老品种数量</p>
          </div>
          <p className="text-3xl font-bold text-amber-600 font-serif">{heirloomCount + localCount}</p>
          <p className="text-xs text-forest-400 mt-2">珍贵的地方种质资源</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-forest-500">濒危品种</p>
          </div>
          <p className="text-3xl font-bold text-red-600 font-serif">{stats.endangeredSeeds}</p>
          <p className="text-xs text-forest-400 mt-2">三年以上未更新</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-forest-500">种植记录</p>
          </div>
          <p className="text-3xl font-bold text-green-600 font-serif">{plantingRecords.length}</p>
          <p className="text-xs text-forest-400 mt-2">累积种植数据</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-forest-600" />
            <h3 className="text-lg font-serif font-bold text-forest-800">物种分布</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.speciesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
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
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-forest-600" />
            <h3 className="text-lg font-serif font-bold text-forest-800">品种类型分布</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={varietyTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                >
                  {varietyTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-forest-600" />
            <h3 className="text-lg font-serif font-bold text-forest-800">年度入库与交换趋势</h3>
          </div>
          <span className="text-sm text-forest-400">近5年数据</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.yearlyTrend} barGap={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="year" stroke="#9ca3af" fontSize={13} />
              <YAxis stroke="#9ca3af" fontSize={13} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px -4px rgba(0,0,0,0.15)'
                }} 
              />
              <Legend />
              <Bar dataKey="entries" name="入库量" fill="#52804e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="exchanges" name="交换量" fill="#c9a227" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-serif font-bold text-forest-800">贡献排行</h3>
          </div>
          <div className="space-y-4">
            {stats.topContributors.map((user, index) => (
              <div 
                key={user.name}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-cream-50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ${
                  index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                  index === 1 ? 'bg-gradient-to-br from-forest-400 to-forest-600' :
                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                  'bg-gradient-to-br from-cream-400 to-cream-600'
                }`}>
                  {index + 1}
                </div>
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                <div className="flex-1">
                  <p className="font-medium text-forest-800">{user.name}</p>
                  <p className="text-sm text-forest-400">贡献了 {user.count} 份种子</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-600">{user.count}</p>
                  <p className="text-xs text-forest-400">份</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-serif font-bold text-forest-800">品种热度榜</h3>
          </div>
          <div className="space-y-3">
            {stats.varietyHeat.map((item, index) => (
              <div 
                key={item.name}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream-50 transition-colors"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-cream-100 text-forest-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-forest-700 truncate">{item.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-forest-400">{item.exchanges} 次交换</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-amber-500">★ {item.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="w-24 h-2 bg-cream-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                    style={{ width: `${Math.min(100, item.exchanges * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {endangeredSeeds.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-serif font-bold text-amber-800">濒危品种关注</h3>
          </div>
          <p className="text-sm text-amber-700 mb-4">
            以下品种已超过三年未更新，需要更多种植者参与保育
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {endangeredSeeds.map((seed) => (
              <div 
                key={seed.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Sprout className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-forest-800 truncate">{seed.name}</p>
                    <p className="text-xs text-forest-400">上次更新: {seed.lastUpdateDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
