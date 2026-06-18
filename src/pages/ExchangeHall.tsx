import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Repeat, 
  Search, 
  Filter, 
  Plus,
  Clock,
  User,
  Tag,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  ExchangeCondition,
  exchangeConditionLabels,
  Species,
  speciesLabels,
} from '../types';

export default function ExchangeHall() {
  const navigate = useNavigate();
  const { exchanges, seeds, currentUser, addExchangeRequest } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState<ExchangeCondition | 'all'>('all');
  const [selectedSeedId, setSelectedSeedId] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyPlan, setApplyPlan] = useState('');

  const activeExchanges = exchanges.filter(e => e.status === 'active');

  const filteredExchanges = activeExchanges.filter(exchange => {
    const seed = seeds.find(s => s.id === exchange.seedId);
    if (!seed) return false;
    
    const matchSearch = seed.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCondition = conditionFilter === 'all' || exchange.condition === conditionFilter;
    return matchSearch && matchCondition;
  });

  const handleApply = (exchangeId: string, seedId: string) => {
    setSelectedSeedId(seedId);
    setShowApplyModal(true);
  };

  const submitApplication = () => {
    if (!selectedSeedId || !applyPlan.trim()) return;
    
    const exchange = activeExchanges.find(e => e.seedId === selectedSeedId);
    if (!exchange) return;

    addExchangeRequest({
      exchangeId: exchange.id,
      seedId: selectedSeedId,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      plan: applyPlan,
    });

    setShowApplyModal(false);
    setApplyPlan('');
    setSelectedSeedId(null);
  };

  const conditionColors: Record<ExchangeCondition, string> = {
    free: 'bg-green-100 text-green-700',
    exchange: 'bg-amber-100 text-amber-700',
    return: 'bg-blue-100 text-blue-700',
    community_only: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-forest-800">交换大厅</h1>
          <p className="text-forest-600 mt-1">发现社区分享的老品种种子</p>
        </div>
        <button
          onClick={() => navigate('/exchange/my')}
          className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          <Repeat className="w-5 h-5" />
          <span className="font-medium">我的交换</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-400" />
            <input
              type="text"
              placeholder="搜索种子名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 transition-all bg-cream-50"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value as ExchangeCondition | 'all')}
              className="pl-10 pr-8 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-cream-50 appearance-none cursor-pointer"
            >
              <option value="all">全部条件</option>
              {Object.entries(exchangeConditionLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-sm text-forest-500">
          <Tag className="w-4 h-4" />
          <span>共有 <strong className="text-forest-700">{filteredExchanges.length}</strong> 个分享</span>
        </div>
      </div>

      {filteredExchanges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExchanges.map((exchange, index) => {
            const seed = seeds.find(s => s.id === exchange.seedId);
            if (!seed) return null;
            
            return (
              <div 
                key={exchange.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 animate-slide-up"
              >
                <div className="relative h-44 bg-cream-100">
                  {seed.photos[0] && (
                    <img
                      src={seed.photos[0].url}
                      alt={seed.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${conditionColors[exchange.condition]}`}>
                      {exchangeConditionLabels[exchange.condition]}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-forest-600/90 text-white text-xs rounded-full backdrop-blur-sm">
                      {speciesLabels[seed.species]}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-serif font-bold text-forest-800 mb-1">
                    {seed.name}
                  </h3>
                  
                  <p className="text-xs text-forest-400 font-mono mb-3">{seed.code}</p>
                  
                  <p className="text-sm text-forest-600 line-clamp-2 mb-4">
                    {exchange.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center gap-2 text-forest-500">
                      <User className="w-4 h-4" />
                      <span>{exchange.sharerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 font-medium">
                      <span>{exchange.quantity}g</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-forest-400 mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>发布于 {exchange.createdAt}</span>
                  </div>
                  
                  <button
                    onClick={() => handleApply(exchange.id, exchange.seedId)}
                    className="w-full py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors font-medium"
                  >
                    申请交换
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 shadow-card text-center">
          <Repeat className="w-16 h-16 text-cream-300 mx-auto mb-4" />
          <p className="text-forest-400">暂无可用的分享</p>
          <p className="text-sm text-forest-300 mt-1">来发布第一个分享吧</p>
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-serif font-bold text-forest-800 mb-4">申请交换</h3>
            <p className="text-sm text-forest-600 mb-4">
              请填写您的种植计划，分享者确认后将安排线下交换。
            </p>
            <textarea
              value={applyPlan}
              onChange={(e) => setApplyPlan(e.target.value)}
              placeholder="您打算什么时候种？种在哪里？有什么种植计划？"
              className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 h-32 resize-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-2.5 border border-cream-300 text-forest-600 rounded-xl hover:bg-cream-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={submitApplication}
                disabled={!applyPlan.trim()}
                className="flex-1 py-2.5 bg-forest-600 hover:bg-forest-700 disabled:bg-forest-300 text-white rounded-xl transition-colors font-medium"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
