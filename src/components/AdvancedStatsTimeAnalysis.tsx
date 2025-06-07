
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, Calendar } from 'lucide-react';

interface TimeAnalysisData {
  hourlyData: Array<{ hour: string; clicks: number; conversions: number }>;
  dailyData: Array<{ day: string; clicks: number; conversions: number; dayIndex: number }>;
  bestPerformingHour: string;
  bestPerformingDay: string;
}

interface AdvancedStatsTimeAnalysisProps {
  timeAnalysis: TimeAnalysisData;
}

const dayColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'];
const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export const AdvancedStatsTimeAnalysis = ({ timeAnalysis }: AdvancedStatsTimeAnalysisProps) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Analyse par heure */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Performance par heure
          </CardTitle>
          <CardDescription className="text-slate-600">
            Meilleure heure : {timeAnalysis.bestPerformingHour}h
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeAnalysis.hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeAnalysis.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="clicks" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500">
              <p className="text-sm">Données insuffisantes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analyse par jour */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Performance par jour
          </CardTitle>
          <CardDescription className="text-slate-600">
            Meilleur jour : {timeAnalysis.bestPerformingDay}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeAnalysis.dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeAnalysis.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="clicks" radius={[2, 2, 0, 0]}>
                  {timeAnalysis.dailyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={dayColors[entry.dayIndex]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-500">
              <p className="text-sm">Données insuffisantes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
