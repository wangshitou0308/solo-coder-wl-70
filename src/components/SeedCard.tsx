import { useNavigate } from 'react-router-dom';
import { Sprout, Droplets, Calendar, MapPin } from 'lucide-react';
import { Seed, speciesLabels, varietyTypeLabels } from '../types';

interface SeedCardProps {
  seed: Seed;
}

export default function SeedCard({ seed }: SeedCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
      onClick={() => navigate(`/seeds/${seed.id}`)}
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
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 bg-forest-600/90 text-white text-xs rounded-full backdrop-blur-sm">
            {speciesLabels[seed.species]}
          </span>
          {seed.isEndangered && (
            <span className="px-3 py-1 bg-amber-600/90 text-white text-xs rounded-full backdrop-blur-sm">
              濒危
            </span>
          )}
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
        </div>
        
        <p className="text-xs text-forest-400 font-mono mb-4">{seed.code}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-forest-600">
            <Droplets className="w-4 h-4 text-forest-400" />
            <span>发芽率 {seed.germinationRate}%</span>
          </div>
          <div className="flex items-center gap-2 text-forest-600">
            <Calendar className="w-4 h-4 text-forest-400" />
            <span>{seed.collectYear}年</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-cream-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Sprout className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-amber-700">{seed.quantity}g</span>
          </div>
          <button className="text-sm text-forest-600 hover:text-forest-800 font-medium group-hover:translate-x-1 transition-transform">
            查看详情 →
          </button>
        </div>
      </div>
    </div>
  );
}
