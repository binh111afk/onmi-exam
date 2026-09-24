import React from 'react';
import { Award, Flame, Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  // Rank colors for top 3
  const rankColors = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-100 text-amber-700 border-amber-200'; // Gold
      case 2:
        return 'bg-slate-100 text-slate-700 border-slate-200'; // Silver
      case 3:
        return 'bg-orange-100 text-orange-700 border-orange-200'; // Bronze
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header text */}
      <div className="border-b border-slate-100 pb-5 text-center max-w-[650px] mx-auto space-y-2">
        <div className="h-10 w-10 bg-accent-light text-accent rounded-full flex items-center justify-center mx-auto">
          <Trophy size={20} className="fill-accent" />
        </div>
        <h1 className="text-xl font-bold text-text-primary tracking-tight">
          Bảng xếp hạng học viên Onmi Exam
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed">
          Tôn vinh những học viên nỗ lực bền bỉ, tích lũy điểm kinh nghiệm (XP) và duy trì chuỗi học tập (streak) đều đặn hàng ngày trên nền tảng.
        </p>
      </div>

      {/* Notion-style Table container */}
      <div className="max-w-[950px] mx-auto bg-white border border-slate-100 rounded-card overflow-hidden notion-shadow">
        
        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-text-secondary font-semibold">
                <th className="py-3 px-4 w-16 text-center">Thứ hạng</th>
                <th className="py-3 px-4">Học viên</th>
                <th className="py-3 px-4">Trường học</th>
                <th className="py-3 px-4 w-28 text-center">Chuỗi học tập</th>
                <th className="py-3 px-4 w-28 text-center">Tích lũy XP</th>
                <th className="py-3 px-4 hidden md:table-cell">Huy hiệu tiêu biểu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
              {entries.map((entry) => (
                <tr key={entry.rank} className="hover:bg-slate-50/50 transition-default">
                  {/* Rank badge */}
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full border text-[10px] font-bold ${rankColors(entry.rank)}`}>
                      {entry.rank}
                    </span>
                  </td>

                  {/* Student details with Avatar */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        className="h-8 w-8 rounded-full border border-slate-100 object-cover shrink-0"
                        onError={(e) => {
                          // Fallback to text initials
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary text-xs leading-normal">{entry.name}</span>
                        <span className="text-[10px] text-text-secondary font-normal mt-0.5">{entry.grade}</span>
                      </div>
                    </div>
                  </td>

                  {/* School */}
                  <td className="py-4 px-4 text-text-secondary text-xs">
                    {entry.school}
                  </td>

                  {/* Streak */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-1 text-accent bg-accent-light px-2.5 py-0.5 rounded font-semibold text-[10px]">
                      <Flame size={11} className="fill-accent" />
                      <span>{entry.streak} ngày</span>
                    </div>
                  </td>

                  {/* XP */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-1 text-primary bg-primary-light px-2.5 py-0.5 rounded font-bold text-[10px]">
                      <Award size={11} />
                      <span>{entry.xp.toLocaleString('vi-VN')}</span>
                    </div>
                  </td>

                  {/* Badges list */}
                  <td className="py-4 px-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {entry.badges.map((badge) => {
                        let theme = 'bg-slate-50 border-slate-200 text-slate-700';
                        let emoji = '🏅';

                        if (badge.includes('Lý thuyết')) {
                          theme = 'bg-blue-50 border-blue-200/50 text-blue-700';
                          emoji = '📖';
                        } else if (badge.includes('chiến binh') || badge.includes('Chiến binh')) {
                          theme = 'bg-red-50 border-red-200/50 text-red-700';
                          emoji = '🔥';
                        } else if (badge.includes('bền bỉ') || badge.includes('Chăm chỉ')) {
                          theme = 'bg-emerald-50 border-emerald-200/50 text-emerald-700';
                          emoji = '⚡';
                        } else if (badge.includes('Vô địch') || badge.includes('Top')) {
                          theme = 'bg-amber-50 border-amber-250/50 text-amber-700';
                          emoji = '🏆';
                        } else if (badge.includes('Sáng tạo')) {
                          theme = 'bg-purple-50 border-purple-200/50 text-purple-700';
                          emoji = '💡';
                        }

                        return (
                          <span
                            key={badge}
                            className={`text-[9px] font-bold px-2.5 py-0.5 border rounded-full flex items-center gap-1 shadow-sm transition-all duration-200 hover:scale-[1.02] ${theme}`}
                          >
                            <span>{emoji}</span>
                            <span>{badge}</span>
                          </span>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};
