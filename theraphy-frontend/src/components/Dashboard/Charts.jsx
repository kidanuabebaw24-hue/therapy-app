import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import './Charts.css';

// Line Chart Component
export const LineChartComponent = ({ data, xKey, lines, title }) => {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
          <XAxis dataKey={xKey} stroke="var(--text-secondary)" />
          <YAxis stroke="var(--text-secondary)" />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--white)', 
              border: '1px solid var(--gray-200)',
              borderRadius: '0.375rem',
              boxShadow: 'var(--shadow-md)'
            }}
          />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color || 'var(--imperial-blue)'}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={line.name || line.dataKey}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Bar Chart Component
export const BarChartComponent = ({ data, xKey, bars, title }) => {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
          <XAxis dataKey={xKey} stroke="var(--text-secondary)" />
          <YAxis stroke="var(--text-secondary)" />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--white)', 
              border: '1px solid var(--gray-200)',
              borderRadius: '0.375rem'
            }}
          />
          <Legend />
          {bars.map((bar, index) => (
            <Bar
              key={index}
              dataKey={bar.dataKey}
              fill={bar.color || 'var(--imperial-blue)'}
              radius={[4, 4, 0, 0]}
              name={bar.name || bar.dataKey}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Pie Chart Component
export const PieChartComponent = ({ data, title }) => {
  const COLORS = ['#0054A6', '#4D7EB3', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Area Chart Component
export const AreaChartComponent = ({ data, xKey, areas, title }) => {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {areas.map((area, index) => (
              <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.color || 'var(--imperial-blue)'} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={area.color || 'var(--imperial-blue)'} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey={xKey} />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          {areas.map((area, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={area.dataKey}
              stroke={area.color || 'var(--imperial-blue)'}
              fillOpacity={1}
              fill={`url(#color${index})`}
              name={area.name || area.dataKey}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Simple Stats Chart (KPI Cards with Mini Charts)
export const StatsWithSparkline = ({ data, title, value, trend, sparklineData }) => {
  const trendColor = trend > 0 ? 'var(--success)' : 'var(--danger)';
  
  return (
    <div className="stats-sparkline-card">
      <div className="stats-sparkline-header">
        <h4>{title}</h4>
        <span className="stats-value">{value}</span>
      </div>
      <div className="stats-sparkline-content">
        <span className="trend" style={{ color: trendColor }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <div className="sparkline">
          <ResponsiveContainer width={100} height={40}>
            <LineChart data={sparklineData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={trendColor} 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default {
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  AreaChartComponent,
  StatsWithSparkline
};