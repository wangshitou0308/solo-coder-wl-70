import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  Package,
  Calendar,
  User,
  Link2,
  Send,
  CheckCircle,
  XCircle,
  Award,
  Leaf,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import {
  taskStatusLabels,
  taskStatusColors,
  growthStageLabels,
  growthStageOrder,
  TaskStatus,
  ConservationTask,
  PlantingRecord,
  GrowthStageType,
} from '../types';

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

const timelineDatesMap: Record<TaskStatus, keyof ConservationTask | null> = {
  published: 'createdAt',
  claimed: 'claimedAt',
  in_progress: 'claimedAt',
  submitted: 'submittedAt',
  completed: 'completedAt',
  cancelled: null,
};

export default function ConservationTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getTaskById,
    currentUser,
    claimConservationTask,
    linkTaskToPlantingRecord,
    submitTaskResult,
    completeTask,
    cancelTask,
    getPlantingRecordsByUser,
    getSeedById,
    getPlantingRecordById,
    markPlantingRecordExcellent,
  } = useAppStore();

  const task = getTaskById(id || '');
  const seed = task ? getSeedById(task.seedId) : undefined;
  const linkedRecord = task?.plantingRecordId
    ? getPlantingRecordById(task.plantingRecordId)
    : undefined;
  const userRecords = getPlantingRecordsByUser(currentUser.id);

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [selectedRecordId, setSelectedRecordId] = useState<string>('');
  const [seedReturned, setSeedReturned] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [reviewType, setReviewType] = useState<'approve' | 'reject'>('approve');
  const [reviewFeedback, setReviewFeedback] = useState<string>('');

  const isAdmin = currentUser.role === 'admin';
  const isClaimant = task?.claimedBy === currentUser.id;

  const getTimelineProgress = (status: TaskStatus): number => {
    if (status === 'cancelled') return -1;
    const idx = taskTimeline.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const getTimelineDate = (task: ConservationTask, status: TaskStatus): string | null => {
    const key = timelineDatesMap[status];
    if (!key) return null;
    return (task[key] as string) || null;
  };

  const confirmClaim = () => {
    if (!task) return;
    claimConservationTask(task.id, currentUser.id, currentUser.name);
    setShowClaimModal(false);
  };

  const confirmLink = () => {
    if (!task || !selectedRecordId) return;
    linkTaskToPlantingRecord(task.id, selectedRecordId);
    setShowLinkModal(false);
    setSelectedRecordId('');
  };

  const confirmSubmit = () => {
    if (!task || !seedReturned) return;
    submitTaskResult(task.id, parseInt(seedReturned, 10), feedback);
    setShowSubmitModal(false);
    setSeedReturned('');
    setFeedback('');
  };

  const confirmReview = () => {
    if (!task) return;
    if (reviewType === 'approve') {
      completeTask(task.id, reviewFeedback);
    } else {
      cancelTask(task.id);
    }
    setShowReviewModal(false);
    setReviewFeedback('');
  };

  const handleMarkExcellent = () => {
    if (!task?.plantingRecordId) return;
    const record = getPlantingRecordById(task.plantingRecordId);
    if (!record) return;
    markPlantingRecordExcellent(task.plantingRecordId, !record.isExcellent);
  };

  const growthProgress = useMemo(() => {
    if (!linkedRecord || !linkedRecord.growthLogs) return { completed: 0, total: growthStageOrder.length, percent: 0 };
    const stagesWithLogs = new Set(linkedRecord.growthLogs.map((l) => l.stage));
    const completed = growthStageOrder.filter((s) => stagesWithLogs.has(s)).length;
    return {
      completed,
      total: growthStageOrder.length,
      percent: Math.min(100, (completed / growthStageOrder.length) * 100),
    };
  }, [linkedRecord]);

  if (!task) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回任务列表</span>
        </button>
        <div className="bg-white rounded-2xl p-16 shadow-card text-center">
          <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-forest-800 mb-2">任务不存在</h2>
          <p className="text-forest-500 mb-6">您访问的任务可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回任务列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回任务列表</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-card">
            <div className="relative h-48 bg-cream-100">
              {seed && seed.photos.length > 0 ? (
                <img
                  src={seed.photos[0].url}
                  alt={seed.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Leaf className="w-16 h-16 text-cream-300" />
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-serif font-bold text-forest-800 mb-1">
                {task.seedName}
              </h3>
              <p className="text-xs text-forest-400 font-mono mb-3">{task.seedCode}</p>
              <button
                onClick={() => navigate(`/seeds/${task.seedId}`)}
                className="flex items-center gap-1.5 text-sm text-forest-600 hover:text-forest-800 font-medium"
              >
                查看种子详情
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-forest-800">任务状态</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${taskStatusColors[task.status]}`}
              >
                {taskStatusLabels[task.status]}
              </span>
            </div>
            <div className="relative">
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-cream-200 rounded-full" />
              {getTimelineProgress(task.status) >= 0 && task.status !== 'cancelled' && (
                <div
                  className="absolute top-3 left-0 h-0.5 bg-forest-500 rounded-full transition-all"
                  style={{
                    width: `${(getTimelineProgress(task.status) / (taskTimeline.length - 1)) * 100}%`,
                  }}
                />
              )}
              <div className="relative flex justify-between">
                {taskTimeline.map((status, idx) => {
                  const progress = getTimelineProgress(task.status);
                  const isActive = task.status !== 'cancelled' && idx <= progress;
                  const isCurrent = task.status !== 'cancelled' && idx === progress;
                  const date = getTimelineDate(task, status);
                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium z-10 transition-all ${
                          task.status === 'cancelled'
                            ? 'bg-gray-200 text-gray-400'
                            : isActive
                            ? isCurrent
                              ? 'bg-forest-600 text-white ring-4 ring-forest-100 scale-110'
                              : 'bg-forest-500 text-white'
                            : 'bg-white border-2 border-cream-300 text-cream-400'
                        }`}
                      >
                        {isActive && task.status !== 'cancelled' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-[10px]">{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-1.5 whitespace-nowrap ${
                          isActive && task.status !== 'cancelled'
                            ? 'text-forest-700 font-medium'
                            : 'text-forest-300'
                        }`}
                      >
                        {timelineLabels[status]}
                      </span>
                      {date && isActive && task.status !== 'cancelled' && (
                        <span className="text-[10px] text-forest-400 mt-0.5">{date}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {task.status === 'cancelled' && (
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                    <XCircle className="w-3 h-3" />
                    任务已取消
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-card">
            <h3 className="text-sm font-bold text-forest-800 mb-4">关键信息</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-forest-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-forest-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-forest-400">发布人</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.publisherName}&backgroundColor=52804e`}
                      alt={task.publisherName}
                      className="w-5 h-5 rounded-full"
                    />
                    <p className="text-sm font-medium text-forest-700 truncate">
                      {task.publisherName}
                    </p>
                  </div>
                </div>
              </div>

              {task.claimedByName ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-forest-400">领取人</p>
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.claimedByName}&backgroundColor=c9a227`}
                        alt={task.claimedByName}
                        className="w-5 h-5 rounded-full"
                      />
                      <p className="text-sm font-medium text-forest-700 truncate">
                        {task.claimedByName}
                        {isClaimant && (
                          <span className="ml-1 text-xs text-amber-600">(我)</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cream-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-cream-400" />
                  </div>
                  <div>
                    <p className="text-xs text-forest-400">领取人</p>
                    <p className="text-sm font-medium text-forest-300">待领取</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-forest-400">目标数量</p>
                  <p className="text-sm font-medium text-forest-700">
                    {task.targetQuantity}g 种子
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-forest-400">截止日期</p>
                  <p className="text-sm font-medium text-forest-700">{task.deadline}</p>
                </div>
              </div>

              {task.seedReturned !== undefined && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-forest-400">回交种子</p>
                    <p className="text-sm font-medium text-forest-700">
                      {task.seedReturned}g
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-serif font-bold text-forest-800 mb-2">
                  {task.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-sm text-forest-500">
                    <Package className="w-3.5 h-3.5" />
                    {task.seedName}
                  </span>
                  <span className="text-xs text-forest-300">·</span>
                  <span className="text-xs text-forest-400 font-mono">{task.seedCode}</span>
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${taskStatusColors[task.status]}`}
              >
                {taskStatusLabels[task.status]}
              </span>
            </div>

            {task.feedback && task.status === 'completed' && (
              <div className="mt-4 p-4 bg-cream-50 rounded-xl border border-cream-200">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-medium text-forest-700">审核评语</p>
                </div>
                <p className="text-sm text-forest-600 italic">"{task.feedback}"</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h2 className="text-lg font-serif font-bold text-forest-800 mb-4">任务描述</h2>
            <p className="text-forest-600 leading-relaxed whitespace-pre-line">
              {task.description}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h2 className="text-lg font-serif font-bold text-forest-800 mb-4">技术要求</h2>
            <div className="p-4 bg-cream-50 rounded-xl">
              <p className="text-forest-600 leading-relaxed whitespace-pre-line">
                {task.requirements}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-forest-600" />
                <h2 className="text-lg font-serif font-bold text-forest-800">关联种植记录</h2>
              </div>
            </div>

            {linkedRecord ? (
              <div className="p-5 bg-cream-50 rounded-xl border border-cream-200">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-forest-600" />
                    </div>
                    <div>
                      <p className="font-medium text-forest-800">{linkedRecord.seedName}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-forest-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {linkedRecord.plantDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {linkedRecord.userName}
                        </span>
                      </div>
                    </div>
                  </div>
                  {linkedRecord.isExcellent && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-sm">
                      <Award className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-bold text-white">优秀档案</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-forest-500 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      生长记录进度
                    </span>
                    <span className="text-xs font-medium text-forest-600">
                      {growthProgress.completed}/{growthProgress.total} 阶段
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-forest-500 rounded-full transition-all duration-500"
                      style={{ width: `${growthProgress.percent}%` }}
                    />
                  </div>
                  {linkedRecord.growthLogs && linkedRecord.growthLogs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {Array.from(
                        new Set(linkedRecord.growthLogs.map((l) => l.stage))
                      ).map((stage) => (
                        <span
                          key={stage}
                          className="px-2 py-0.5 bg-white text-forest-600 rounded text-[11px] font-medium border border-cream-200"
                        >
                          {growthStageLabels[stage as GrowthStageType]}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 bg-forest-50 text-forest-500 rounded text-[11px] font-medium">
                        共 {linkedRecord.growthLogs.length} 条日志
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/planting/${linkedRecord.id}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    查看种植详情
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {isClaimant && (
                    <button
                      onClick={handleMarkExcellent}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                        linkedRecord.isExcellent
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'border border-amber-300 text-amber-600 hover:bg-amber-50'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      {linkedRecord.isExcellent ? '取消优秀标记' : '标记为优秀档案'}
                    </button>
                  )}
                </div>
              </div>
            ) : isClaimant && task.status !== 'completed' && task.status !== 'cancelled' ? (
              <div className="text-center py-8 bg-cream-50 rounded-xl border-2 border-dashed border-cream-300">
                <Link2 className="w-12 h-12 text-cream-300 mx-auto mb-3" />
                <p className="text-forest-600 mb-2">尚未关联种植记录</p>
                <p className="text-sm text-forest-400 mb-4">
                  关联种植记录以跟踪复壮种植过程
                </p>
                <button
                  onClick={() => {
                    setSelectedRecordId('');
                    setShowLinkModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors font-medium"
                >
                  <Link2 className="w-4 h-4" />
                  关联种植记录
                </button>
              </div>
            ) : (
              <div className="text-center py-8 bg-cream-50 rounded-xl">
                <Link2 className="w-12 h-12 text-cream-300 mx-auto mb-3" />
                <p className="text-forest-400">暂无关联的种植记录</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h2 className="text-lg font-serif font-bold text-forest-800 mb-4">操作</h2>
            <div className="flex flex-wrap gap-3">
              {task.status === 'published' && !isAdmin && (
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors font-medium shadow-md"
                >
                  <Package className="w-5 h-5" />
                  领取任务
                </button>
              )}

              {task.status === 'in_progress' && isClaimant && (
                <>
                  <button
                    onClick={() => {
                      setSelectedRecordId('');
                      setShowLinkModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors font-medium shadow-md"
                  >
                    <Link2 className="w-5 h-5" />
                    {linkedRecord ? '更换种植记录' : '关联种植记录'}
                  </button>
                  <button
                    onClick={() => {
                      setSeedReturned('');
                      setFeedback('');
                      setShowSubmitModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors font-medium shadow-md"
                  >
                    <Send className="w-5 h-5" />
                    提交结果
                  </button>
                </>
              )}

              {task.status === 'submitted' && isAdmin && (
                <>
                  <button
                    onClick={() => {
                      setReviewType('approve');
                      setReviewFeedback('');
                      setShowReviewModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium shadow-md"
                  >
                    <CheckCircle className="w-5 h-5" />
                    审核通过
                  </button>
                  <button
                    onClick={() => {
                      setReviewType('reject');
                      setReviewFeedback('');
                      setShowReviewModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium shadow-md"
                  >
                    <XCircle className="w-5 h-5" />
                    驳回
                  </button>
                </>
              )}

              {task.status === 'completed' && (
                <div className="w-full p-5 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">任务已完成</p>
                      <p className="text-xs text-green-600">完成于 {task.completedAt}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-green-600 mb-1">回交种子数量</p>
                      <p className="text-lg font-bold text-green-800">
                        {task.seedReturned || 0}g
                        <span className="text-sm font-normal text-green-600 ml-2">
                          / 目标 {task.targetQuantity}g
                        </span>
                      </p>
                    </div>
                    {task.feedback && (
                      <div>
                        <p className="text-xs text-green-600 mb-1">反馈</p>
                        <p className="text-sm text-green-700 italic">"{task.feedback}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {task.status === 'published' && !isAdmin && (
                <p className="text-xs text-forest-400 w-full mt-2">
                  领取后请在截止日期前完成种植并提交结果
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showClaimModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-serif font-bold text-forest-800 mb-2">
              确认领取任务
            </h3>
            <p className="text-sm text-forest-600 mb-4">
              您即将领取以下复壮种植任务：
            </p>
            <div className="bg-cream-50 rounded-xl p-4 mb-4 space-y-2">
              <p className="font-medium text-forest-800">{task.title}</p>
              <p className="text-sm text-forest-600">
                种子: {task.seedName} · 目标: {task.targetQuantity}g
              </p>
              <p className="text-sm text-forest-600">截止日期: {task.deadline}</p>
            </div>
            <p className="text-xs text-forest-500 mb-4">
              领取后请在截止日期前完成种植并提交结果，逾期将影响您的信用记录。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClaimModal(false)}
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

      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-slide-up max-h-[90vh] overflow-y-auto">
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
                            <Leaf className="w-3 h-3" />
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

      {showSubmitModal && (
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
                  目标数量: {task.targetQuantity}g
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

      {showReviewModal && (
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
              <p className="font-medium text-forest-800">{task.title}</p>
              <p className="text-sm text-forest-600">
                领取人: {task.claimedByName}
              </p>
              <p className="text-sm text-forest-600">
                回交种子: {task.seedReturned || 0}g / 目标{' '}
                {task.targetQuantity}g
              </p>
              {task.feedback && (
                <p className="text-sm text-forest-500 italic">
                  "{task.feedback}"
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
