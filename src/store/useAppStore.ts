import { create } from 'zustand';
import {
  Seed,
  User,
  Exchange,
  ExchangeRequest,
  PlantingRecord,
  TransferHistory,
  ConservationTask,
  GrowthLog,
  TaskStatus,
  EndangeredReason,
  SeedEndangeredInfo,
} from '../types';
import {
  mockSeeds,
  mockUsers,
  mockExchanges,
  mockExchangeRequests,
  mockPlantingRecords,
  mockTransfers,
  mockConservationTasks,
  mockGrowthLogs,
} from '../data/mockData';

interface AppState {
  seeds: Seed[];
  users: User[];
  exchanges: Exchange[];
  exchangeRequests: ExchangeRequest[];
  plantingRecords: PlantingRecord[];
  transferHistories: TransferHistory[];
  conservationTasks: ConservationTask[];
  growthLogs: GrowthLog[];
  currentUser: User;

  addSeed: (seed: Omit<Seed, 'id' | 'code' | 'createdAt' | 'lastUpdateDate' | 'growthLogs' | 'isExcellent'>) => void;
  getSeedById: (id: string) => Seed | undefined;
  getTransfersBySeedId: (seedId: string) => TransferHistory[];
  getEndangeredSeeds: () => Seed[];
  getSeedEndangeredInfo: (seedId: string) => SeedEndangeredInfo | null;

  addExchange: (exchange: Omit<Exchange, 'id' | 'createdAt' | 'status'>) => void;
  getExchangesBySharer: (sharerId: string) => Exchange[];

  addExchangeRequest: (request: Omit<ExchangeRequest, 'id' | 'status' | 'requestDate'>) => void;
  approveExchangeRequest: (requestId: string) => void;
  rejectExchangeRequest: (requestId: string) => void;
  completeExchangeRequest: (requestId: string) => void;
  getRequestsByExchange: (exchangeId: string) => ExchangeRequest[];
  getRequestsByRequester: (requesterId: string) => ExchangeRequest[];

  addPlantingRecord: (record: Omit<PlantingRecord, 'id' | 'createdAt' | 'growthLogs' | 'isExcellent'>) => void;
  getPlantingRecordsBySeed: (seedId: string) => PlantingRecord[];
  getPlantingRecordsByUser: (userId: string) => PlantingRecord[];
  getPlantingRecordById: (id: string) => PlantingRecord | undefined;
  getExcellentPlantingRecordsBySeed: (seedId: string) => PlantingRecord[];
  markPlantingRecordExcellent: (id: string, excellent: boolean) => void;

  addGrowthLog: (log: Omit<GrowthLog, 'id' | 'createdAt'>) => void;
  updateGrowthLog: (id: string, data: Partial<Omit<GrowthLog, 'id' | 'createdAt'>>) => void;
  deleteGrowthLog: (id: string) => void;
  getGrowthLogsByPlantingRecord: (recordId: string) => GrowthLog[];
  getCurrentGrowthStage: (recordId: string) => string | null;
  getNextSuggestion: (recordId: string) => string | null;

  addConservationTask: (task: Omit<ConservationTask, 'id' | 'status' | 'createdAt'>) => void;
  claimConservationTask: (taskId: string, userId: string, userName: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus, extra?: Partial<ConservationTask>) => void;
  linkTaskToPlantingRecord: (taskId: string, plantingRecordId: string) => void;
  submitTaskResult: (taskId: string, seedReturned: number, feedback?: string) => void;
  completeTask: (taskId: string, feedback?: string) => void;
  cancelTask: (taskId: string) => void;
  getTasksBySeed: (seedId: string) => ConservationTask[];
  getTasksByClaimant: (userId: string) => ConservationTask[];
  getTasksByPublisher: (userId: string) => ConservationTask[];
  getTaskById: (id: string) => ConservationTask | undefined;
  getAllTasks: () => ConservationTask[];

