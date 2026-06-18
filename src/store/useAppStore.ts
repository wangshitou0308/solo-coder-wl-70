import { create } from 'zustand';
import {
  Seed,
  User,
  Exchange,
  ExchangeRequest,
  PlantingRecord,
  TransferHistory,
} from '../types';
import {
  mockSeeds,
  mockUsers,
  mockExchanges,
  mockExchangeRequests,
  mockPlantingRecords,
  mockTransfers,
} from '../data/mockData';

interface AppState {
  seeds: Seed[];
  users: User[];
  exchanges: Exchange[];
  exchangeRequests: ExchangeRequest[];
  plantingRecords: PlantingRecord[];
  transferHistories: TransferHistory[];
  currentUser: User;
  
  addSeed: (seed: Omit<Seed, 'id' | 'code' | 'createdAt' | 'lastUpdateDate'>) => void;
  getSeedById: (id: string) => Seed | undefined;
  getTransfersBySeedId: (seedId: string) => TransferHistory[];
  
  addExchange: (exchange: Omit<Exchange, 'id' | 'createdAt' | 'status'>) => void;
  getExchangesBySharer: (sharerId: string) => Exchange[];
  
  addExchangeRequest: (request: Omit<ExchangeRequest, 'id' | 'status' | 'requestDate'>) => void;
  approveExchangeRequest: (requestId: string) => void;
  rejectExchangeRequest: (requestId: string) => void;
  completeExchangeRequest: (requestId: string) => void;
  getRequestsByExchange: (exchangeId: string) => ExchangeRequest[];
  getRequestsByRequester: (requesterId: string) => ExchangeRequest[];
  
  addPlantingRecord: (record: Omit<PlantingRecord, 'id' | 'createdAt'>) => void;
  getPlantingRecordsBySeed: (seedId: string) => PlantingRecord[];
  getPlantingRecordsByUser: (userId: string) => PlantingRecord[];
  getPlantingRecordById: (id: string) => PlantingRecord | undefined;
  
  getStats: () => {
    totalSeeds: number;
    activeExchanges: number;
    activeGrowers: number;
    endangeredSeeds: number;
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

  getStats: () => {
    const { seeds, exchanges, users, exchangeRequests, plantingRecords } = get();
    
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
    
    const endangeredSeeds = seeds.filter(s => {
      const lastUpdate = new Date(s.lastUpdateDate);
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      return lastUpdate < threeYearsAgo || s.isEndangered;
    }).length;
    
    return {
      totalSeeds: seeds.length,
      activeExchanges: exchanges.filter(e => e.status === 'active').length,
      activeGrowers: users.length,
      endangeredSeeds,
      speciesDistribution,
      yearlyTrend,
      topContributors,
      varietyHeat,
    };
  },
}));
