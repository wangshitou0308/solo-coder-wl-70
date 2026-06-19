import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Clock,
  Check,
  X,
  Send,
  Inbox,
  Share2,
  Package,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  ExchangeCondition,
  exchangeConditionLabels,
} from '../types';

type TabType = 'shares' | 'requests';

export default function MyExchange() {
  const navigate = useNavigate();
  const { 
    currentUser, 
    seeds, 
    exchanges, 
    exchangeRequests,
    getRequestsByExchange,
    getRequestsByRequester,
    approveExchangeRequest,
    rejectExchangeRequest,
    completeExchangeRequest,
    addExchange,
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('shares');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishForm, setPublishForm] = useState({
    seedId: '',
    quantity: 50,
    condition: 'free' as ExchangeCondition,
    description: '',
  });

  const myExchanges = exchanges.filter(e => e.sharerId === currentUser.id);
  const myRequests = getRequestsByRequester(currentUser.id);

  const selectedSeed = seeds.find(s => s.id === publishForm.seedId);
  const maxQuantity = selectedSeed?.quantity || 0;
  const isQuantityValid = publishForm.quantity > 0 && publishForm.quantity <= maxQuantity;

  const handlePublish = () => {
    if (!publishForm.seedId || !publishForm.description.trim() || !isQuantityValid) return;
    
    addExchange({
      seedId: publishForm.seedId,
      sharerId: currentUser.id,
      sharerName: currentUser.name,
      quantity: publishForm.quantity,
      condition: publishForm.condition,
      description: publishForm.description,
    });

    setShowPublishModal(false);
    setPublishForm({
      seedId: '',
      quantity: 50,
      condition: 'free',
      description: '',
    });
  };

  const handleApprove = (requestId: string) => {
    approveExchangeRequest(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectExchangeRequest(requestId);
  };

  const handleComplete = (requestId: string) => {
    completeExchangeRequest(requestId);
  };

  const mySeeds = seeds.filter(s => s.ownerId === currentUser.id);

  const requestStatusLabels: Record<string, { text: string; color: string }> = {
    pending: { text: '待确认', color: 'bg-amber-100 text-amber-700' },
    approved: { text: '已确认', color: 'bg-green-100 text-green-700' },
    rejected: { text: '已拒绝', color: 'bg-red-100 text-red-700' },
    completed: { text: '已完成', color: 'bg-forest-100 text-forest-700' },
  };

  const exchangeStatusLabels: Record<string, { text: string; color: string }> = {
    active: { text: '进行中', color: 'bg-green-100 text-green-700' },
    exchanged: { text: '已交换', color: 'bg-forest-100 text-forest-700' },
    closed: { text: '已关闭', color: 'bg-gray-100 text-gray-700' },
  };

  const conditionColors: Record<ExchangeCondition, string> = {
    free: 'bg-green-100 text-green-700',
    exchange: 'bg-amber-100 text-amber-700',
    return: 'bg-blue-100 text-blue-700',
    community_only: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/exchange')}
        className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回交换大厅</span>
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-forest-800">我的交换</h1>
          <p className="text-forest-600 mt-1">管理您的分享与申请</p>
        </div>
        <button
          onClick={() => setShowPublishModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">发布分享</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex border-b border-cream-200">
          <button
            onClick={() => setActiveTab('shares')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'shares'
                ? 'text-forest-700 border-b-2 border-forest-600 bg-forest-50/50'
                : 'text-forest-400 hover:text-forest-600'
            }`}
          >
            <Share2 className="w-4 h-4" />
            我的分享
            <span className="text-xs bg-cream-200 text-forest-600 px-2 py-0.5 rounded-full">
              {myExchanges.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'requests'
                ? 'text-forest-700 border-b-2 border-forest-600 bg-forest-50/50'
                : 'text-forest-400 hover:text-forest-600'
            }`}
          >
            <Inbox className="w-4 h-4" />
            我的申请
            <span className="text-xs bg-cream-200 text-forest-600 px-2 py-0.5 rounded-full">
              {myRequests.length}
            </span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'shares' && (
            <div className="space-y-4">
              {myExchanges.length > 0 ? (
                myExchanges.map((exchange) => {
                  const seed = seeds.find(s => s.id === exchange.seedId);
                  const requests = getRequestsByExchange(exchange.id);
                  
                  return (
                    <div key={exchange.id} className="border border-cream-200 rounded-xl p-5 hover:shadow-soft transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                          {seed?.photos[0] && (
                            <img src={seed.photos[0].url} alt={seed.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-serif font-bold text-forest-800">
                              {seed?.name}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${exchangeStatusLabels[exchange.status].color}`}>
                              {exchangeStatusLabels[exchange.status].text}
                            </span>
                          </div>
                          <p className="text-xs text-forest-400 mb-2">{exchange.quantity}g · {exchange.createdAt}</p>
                          <p className="text-sm text-forest-600 line-clamp-1">{exchange.description}</p>
                          
                          {requests.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-cream-100">
                              <p className="text-xs text-forest-500 mb-3">收到 {requests.length} 个申请</p>
                              <div className="space-y-2">
                                {requests.slice(0, 3).map((req) => (
                                  <div key={req.id} className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg">
                                    <img 
                                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${req.requesterName}&backgroundColor=52804e`}
                                      alt={req.requesterName}
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-forest-700">{req.requesterName}</p>
                                      <p className="text-xs text-forest-400 line-clamp-1">{req.plan}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${requestStatusLabels[req.status].color}`}>
                                      {requestStatusLabels[req.status].text}
                                    </span>
                                    {req.status === 'pending' && (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => handleApprove(req.id)}
                                          className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleReject(req.id)}
                                          className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                    {req.status === 'approved' && (
                                      <button
                                        onClick={() => handleComplete(req.id)}
                                        className="px-3 py-1 text-xs font-medium bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
                                      >
                                        完成交换
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Share2 className="w-12 h-12 text-cream-300 mx-auto mb-3" />
                  <p className="text-forest-400">还没有发布分享</p>
                  <p className="text-sm text-forest-300 mt-1">分享您的种子，让老品种流传下去</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {myRequests.length > 0 ? (
                myRequests.map((request) => {
                  const seed = seeds.find(s => s.id === request.seedId);
                  const exchange = exchanges.find(e => e.id === request.exchangeId);
                  
                  return (
                    <div key={request.id} className="border border-cream-200 rounded-xl p-5 hover:shadow-soft transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                          {seed?.photos[0] && (
                            <img src={seed.photos[0].url} alt={seed.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-serif font-bold text-forest-800">
                              {seed?.name}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${requestStatusLabels[request.status].color}`}>
                              {requestStatusLabels[request.status].text}
                            </span>
                          </div>
                          <p className="text-xs text-forest-400 mb-2">
                            分享者: {exchange?.sharerName} · 申请于 {request.requestDate}
                          </p>
                          <p className="text-sm text-forest-600">
                            <span className="text-forest-400">种植计划: </span>
                            {request.plan}
                          </p>
                          {request.exchangeDate && (
                            <p className="text-xs text-forest-400 mt-2">
                              交换日期: {request.exchangeDate}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Send className="w-12 h-12 text-cream-300 mx-auto mb-3" />
                  <p className="text-forest-400">还没有提交申请</p>
                  <p className="text-sm text-forest-300 mt-1">去交换大厅看看有什么好种子</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-serif font-bold text-forest-800 mb-4">发布种子分享</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">选择种子 *</label>
                <select
                  value={publishForm.seedId}
                  onChange={(e) => setPublishForm({ ...publishForm, seedId: e.target.value })}
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-white"
                >
                  <option value="">请选择您要分享的种子</option>
                  {mySeeds.map((seed) => (
                    <option key={seed.id} value={seed.id}>
                      {seed.name} ({seed.quantity}g)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">
                  分享数量(克) *
                  {selectedSeed && (
                    <span className="text-forest-400 font-normal ml-2">
                      (库存: {maxQuantity}g)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity || undefined}
                  value={publishForm.quantity}
                  onChange={(e) => setPublishForm({ ...publishForm, quantity: Math.min(parseInt(e.target.value) || 0, maxQuantity) })}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 transition-colors ${
                    selectedSeed && !isQuantityValid ? 'border-red-400 bg-red-50' : 'border-cream-300'
                  }`}
                />
                {selectedSeed && !isQuantityValid && (
                  <p className="text-xs text-red-500 mt-1">分享数量不能超过库存数量 {maxQuantity}g</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">分享条件 *</label>
                <select
                  value={publishForm.condition}
                  onChange={(e) => setPublishForm({ ...publishForm, condition: e.target.value as ExchangeCondition })}
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-white"
                >
                  {Object.entries(exchangeConditionLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">分享说明 *</label>
                <textarea
                  value={publishForm.description}
                  onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                  placeholder="介绍一下这个品种，以及您对交换的期望..."
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 h-28 resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-2.5 border border-cream-300 text-forest-600 rounded-xl hover:bg-cream-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handlePublish}
                disabled={!publishForm.seedId || !publishForm.description.trim() || !isQuantityValid}
                className="flex-1 py-2.5 bg-forest-600 hover:bg-forest-700 disabled:bg-forest-300 text-white rounded-xl transition-colors font-medium"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
