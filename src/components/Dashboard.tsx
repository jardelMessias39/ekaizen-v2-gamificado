import { useGameStore } from '../store/gameStore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Dashboard = () => {
  const { history } = useGameStore();

  if (history.length === 0) {
    return <div className="p-4 text-slate-500 text-sm">Aguardando dados...</div>;
  }

  return (
    <div className="w-full grid grid-cols-3 gap-6 p-6 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-md">
      
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

    </div>
  );
};
