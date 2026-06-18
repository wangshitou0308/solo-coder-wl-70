import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Sprout } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import SeedCard from '../components/SeedCard';
import { Species, VarietyType, speciesLabels, varietyTypeLabels } from '../types';

export default function SeedList() {
  const { seeds } = useAppStore();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<Species | 'all'>('all');
  const [varietyFilter, setVarietyFilter] = useState<VarietyType | 'all'>('all');

  const filteredSeeds = seeds.filter(seed => {
    const matchSearch = seed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        seed.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpecies = speciesFilter === 'all' || seed.species === speciesFilter;
    const matchVariety = varietyFilter === 'all' || seed.varietyType === varietyFilter;
    return matchSearch && matchSpecies && matchVariety;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-forest-800">种子库</h1>
          <p className="text-forest-600 mt-1">社区收藏的老品种种子一览</p>
        </div>
        <button
          onClick={() => navigate('/seeds/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">录入种子</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-400" />
            <input
              type="text"
              placeholder="搜索种子名称或编号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 transition-all bg-cream-50"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value as Species | 'all')}
                className="pl-10 pr-8 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-cream-50 appearance-none cursor-pointer"
              >
                <option value="all">全部物种</option>
                {Object.entries(speciesLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <select
              value={varietyFilter}
              onChange={(e) => setVarietyFilter(e.target.value as VarietyType | 'all')}
              className="px-4 py-3 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 bg-cream-50 appearance-none cursor-pointer"
            >
              <option value="all">全部类型</option>
              {Object.entries(varietyTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-sm text-forest-500">
          <Sprout className="w-4 h-4" />
          <span>共找到 <strong className="text-forest-700">{filteredSeeds.length}</strong> 份种子</span>
        </div>
      </div>

      {filteredSeeds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSeeds.map((seed, index) => (
            <div 
              key={seed.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-slide-up"
            >
              <SeedCard seed={seed} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 shadow-card text-center">
          <Sprout className="w-16 h-16 text-cream-300 mx-auto mb-4" />
          <p className="text-forest-400">没有找到匹配的种子</p>
          <p className="text-sm text-forest-300 mt-1">试试调整筛选条件</p>
        </div>
      )}
    </div>
  );
}
