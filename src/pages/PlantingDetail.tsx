import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Sprout, 
  Flower2,
  Apple,
  Bug,
  Star,
  Leaf,
  Image,
  MessageSquare,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { plantingMethodLabels } from '../types';

export default function PlantingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlantingRecordById, getSeedById } = useAppStore();
  
  const record = getPlantingRecordById(id || '');
  const seed = record ? getSeedById(record.seedId) : undefined;

  if (!record) {
    return (
      <div className="text-center py-16">
        <p className="text-forest-500">记录不存在</p>
        <button 
          onClick={() => navigate('/planting')}
          className="mt-4 text-forest-600 hover:text-forest-800"
        >
          返回种植记录
        </button>
      </div>
    );
  }

  const ratingLabels = [
    { key: 'tasteRating', label: '口感' },
    { key: 'yieldRating', label: '产量' },
    { key: 'diseaseRating', label: '抗病性' },
    { key: 'adaptabilityRating', label: '适应性' },
  ] as const;

  const growthStages = [
    { key: 'plantDate', label: '种植', icon: Sprout, color: 'bg-green-500' },
    { key: 'germinationDate', label: '出苗', icon: Leaf, color: 'bg-emerald-500' },
    { key: 'floweringDate', label: '开花', icon: Flower2, color: 'bg-pink-500' },
    { key: 'fruitingDate', label: '结果', icon: Apple, color: 'bg-amber-500' },
    { key: 'harvestDate', label: '收获', icon: Apple, color: 'bg-orange-500' },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/planting')}
        className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回种植记录</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-card">
            <div className="relative h-48 bg-cream-100">
              {record.photos[0] ? (
                <img
                  src={record.photos[0]}
                  alt={record.seedName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-16 h-16 text-cream-300" />
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-xs text-forest-400">综合评分</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(record.overallRating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-cream-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-amber-600">{record.overallRating}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5">
              <h1 className="text-xl font-serif font-bold text-forest-800 mb-1">
                {record.seedName}
              </h1>
              <p className="text-xs text-forest-400 font-mono mb-4">{record.seedBatchCode}</p>
              
              {seed && (
                <Link
                  to={`/seeds/${seed.id}`}
                  className="flex items-center gap-2 text-sm text-forest-600 hover:text-forest-800"
                >
                  <Sprout className="w-4 h-4" />
                  查看种子详情 →
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-card">
            <h3 className="text-sm font-bold text-forest-800 mb-4">种植信息</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-forest-600" />
                </div>
                <div>
                  <p className="text-xs text-forest-400">种植日期</p>
                  <p className="text-sm font-medium text-forest-700">{record.plantDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-forest-400">种植地点</p>
                  <p className="text-sm font-medium text-forest-700">{record.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-forest-400">种植方式</p>
                  <p className="text-sm font-medium text-forest-700">{plantingMethodLabels[record.method]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h2 className="text-lg font-serif font-bold text-forest-800 mb-6">生长周期</h2>
            <div className="relative">
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-cream-200"></div>
              <div className="space-y-6">
                {growthStages.map((stage) => {
                  const date = record[stage.key as keyof typeof record] as string | undefined;
                  const isDone = !!date;
                  
                  return (
                    <div key={stage.key} className="relative pl-14">
                      <div className={`absolute left-2 top-0 w-7 h-7 rounded-full ${stage.color} flex items-center justify-center shadow-md`}>
                        <stage.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className={`p-4 rounded-xl ${isDone ? 'bg-cream-50' : 'bg-gray-50 opacity-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-forest-700">{stage.label}</span>
                          <span className={`text-sm ${isDone ? 'text-forest-600' : 'text-gray-400'}`}>
                            {date || '未记录'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Bug className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-serif font-bold text-forest-800">病虫害记录</h2>
            </div>
            <p className="text-forest-600 leading-relaxed">
              {record.pestDisease || '暂无病虫害记录'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-serif font-bold text-forest-800">种植评价</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {ratingLabels.map((item) => {
                const rating = record[item.key];
                return (
                  <div key={item.key} className="text-center p-4 bg-cream-50 rounded-xl">
                    <p className="text-sm text-forest-500 mb-2">{item.label}</p>
                    <div className="flex justify-center gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-cream-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-lg font-bold text-amber-600">{rating}</p>
                  </div>
                );
              })}
            </div>
            
            {record.review && (
              <div className="pt-4 border-t border-cream-200">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-forest-500" />
                  <p className="text-sm font-medium text-forest-700">种植体验</p>
                </div>
                <p className="text-forest-600 leading-relaxed">{record.review}</p>
              </div>
            )}
          </div>

          {record.harvestYield && (
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Apple className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-serif font-bold text-forest-800">收获情况</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Apple className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-600 font-serif">
                    {record.harvestYield.toLocaleString()}
                  </p>
                  <p className="text-sm text-forest-500">克 · 总产量</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
