export type Species = 'vegetable' | 'grain' | 'bean' | 'melon' | 'spice' | 'flower' | 'herb';

export type VarietyType = 'heirloom' | 'hybrid' | 'local' | 'wild';

export type SeedSource = 'self' | 'neighbor' | 'wild' | 'bank';

export type StorageCondition = 'normal' | 'cold' | 'frozen' | 'dry' | 'dark';

export type ExchangeCondition = 'free' | 'exchange' | 'return' | 'community_only';

export type PlantingMethod = 'direct' | 'seedling' | 'transplant' | 'pot';

export type UserRole = 'admin' | 'grower';

export type EndangeredReason = 'old_update' | 'low_stock' | 'low_germination' | 'manual';

export type TaskStatus = 'published' | 'claimed' | 'in_progress' | 'submitted' | 'completed' | 'cancelled';

export type GrowthStageType = 
  | 'sowing' 
  | 'germination' 
  | 'transplant' 
  | 'flowering' 
  | 'fruiting' 
  | 'pest_disease' 
  | 'harvest' 
  | 'seed_saving';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  joinDate: string;
  contributedSeeds: number;
}

export interface SeedPhoto {
  id: string;
  url: string;
  type: 'seed' | 'plant' | 'fruit';
  description?: string;
}

export interface Seed {
  id: string;
  code: string;
  name: string;
  species: Species;
  varietyType: VarietyType;
  collectYear: number;
  source: SeedSource;
  quantity: number;
  germinationRate: number;
  storageCondition: StorageCondition;
  photos: SeedPhoto[];
  diseaseResistance: string;
  taste: string;
  yield: string;
  adaptability: string;
  history: string;
  ownerId: string;
  createdAt: string;
  isEndangered?: boolean;
  lastUpdateDate: string;
  plantingSeason?: string;
}

export interface TransferHistory {
  id: string;
  seedId: string;
  type: 'entry' | 'exchange_out' | 'exchange_in' | 'planting';
  fromUserId?: string;
  toUserId?: string;
  fromUserName?: string;
  toUserName?: string;
  date: string;
  quantity: number;
  note?: string;
}

export interface Exchange {
  id: string;
  seedId: string;
  sharerId: string;
  sharerName: string;
  quantity: number;
  condition: ExchangeCondition;
  description: string;
  status: 'active' | 'exchanged' | 'closed';
  createdAt: string;
}

export interface ExchangeRequest {
  id: string;
  exchangeId: string;
  seedId: string;
  requesterId: string;
  requesterName: string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  exchangeDate?: string;
}

export interface PlantingRecord {
  id: string;
  seedId: string;
  userId: string;
  userName: string;
  seedBatchCode: string;
  seedName: string;
  plantDate: string;
  location: string;
  method: PlantingMethod;
  germinationDate?: string;
  floweringDate?: string;
  fruitingDate?: string;
  pestDisease: string;
  harvestDate?: string;
  harvestYield?: number;
  tasteRating: number;
  yieldRating: number;
  diseaseRating: number;
  adaptabilityRating: number;
  overallRating: number;
  review: string;
  photos: string[];
  createdAt: string;
  growthLogs: GrowthLog[];
  isExcellent?: boolean;
}

export const speciesLabels: Record<Species, string> = {
  vegetable: '蔬菜',
  grain: '粮食',
  bean: '豆类',
  melon: '瓜果',
  spice: '香料',
  flower: '花卉',
  herb: '药草',
};

export const varietyTypeLabels: Record<VarietyType, string> = {
  heirloom: '老品种',
  hybrid: '杂交种',
  local: '地方农家种',
  wild: '野生近缘种',
};

export const sourceLabels: Record<SeedSource, string> = {
  self: '自家留种',
  neighbor: '邻居赠予',
  wild: '野外采集',
  bank: '种子银行交换',
};

export const storageConditionLabels: Record<StorageCondition, string> = {
  normal: '常温',
  cold: '冷藏',
  frozen: '冷冻',
  dry: '干燥',
  dark: '避光',
};

export const exchangeConditionLabels: Record<ExchangeCondition, string> = {
  free: '免费分享',
  exchange: '交换回馈种子',
  return: '需回馈种子',
  community_only: '仅限本社区',
};

export const plantingMethodLabels: Record<PlantingMethod, string> = {
  direct: '直播',
  seedling: '育苗',
  transplant: '移栽',
  pot: '盆栽',
};

export interface ConservationTask {
  id: string;
  seedId: string;
  seedName: string;
  seedCode: string;
  publisherId: string;
  publisherName: string;
  title: string;
  description: string;
  requirements: string;
  targetQuantity: number;
  deadline: string;
  status: TaskStatus;
  claimedBy?: string;
  claimedByName?: string;
  claimedAt?: string;
  plantingRecordId?: string;
  submittedAt?: string;
  completedAt?: string;
  seedReturned?: number;
  feedback?: string;
  createdAt: string;
}

export interface GrowthLogPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface GrowthLog {
  id: string;
  plantingRecordId: string;
  stage: GrowthStageType;
  title: string;
  description: string;
  date: string;
  photos: GrowthLogPhoto[];
  temperature?: number;
  humidity?: number;
  weather?: string;
  createdAt: string;
}

export interface ExtendedPlantingRecord extends PlantingRecord {
  growthLogs: GrowthLog[];
  isExcellent?: boolean;
}

export interface SeedEndangeredInfo {
  seedId: string;
  reasons: EndangeredReason[];
  lastUpdateYears: number;
  stockLevel: 'low' | 'medium' | 'high';
  germinationLevel: 'low' | 'medium' | 'high';
}

export const endangeredReasonLabels: Record<EndangeredReason, string> = {
  old_update: '三年以上未更新',
  low_stock: '库存过低',
  low_germination: '发芽率低',
  manual: '人工标记',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  published: '待领取',
  claimed: '已领取',
  in_progress: '进行中',
  submitted: '已提交结果',
  completed: '已完成',
  cancelled: '已取消',
};

export const taskStatusColors: Record<TaskStatus, string> = {
  published: 'bg-blue-100 text-blue-700',
  claimed: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-green-100 text-green-700',
  submitted: 'bg-purple-100 text-purple-700',
  completed: 'bg-forest-100 text-forest-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export const growthStageLabels: Record<GrowthStageType, string> = {
  sowing: '播种',
  germination: '发芽',
  transplant: '移栽',
  flowering: '开花',
  fruiting: '结果',
  pest_disease: '病虫害',
  harvest: '收获',
  seed_saving: '留种',
};

export const growthStageColors: Record<GrowthStageType, string> = {
  sowing: 'bg-amber-500',
  germination: 'bg-green-500',
  transplant: 'bg-teal-500',
  flowering: 'bg-pink-500',
  fruiting: 'bg-orange-500',
  pest_disease: 'bg-red-500',
  harvest: 'bg-amber-600',
  seed_saving: 'bg-forest-600',
};

export const growthStageOrder: GrowthStageType[] = [
  'sowing',
  'germination',
  'transplant',
  'flowering',
  'fruiting',
  'harvest',
  'seed_saving',
];
