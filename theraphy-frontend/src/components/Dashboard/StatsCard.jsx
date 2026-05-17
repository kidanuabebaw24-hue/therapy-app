import './StatsCard.css';

const StatsCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  return (
    <div className="stats-card" style={{ borderLeftColor: color }}>
      <div className="stats-card-header">
        <div className="stats-card-icon" style={{ backgroundColor: `${color}20`, color }}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <div className={`stats-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trendValue || trend)}%
          </div>
        )}
      </div>
      <div className="stats-card-content">
        <div className="stats-card-value">{value}</div>
        <div className="stats-card-title">{title}</div>
      </div>
    </div>
  );
};

export default StatsCard;