import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Target,
  AlertTriangle,
  Sparkles,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  speciesLabels, 
  varietyTypeLabels, 
  sourceLabels, 
  storageConditionLabels,
  growthStageLabels,
  endangeredReasonLabels,
  taskStatusLabels,
  taskStatusColors,
  growthStageColors,
  growthStageOrder,
} from '../types';

export default function SeedDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getSeedById, 
    getTransfersBySeedId, 
    getPlantingRecordsBySeed, 
    users,
    getSeedEndangeredInfo,
    getExcellentPlantingRecordsBySeed,
    getTasksBySeed,
    currentUser,
  } = useAppStore();
  
  const seed = getSeedById(id || '');
  const transfers = getTransfersBySeedId(id || '');
  const plantingRecords = getPlantingRecordsBySeed(id || '');
  const excellentRecords = seed ? getExcellentPlantingRecordsBySeed(seed.id) : [];
  const endangeredInfo = seed ? getSeedEndangeredInfo(seed.id) : null;
  const relatedTasks = seed ? getTasksBySeed(seed.id) : [];
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

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-forest-600" />
              <h2 className="text-lg font-serif font-bold text-forest-800">保育情况</h2>
            </div>

            {endangeredInfo && endangeredInfo.reasons.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-amber-700">该品种需关注保育</span>
                </div>

                <div>
                  <p className="text-xs text-forest-500 mb-2">濒危原因：</p>
                  <div className="flex flex-wrap gap-2">
                    {endangeredInfo.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full"
                      >
                        {endangeredReasonLabels[reason]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-forest-500">库存水平</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      endangeredInfo.stockLevel === 'low' ? 'bg-red-100 text-red-600' :
                      endangeredInfo.stockLevel === 'medium' ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {endangeredInfo.stockLevel === 'low' ? '偏低' :
                       endangeredInfo.stockLevel === 'medium' ? '中等' : '充足'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-forest-500">发芽率水平</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      endangeredInfo.germinationLevel === 'low' ? 'bg-red-100 text-red-600' :
                      endangeredInfo.germinationLevel === 'medium' ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {endangeredInfo.germinationLevel === 'low' ? '偏低' :
                       endangeredInfo.germinationLevel === 'medium' ? '中等' : '优良'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-forest-500">距上次更新</span>
                    <span className="text-xs font-medium text-forest-600">
                      {endangeredInfo.lastUpdateYears}年
                    </span>
                  </div>
                </div>

                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => navigate(`/tasks/new?seedId=${seed.id}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
                  >
                    <Target className="w-4 h-4" />
                    建议：发布复壮任务
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700">品种状态良好</span>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-cream-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-forest-500 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  相关保育任务
                </p>
                <span className="text-xs font-medium text-forest-700">{relatedTasks.length} 个</span>
              </div>
              {relatedTasks.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(
                    relatedTasks.reduce((acc, t) => {
                      acc[t.status] = (acc[t.status] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([status, count]) => (
                    <span
                      key={status}
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${taskStatusColors[status as keyof typeof taskStatusColors]}`}
                    >
                      {taskStatusLabels[status as keyof typeof taskStatusLabels]} {count}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-forest-400">暂无相关任务</p>
              )}
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
                {transfers.map((transfer) => (
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

          <div className="bg-white rounded-2xl p-6 shadow-card border-2 border-amber-200 bg-gradient-to-br from-amber-50/30 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-serif font-bold text-forest-800">优秀生长档案</h2>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 rounded-full">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">{excellentRecords.length} 份认证档案</span>
              </div>
            </div>

            {excellentRecords.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream-100 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-forest-300" />
                </div>
                <p className="text-sm text-forest-500 leading-relaxed">
                  该品种暂无优秀生长档案，<br />
                  鼓励种植者完整记录各阶段日志以获取优秀档案认证
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {excellentRecords.map((record) => {
                  const displayLogs = record.growthLogs.slice(0, 5);
                  const allPhotos = record.growthLogs.flatMap(log => log.photos).slice(0, 4);
                  const recordUser = users.find(u => u.id === record.userId);

                  return (
                    <div
                      key={record.id}
                      className="relative p-5 rounded-2xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 shadow-sm"
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full shadow-md">
                        <Award className="w-3 h-3 text-white" />
                        <span className="text-[11px] font-bold text-white">优秀认证</span>
                      </div>

                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={recordUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${record.userName}&backgroundColor=c9a227`}
                          alt={record.userName}
                          className="w-12 h-12 rounded-full border-2 border-amber-200 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-forest-800">{record.userName}</p>
                            <span className="text-[11px] text-forest-400 flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {record.plantDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`w-4 h-4 ${
                                  n <= Math.round(record.overallRating)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-cream-200'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-lg font-bold text-amber-600">{record.overallRating}</span>
                          </div>
                        </div>
                      </div>

                      {displayLogs.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-forest-500 mb-2.5 flex items-center gap-1">
                            <History className="w-3 h-3" />
                            生长记录时间线
                          </p>
                          <div className="relative pl-4 border-l-2 border-amber-200 space-y-3">
                            {displayLogs.map((log, idx) => (
                              <div key={log.id} className="relative">
                                <div className={`absolute -left-[25px] top-1 w-3.5 h-3.5 rounded-full ${growthStageColors[log.stage]} border-2 border-white shadow-sm`}></div>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium text-white ${growthStageColors[log.stage]}`}>
                                      {growthStageLabels[log.stage]}
                                    </span>
                                    <span className="text-xs font-medium text-forest-700">{log.title}</span>
                                  </div>
                                  <span className="text-[11px] text-forest-400 whitespace-nowrap">{log.date}</span>
                                </div>
                                {idx === displayLogs.length - 1 && record.growthLogs.length > 5 && (
                                  <p className="text-[11px] text-forest-400 mt-1">...还有 {record.growthLogs.length - 5} 条记录</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {allPhotos.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-forest-500 mb-2 flex items-center gap-1">
                            <Image className="w-3 h-3" />
                            现场照片
                          </p>
                          <div className={`grid gap-2 ${
                            allPhotos.length === 1 ? 'grid-cols-1' :
                            allPhotos.length === 2 ? 'grid-cols-2' :
                            'grid-cols-2'
                          }`}>
                            {allPhotos.map((photo) => (
                              <div
                                key={photo.id}
                                className={`relative rounded-xl overflow-hidden ${
                                  allPhotos.length === 1 ? 'aspect-video' : 'aspect-square'
                                } bg-cream-100`}
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.caption || record.seedName}
                                  className="w-full h-full object-cover"
                                />
                                {photo.caption && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                                    <p className="text-[10px] text-white truncate">{photo.caption}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-amber-100">
                        <div className="flex items-center gap-4 text-xs text-forest-400">
                          <span>📍 {record.location}</span>
                          {record.harvestYield && <span>🌾 {record.harvestYield}g</span>}
                        </div>
                        <button
                          onClick={() => navigate(`/planting/${record.id}`)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-forest-500 to-forest-600 text-white text-xs font-medium rounded-lg hover:from-forest-600 hover:to-forest-700 transition-all shadow-sm"
                        >
                          查看完整档案
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-forest-600" />
                <h2 className="text-lg font-serif font-bold text-forest-800">全部种植反馈</h2>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-amber-600">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-forest-400">({plantingRecords.length}条评价)</span>
              </div>
            </div>

            {plantingRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-forest-400">暂无种植反馈</p>
              </div>
            ) : (
              <div className="space-y-4">
                {plantingRecords.map((record) => {
                  const stagesCompleted = record.growthLogs.length;
                  const totalStages = growthStageOrder.length;
                  const progressPercent = Math.min(100, (stagesCompleted / totalStages) * 100);

                  return (
                    <div key={record.id} className="p-4 bg-cream-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
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

                      {record.growthLogs && record.growthLogs.length > 0 && (
                        <div className="mb-3 p-3 bg-white rounded-lg border border-cream-200">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] text-forest-500 flex items-center gap-1">
                              <Sprout className="w-3 h-3" />
                              生长记录进度
                            </span>
                            <span className="text-[11px] font-medium text-forest-600">
                              已记录 {stagesCompleted}/{totalStages} 阶段
                            </span>
                          </div>
                          <div className="w-full h-2 bg-cream-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-forest-500 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          {record.growthLogs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {record.growthLogs.slice(0, 6).map((log) => (
                                <span
                                  key={log.id}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium text-white ${growthStageColors[log.stage]}`}
                                  title={growthStageLabels[log.stage]}
                                >
                                  {growthStageLabels[log.stage]}
                                </span>
                              ))}
                              {record.growthLogs.length > 6 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] text-forest-400 bg-cream-100">
                                  +{record.growthLogs.length - 6}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-forest-600 line-clamp-2">{record.review}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-forest-400">
                          <span>产量: {record.harvestYield ? `${record.harvestYield}g` : '-'}</span>
                          <span>种植地点: {record.location}</span>
                        </div>
                        <button
                          onClick={() => navigate(`/planting/${record.id}`)}
                          className="text-xs text-forest-500 hover:text-forest-700 font-medium flex items-center gap-0.5"
                        >
                          详情
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
