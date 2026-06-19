import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Sprout, 
  Repeat, 
  Leaf, 
  Calendar,
  Award,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, seeds, getPlantingRecordsByUser, getExchangesBySharer } = useAppStore();
  
  const mySeeds = seeds.filter(s => s.ownerId === currentUser.id);
  const myPlantings = getPlantingRecordsByUser(currentUser.id);
  const myExchanges = getExchangesBySharer(currentUser.id);

  const stats = [
    { label: '贡献种子', value: mySeeds.length, icon: Sprout, color: 'bg-forest-100 text-forest-600' },
    { label: '发布分享', value: myExchanges.length, icon: Repeat, color: 'bg-amber-100 text-amber-600' },
    { label: '种植记录', value: myPlantings.length, icon: Leaf, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回首页</span>
      </button>

      <div className="bg-gradient-to-r from-forest-600 to-forest-800 rounded-2xl p-8 shadow-card text-white">
        <div className="flex items-center gap-6">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name}
            className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-serif font-bold">{currentUser.name}</h1>
            <p className="text-forest-200 mt-1">
              {currentUser.role === 'admin' ? '管理员' : '种植者'}
            </p>
            <div className="flex items-center gap-2 mt-3 text-forest-200 text-sm">
              <Calendar className="w-4 h-4" />
              <span>加入于 {currentUser.joinDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-bold text-forest-800 font-serif">{stat.value}</p>
                <p className="text-sm text-forest-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="w-5 h-5 text-forest-600" />
            <h3 className="text-lg font-serif font-bold text-forest-800">我贡献的种子</h3>
          </div>
          {mySeeds.length > 0 ? (
            <div className="space-y-3">
              {mySeeds.slice(0, 5).map((seed) => (
                <div 
                  key={seed.id}
                  onClick={() => navigate(`/seeds/${seed.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-50 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                    {seed.photos[0] && (
                      <img src={seed.photos[0].url} alt={seed.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-forest-800 truncate">{seed.name}</p>
                    <p className="text-xs text-forest-400">{seed.code}</p>
                  </div>
                  <span className="text-sm text-amber-600 font-medium">{seed.quantity}g</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-forest-400 text-center py-8">还没有贡献种子</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-serif font-bold text-forest-800">我的种植记录</h3>
          </div>
          {myPlantings.length > 0 ? (
            <div className="space-y-3">
              {myPlantings.slice(0, 5).map((record) => (
                <div 
                  key={record.id}
                  onClick={() => navigate(`/planting/${record.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-50 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                    {record.photos[0] ? (
                      <img src={record.photos[0]} alt={record.seedName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-cream-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-forest-800 truncate">{record.seedName}</p>
                    <p className="text-xs text-forest-400">{record.plantDate} 种植</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-xs ${
                          star <= Math.round(record.overallRating)
                            ? 'text-amber-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-forest-400 text-center py-8">还没有种植记录</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-serif font-bold text-forest-800">成就徽章</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl text-center ${mySeeds.length >= 1 ? 'bg-amber-50' : 'bg-gray-50 opacity-50'}`}>
            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
              mySeeds.length >= 1 ? 'bg-amber-400' : 'bg-gray-300'
            }`}>
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-forest-700">初次分享</p>
            <p className="text-xs text-forest-400">贡献第一份种子</p>
          </div>
          <div className={`p-4 rounded-xl text-center ${mySeeds.length >= 5 ? 'bg-forest-50' : 'bg-gray-50 opacity-50'}`}>
            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
              mySeeds.length >= 5 ? 'bg-forest-500' : 'bg-gray-300'
            }`}>
              <Award className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-forest-700">种子达人</p>
            <p className="text-xs text-forest-400">贡献5份以上种子</p>
          </div>
          <div className={`p-4 rounded-xl text-center ${myPlantings.length >= 1 ? 'bg-green-50' : 'bg-gray-50 opacity-50'}`}>
            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
              myPlantings.length >= 1 ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-forest-700">辛勤园丁</p>
            <p className="text-xs text-forest-400">完成第一次种植</p>
          </div>
          <div className={`p-4 rounded-xl text-center ${myExchanges.length >= 1 ? 'bg-blue-50' : 'bg-gray-50 opacity-50'}`}>
            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
              myExchanges.length >= 1 ? 'bg-blue-500' : 'bg-gray-300'
            }`}>
              <Repeat className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-forest-700">交流使者</p>
            <p className="text-xs text-forest-400">完成第一次交换</p>
          </div>
        </div>
      </div>
    </div>
  );
}
