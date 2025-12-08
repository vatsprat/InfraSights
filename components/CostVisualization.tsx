import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CostItem } from '../types';

// Updated palette: Violet, Emerald, Fuchsia, Sky, Amber, Rose, Indigo
const COLORS = ['#8b5cf6', '#10b981', '#d946ef', '#0ea5e9', '#f59e0b', '#f43f5e', '#6366f1'];

interface CostVisualizationProps {
  items: CostItem[];
}

export const CostVisualization: React.FC<CostVisualizationProps> = ({ items }) => {
  // Sort by cost desc
  const data = items
    .filter(i => i.monthly_cost > 0)
    .sort((a, b) => b.monthly_cost - a.monthly_cost)
    .map(i => ({
      name: i.service,
      value: i.monthly_cost,
      fullData: i
    }));

  if (data.length === 0) return null;

  return (
    <div className="flex flex-col md:flex-row gap-8 h-auto w-full items-center">
      <div className="w-full md:w-1/2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ color: '#e4e4e7' }}
              formatter={(value: number) => `$${value.toFixed(2)}`}
              cursor={false}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="w-full md:w-1/2 flex flex-col gap-3">
         {data.map((entry, index) => (
           <div key={index} className="flex items-center gap-3 text-sm p-2 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-default">
             <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.3)]" style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 8px ${COLORS[index % COLORS.length]}40` }}></div>
             <div className="flex-1 truncate text-zinc-300 font-medium">{entry.name}</div>
             <div className="font-mono text-zinc-100 font-bold">${entry.value.toFixed(2)}</div>
           </div>
         ))}
      </div>
    </div>
  );
};