  getStats: () => {
    totalSeeds: number;
    activeExchanges: number;
    activeGrowers: number;
    endangeredSeeds: number;
    pendingRejuvenationSeeds: number;
    activeTasks: number;
    completedTasks: number;
    totalTasks: number;
    speciesDistribution: { name: string; value: number }[];
    yearlyTrend: { year: string; entries: number; exchanges: number }[];
    topContributors: { name: string; count: number; avatar: string }[];
    varietyHeat: { name: string; exchanges: number; rating: number }[];
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  seeds: mockSeeds,
  users: mockUsers,
  exchanges: mockExchanges,
  exchangeRequests: mockExchangeRequests,
  plantingRecords: mockPlantingRecords,
  transferHistories: mockTransfers,
  conservationTasks: mockConservationTasks,
  growthLogs: mockGrowthLogs,
  currentUser: mockUsers[0],

  addSeed: (seedData) => {
    const newId = `s${Date.now()}`;
    const year = new Date().getFullYear();
    const speciesCodes: Record<string, string> = {
      vegetable: 'VG',
      grain: 'GR',
      bean: 'BN',
      melon: 'ML',
      spice: 'SP',
      flower: 'FL',
      herb: 'HB',
    };
    const count = get().seeds.filter(s => s.species === seedData.species).length + 1;
    const code = `SEED-${year}-${speciesCodes[seedData.species]}-${String(count).padStart(3, '0')}`;

    const newSeed: Seed = {
      ...seedData,
      id: newId,
      code,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdateDate: new Date().toISOString().split('T')[0],
    };

    const newTransfer: TransferHistory = {
      id: `t${Date.now()}`,
      seedId: newId,
      type: 'entry',
      toUserId: seedData.ownerId,
      toUserName: get().users.find(u => u.id === seedData.ownerId)?.name,
      date: new Date().toISOString().split('T')[0],
      quantity: seedData.quantity,
      note: '种子入库',
    };

    set(state => ({
      seeds: [...state.seeds, newSeed],
      transferHistories: [...state.transferHistories, newTransfer],
    }));
  },

  getSeedById: (id) => get().seeds.find(s => s.id === id),

  getTransfersBySeedId: (seedId) =>
    get().transferHistories.filter(t => t.seedId === seedId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ),

  getEndangeredSeeds: () => {
    const { seeds } = get();
    const now = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(now.getFullYear() - 3);

    return seeds.filter(s => {
      const lastUpdate = new Date(s.lastUpdateDate);
      const isOld = lastUpdate < threeYearsAgo;
      const isLowStock = s.quantity < 200;
      const isLowGermination = s.germinationRate < 75;
      return s.isEndangered || isOld || isLowStock || isLowGermination;
    });
  },

  getSeedEndangeredInfo: (seedId) => {
    const seed = get().seeds.find(s => s.id === seedId);
    if (!seed) return null;

    const now = new Date();
    const lastUpdate = new Date(seed.lastUpdateDate);
    const diffYears = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const reasons: EndangeredReason[] = [];

    if (diffYears >= 3) reasons.push('old_update');
    if (seed.quantity < 200) reasons.push('low_stock');
    if (seed.germinationRate < 75) reasons.push('low_germination');
    if (seed.isEndangered && reasons.length === 0) reasons.push('manual');

    return {
      seedId,
      reasons,
      lastUpdateYears: Number(diffYears.toFixed(1)),
      stockLevel: seed.quantity < 200 ? 'low' : seed.quantity < 500 ? 'medium' : 'high',
      germinationLevel: seed.germinationRate < 75 ? 'low' : seed.germinationRate < 85 ? 'medium' : 'high',
    };
  },

  addExchange: (exchangeData) => {
    const newExchange: Exchange = {
      ...exchangeData,
      id: `e${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    set(state => ({
      exchanges: [...state.exchanges, newExchange],
    }));
  },

  getExchangesBySharer: (sharerId) =>
    get().exchanges.filter(e => e.sharerId === sharerId),

  addExchangeRequest: (requestData) => {
    const newRequest: ExchangeRequest = {
      ...requestData,
      id: `er${Date.now()}`,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
    };
    set(state => ({
      exchangeRequests: [...state.exchangeRequests, newRequest],
    }));
  },

  approveExchangeRequest: (requestId) => {
    set(state => ({
      exchangeRequests: state.exchangeRequests.map(r =>
        r.id === requestId ? { ...r, status: 'approved' as const } : r
      ),
    }));
  },

  rejectExchangeRequest: (requestId) => {
    set(state => ({
      exchangeRequests: state.exchangeRequests.map(r =>
        r.id === requestId ? { ...r, status: 'rejected' as const } : r
      ),
    }));
  },

  completeExchangeRequest: (requestId) => {
    const request = get().exchangeRequests.find(r => r.id === requestId);
    if (!request) return;

    const exchange = get().exchanges.find(e => e.id === request.exchangeId);
    if (!exchange) return;

    const seed = get().seeds.find(s => s.id === request.seedId);
    if (!seed) return;

    const requester = get().users.find(u => u.id === request.requesterId);
    const sharer = get().users.find(u => u.id === exchange.sharerId);

    const transferOut: TransferHistory = {
      id: `t${Date.now()}-out`,
      seedId: request.seedId,
      type: 'exchange_out',
      fromUserId: exchange.sharerId,
      fromUserName: sharer?.name,
      toUserId: request.requesterId,
      toUserName: requester?.name,
      date: new Date().toISOString().split('T')[0],
      quantity: 20,
      note: '交换出库',
    };

    const transferIn: TransferHistory = {
      id: `t${Date.now()}-in`,
      seedId: request.seedId,
      type: 'exchange_in',
      fromUserId: exchange.sharerId,
      fromUserName: sharer?.name,
      toUserId: request.requesterId,
      toUserName: requester?.name,
      date: new Date().toISOString().split('T')[0],
      quantity: 20,
      note: '交换入库',
    };

    set(state => ({
      exchangeRequests: state.exchangeRequests.map(r =>
        r.id === requestId
          ? { ...r, status: 'completed' as const, exchangeDate: new Date().toISOString().split('T')[0] }
          : r
      ),
      seeds: state.seeds.map(s =>
        s.id === request.seedId
          ? { ...s, quantity: Math.max(0, s.quantity - 20), lastUpdateDate: new Date().toISOString().split('T')[0] }
          : s
      ),
      transferHistories: [...state.transferHistories, transferOut, transferIn],
    }));
  },

  getRequestsByExchange: (exchangeId) =>
    get().exchangeRequests.filter(r => r.exchangeId === exchangeId),

  getRequestsByRequester: (requesterId) =>
    get().exchangeRequests.filter(r => r.requesterId === requesterId),

  addPlantingRecord: (recordData) => {
    const newRecord: PlantingRecord = {
      ...recordData,
      id: `pr${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      growthLogs: [],
      isExcellent: false,
    };
    set(state => ({
      plantingRecords: [...state.plantingRecords, newRecord],
    }));
  },

  getPlantingRecordsBySeed: (seedId) =>
    get().plantingRecords.filter(r => r.seedId === seedId),

  getPlantingRecordsByUser: (userId) =>
    get().plantingRecords.filter(r => r.userId === userId),

  getPlantingRecordById: (id) =>
    get().plantingRecords.find(r => r.id === id),

  getExcellentPlantingRecordsBySeed: (seedId) =>
    get().plantingRecords.filter(r => r.seedId === seedId && r.isExcellent),

  markPlantingRecordExcellent: (id, excellent) => {
    set(state => ({
      plantingRecords: state.plantingRecords.map(r =>
        r.id === id ? { ...r, isExcellent: excellent } : r
      ),
    }));
  },

  addGrowthLog: (logData) => {
    const newLog: GrowthLog = {
      ...logData,
      id: `gl${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set(state => {
      const updatedRecords = state.plantingRecords.map(r =>
        r.id === logData.plantingRecordId
          ? { ...r, growthLogs: [...r.growthLogs, newLog] }
          : r
      );
      return {
        growthLogs: [...state.growthLogs, newLog],
        plantingRecords: updatedRecords,
      };
    });
  },

  updateGrowthLog: (id, data) => {
    set(state => {
      const updatedLogs = state.growthLogs.map(log =>
        log.id === id ? { ...log, ...data } : log
      );
      const updatedLog = updatedLogs.find(l => l.id === id);
      const updatedRecords = state.plantingRecords.map(r =>
        r.id === updatedLog?.plantingRecordId
          ? { ...r, growthLogs: r.growthLogs.map(gl => gl.id === id ? { ...gl, ...data } : gl) }
          : r
      );
      return {
        growthLogs: updatedLogs,
        plantingRecords: updatedRecords,
      };
    });
  },

  deleteGrowthLog: (id) => {
    const log = get().growthLogs.find(l => l.id === id);
    if (!log) return;
    set(state => ({
      growthLogs: state.growthLogs.filter(l => l.id !== id),
      plantingRecords: state.plantingRecords.map(r =>
        r.id === log.plantingRecordId
          ? { ...r, growthLogs: r.growthLogs.filter(gl => gl.id !== id) }
          : r
      ),
    }));
  },

  getGrowthLogsByPlantingRecord: (recordId) =>
    get().growthLogs
      .filter(l => l.plantingRecordId === recordId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),

  getCurrentGrowthStage: (recordId) => {
    const logs = get().getGrowthLogsByPlantingRecord(recordId);
    if (logs.length === 0) return null;
    const { growthStageLabels } = require('../types');
    const latestLog = logs[logs.length - 1];
    return growthStageLabels[latestLog.stage] || null;
  },

  getNextSuggestion: (recordId) => {
    const { growthStageOrder, growthStageLabels } = require('../types');
    const logs = get().getGrowthLogsByPlantingRecord(recordId);
    if (logs.length === 0) {
      return '创建播种日志，开始记录您的种植历程';
    }
    const stagesDone = new Set(logs.map(l => l.stage));
    const mainStages = growthStageOrder.filter(s => s !== 'pest_disease');
    for (const stage of mainStages) {
      if (!stagesDone.has(stage)) {
        return `建议下一步：记录「${growthStageLabels[stage]}」阶段`;
      }
    }
    return '恭喜！所有主要生长阶段已完成记录';
  },

  addConservationTask: (taskData) => {
    const newTask: ConservationTask = {
      ...taskData,
      id: `ct${Date.now()}`,
      status: 'published',
      createdAt: new Date().toISOString().split('T')[0],
    };
    set(state => ({
      conservationTasks: [...state.conservationTasks, newTask],
    }));
  },

  claimConservationTask: (taskId, userId, userName) => {
    const now = new Date().toISOString().split('T')[0];
    set(state => ({
      conservationTasks: state.conservationTasks.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: 'claimed' as const,
              claimedBy: userId,
              claimedByName: userName,
              claimedAt: now,
            }
          : t
      ),
    }));
  },

  updateTaskStatus: (taskId, status, extra) => {
    set(state => ({
      conservationTasks: state.conservationTasks.map(t =>
        t.id === taskId ? { ...t, status, ...extra } : t
      ),
    }));
  },

  linkTaskToPlantingRecord: (taskId, plantingRecordId) => {
    set(state => ({
      conservationTasks: state.conservationTasks.map(t =>
        t.id === taskId
          ? { ...t, plantingRecordId, status: 'in_progress' as const }
          : t
      ),
    }));
  },

  submitTaskResult: (taskId, seedReturned, feedback) => {
    set(state => ({
      conservationTasks: state.conservationTasks.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: 'submitted' as const,
              submittedAt: new Date().toISOString().split('T')[0],
              seedReturned,
              feedback: feedback || t.feedback,
            }
          : t
      ),
    }));
  },

  completeTask: (taskId, feedback) => {
    const task = get().conservationTasks.find(t => t.id === taskId);
    if (!task) return;

    const seed = get().seeds.find(s => s.id === task.seedId);
    if (!seed) return;

    const returnedQty = task.seedReturned || 0;

    const transferIn: TransferHistory = {
      id: `t${Date.now()}`,
      seedId: task.seedId,
      type: 'entry',
      toUserId: task.publisherId,
      toUserName: task.publisherName,
      fromUserId: task.claimedBy,
      fromUserName: task.claimedByName,
      date: new Date().toISOString().split('T')[0],
      quantity: returnedQty,
      note: `复壮任务完成 - ${task.title}`,
    };

    set(state => ({
      conservationTasks: state.conservationTasks.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: 'completed' as const,
              completedAt: new Date().toISOString().split('T')[0],
              feedback: feedback || t.feedback,
            }
          : t
      ),
      seeds: state.seeds.map(s =>
        s.id === task.seedId
          ? { ...s, quantity: s.quantity + returnedQty, lastUpdateDate: new Date().toISOString().split('T')[0] }
          : s
      ),
      transferHistories: [...state.transferHistories, transferIn],
    }));
  },

  cancelTask: (taskId) => {
    set(state => ({
      conservationTasks: state.conservationTasks.map(t =>
        t.id === taskId ? { ...t, status: 'cancelled' as const } : t
      ),
    }));
  },

  getTasksBySeed: (seedId) =>
    get().conservationTasks.filter(t => t.seedId === seedId),

  getTasksByClaimant: (userId) =>
    get().conservationTasks.filter(t => t.claimedBy === userId),

  getTasksByPublisher: (userId) =>
    get().conservationTasks.filter(t => t.publisherId === userId),

  getTaskById: (id) =>
    get().conservationTasks.find(t => t.id === id),

  getAllTasks: () => get().conservationTasks,

  getStats: () => {
    const { seeds, exchanges, users, exchangeRequests, plantingRecords, conservationTasks } = get();

    const speciesLabels: Record<string, string> = {
      vegetable: '蔬菜',
      grain: '粮食',
      bean: '豆类',
      melon: '瓜果',
      spice: '香料',
      flower: '花卉',
      herb: '药草',
    };

    const speciesCount: Record<string, number> = {};
    seeds.forEach(s => {
      const label = speciesLabels[s.species] || s.species;
      speciesCount[label] = (speciesCount[label] || 0) + 1;
    });

    const speciesDistribution = Object.entries(speciesCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const currentYear = new Date().getFullYear();
    const yearlyTrend = [];
    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      const entries = seeds.filter(s => s.collectYear === year).length;
      const exchs = exchangeRequests.filter(r =>
        r.exchangeDate && new Date(r.exchangeDate).getFullYear() === year
      ).length;
      yearlyTrend.push({ year: `${year}年`, entries, exchanges: exchs + i });
    }

    const topContributors = users
      .map(u => ({
        name: u.name,
        count: seeds.filter(s => s.ownerId === u.id).length,
        avatar: u.avatar,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const varietyHeat = seeds.map(s => {
      const exchCount = exchanges.filter(e => e.seedId === s.id).length;
      const records = plantingRecords.filter(r => r.seedId === s.id);
      const avgRating = records.length > 0
        ? records.reduce((sum, r) => sum + r.overallRating, 0) / records.length
        : 4.0;
      return {
        name: s.name,
        exchanges: exchCount + Math.floor(Math.random() * 3),
        rating: Number(avgRating.toFixed(1)),
      };
    }).sort((a, b) => b.exchanges - a.exchanges).slice(0, 8);

    const now = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(now.getFullYear() - 3);

    const endangeredSeeds = seeds.filter(s => {
      const lastUpdate = new Date(s.lastUpdateDate);
      return lastUpdate < threeYearsAgo || s.isEndangered || s.quantity < 200 || s.germinationRate < 75;
    }).length;

    const activeTasks = conservationTasks.filter(
      t => t.status === 'in_progress' || t.status === 'claimed'
    ).length;
    const completedTasks = conservationTasks.filter(t => t.status === 'completed').length;
    const totalTasks = conservationTasks.length;

    const seedsWithActiveTasks = new Set(
      conservationTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').map(t => t.seedId)
    );
    const pendingRejuvenationSeeds = Math.max(0, endangeredSeeds - seedsWithActiveTasks.size);

    return {
      totalSeeds: seeds.length,
      activeExchanges: exchanges.filter(e => e.status === 'active').length,
      activeGrowers: users.length,
      endangeredSeeds,
      pendingRejuvenationSeeds,
      activeTasks,
      completedTasks,
      totalTasks,
      speciesDistribution,
      yearlyTrend,
      topContributors,
      varietyHeat,
    };
  },
}));
