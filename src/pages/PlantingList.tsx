import { useState } from 'react';
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
  Lightbulb,
  Award,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { plantingMethodLabels, growthStageLabels, growthStageOrder } from '../types';

type TabType = 'all' | 'growing' | 'harvested' | 'excellent';

export default function PlantingList() {
  const navigate = useNavigate();
  const { currentUser, getPlantingRecordsByUser, getCurrentGrowthStage, getNextSuggestion, getGrowthLogsByPlantingRecord } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  const records = getPlantingRecordsByUser(currentUser.id);

  const incompleteRecords = records.filter(r => !r.harvestDate).slice(0, 3);

  const filteredRecords = records.filter(record => {
    switch (activeTab) {
      case 'growing':
        return !record.harvestDate;
      case 'harvested':
        return !!record.harvestDate;
      case 'excellent':
        return !!record.isExcellent;
      default:
        return true;
    }
  });

  const getCompletedStageCount = (recordId: string) => {
    const logs = getGrowthLogsByPlantingRecord(recordId);
    const completedStages = new Set(logs.map(l => l.stage));
    const mainStages = growthStageOrder.filter(s => s !== 'pest_disease');
    return mainStages.filter(s => completedStages.has(s)).length;
  };

  const totalMainStages = growthStageOrder.filter(s => s !== 'pest_disease').length;

  const getStageBadgeText = (record: any) => {
    if (record.harvestDate) return '已收获';
    const stage = getCurrentGrowthStage(record.id);
    if (stage) {
      const map: Record<string, string> = {
        '播种': '播种中',
        '发芽': '发芽中',
        '移栽': '移栽中',
        '开花': '开花中',
        '结果': '结果中',
        '病虫害': '病虫害中',
        '收获': '收获中',
        '留种': '留种中',
      };
      return map[stage] || stage;
    }
    return '待记录';
  };

  const getStageBadgeColor = (record: any) => {
    if (record.harvestDate) return 'bg-forest-600 text-white';
    const stage = getCurrentGrowthStage(record.id);
    const colorMap: Record<string, string> = {
      'sowing': 'bg-amber-500 text-white',
      'germination': 'bg-green-500 text-white',
      'transplant': 'bg-teal-500 text-white',
      'flowering': 'bg-pink-500 text-white',
      'fruiting': 'bg-orange-500 text-white',
      'pest_disease': 'bg-red-500 text-white',
      'harvest': 'bg-amber-600 text-white',
      'seed_saving': 'bg-forest-600 text-white',
    };
    const logs = getGrowthLogsByPlantingRecord(record.id);
    if (logs.length === 0) return 'bg-gray-400 text-white';
    const latestLog = logs[logs.length - 1];
    return colorMap[latestLog.stage] || 'bg-forest-500 text-white';
  };

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

      {records.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-cream-100 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-serif font-bold text-forest-800">下一步建议</h2>
          </div>

          {incompleteRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {incompleteRecords.map(record => {
                const stage = getCurrentGrowthStage(record.id);
                const suggestion = getNextSuggestion(record.id);
                return (
                  <div
                    key={record.id}
                    onClick={() => navigate(`/planting/${record.id}`)}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-cream-200 hover:border-forest-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-forest-800 text-sm">{record.seedName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStageBadgeColor(record)}`}>
                        {getStageBadgeText(record)}
                      </span>
                    </div>
                    <p className="text-xs text-forest-600 leading-relaxed">{suggestion}</p>
                    <div className="mt-3 flex items-center justify-end text-forest-500 text-xs font-medium">
                      <span>查看详情</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center border border-cream-200">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-forest-700 font-medium">🎉 太棒了！所有种植记录都已完成完整记录</p>
            </div>
          )}
        </div>
      )}

      {records.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { key: 'all', label: '全部', count: records.length },
            { key: 'growing', label: '生长中', count: records.filter(r => !r.harvestDate).length },
            { key: 'harvested', label: '已收获', count: records.filter(r => r.harvestDate).length },
            { key: 'excellent', label: '优秀档案', count: records.filter(r => r.isExcellent).length },
          ] as { key: TabType; label: string; count: number }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'bg-white text-forest-600 hover:bg-cream-100 border border-cream-200'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-forest-100' : 'text-forest-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record, index) => {
            const completedCount = getCompletedStageCount(record.id);
            const progressPercent = (completedCount / totalMainStages) * 100;

            return (
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
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm shadow-sm ${getStageBadgeColor(record)}`}>
                      {getStageBadgeText(record)}
                    </span>
                    {record.isExcellent && (
                      <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span className="text-xs font-bold">优秀</span>
                      </span>
                    )}
                  </div>
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
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-forest-600">生长进度</span>
                      <span className="text-xs text-forest-500 font-mono">{completedCount}/{totalMainStages} 阶段</span>
                    </div>
                    <div className="w-full h-1.5 bg-cream-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-forest-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {growthStageOrder.filter(s => s !== 'pest_disease').map((stage, i) => (
                        <div
                          key={stage}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i < completedCount ? 'bg-forest-500' : 'bg-cream-300'
                          }`}
                          title={growthStageLabels[stage]}
                        />
                      ))}
                    </div>
                  </div>

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
            );
          })}
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
