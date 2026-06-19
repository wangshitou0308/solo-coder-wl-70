import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save,
  AlertTriangle,
  Package,
  Thermometer,
  Calendar,
  Target,
  FileText,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  speciesLabels,
  endangeredReasonLabels,
  varietyTypeLabels,
} from '../types';

export default function ConservationTaskNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { seeds, currentUser, addConservationTask, getSeedEndangeredInfo } = useAppStore();
  
  const [formData, setFormData] = useState({
    seedId: '',
    title: '',
    description: '',
    requirements: '',
    targetQuantity: '',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    const seedId = searchParams.get('seedId');
    if (seedId && seeds.some(s => s.id === seedId)) {
      setFormData(prev => ({ ...prev, seedId }));
    }
  }, [searchParams, seeds]);

  const selectedSeed = seeds.find(s => s.id === formData.seedId);
  const endangeredInfo = selectedSeed ? getSeedEndangeredInfo(selectedSeed.id) : null;
  const isEndangered = endangeredInfo && endangeredInfo.reasons.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.seedId) return;
    
    const seed = seeds.find(s => s.id === formData.seedId);
    if (!seed) return;

    addConservationTask({
      seedId: formData.seedId,
      seedName: seed.name,
      seedCode: seed.code,
      publisherId: currentUser.id,
      publisherName: currentUser.name,
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      targetQuantity: parseInt(formData.targetQuantity),
      deadline: formData.deadline,
    });

    navigate('/tasks');
  };

  const inputClass = "w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 transition-all bg-white";
  const labelClass = "block text-sm font-medium text-forest-700 mb-2";
  const sectionTitleClass = "text-lg font-serif font-bold text-forest-800 mb-4";

  const stockLevelColors: Record<string, string> = {
    low: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-green-100 text-green-700',
  };

  const stockLevelLabels: Record<string, string> = {
    low: '库存紧张',
    medium: '库存一般',
    high: '库存充足',
  };

  const germinationLevelColors: Record<string, string> = {
    low: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-green-100 text-green-700',
  };

  const germinationLevelLabels: Record<string, string> = {
    low: '发芽率低',
    medium: '发芽率一般',
    high: '发芽率良好',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回保护任务</span>
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-card">
        <h1 className="text-2xl font-serif font-bold text-forest-800 mb-2">发布保护任务</h1>
        <p className="text-forest-500">发起老品种复壮与保护任务，携手守护种质资源</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>选择品种</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>选择种子品种 *</label>
              <div className="relative">
                <select
                  required
                  value={formData.seedId}
                  onChange={(e) => setFormData({ ...formData, seedId: e.target.value })}
                  className={`${inputClass} pr-10`}
                >
                  <option value="">请选择种子品种</option>
                  {seeds.map((seed) => {
                    const info = getSeedEndangeredInfo(seed.id);
                    const hasRisk = info && info.reasons.length > 0;
                    return (
                      <option key={seed.id} value={seed.id}>
                        {seed.name} ({seed.code}){hasRisk ? ' ⚠️ 需保护' : ''}
                      </option>
                    );
                  })}
                </select>
                {isEndangered && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                )}
              </div>
            </div>

            {isEndangered && endangeredInfo && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 mb-2">该品种需保护</p>
                    <div className="flex flex-wrap gap-2">
                      {endangeredInfo.reasons.map((reason) => (
                        <span
                          key={reason}
                          className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700"
                        >
                          {endangeredReasonLabels[reason]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedSeed && (
              <div className="bg-cream-50 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif font-bold text-forest-800 text-lg">
                        {selectedSeed.name}
                      </h3>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-forest-100 text-forest-700">
                        {speciesLabels[selectedSeed.species]}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cream-200 text-forest-600">
                        {varietyTypeLabels[selectedSeed.varietyType]}
                      </span>
                    </div>
                    <p className="text-sm text-forest-500">
                      编号: {selectedSeed.code} · 采集年份: {selectedSeed.collectYear}年
                    </p>
                  </div>
                  {selectedSeed.photos[0] && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                      <img
                        src={selectedSeed.photos[0].url}
                        alt={selectedSeed.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-cream-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Package className="w-4 h-4 text-forest-500" />
                      <span className="text-xs text-forest-500">当前库存</span>
                    </div>
                    <p className="font-bold text-forest-800 text-lg mb-1">
                      {selectedSeed.quantity}g
                    </p>
                    {endangeredInfo && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${stockLevelColors[endangeredInfo.stockLevel]}`}>
                        {stockLevelLabels[endangeredInfo.stockLevel]}
                      </span>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-cream-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Thermometer className="w-4 h-4 text-forest-500" />
                      <span className="text-xs text-forest-500">发芽率</span>
                    </div>
                    <p className="font-bold text-forest-800 text-lg mb-1">
                      {selectedSeed.germinationRate}%
                    </p>
                    {endangeredInfo && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${germinationLevelColors[endangeredInfo.germinationLevel]}`}>
                        {germinationLevelLabels[endangeredInfo.germinationLevel]}
                      </span>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-cream-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calendar className="w-4 h-4 text-forest-500" />
                      <span className="text-xs text-forest-500">上次更新</span>
                    </div>
                    <p className="font-bold text-forest-800 text-lg mb-1">
                      {selectedSeed.lastUpdateDate}
                    </p>
                    {endangeredInfo && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cream-200 text-forest-600">
                        {endangeredInfo.lastUpdateYears}年前
                      </span>
                    )}
                  </div>
                </div>

                {endangeredInfo && endangeredInfo.reasons.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 mb-2">保护原因说明</p>
                    <ul className="space-y-1">
                      {endangeredInfo.reasons.map((reason) => (
                        <li key={reason} className="flex items-start gap-2 text-sm text-amber-700">
                          <span className="text-amber-500 mt-1">•</span>
                          <span>
                            {reason === 'old_update' && `该品种已 ${endangeredInfo.lastUpdateYears} 年未更新，种质活力可能下降，需通过重新种植复壮。`}
                            {reason === 'low_stock' && `当前库存仅 ${selectedSeed.quantity}g，低于安全阈值 200g，需扩繁保种。`}
                            {reason === 'low_germination' && `发芽率仅 ${selectedSeed.germinationRate}%，低于 75% 标准线，需重新种植更新种子。`}
                            {reason === 'manual' && '该品种被人工标记为需保护状态。'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>任务信息</h2>
          <div className="space-y-5">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-forest-500" />
                  任务标题 *
                </span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClass}
                placeholder="如：红心胡萝卜2026年度复壮保种任务"
                maxLength={100}
              />
              <p className="text-xs text-forest-400 mt-1 text-right">
                {formData.title.length}/100
              </p>
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-forest-500" />
                  任务描述 *
                </span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`${inputClass} resize-none h-36`}
                placeholder="描述本次保护任务的背景、意义和目标。例如：该品种为当地传统农家种，具有极高的风味价值，但库存不足且发芽率下降，急需通过种植扩繁来保存种质资源..."
                maxLength={2000}
              />
              <p className="text-xs text-forest-400 mt-1 text-right">
                {formData.description.length}/2000
              </p>
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-forest-500" />
                  技术要求 *
                </span>
              </label>
              <textarea
                required
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className={`${inputClass} resize-none h-36`}
                placeholder="详细说明种植技术要求、注意事项、留种标准等。例如：1. 选择排水良好、肥沃的沙壤土；2. 株行距 30x40cm；3. 开花期隔离其他胡萝卜品种，防止串粉；4. 选择典型植株留种，去除杂株劣株；5. 种子充分成熟后采收..."
                maxLength={3000}
              />
              <p className="text-xs text-forest-400 mt-1 text-right">
                {formData.requirements.length}/3000
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>任务目标</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-forest-500" />
                  目标留种量 (克) *
                </span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.targetQuantity}
                onChange={(e) => setFormData({ ...formData, targetQuantity: e.target.value })}
                className={inputClass}
                placeholder="请输入目标留种重量"
              />
              {selectedSeed && (
                <p className="text-xs text-forest-400 mt-1">
                  当前库存 {selectedSeed.quantity}g，建议目标量为库存的 2-5 倍
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-forest-500" />
                  完成截止日期 *
                </span>
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={inputClass}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-forest-400 mt-1">
                请考虑品种生长周期，留出充足时间
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="px-6 py-3 border border-cream-300 text-forest-600 rounded-xl hover:bg-cream-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!formData.seedId || !formData.title.trim() || !formData.description.trim() || !formData.requirements.trim() || !formData.targetQuantity || !formData.deadline}
            className="flex items-center gap-2 px-6 py-3 bg-forest-600 hover:bg-forest-700 disabled:bg-forest-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-md hover:shadow-lg font-medium"
          >
            <Save className="w-5 h-5" />
            发布任务
          </button>
        </div>
      </form>
    </div>
  );
}
