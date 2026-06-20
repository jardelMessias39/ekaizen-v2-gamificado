import { useGameStore } from '../store/gameStore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useState, useEffect } from 'react';

export const Dashboard = () => {
  const { history } = useGameStore();
  const [heat, setHeat] = useState(0);

  useEffect(() => {
    const handleHeat = () => {
      setHeat(h => Math.min(h + 15, 100));
    };
    window.addEventListener('manual-click', handleHeat);
    
    const interval = setInterval(() => {
      setHeat(h => Math.max(h - 3, 0));
    }, 100);

    return () => {
      window.removeEventListener('manual-click', handleHeat);
      clearInterval(interval);
    };
  }, []);

  if (history.length === 0) {
    return <div className="p-4 text-slate-500 text-sm">Aguardando dados...</div>;
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-md">
      
      {/* Gráfico 1: Produção Acumulada */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-inner">
        <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Produção Acumulada</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#94a3b8" fontSize={10} width={30} tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(1)}k` : value} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                itemStyle={{ color: '#34d399' }}
              />
              <Line type="monotone" dataKey="producao" stroke="#34d399" strokeWidth={3} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Defeitos por Minuto */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-inner">
        <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Defeitos / Minuto (Est.)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#94a3b8" fontSize={10} width={30} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                cursor={{ fill: '#334155' }}
              />
              <Bar dataKey="defeitosPM" fill="#f87171" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 3: OEE % */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-inner relative overflow-hidden">
        <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Eficiência (OEE) %</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#94a3b8" fontSize={10} width={30} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Line type="stepAfter" dataKey="oee" stroke="#818cf8" strokeWidth={3} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 4: Temperatura da Máquina */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-inner flex flex-col items-center">
        <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 self-start">Temp. do Motor</h3>
        <div className="flex-1 flex items-end justify-center pb-6 relative w-full mt-2">
           
           <div className="w-6 h-28 bg-slate-900 border-2 border-slate-700 rounded-t-full relative flex flex-col justify-end items-center shadow-inner z-0">
             {/* Mercury Level */}
             <div 
                className="w-full rounded-t-full transition-all duration-100 ease-out"
                style={{ 
                  height: `${Math.max(heat, 5)}%`, 
                  backgroundColor: heat > 80 ? '#ef4444' : heat > 50 ? '#f59e0b' : '#3b82f6',
                  boxShadow: heat > 50 ? `0 0 10px ${heat > 80 ? '#ef4444' : '#f59e0b'}` : 'none'
                }}
             ></div>
           </div>
           
           {/* Mercury Bulb */}
           <div 
             className="absolute bottom-2 w-12 h-12 rounded-full border-4 border-slate-800 shadow-lg z-10 flex items-center justify-center transition-colors duration-100"
             style={{ 
                backgroundColor: heat > 80 ? '#ef4444' : heat > 50 ? '#f59e0b' : '#3b82f6',
                boxShadow: heat > 50 ? `0 0 20px ${heat > 80 ? '#ef4444' : '#f59e0b'}` : 'none'
             }}
           >
             <span className="text-white text-xs font-black drop-shadow-md">{Math.floor(heat)}°</span>
           </div>
           
        </div>
      </div>

    </div>
  );
};
