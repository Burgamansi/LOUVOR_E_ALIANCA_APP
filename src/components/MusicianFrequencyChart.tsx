import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Musician, PastCelebration } from '../types';

interface MusicianFrequencyChartProps {
  musicians: Musician[];
  pastCelebrations: PastCelebration[];
}

export const MusicianFrequencyChart: React.FC<MusicianFrequencyChartProps> = ({
  musicians,
  pastCelebrations,
}) => {
  const [viewType, setViewType] = useState<'bar' | 'list'>('bar');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'recent'>('all');

  // Total celebrations count including current confirmed ones
  const totalCelebrationsCount = pastCelebrations.length + 1; // past + current upcoming

  // Compute attendance data for each musician
  const data = musicians.map((musician) => {
    // Count occurrences in past celebrations
    let pastCount = 0;
    pastCelebrations.forEach((past) => {
      if (
        past.musicianNames.some(
          (name) => name.toLowerCase().includes(musician.name.toLowerCase()) ||
                    musician.name.toLowerCase().includes(name.toLowerCase())
        )
      ) {
        pastCount += 1;
      }
    });

    // Add +1 if confirmed for current upcoming celebration
    const currentConfirmed = musician.confirmed ? 1 : 0;
    const totalAttendances = pastCount + currentConfirmed;
    const ratePercentage = Math.round((totalAttendances / totalCelebrationsCount) * 100);

    return {
      name: musician.name,
      role: musician.role,
      presences: totalAttendances,
      total: totalCelebrationsCount,
      percentage: ratePercentage,
      confirmed: musician.confirmed,
      avatar: musician.avatar,
      initials: musician.initials || musician.name.substring(0, 2).toUpperCase(),
    };
  });

  // Sort by presences descending
  data.sort((a, b) => b.presences - a.presences);

  const topMusician = data[0];

  const BAR_COLORS = ['#7A2332', '#C9A24A', '#4D1721', '#9E2B3E', '#B38B3A', '#6B1F2C'];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#7A2332]/15 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#7A2332]/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7A2332] text-[#C9A24A] flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-xl">monitoring</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-[#7A2332]">
                Frequência dos Músicos
              </h3>
              <span className="bg-[#C9A24A]/20 text-[#2D2118] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#C9A24A]/30">
                Recharts
              </span>
            </div>
            <p className="text-xs text-[#5C4A3E]">
              Participação da equipe de canto nas últimas {totalCelebrationsCount} celebrações
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1.5 bg-[#FFF9F2] p-1 rounded-xl border border-[#7A2332]/15 self-start sm:self-auto">
          <button
            onClick={() => setViewType('bar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              viewType === 'bar'
                ? 'bg-[#7A2332] text-white shadow-2xs'
                : 'text-[#5C4A3E] hover:text-[#7A2332]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">bar_chart</span>
            <span>Gráfico</span>
          </button>
          <button
            onClick={() => setViewType('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              viewType === 'list'
                ? 'bg-[#7A2332] text-white shadow-2xs'
                : 'text-[#5C4A3E] hover:text-[#7A2332]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">leaderboard</span>
            <span>Ranking</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#FFF9F2] p-3.5 rounded-xl border border-[#7A2332]/10 flex flex-col">
          <span className="text-[10px] font-bold text-[#5C4A3E] uppercase tracking-wider">
            Total de Celebrações
          </span>
          <span className="text-lg font-serif font-bold text-[#7A2332]">{totalCelebrationsCount} Missas</span>
        </div>

        <div className="bg-[#FFF9F2] p-3.5 rounded-xl border border-[#7A2332]/10 flex flex-col">
          <span className="text-[10px] font-bold text-[#5C4A3E] uppercase tracking-wider">
            Mais Assíduo
          </span>
          <span className="text-xs font-bold text-[#C9A24A] truncate">
            {topMusician ? `${topMusician.name} (${topMusician.percentage}%)` : '-'}
          </span>
        </div>

        <div className="bg-[#FFF9F2] p-3.5 rounded-xl border border-[#7A2332]/10 flex flex-col col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-[#5C4A3E] uppercase tracking-wider">
            Média de Presença
          </span>
          <span className="text-xs font-bold text-[#2D2118]">
            {data.length > 0
              ? `${Math.round(
                  data.reduce((acc, curr) => acc + curr.percentage, 0) / data.length
                )}% da equipe`
              : '100%'}
          </span>
        </div>
      </div>

      {/* Main View Area */}
      {viewType === 'bar' ? (
        <div className="bg-[#FFF9F2] p-4 rounded-xl border border-[#7A2332]/10 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[#7A2332] uppercase tracking-wider">
            NÚMERO DE PRESENÇAS POR MÚSICO
          </span>
          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEDCC8" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#7A2332', fontSize: 11, fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: '#5C4A3E', fontSize: 11 }}
                  allowDecimals={false}
                  domain={[0, totalCelebrationsCount]}
                />
                <Tooltip
                  cursor={{ fill: '#7A2332', opacity: 0.08 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#4D1721] text-white p-3 rounded-xl shadow-xl border border-[#C9A24A]/40 text-xs flex flex-col gap-1">
                          <p className="font-bold text-[#C9A24A]">{item.name}</p>
                          <p className="text-[10px] text-amber-100">{item.role}</p>
                          <div className="mt-1 pt-1 border-t border-white/20 flex items-center justify-between gap-3">
                            <span>Presenças:</span>
                            <strong className="text-white">
                              {item.presences} de {item.total} ({item.percentage}%)
                            </strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="presences" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFF9F2] p-4 rounded-xl border border-[#7A2332]/10 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold text-[#7A2332] uppercase tracking-wider">
            RANKING DE PARTICIPAÇÃO
          </span>
          <div className="flex flex-col gap-2">
            {data.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#7A2332]/10 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full font-bold text-[11px] flex items-center justify-center ${
                      index === 0
                        ? 'bg-[#C9A24A] text-white'
                        : index === 1
                        ? 'bg-[#7A2332]/20 text-[#7A2332]'
                        : index === 2
                        ? 'bg-[#7A2332]/10 text-[#7A2332]'
                        : 'bg-gray-100 text-[#5C4A3E]'
                    }`}
                  >
                    #{index + 1}
                  </span>

                  <div>
                    <p className="font-bold text-[#2D2118]">{item.name}</p>
                    <p className="text-[10px] text-[#5C4A3E]">{item.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 bg-[#FFF9F2] rounded-full h-2 overflow-hidden hidden sm:block border border-[#7A2332]/10">
                    <div
                      className="bg-[#7A2332] h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-[#7A2332] bg-[#FFF9F2] px-2.5 py-1 rounded-lg text-xs border border-[#7A2332]/15">
                    {item.presences}/{item.total} ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
