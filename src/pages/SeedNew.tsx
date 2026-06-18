import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  Save,
  X,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  Species, 
  VarietyType, 
  SeedSource, 
  StorageCondition,
  speciesLabels,
  varietyTypeLabels,
  sourceLabels,
  storageConditionLabels,
} from '../types';

export default function SeedNew() {
  const navigate = useNavigate();
  const { addSeed, currentUser } = useAppStore();
  
  const [formData, setFormData] = useState({
    name: '',
    species: 'vegetable' as Species,
    varietyType: 'heirloom' as VarietyType,
    collectYear: new Date().getFullYear(),
    source: 'self' as SeedSource,
    quantity: 100,
    germinationRate: 85,
    storageCondition: 'normal' as StorageCondition,
    diseaseResistance: '',
    taste: '',
    yield: '',
    adaptability: '',
    history: '',
    plantingSeason: '',
  });

  const [photos, setPhotos] = useState<{ url: string; type: 'seed' | 'plant' | 'fruit'; description: string }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addSeed({
      ...formData,
      photos: photos.map((p, i) => ({
        id: `photo-${i}`,
        url: p.url,
        type: p.type,
        description: p.description,
      })),
      ownerId: currentUser.id,
      isEndangered: false,
    });

    navigate('/seeds');
  };

  const handleAddPhoto = () => {
    const samplePhotos = [
      { url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop', type: 'plant' as const, description: '植株照片' },
      { url: 'https://images.unsplash.com/photo-1592924357228-91a9daadcfea?w=400&h=300&fit=crop', type: 'fruit' as const, description: '果实照片' },
      { url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop', type: 'seed' as const, description: '种子照片' },
    ];
    const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    setPhotos([...photos, randomPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const inputClass = "w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 transition-all bg-white";
  const labelClass = "block text-sm font-medium text-forest-700 mb-2";
  const sectionTitleClass = "text-lg font-serif font-bold text-forest-800 mb-4";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/seeds')}
        className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回种子列表</span>
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-card">
        <h1 className="text-2xl font-serif font-bold text-forest-800 mb-2">录入新种子</h1>
        <p className="text-forest-500">填写种子详细信息，加入社区种子银行</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>品种名称 *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="如：老北京心里美萝卜"
              />
            </div>
            <div>
              <label className={labelClass}>物种分类 *</label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value as Species })}
                className={inputClass}
              >
                {Object.entries(speciesLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>品种类型 *</label>
              <select
                value={formData.varietyType}
                onChange={(e) => setFormData({ ...formData, varietyType: e.target.value as VarietyType })}
                className={inputClass}
              >
                {Object.entries(varietyTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>采集/入馆年份 *</label>
              <input
                type="number"
                required
                min="1900"
                max="2100"
                value={formData.collectYear}
                onChange={(e) => setFormData({ ...formData, collectYear: parseInt(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>种子来源 *</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as SeedSource })}
                className={inputClass}
              >
                {Object.entries(sourceLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>数量与储存</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>数量(克) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>发芽率(%) *</label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={formData.germinationRate}
                onChange={(e) => setFormData({ ...formData, germinationRate: parseInt(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>储存条件 *</label>
              <select
                value={formData.storageCondition}
                onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value as StorageCondition })}
                className={inputClass}
              >
                {Object.entries(storageConditionLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>照片</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-cream-100">
                <img src={photo.url} alt="种子照片" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddPhoto}
              className="aspect-square rounded-xl border-2 border-dashed border-cream-300 flex flex-col items-center justify-center text-forest-400 hover:border-forest-400 hover:text-forest-600 transition-colors"
            >
              <Upload className="w-6 h-6 mb-1" />
              <span className="text-xs">添加照片</span>
            </button>
          </div>
          <p className="text-xs text-forest-400">支持种子、植株、果实照片，最多上传8张</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>品种特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>抗病性</label>
              <textarea
                value={formData.diseaseResistance}
                onChange={(e) => setFormData({ ...formData, diseaseResistance: e.target.value })}
                className={`${inputClass} resize-none h-24`}
                placeholder="描述该品种的抗病能力..."
              />
            </div>
            <div>
              <label className={labelClass}>口感</label>
              <textarea
                value={formData.taste}
                onChange={(e) => setFormData({ ...formData, taste: e.target.value })}
                className={`${inputClass} resize-none h-24`}
                placeholder="描述口感风味特点..."
              />
            </div>
            <div>
              <label className={labelClass}>产量</label>
              <textarea
                value={formData.yield}
                onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                className={`${inputClass} resize-none h-24`}
                placeholder="描述产量情况..."
              />
            </div>
            <div>
              <label className={labelClass}>适应性</label>
              <textarea
                value={formData.adaptability}
                onChange={(e) => setFormData({ ...formData, adaptability: e.target.value })}
                className={`${inputClass} resize-none h-24`}
                placeholder="描述环境适应能力..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <h2 className={sectionTitleClass}>历史故事</h2>
          <textarea
            value={formData.history}
            onChange={(e) => setFormData({ ...formData, history: e.target.value })}
            className={`${inputClass} resize-none h-32`}
            placeholder="讲讲这个品种的来历、故事，或者您与它的渊源..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/seeds')}
            className="px-6 py-3 border border-cream-300 text-forest-600 rounded-xl hover:bg-cream-50 transition-colors font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg font-medium"
          >
            <Save className="w-5 h-5" />
            保存入库
          </button>
        </div>
      </form>
    </div>
  );
}
