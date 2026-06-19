import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Package,
  Thermometer,
  Clock,
  Plus,
  ChevronRight,
  Target,
  CheckCircle,
  Activity,
  Filter,
  Search,
  X,
  Sprout,
  User,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import {
  Seed,
  ConservationTask,
  EndangeredReason,
  endangeredReasonLabels,
  taskStatusLabels,
  taskStatusColors,
  speciesLabels,
  varietyTypeLabels,
} from '../types';

type FilterTab = 'all' | EndangeredReason;
type ViewTab = 'seeds' | 'tasks';

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  title: string;
  value: number;
  subtitle: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-2xl p-6 shadow-card hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2 font-serif">{value}</p>
          <p className="text-xs text-white/70 mt-2">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center backdrop-blur-sm`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function getStockColor(level: 'low' | 'medium' | 'high') {
  switch (level) {
    case 'low':
      return 'text-red-600 bg-red-100';
    case 'medium':
      return 'text-amber-600 bg-amber-100';
    case 'high':
      return 'text-forest-600 bg-forest-100';
  }
}

function getGerminationColor(level: 'low' | 'medium' | 'high') {
  switch (level) {
    case 'low':
      return 'text-red-600 bg-red-100';
    case 'medium':
      return 'text-amber-600 bg-amber-100';
    case 'high':
      return 'text-forest-600 bg-forest-100';
  }
}

function getReasonBadgeColor(reason: EndangeredReason) {
  switch (reason) {
    case 'old_update':
      return 'bg-orange-100 text-orange-700';
    case 'low_stock':
      return 'bg-red-100 text-red-700';
    case 'low_germination':
      return 'bg-amber-100 text-amber-700';
    case 'manual':
      return 'bg-purple-100 text-purple-700';
  }
}

export default function EndangeredZone() {
  const navigate = useNavigate();
  const {
    getEndangeredSeeds,
    getSeedEndangeredInfo,
    getAllTasks,
    currentUser,
    addConservationTask,
  } = useAppStore();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [activeView, setActiveView] = useState<ViewTab>('seeds');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskRequirements, setTaskRequirements] = useState('');
  const [taskTargetQuantity, setTaskTargetQuantity] = useState(300);
  const [taskDeadline, setTaskDeadline] = useState('');

  const endangeredSeeds = useMemo(() => getEndangeredSeeds(), [getEndangeredSeeds]);
  const allTasks = useMemo(() => getAllTasks(), [getAllTasks]);

  const endangeredTaskSeedIds = useMemo(() => {
    const seedIds = new Set(endangeredSeeds.map((s) => s.id));
    return allTasks.filter((t) => seedIds.has(t.seedId));
  }, [endangeredSeeds, allTasks]);

  const seedsWithActiveTasks = useMemo(() => {
    return new Set(
      endangeredTaskSeedIds
        .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
        .map((t) => t.seedId)
    );
  }, [endangeredTaskSeedIds]);

  const stats = useMemo(() => {
    const pendingRejuvenation = endangeredSeeds.filter(
      (s) => !seedsWithActiveTasks.has(s.id)
    ).length;
    const inProgressTasks = endangeredTaskSeedIds.filter(
      (t) => t.status === 'in_progress' || t.status === 'claimed'
    ).length;
    const completedTasks = endangeredTaskSeedIds.filter(
      (t) => t.status === 'completed'
    ).length;
    const lowStockWarning = endangeredSeeds.filter((s) => {
      const info = getSeedEndangeredInfo(s.id);
      return info?.stockLevel === 'low';
    }).length;

    return {
      pendingRejuvenation,
      inProgressTasks,
      completedTasks,
      lowStockWarning,
    };
  }, [endangeredSeeds, endangeredTaskSeedIds, seedsWithActiveTasks, getSeedEndangeredInfo]);

  const filteredSeeds = useMemo(() => {
    return endangeredSeeds.filter((seed) => {
      const matchSearch =
        seed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seed.code.toLowerCase().includes(searchTerm.toLowerCase());

      if (activeFilter === 'all') return matchSearch;

      const info = getSeedEndangeredInfo(seed.id);
      if (!info) return false;
      return matchSearch && info.reasons.includes(activeFilter);
    });
  }, [endangeredSeeds, activeFilter, searchTerm, getSeedEndangeredInfo]);

  const filterTabs: { key: FilterTab; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: '全部', icon: Filter },
    { key: 'old_update', label: '三年未更新', icon: Clock },
    { key: 'low_stock', label: '库存低', icon: Package },
    { key: 'low_germination', label: '发芽率低', icon: Thermometer },
    { key: 'manual', label: '人工标记', icon: AlertTriangle },
  ];

  const openTaskModal = (seed: Seed) => {
    setSelectedSeed(seed);
    setTaskTitle(`${seed.name}复壮保种任务`);
    setTaskDescription(
      `${seed.name}（${seed.code}）为濒危品种，${speciesLabels[seed.species]}类${varietyTypeLabels[seed.varietyType]}，需扩繁复壮以保持种质资源活力。`
    );
    setTaskRequirements(
      '1. 选择具有典型性状的地块隔离种植；\n2. 全生育期记录生长情况，每阶段拍照存档；\n3. 严格去杂去劣，选择优良典型植株留种；\n4. 收获后精选，单独脱粒保存。'
    );
    setTaskTargetQuantity(Math.max(300, seed.quantity));
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setTaskDeadline(nextYear.toISOString().split('T')[0]);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedSeed(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskRequirements('');
    setTaskTargetQuantity(300);
    setTaskDeadline('');
  };

  const handleSubmitTask = () => {
    if (!selectedSeed) return;
    addConservationTask({
      seedId: selectedSeed.id,
      seedName: selectedSeed.name,
      seedCode: selectedSeed.code,
      publisherId: currentUser.id,
      publisherName: currentUser.name,
      title: taskTitle,
      description: taskDescription,
      requirements: taskRequirements,
      targetQuantity: taskTargetQuantity,
      deadline: taskDeadline,
    });
    closeTaskModal();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-forest-800">濒危品种专区</h1>
          <p className="text-forest-600 mt-1">
            关注珍贵种质资源，共 <strong className="text-amber-600">{endangeredSeeds.length}</strong> 个品种亟待保育
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={AlertTriangle}
          title="待复壮品种数"
          value={stats.pendingRejuvenation}
          subtitle="暂无进行中任务"
          color="bg-white/20"
          bgColor="bg-gradient-to-br from-amber-500 to-amber-700"
        />
        <StatCard
          icon={Activity}
          title="进行中任务数"
          value={stats.inProgressTasks}
          subtitle="已领取或执行中"
          color="bg-white/20"
          bgColor="bg-gradient-to-br from-forest-500 to-forest-700"
        />
        <StatCard
          icon={CheckCircle}
          title="已完成任务数"
          value={stats.completedTasks}
          subtitle="成功保育品种"
          color="bg-white/20"
          bgColor="bg-gradient-to-br from-forest-400 to-forest-600"
        />
        <StatCard
          icon={Package}
          title="库存不足预警数"
          value={stats.lowStockWarning}
          subtitle="库存低于200克"
          color="bg-white/20"
          bgColor="bg-gradient-to-br from-red-500 to-red-700"
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('seeds')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeView === 'seeds'
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'bg-cream-100 text-forest-600 hover:bg-cream-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4" />
                <span>品种列表</span>
              </div>
            </button>
            <button
              onClick={() => setActiveView('tasks')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                activeView === 'tasks'
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'bg-cream-100 text-forest-600 hover:bg-cream-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>复壮任务</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeView === 'tasks' ? 'bg-white/20' : 'bg-forest-100 text-forest-600'
                }`}>
                  {endangeredTaskSeedIds.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {activeView === 'seeds' ? (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-400" />
                <input
                  type="text"
                  placeholder="搜索濒危品种名称或编号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 transition-all bg-cream-50"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeFilter === tab.key
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-cream-100 text-forest-600 hover:bg-cream-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {filteredSeeds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSeeds.map((seed, index) => {
                  const info = getSeedEndangeredInfo(seed.id);
                  if (!info) return null;

                  return (
                    <div
                      key={seed.id}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="animate-slide-up bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 border border-amber-100"
                    >
                      <div className="relative h-48 bg-cream-100 overflow-hidden">
                        {seed.photos[0] ? (
                          <img
                            src={seed.photos[0].url}
                            alt={seed.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sprout className="w-16 h-16 text-cream-300" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                          {info.reasons.map((reason) => (
                            <span
                              key={reason}
                              className={`px-3 py-1 text-xs rounded-full backdrop-blur-sm font-medium ${getReasonBadgeColor(
                                reason
                              )}`}
                            >
                              {endangeredReasonLabels[reason]}
                            </span>
                          ))}
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="px-3 py-1 bg-white/90 text-forest-700 text-xs font-medium rounded-full backdrop-blur-sm">
                            {varietyTypeLabels[seed.varietyType]}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-lg font-serif font-bold text-forest-800 line-clamp-1">
                            {seed.name}
                          </h3>
                          <span className="px-2 py-1 bg-forest-50 text-forest-600 text-xs rounded-lg font-medium flex-shrink-0">
                            {speciesLabels[seed.species]}
                          </span>
                        </div>

                        <p className="text-xs text-forest-400 font-mono mb-4">{seed.code}</p>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-forest-600">
                              <Package className="w-4 h-4 text-forest-400" />
                              <span>库存</span>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-lg ${getStockColor(
                                info.stockLevel
                              )}`}
                            >
                              {seed.quantity}g
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-forest-600">
                              <Thermometer className="w-4 h-4 text-forest-400" />
                              <span>发芽率</span>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-lg ${getGerminationColor(
                                info.germinationLevel
                              )}`}
                            >
                              {seed.germinationRate}%
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-forest-600">
                              <Clock className="w-4 h-4 text-forest-400" />
                              <span>上次更新</span>
                            </div>
                            <span
                              className={`text-xs font-medium ${
                                info.lastUpdateYears >= 3
                                  ? 'text-orange-600'
                                  : 'text-forest-500'
                              }`}
                            >
                              {info.lastUpdateYears >= 3
                                ? `${info.lastUpdateYears}年前 ⚠`
                                : seed.lastUpdateDate}
                            </span>
                          </div>
                        </div>

                        {seedsWithActiveTasks.has(seed.id) && (
                          <div className="mb-4 p-3 bg-forest-50 rounded-xl border border-forest-100">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-forest-500" />
                              <span className="text-xs text-forest-600 font-medium">
                                已有复壮任务进行中
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-cream-200 flex gap-3">
                          <button
                            onClick={() => navigate(`/seeds/${seed.id}`)}
                            className="flex-1 px-4 py-2.5 bg-cream-100 hover:bg-cream-200 text-forest-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <span>查看详情</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => openTaskModal(seed)}
                              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-md"
                            >
                              <Plus className="w-4 h-4" />
                              <span>发布任务</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-cream-50 rounded-2xl p-16 text-center">
                <AlertTriangle className="w-16 h-16 text-cream-300 mx-auto mb-4" />
                <p className="text-forest-400 font-medium">没有找到匹配的濒危品种</p>
                <p className="text-sm text-forest-300 mt-1">试试调整筛选条件或搜索关键词</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {endangeredTaskSeedIds.length > 0 ? (
              endangeredTaskSeedIds.map((task) => (
                <div
                  key={task.id}
                  className="p-5 bg-cream-50 rounded-2xl hover:shadow-card transition-all duration-300 border border-cream-200"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-serif font-bold text-forest-800 text-lg">{task.title}</h4>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${taskStatusColors[task.status]}`}
                        >
                          {taskStatusLabels[task.status]}
                        </span>
                      </div>
                      <p className="text-xs text-forest-400 font-mono mb-2">
                        {task.seedCode} · {task.seedName}
                      </p>
                      <p className="text-sm text-forest-600 line-clamp-2">{task.description}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/seeds/${task.seedId}`)}
                      className="p-2 bg-white rounded-xl text-forest-500 hover:text-forest-700 hover:bg-cream-100 transition-colors flex-shrink-0"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-cream-200 text-sm">
                    <div className="flex items-center gap-2 text-forest-500">
                      <User className="w-4 h-4" />
                      <span>发布：{task.publisherName}</span>
                    </div>
                    {task.claimedByName && (
                      <div className="flex items-center gap-2 text-forest-500">
                        <Sprout className="w-4 h-4" />
                        <span>执行：{task.claimedByName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-forest-500">
                      <Target className="w-4 h-4" />
                      <span>目标：{task.targetQuantity}g</span>
                    </div>
                    <div className="flex items-center gap-2 text-forest-500">
                      <Clock className="w-4 h-4" />
                      <span>截止：{task.deadline}</span>
                    </div>
                    {task.seedReturned !== undefined && (
                      <div className="flex items-center gap-2 text-forest-600 font-medium">
                        <CheckCircle className="w-4 h-4 text-forest-500" />
                        <span>已回收：{task.seedReturned}g</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-cream-50 rounded-2xl p-16 text-center">
                <Target className="w-16 h-16 text-cream-300 mx-auto mb-4" />
                <p className="text-forest-400 font-medium">暂无复壮任务</p>
                <p className="text-sm text-forest-300 mt-1">管理员可为濒危品种发布保种任务</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showTaskModal && selectedSeed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-cream-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-serif font-bold text-forest-800">发布复壮保种任务</h3>
                <p className="text-sm text-forest-500 mt-1">
                  {selectedSeed.name}（{selectedSeed.code}）
                </p>
              </div>
              <button
                onClick={closeTaskModal}
                className="p-2 hover:bg-cream-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-forest-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">任务标题</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-cream-50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">任务描述</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-cream-50 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">执行要求</label>
                <textarea
                  value={taskRequirements}
                  onChange={(e) => setTaskRequirements(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-cream-50 transition-all resize-none font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-2">
                    目标回收量（克）
                  </label>
                  <input
                    type="number"
                    value={taskTargetQuantity}
                    onChange={(e) => setTaskTargetQuantity(Number(e.target.value))}
                    min={100}
                    className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-cream-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-2">截止日期</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-cream-50 transition-all"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">品种风险评估</p>
                    <p>库存 {selectedSeed.quantity}g，发芽率 {selectedSeed.germinationRate}%，上次更新 {selectedSeed.lastUpdateDate}。请根据实际情况合理设定任务目标。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-cream-200 flex gap-4 sticky bottom-0 bg-white">
              <button
                onClick={closeTaskModal}
                className="flex-1 px-5 py-3 bg-cream-100 hover:bg-cream-200 text-forest-700 rounded-xl font-medium transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitTask}
                disabled={!taskTitle || !taskDescription || !taskDeadline}
                className="flex-1 px-5 py-3 bg-forest-600 hover:bg-forest-700 disabled:bg-forest-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>确认发布</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
