import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Droplets, 
  Thermometer,
  Shield,
  Award,
  BookOpen,
  History,
  Sprout,
  Image,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Star,
  MessageSquare,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  speciesLabels, 
  varietyTypeLabels, 
  sourceLabels, 
  storageConditionLabels 
} from '../types';

export default function SeedDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSeedById, getTransfersBySeedId, getPlantingRecordsBySeed, users } = useAppStore();
  
  const seed = getSeedById(id || '');
  const transfers = getTransfersBySeedId(id || '');
  const plantingRecords = getPlantingRecordsBySeed(id || '');
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!seed) {
    return (
      <div className="text-center py-16">
        <p className="text-forest-500">种子不存在</p>
        <button 
          onClick={() => navigate('/seeds')}
          className="mt-4 text-forest-600 hover:text-forest-800"
        >
          返回种子列表
        </button>
      </div>
    );
  }

  const owner = users.find(u => u.id === seed.ownerId);
  const avgRating = plantingRecords.length > 0
    ? plantingRecords.reduce((sum, r) => sum + r.overallRating, 0) / plantingRecords.length
    : 0;

  const nextPhoto = () => {
    if (seed.photos.length > 0) {
      setPhotoIndex((prev) => (prev + 1) % seed.photos.length);
    }
  };

  const prevPhoto = () => {
    if (seed.photos.length > 0) {
      setPhotoIndex((prev) => (prev - 1 + seed.photos.length) % seed.photos.length);
    }
  };

  const transferTypeLabels: Record<string, string> = {
    entry: '入馆',
    exchange_out: '交换出库',
    exchange_in: '交换入库',
    planting: '种植',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/seeds')}
        className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回种子列表</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-card">
            <div className="relative h-64 bg-cream-100">
              {seed.photos.length > 0 ? (
                <>
                  <img
                    src={seed.photos[photoIndex].url}
                    alt={seed.name}
                    className="w-full h-full object-cover"
                  />
                  {seed.photos.length > 1 && (
                    <>
                      <button
                        onClick={prevPhoto}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-forest-600" />
                      </button>
                      <button
                        onClick={nextPhoto}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-forest-600" />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {seed.photos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPhotoIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === photoIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-16 h-16 text-cream-300" />
                </div>
              )}
            </div>
            {seed.photos[photoIndex]?.description && (
              <p className="px-4 py-2 text-sm text-forest-500 bg-cream-50 text-center">
                {seed.photos[photoIndex].description}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-forest-500">库存数量</p>
                <p className="text-2xl font-bold text-amber-600 font-serif">{seed.quantity}g</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-forest-500">发芽率</span>
                <span className="font-medium text-forest-700">{seed.germinationRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forest-500">唯一编号</span>
                <span className="font-mono text-forest-700 text-xs">{seed.code}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {seed.isEndangered && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      濒危品种
                    </span>
                  )}
                  <span className="px-3 py-1 bg-forest-100 text-forest-700 text-xs font-medium rounded-full">
                    {speciesLabels[seed.species]}
                  </span>
                  <span className="px-3 py-1 bg-cream-200 text-forest-700 text-xs font-medium rounded-full">
                    {varietyTypeLabels[seed.varietyType]}
                  </span>
                </div>
                <h1 className="text-2xl font-serif font-bold text-forest-800">{seed.name}</h1>
                <p className="text-sm text-forest-400 font-mono mt-1">{seed.code}</p>
              </div>
              {owner && (
                <div className="flex items-center gap-3">
                  <img src={owner.avatar} alt={owner.name} className="w-10 h-10 rounded-full" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-forest-700">{owner.name}</p>
                    <p className="text-xs text-forest-400">保存者</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-cream-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-forest-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-forest-600" />
                </div>
                <div>
                  <p className="text-xs text-forest-400">采集年份</p>
                  <p className="text-sm font-medium text-forest-700">{seed.collectYear}年</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-forest-400">来源</p>
                  <p className="text-sm font-medium text-forest-700">{sourceLabels[seed.source]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Thermometer className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-forest-400">储存条件</p>
                  <p className="text-sm font-medium text-forest-700">{storageConditionLabels[seed.storageCondition]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-forest-400">种植季节</p>
                  <p className="text-sm font-medium text-forest-700">{seed.plantingSeason || '春秋'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-forest-600" />
              <h2 className="text-lg font-serif font-bold text-forest-800">品种特性</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-cream-50 rounded-xl">
                <h3 className="text-sm font-medium text-forest-700 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-forest-500" />
                  抗病性
                </h3>
                <p className="text-sm text-forest-600">{seed.diseaseResistance}</p>
              </div>
              <div className="p-4 bg-cream-50 rounded-xl">
                <h3 className="text-sm font-medium text-forest-700 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  口感
                </h3>
                <p className="text-sm text-forest-600">{seed.taste}</p>
              </div>
              <div className="p-4 bg-cream-50 rounded-xl">
                <h3 className="text-sm font-medium text-forest-700 mb-2 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-green-500" />
                  产量
                </h3>
                <p className="text-sm text-forest-600">{seed.yield}</p>
              </div>
              <div className="p-4 bg-cream-50 rounded-xl">
                <h3 className="text-sm font-medium text-forest-700 mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-forest-500" />
                  适应性
                </h3>
                <p className="text-sm text-forest-600">{seed.adaptability}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-serif font-bold text-forest-800">历史故事</h2>
            </div>
            <p className="text-forest-600 leading-relaxed whitespace-pre-line">{seed.history}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-forest-600" />
                <h2 className="text-lg font-serif font-bold text-forest-800">流转历史</h2>
              </div>
              <span className="text-sm text-forest-400">共 {transfers.length} 条记录</span>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-cream-200"></div>
              <div className="space-y-4">
                {transfers.map((transfer, index) => (
                  <div key={transfer.id} className="relative pl-10">
                    <div className={`absolute left-2 top-1 w-5 h-5 rounded-full border-2 border-white ${
                      transfer.type === 'entry' ? 'bg-forest-500' :
                      transfer.type === 'exchange_out' ? 'bg-amber-500' :
                      transfer.type === 'exchange_in' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="p-4 bg-cream-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-forest-700">
                          {transferTypeLabels[transfer.type]}
                        </span>
                        <span className="text-xs text-forest-400">{transfer.date}</span>
                      </div>
                      {transfer.fromUserName && (
                        <p className="text-xs text-forest-500 mt-1">
                          来自: {transfer.fromUserName}
                        </p>
                      )}
                      {transfer.toUserName && (
                        <p className="text-xs text-forest-500">
                          给与: {transfer.toUserName}
                        </p>
                      )}
                      <p className="text-xs text-amber-600 mt-1 font-medium">
                        {transfer.quantity}g
                      </p>
                      {transfer.note && (
                        <p className="text-xs text-forest-400 mt-1">{transfer.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {plantingRecords.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-forest-600" />
                  <h2 className="text-lg font-serif font-bold text-forest-800">种植反馈</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-amber-600">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-forest-400">({plantingRecords.length}条评价)</span>
                </div>
              </div>
              <div className="space-y-4">
                {plantingRecords.map((record) => (
                  <div key={record.id} className="p-4 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${record.userName}&backgroundColor=52804e`}
                        alt={record.userName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-forest-700">{record.userName}</p>
                        <p className="text-xs text-forest-400">{record.plantDate} 种植</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-amber-600">
                          {record.overallRating}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-forest-600 line-clamp-2">{record.review}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-forest-400">
                      <span>产量: {record.harvestYield ? `${record.harvestYield}g` : '-'}</span>
                      <span>种植地点: {record.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
