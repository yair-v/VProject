function getProgressColor(progress) {
  if (progress >= 80) return '#24c37d';
  if (progress >= 40) return '#ffb648';
  return '#ff5f6d';
}

export default function ProjectClock({ total = 0, completed = 0, pending = 0, size = 132, stroke = 12, title = 'גרף שעון' }) {
  const safeTotal = Number(total) || 0;
  const safeCompleted = Number(completed) || 0;
  const safePending = Number(pending) || 0;
  const progress = safeTotal ? Math.round((safeCompleted / safeTotal) * 100) : 0;
  const color = getProgressColor(progress);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="project-clock-card">
      <div className="project-clock-title">{title}</div>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.35s ease, stroke 0.35s ease' }}
          />
        </svg>
        <div className="project-clock-center">
          <div className="project-clock-percent">{progress}%</div>
          <div className="project-clock-ratio">{safeCompleted}/{safeTotal}</div>
        </div>
      </div>
      <div className="project-clock-legend">
        <span className="ok-pill">בוצע {safeCompleted}</span>
        <span className="warn-pill">ממתין {safePending}</span>
      </div>
    </div>
  );
}
