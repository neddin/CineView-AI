
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShotData } from '../types';

interface AnalysisChartsProps {
  shots: ShotData[];
  theme?: 'light' | 'dark';
}

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ shots, theme = 'light' }) => {
  // Calculate Shot Size Distribution
  const sizeCounts = shots.reduce((acc, shot) => {
    const size = shot.size || 'Unknown';
    acc[size] = (acc[size] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(sizeCounts).map(([name, value]) => ({ name, value }));

  // Refined palette: Neutral Grays
  // Light Mode: Dark bars
  const COLORS_LIGHT = [
    '#131314', // gray-900
    '#444746', // gray-600
    '#8E918F', // gray-500
    '#9CA3AF', // gray-400
    '#D1D5DB', // gray-300
  ];

  // Dark Mode: BRIGHT bars (White -> Light Grays) to "light up" against dark background
  const COLORS_DARK = [
    '#FFFFFF', // Pure White
    '#F3F4F6', // Very Light Gray
    '#E5E7EB', // Light Gray
    '#D1D5DB', // Gray 300
    '#9CA3AF', // Gray 400
  ];

  const COLORS = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;
  const textColor = theme === 'dark' ? '#8E918F' : '#9CA3AF'; // gray-500 : gray-400
  const axisColor = theme === 'dark' ? '#444746' : '#E5E7EB'; // gray-600 : gray-200

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-3">Shot Size Distribution</h3>
      <div className="flex-1 w-full min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              stroke={textColor} 
              tick={{ fill: textColor, fontSize: 11, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: axisColor }}
              interval={0}
            />
            <YAxis 
              stroke={textColor} 
              tick={{ fill: textColor, fontSize: 10 }} 
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#1E1F20' : '#FFFFFF', 
                border: `1px solid ${theme === 'dark' ? '#444746' : '#E5E7EB'}`, 
                borderRadius: '8px', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
              }}
              itemStyle={{
                color: theme === 'dark' ? '#E5E7EB' : '#111827',
                fontSize: '12px',
                fontWeight: 600
              }}
              labelStyle={{
                color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
                fontSize: '11px',
                marginBottom: '4px'
              }}
              cursor={{ 
                  // In dark mode, use a dark transparent overlay to "dim" the column background.
                  // In light mode, use a light gray highlight.
                  fill: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#F3F4F6' 
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalysisCharts;
