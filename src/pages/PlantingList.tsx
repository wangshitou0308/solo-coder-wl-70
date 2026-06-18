import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Plus, 
  Calendar,
  MapPin,
  Star,
  Droplets,
  Sprout,
  Flower2,
  Apple,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { plantingMethodLabels } from '../types';

export default function PlantingList() {
  const navigate = useNavigate();
  const { currentUser, getPlantingRecordsByUser } = useAppStore();
  
  const records = getPlantingRecordsByUser(currentUser.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-forest-800">种植记录</h1>
          <p className="text-forest-600 mt-1">记录您的种植历程与收获</p>
        </div>
        <button
          onClick={() => navigate('/planting/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">新增记录</span>
        </button>
      </div>

      {records.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record, index) => (
            <div 
              key={record.id}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/planting/${record.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-slide-up"
            >
              <div className="relative h-40 bg-cream-100">
                {record.photos[0] ? (
                  <img
                    src={record.photos[0]}
                    alt={record.seedName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="w-16 h-16 text-cream-300" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 bg-white/90 text-forest-700 text-xs font-medium rounded-full backdrop-blur-sm">
                    {plantingMethodLabels[record.method]}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full backdrop-blur-sm">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-amber-600">{record.overallRating}</span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-serif font-bold text-forest-800 mb-1">
                  {record.seedName}
                </h3>
                <p className="text-xs text-forest-400 font-mono mb-3">{record.seedBatchCode}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-forest-600">
                    <Calendar className="w-4 h-4 text-forest-400" />
                    <span>{record.plantDate} 种植</span>
                  </div>
                  <div className="flex items-center gap-2 text-forest-600">
                    <MapPin className="w-4 h-4 text-forest-400" />
                    <span className="truncate">{record.location}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-cream-200">
                  {record.harvestDate ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Apple className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-forest-600">
                          收获 {record.harvestYield ? `${record.harvestYield}g` : ''}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">已收获</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">生长中</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 shadow-card text-center">
          <Leaf className="w-16 h-16 text-cream-300 mx-auto mb-4" />
          <p className="text-forest-400">还没有种植记录</p>
          <p className="text-sm text-forest-300 mt-1">开始记录您的第一次种植吧</p>
          <button
            onClick={() => navigate('/planting/new')}
            className="mt-6 px-6 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建记录
          </button>
        </div>
      )}
    </div>
  );
}
