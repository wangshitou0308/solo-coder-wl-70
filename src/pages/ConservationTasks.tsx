import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Target,
  User,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  ArrowRight,
  XCircle,
  Link2,
  Send,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import {
  taskStatusLabels,
  taskStatusColors,
  TaskStatus,
  ConservationTask,
  PlantingRecord,
} from '../types';

type TabFilter = 'all' | TaskStatus;

const taskTimeline: TaskStatus[] = [
  'published',
  'claimed',
  'in_progress',
  'submitted',
  'completed',
];

const timelineLabels: Record<TaskStatus, string> = {
  published: '发布',
  claimed: '领取',
  in_progress: '进行中',
  submitted: '提交',
  completed: '完成',
  cancelled: '取消',
};

export default function ConservationTasks() {
  const navigate = useNavigate();
  const {
    getAllTasks,
    currentUser,
    claimConservationTask,
    linkTaskToPlantingRecord,
    submitTaskResult,
    completeTask,
    cancelTask,
    getPlantingRecordsByUser,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [selectedTask, setSelectedTask] = useState<ConservationTask | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [seedReturned, setSeedReturned] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [reviewType, setReviewType] = useState<'approve' | 'reject'>('approve');
  const [reviewFeedback, setReviewFeedback] = useState<string>('');

  const allTasks = getAllTasks();
  const userRecords = getPlantingRecordsByUser(currentUser.id);

  const filteredTasks = useMemo(() => {
    let tasks = allTasks;

    if (activeTab !== 'all') {
      tasks = tasks.filter((t) => t.status === activeTab);
    }

    if (statusFilter !== 'all') {
      tasks = tasks.filter((t) => t.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.seedName.toLowerCase().includes(term)
      );
    }

    return tasks.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [allTasks, activeTab, statusFilter, searchTerm]);

  const tabCounts = useMemo(() => {
    const counts: Record<TabFilter, number> = {
      all: allTasks.length,
      published: 0,
      claimed: 0,
      in_progress: 0,
      submitted: 0,
      completed: 0,
      cancelled: 0,
    };
    allTasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [allTasks]);

  const isAdmin = currentUser.role === 'admin';

  const getTimelineProgress = (status: TaskStatus): number => {
    if (status === 'cancelled') return -1;
    const idx = taskTimeline.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const handleClaimClick = (task: ConservationTask) => {
    setSelectedTask(task);
    setShowClaimModal(true);
  };

  const confirmClaim = () => {
    if (!selectedTask) return;
    claimConservationTask(selectedTask.id, currentUser.id, currentUser.name);
    setShowClaimModal(false);
    setSelectedTask(null);
  };

  const handleLinkClick = (task: ConservationTask) => {
    setSelectedTask(task);
    setSelectedRecordId('');
    setShowLinkModal(true);
  };

  const confirmLink = () => {
    if (!selectedTask || !selectedRecordId) return;
    linkTaskToPlantingRecord(selectedTask.id, selectedRecordId);
    setShowLinkModal(false);
    setSelectedTask(null);
    setSelectedRecordId('');
  };

  const handleSubmitClick = (task: ConservationTask) => {
    setSelectedTask(task);
    setSeedReturned('');
    setFeedback('');
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    if (!selectedTask || !seedReturned) return;
    submitTaskResult(selectedTask.id, parseInt(seedReturned, 10), feedback);
    setShowSubmitModal(false);
    setSelectedTask(null);
    setSeedReturned('');
    setFeedback('');
  };

  const handleReviewClick = (task: ConservationTask, type: 'approve' | 'reject') => {
    setSelectedTask(task);
    setReviewType(type);
    setReviewFeedback('');
    setShowReviewModal(true);
  };

  const confirmReview = () => {
    if (!selectedTask) return;
    if (reviewType === 'approve') {
      completeTask(selectedTask.id, reviewFeedback);
    } else {
      cancelTask(selectedTask.id);
    }
    setShowReviewModal(false);
    setSelectedTask(null);
    setReviewFeedback('');
  };

  const handleViewDetail = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const renderActionButtons = (task: ConservationTask) => {
    const isClaimant = task.claimedBy === currentUser.id;
    const buttons: JSX.Element[] = [];

    if (task.status === 'published' && !isAdmin) {
      buttons.push(
        <button
          key="claim"
          onClick={() => handleClaimClick(task)}
          className="flex-1 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" />
          领取任务
        </button>
      );
    }

    if (task.status === 'in_progress' && isClaimant) {
      buttons.push(
        <button
          key="link"
          onClick={() => handleLinkClick(task)}
          className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Link2 className="w-4 h-4" />
          关联种植记录
        </button>
      );
      buttons.push(
        <button
          key="submit"
          onClick={() => handleSubmitClick(task)}
          className="flex-1 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          提交结果
        </button>
      );
    }

    if (task.status === 'submitted' && isAdmin) {
      buttons.push(
        <button
          key="approve"
          onClick={() => handleReviewClick(task, 'approve')}
          className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          审核通过
        </button>
      );
      buttons.push(
        <button
          key="reject"
          onClick={() => handleReviewClick(task, 'reject')}
          className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          驳回
        </button>
      );
    }

    if (isClaimant) {
      buttons.push(
        <button
          key="detail"
          onClick={() => handleViewDetail(task.id)}
          className="flex-1 py-2.5 border border-cream-300 text-forest-600 rounded-xl hover:bg-cream-50 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          查看详情
        </button>
      );
    }

    return buttons;
  };

  const renderTimeline = (task: ConservationTask) => {
    const progress = getTimelineProgress(task.status);
    const isCancelled = task.status === 'cancelled';

    return (
      <div className="mt-5 pt-4 border-t border-cream-200">
        <div className="relative">
          <div className="absolute top-3 left-0 right-0 h-0.5 bg-cream-200 rounded-full" />
          {progress >= 0 && !isCancelled && (
            <div
              className="absolute top-3 left-0 h-0.5 bg-forest-500 rounded-full transition-all"
              style={{ width: `${(progress / (taskTimeline.length - 1)) * 100}%` }}
            />
          )}
          <div className="relative flex justify-between">
            {taskTimeline.map((status, idx) => {
              const isActive = !isCancelled && idx <= progress;
              const isCurrent = !isCancelled && idx === progress;
              return (
                <div key={status} className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium z-10 transition-all ${
                      isCancelled
                        ? 'bg-gray-200 text-gray-400'
                        : isActive
                        ? isCurrent
                          ? 'bg-forest-600 text-white ring-4 ring-forest-100 scale-110'
                          : 'bg-forest-500 text-white'
                        : 'bg-white border-2 border-cream-300 text-cream-400'
                    }`}
                  >
                    {isActive && !isCancelled ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px]">{idx + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1.5 whitespace-nowrap ${
                      isActive && !isCancelled
                        ? 'text-forest-700 font-medium'
                        : 'text-forest-300'
                    }`}
                  >
                    {timelineLabels[status]}
                  </span>
                </div>
              );
            })}
          </div>
          {isCancelled && (
            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                <XCircle className="w-3 h-3" />
                任务已取消
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'published', label: '待领取' },
    { key: 'in_progress', label: '进行中' },
    { key: 'submitted', label: '已提交' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-forest-800">复壮种植任务</h1>
          <p className="text-forest-600 mt-1">
            参与老品种保育，共同守护种质资源多样性
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/tasks/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">发布任务</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-card">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-forest-600 text-white shadow-md'
                  : 'bg-cream-50 text-forest-600 hover:bg-cream-100'
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-cream-200 text-forest-500'
                }`}
              >
                {tabCounts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-400" />
            <input
              type="text"
              placeholder="搜索任务标题或种子名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 transition-all bg-cream-50"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="pl-10 pr-8 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-cream-50 appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="all">全部状态</option>
              {Object.entries(taskStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-forest-500">
          <Target className="w-4 h-4" />
          <span>
            共找到 <strong className="text-forest-700">{filteredTasks.length}</strong> 个任务
          </span>
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTasks.map((task, index) => {
            const isClaimant = task.claimedBy === currentUser.id;
            return (
              <div
                key={task.id}
                style={{ animationDelay: `${index * 60}ms` }}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-hover transition-all duration-300 animate-slide-up"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-serif font-bold text-forest-800 mb-1 line-clamp-1">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-sm text-forest-500">
                        <Package className="w-3.5 h-3.5" />
                        {task.seedName}
                      </span>
                      <span className="text-xs text-forest-300">·</span>
                      <span className="text-xs text-forest-400 font-mono">
                        {task.seedCode}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${taskStatusColors[task.status]}`}
                  >
                    {taskStatusLabels[task.status]}
                  </span>
                </div>

                <p className="text-sm text-forest-600 line-clamp-2 mb-4">
                  {task.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-forest-600">
                    <User className="w-4 h-4 text-forest-400" />
                    <div className="min-w-0">
                      <p className="text-xs text-forest-400">发布人</p>
                      <p className="font-medium truncate">{task.publisherName}</p>
                    </div>
                  </div>
                  {task.claimedByName ? (
                    <div className="flex items-center gap-2 text-sm text-forest-600">
                      <Package className="w-4 h-4 text-forest-400" />
                      <div className="min-w-0">
                        <p className="text-xs text-forest-400">领取人</p>
                        <p className="font-medium truncate">
                          {task.claimedByName}
                          {isClaimant && (
                            <span className="ml-1 text-xs text-amber-600">(我)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-forest-300">
                      <Package className="w-4 h-4" />
                      <div>
                        <p className="text-xs">领取人</p>
                        <p className="font-medium">待领取</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-forest-600">
                    <Target className="w-4 h-4 text-forest-400" />
                    <div>
                      <p className="text-xs text-forest-400">目标数量</p>
                      <p className="font-medium">{task.targetQuantity}g 种子</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-forest-600">
                    <Calendar className="w-4 h-4 text-forest-400" />
                    <div>
                      <p className="text-xs text-forest-400">截止日期</p>
                      <p className="font-medium">{task.deadline}</p>
                    </div>
                  </div>
                </div>

                {task.seedReturned !== undefined && (
                  <div className="mb-4 p-3 bg-cream-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-forest-500" />
                      <span className="text-forest-600">
                        回交种子:{' '}
                        <strong className="text-forest-800">
                          {task.seedReturned}g
                        </strong>
                      </span>
                    </div>
                    {task.feedback && (
                      <p className="mt-2 text-xs text-forest-500 italic">
                        "{task.feedback}"
                      </p>
                    )}
                  </div>
                )}

                {renderTimeline(task)}

                {renderActionButtons(task).length > 0 && (
                  <div className="mt-5 pt-4 border-t border-cream-200 flex gap-3">
                    {renderActionButtons(task)}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-forest-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>发布于 {task.createdAt}</span>
                  </div>
                  {task.claimedAt && task.status !== 'published' && (
                    <span>领取于 {task.claimedAt}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 shadow-card text-center">
          <Target className="w-16 h-16 text-cream-300 mx-auto mb-4" />
          <p className="text-forest-400">暂无符合条件的任务</p>
          <p className="text-sm text-forest-300 mt-1">
            {searchTerm || statusFilter !== 'all' || activeTab !== 'all'
              ? '尝试调整筛选条件'
              : isAdmin
              ? '发布第一个复壮种植任务吧'
              : '耐心等待管理员发布任务'}
          </p>
        </div>
      )}

      {showClaimModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-serif font-bold text-forest-800 mb-2">
              确认领取任务
            </h3>
            <p className="text-sm text-forest-600 mb-4">
              您即将领取以下复壮种植任务：
            </p>
            <div className="bg-cream-50 rounded-xl p-4 mb-4 space-y-2">
              <p className="font-medium text-forest-800">{selectedTask.title}</p>
              <p className="text-sm text-forest-600">
                种子: {selectedTask.seedName} · 目标: {selectedTask.targetQuantity}g
              </p>
              <p className="text-sm text-forest-600">截止日期: {selectedTask.deadline}</p>
            </div>
            <p className="text-xs text-forest-500 mb-4">
              领取后请在截止日期前完成种植并提交结果，逾期将影响您的信用记录。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowClaimModal(false);
                  setSelectedTask(null);
                }}
                className="flex-1 py-2.5 border border-cream-300 text-forest-600 rounded-xl hover:bg-cream-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmClaim}
                className="flex-1 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors font-medium"
              >
                确认领取
              </button>
            </div>
          </div>
        </div>
      )}

      {showLinkModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up">
            <h3 className="text-xl font-serif font-bold text-forest-800 mb-2">
              关联种植记录
            </h3>
            <p className="text-sm text-forest-600 mb-4">
              选择您已创建的种植记录与本任务关联，用于记录复壮过程。
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-forest-700 mb-2">
                选择种植记录
              </label>
              {userRecords.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {userRecords.map((record) => (
                    <label
                      key={record.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedRecordId === record.id
                          ? 'border-forest-500 bg-forest-50'
                          : 'border-cream-200 hover:border-cream-300 hover:bg-cream-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="record"
                        value={record.id}
                        checked={selectedRecordId === record.id}
                        onChange={() => setSelectedRecordId(record.id)}
                        className="mt-1 accent-forest-600"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-forest-800">
                          {record.seedName}
                        </p>
                        <p className="text-xs text-forest-400 font-mono">
                          {record.seedBatchCode}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-forest-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {record.plantDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {record.location}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-cream-50 rounded-xl">
                  <Link2 className="w-10 h-10 text-cream-300 mx-auto mb-2" />
                  <p className="text-sm text-forest-400">暂无可用的种植记录</p>
                  <button
                    onClick={() => navigate('/planting/new')}
                    className="mt-3 text-sm text-forest-600 hover:text-forest-700 underline"
                  >
                    去创建种植记录 →
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setSelectedTask(null);
                  setSelectedRecordId('');
                }}
                className="flex-1 py-2.5 border border-cream-300 text-forest-600 rounded-xl hover:bg-cream-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmLink}
                disabled={!selectedRecordId}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl transition-colors font-medium"
              >
                确认关联
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-serif font-bold text-forest-800 mb-2">
              提交任务结果
            </h3>
            <p className="text-sm text-forest-600 mb-4">
              请填写本次复壮种植回交的种子数量及相关反馈。
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">
                  回交种子数量 (g)
                </label>
                <input
                  type="number"
                  min="0"
                  value={seedReturned}
                  onChange={(e) => setSeedReturned(e.target.value)}
                  placeholder="例如: 250"
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500"
                />
                <p className="text-xs text-forest-400 mt-1">
                  目标数量: {selectedTask.targetQuantity}g
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-2">
                  反馈说明
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="描述种植过程、发芽情况、产量等..."
                  className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 h-28 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSelectedTask(null);
                  setSeedReturned('');
                  setFeedback('');
                }}
                className="flex-1 py-2.5 border border-cream-300 text-forest-600 rounded-xl hover:bg-cream-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmSubmit}
                disabled={!seedReturned || parseInt(seedReturned, 10) < 0}
                className="flex-1 py-2.5 bg-forest-600 hover:bg-forest-700 disabled:bg-forest-300 text-white rounded-xl transition-colors font-medium"
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3
              className={`text-xl font-serif font-bold mb-2 ${
                reviewType === 'approve' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {reviewType === 'approve' ? '审核通过任务' : '驳回任务'}
            </h3>
            <div className="bg-cream-50 rounded-xl p-4 mb-4 space-y-2">
              <p className="font-medium text-forest-800">{selectedTask.title}</p>
              <p className="text-sm text-forest-600">
                领取人: {selectedTask.claimedByName}
              </p>
              <p className="text-sm text-forest-600">
                回交种子: {selectedTask.seedReturned || 0}g / 目标{' '}
                {selectedTask.targetQuantity}g
              </p>
              {selectedTask.feedback && (
                <p className="text-sm text-forest-500 italic">
                  "{selectedTask.feedback}"
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-2">
                {reviewType === 'approve' ? '评语 (可选)' : '驳回原因'}
              </label>
              <textarea
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder={
                  reviewType === 'approve'
                    ? '给种植者的评语...'
                    : '请说明驳回原因...'
                }
                className="w-full px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 h-24 resize-none"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedTask(null);
                  setReviewFeedback('');
                }}
                className="flex-1 py-2.5 border border-cream-300 text-forest-600 rounded-xl hover:bg-cream-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={confirmReview}
                disabled={reviewType === 'reject' && !reviewFeedback.trim()}
                className={`flex-1 py-2.5 text-white rounded-xl transition-colors font-medium disabled:opacity-50 ${
                  reviewType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {reviewType === 'approve' ? '确认通过' : '确认驳回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
