import { useState } from 'react';
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
  Plus,
  Lightbulb,
  Award,
  Camera,
  CloudSun,
  Droplets,
  Thermometer,
  X,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  plantingMethodLabels,
  growthStageLabels,
  growthStageColors,
  growthStageOrder,
  GrowthStageType,
} from '../types';

export default function PlantingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getPlantingRecordById, 
    getSeedById,
    addGrowthLog,
    getCurrentGrowthStage,
    getNextSuggestion,
    currentUser,
  } = useAppStore();

  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    stage: 'sowing' as GrowthStageType,
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    photos: '',
    temperature: '' as string,
    humidity: '' as string,
    weather: '',
  });
  
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

  const growthLogs = [...(record.growthLogs || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const pestDiseaseLogs = growthLogs.filter(log => log.stage === 'pest_disease');
  const stagesWithLogs = new Set(growthLogs.map(log => log.stage));
  const completedMainStages = growthStageOrder.filter(stage => stagesWithLogs.has(stage));
  const progressPercent = (completedMainStages.length / growthStageOrder.length) * 100;
  const currentStage = getCurrentGrowthStage(record.id);
  const nextSuggestion = getNextSuggestion(record.id);
  const isOwner = record.userId === currentUser.id;

  const handleAddLog = () => {
    if (!logForm.title.trim() || !logForm.description.trim() || !logForm.date) return;

    const photosUrls = logForm.photos
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0)
      .map((url, idx) => ({
        id: `glp-${Date.now()}-${idx}`,
        url,
      }));

    addGrowthLog({
      plantingRecordId: record.id,
      stage: logForm.stage,
      title: logForm.title.trim(),
      description: logForm.description.trim(),
      date: logForm.date,
      photos: photosUrls,
      temperature: logForm.temperature ? Number(logForm.temperature) : undefined,
      humidity: logForm.humidity ? Number(logForm.humidity) : undefined,
      weather: logForm.weather.trim() || undefined,
    });

    setShowAddLogModal(false);
    setLogForm({
      stage: 'sowing',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      photos: '',
      temperature: '',
      humidity: '',
      weather: '',
    });
  };

  const stageIconMap: Record<string, typeof Sprout> = {
    sowing: Sprout,
    germination: Leaf,
    transplant: Sprout,
    flowering: Flower2,
    fruiting: Apple,
    pest_disease: Bug,
    harvest: Apple,
    seed_saving: Award,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/planting')}
          className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回种植记录</span>
        </button>

        {isOwner && (
          <button
            onClick={() => setShowAddLogModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">添加生长日志</span>
          </button>
        )}
      </div>

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
              {record.isExcellent && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full shadow-md">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold">优秀生长档案</span>
                </div>
              )}
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
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="w-5 h-5 text-forest-600" />
              <h3 className="text-sm font-bold text-forest-800">当前生长阶段</h3>
            </div>
            {currentStage ? (
              <div className="flex items-center gap-3 p-4 bg-forest-50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-forest-600 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-forest-400">当前处于</p>
                  <p className="text-lg font-bold text-forest-700">{currentStage}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl opacity-60">
                <div className="w-12 h-12 rounded-xl bg-gray-300 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">尚未开始</p>
                  <p className="text-sm font-medium text-gray-500">等待记录生长日志</p>
                </div>
              </div>
            )}
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-forest-600" />
                <h2 className="text-lg font-serif font-bold text-forest-800">生长阶段概览</h2>
              </div>
              <span className="text-sm font-medium text-forest-600">
                {completedMainStages.length} / {growthStageOrder.length}
              </span>
            </div>
            <div className="w-full h-3 bg-cream-100 rounded-full overflow-hidden mb-5">
              <div 
                className="h-full bg-gradient-to-r from-forest-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {growthStageOrder.map((stage) => {
                const StageIcon = stageIconMap[stage] || Sprout;
                const isCompleted = stagesWithLogs.has(stage);
                return (
                  <div
                    key={stage}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isCompleted
                        ? `${growthStageColors[stage]} text-white`
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <StageIcon className="w-3.5 h-3.5" />
                    <span>{growthStageLabels[stage]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-800 mb-1">下一步建议</h3>
                <p className="text-amber-700 leading-relaxed">
                  {nextSuggestion || '暂无建议'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h2 className="text-lg font-serif font-bold text-forest-800 mb-6">生长时间线</h2>
            {growthLogs.length > 0 ? (
              <div className="relative">
                <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-cream-200"></div>
                <div className="space-y-6">
                  {growthLogs.map((log) => {
                    const StageIcon = stageIconMap[log.stage] || Sprout;
                    return (
                      <div key={log.id} className="relative pl-14">
                        <div
                          className={`absolute left-2 top-0 w-7 h-7 rounded-full ${growthStageColors[log.stage]} flex items-center justify-center shadow-md`}
                        >
                          <StageIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="p-4 rounded-xl bg-cream-50 hover:bg-cream-100 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${growthStageColors[log.stage]} text-white`}
                                >
                                  <StageIcon className="w-3 h-3" />
                                  {growthStageLabels[log.stage]}
                                </span>
                                <span className="text-xs text-forest-400">{log.date}</span>
                              </div>
                              <h4 className="font-bold text-forest-800">{log.title}</h4>
                            </div>
                          </div>
                          <p className="text-sm text-forest-600 leading-relaxed mb-3">
                            {log.description}
                          </p>
                          {(log.temperature !== undefined || log.humidity !== undefined || log.weather) && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {log.temperature !== undefined && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-medium">
                                  <Thermometer className="w-3 h-3" />
                                  {log.temperature}°C
                                </span>
                              )}
                              {log.humidity !== undefined && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                                  <Droplets className="w-3 h-3" />
                                  {log.humidity}%
                                </span>
                              )}
                              {log.weather && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full font-medium">
                                  <CloudSun className="w-3 h-3" />
                                  {log.weather}
                                </span>
                              )}
                            </div>
                          )}
                          {log.photos && log.photos.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {log.photos.map((photo) => (
                                <div
                                  key={photo.id}
                                  className="relative aspect-video rounded-lg overflow-hidden bg-cream-200 group"
                                >
                                  <img
                                    src={photo.url}
                                    alt={photo.caption || log.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  {photo.caption && (
                                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                      <p className="text-xs text-white truncate">{photo.caption}</p>
                                    </div>
                                  )}
                                  <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-3 h-3 text-white" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-4">
                  <Sprout className="w-8 h-8 text-cream-400" />
                </div>
                <p className="text-forest-400 mb-1">还没有生长日志</p>
                <p className="text-sm text-forest-300">开始记录您的种植历程吧！</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Bug className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-serif font-bold text-forest-800">病虫害记录</h2>
            </div>
            {pestDiseaseLogs.length > 0 ? (
              <div className="space-y-4">
                {pestDiseaseLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-red-50 border border-red-100"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                          <Bug className="w-3 h-3" />
                          病虫害
                        </span>
                        <span className="text-xs text-red-400">{log.date}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-red-800 mb-2">{log.title}</h4>
                    <p className="text-sm text-red-700 leading-relaxed mb-3">
                      {log.description}
                    </p>
                    {log.photos && log.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {log.photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="relative aspect-video rounded-lg overflow-hidden bg-red-100 group"
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption || log.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-forest-600 leading-relaxed">
                {record.pestDisease || '暂无病虫害记录'}
              </p>
            )}
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

      {showAddLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold text-forest-800">添加生长日志</h3>
              <button
                onClick={() => setShowAddLogModal(false)}
                className="p-2 rounded-lg hover:bg-cream-100 text-forest-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">生长阶段 *</label>
                <select
                  value={logForm.stage}
                  onChange={(e) => setLogForm({ ...logForm, stage: e.target.value as GrowthStageType })}
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-white"
                >
                  {Object.entries(growthStageLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">日志标题 *</label>
                <input
                  type="text"
                  value={logForm.title}
                  onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                  placeholder="例如：种子发芽了！"
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">详细描述 *</label>
                <textarea
                  value={logForm.description}
                  onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                  placeholder="记录生长情况、操作、观察到的现象..."
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 h-28 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">日期 *</label>
                <input
                  type="date"
                  value={logForm.date}
                  onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">
                  环境条件 <span className="text-forest-400 font-normal">(可选)</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-forest-500 mb-1.5">
                      <Thermometer className="w-3 h-3" />
                      温度(°C)
                    </div>
                    <input
                      type="number"
                      value={logForm.temperature}
                      onChange={(e) => setLogForm({ ...logForm, temperature: e.target.value })}
                      placeholder="25"
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-forest-500 mb-1.5">
                      <Droplets className="w-3 h-3" />
                      湿度(%)
                    </div>
                    <input
                      type="number"
                      value={logForm.humidity}
                      onChange={(e) => setLogForm({ ...logForm, humidity: e.target.value })}
                      placeholder="65"
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-forest-500 mb-1.5">
                      <CloudSun className="w-3 h-3" />
                      天气
                    </div>
                    <input
                      type="text"
                      value={logForm.weather}
                      onChange={(e) => setLogForm({ ...logForm, weather: e.target.value })}
                      placeholder="晴"
                      className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    照片链接 <span className="text-forest-400 font-normal">(可选，用逗号分隔多个URL)</span>
                  </div>
                </label>
                <textarea
                  value={logForm.photos}
                  onChange={(e) => setLogForm({ ...logForm, photos: e.target.value })}
                  placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 h-20 resize-none font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddLogModal(false)}
                className="flex-1 py-2.5 border border-cream-300 text-forest-600 rounded-xl hover:bg-cream-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAddLog}
                disabled={!logForm.title.trim() || !logForm.description.trim() || !logForm.date}
                className="flex-1 py-2.5 bg-forest-600 hover:bg-forest-700 disabled:bg-forest-300 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加日志
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
