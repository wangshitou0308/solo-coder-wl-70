import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save,
  Star,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  PlantingMethod,
  plantingMethodLabels,
} from '../types';

export default function PlantingNew() {
  const navigate = useNavigate();
  const { currentUser, seeds, addPlantingRecord } = useAppStore();
  
  const [formData, setFormData] = useState({
    seedId: '',
    plantDate: new Date().toISOString().split('T')[0],
    location: '',
    method: 'direct' as PlantingMethod,
    germinationDate: '',
    floweringDate: '',
    fruitingDate: '',
    pestDisease: '',
    harvestDate: '',
    harvestYield: '',
    tasteRating: 3,
    yieldRating: 3,
    diseaseRating: 3,
    adaptabilityRating: 3,
    review: '',
  });

  const mySeeds = seeds;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.seedId) return;
    
    const seed = seeds.find(s => s.id === formData.seedId);
    if (!seed) return;

    const overallRating = (
      formData.tasteRating +
      formData.yieldRating +
      formData.diseaseRating +
      formData.adaptabilityRating
    ) / 4;

    addPlantingRecord({
      seedId: formData.seedId,
      userId: currentUser.id,
      userName: currentUser.name,
      seedBatchCode: seed.code,
      seedName: seed.name,
      plantDate: formData.plantDate,
      location: formData.location,
      method: formData.method,
      germinationDate: formData.germinationDate || undefined,
      floweringDate: formData.floweringDate || undefined,
      fruitingDate: formData.fruitingDate || undefined,
      pestDisease: formData.pestDisease,
      harvestDate: formData.harvestDate || undefined,
      harvestYield: formData.harvestYield ? parseInt(formData.harvestYield) : undefined,
      tasteRating: formData.tasteRating,
      yieldRating: formData.yieldRating,
      diseaseRating: formData.diseaseRating,
      adaptabilityRating: formData.adaptabilityRating,
      overallRating: Number(overallRating.toFixed(1)),
      review: formData.review,
      photos: [],
    });

    navigate('/planting');
  };

  const inputClass = "w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 transition-all bg-white";
  const labelClass = "block text-sm font-medium text-forest-700 mb-2";
  const sectionTitleClass = "text-lg font-serif font-bold text-forest-800 mb-4";

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (v: number) => void;
    label: string;
  }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-7 h-7 ${
                star <= value
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-cream-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/planting')}
        className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回种植记录</span>
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-card">
        <h1 className="text-2xl font-serif font-bold text-forest-800 mb-2">新增种植记录</h1>
        <p className="text-forest-500">记录您的种植过程与收获体验</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>选择种子 *</label>
              <select
                required
                value={formData.seedId}
                onChange={(e) => setFormData({ ...formData, seedId: e.target.value })}
                className={inputClass}
              >
                <option value="">请选择种子品种</option>
                {mySeeds.map((seed) => (
                  <option key={seed.id} value={seed.id}>
                    {seed.name} ({seed.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>种植日期 *</label>
              <input
                type="date"
                required
                value={formData.plantDate}
                onChange={(e) => setFormData({ ...formData, plantDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>种植方式 *</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as PlantingMethod })}
                className={inputClass}
              >
                {Object.entries(plantingMethodLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>种植地点 *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={inputClass}
                placeholder="如：自家后院菜园东头"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>生长阶段</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>出苗日期</label>
              <input
                type="date"
                value={formData.germinationDate}
                onChange={(e) => setFormData({ ...formData, germinationDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>开花日期</label>
              <input
                type="date"
                value={formData.floweringDate}
                onChange={(e) => setFormData({ ...formData, floweringDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>结果日期</label>
              <input
                type="date"
                value={formData.fruitingDate}
                onChange={(e) => setFormData({ ...formData, fruitingDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>收获日期</label>
              <input
                type="date"
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          
          {formData.harvestDate && (
            <div className="mt-4">
              <label className={labelClass}>收获产量 (克)</label>
              <input
                type="number"
                min="0"
                value={formData.harvestYield}
                onChange={(e) => setFormData({ ...formData, harvestYield: e.target.value })}
                className={inputClass}
                placeholder="收获总产量"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>病虫害记录</h2>
          <textarea
            value={formData.pestDisease}
            onChange={(e) => setFormData({ ...formData, pestDisease: e.target.value })}
            className={`${inputClass} resize-none h-24`}
            placeholder="记录遇到的病虫害情况及处理方式..."
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>种植评价</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <StarRating
              value={formData.tasteRating}
              onChange={(v) => setFormData({ ...formData, tasteRating: v })}
              label="口感"
            />
            <StarRating
              value={formData.yieldRating}
              onChange={(v) => setFormData({ ...formData, yieldRating: v })}
              label="产量"
            />
            <StarRating
              value={formData.diseaseRating}
              onChange={(v) => setFormData({ ...formData, diseaseRating: v })}
              label="抗病性"
            />
            <StarRating
              value={formData.adaptabilityRating}
              onChange={(v) => setFormData({ ...formData, adaptabilityRating: v })}
              label="适应性"
            />
          </div>
          
          <div>
            <label className={labelClass}>种植体验</label>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              className={`${inputClass} resize-none h-32`}
              placeholder="分享您的种植体验、心得或建议..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/planting')}
            className="px-6 py-3 border border-cream-300 text-forest-600 rounded-xl hover:bg-cream-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg font-medium"
          >
            <Save className="w-5 h-5" />
            保存记录
          </button>
        </div>

        <p className="text-center text-sm text-forest-500 italic">
          提示：记录创建后，可在详情页添加各阶段的详细生长日志，形成完整的种植档案。
        </p>
      </form>
    </div>
  );
}
