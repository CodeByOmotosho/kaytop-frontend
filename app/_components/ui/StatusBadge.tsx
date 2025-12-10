/**
 * StatusBadge Component
 * Displays loan status with colored indicator dot and text
 */

interface StatusBadgeProps {
  status: 'Active' | 'Scheduled' | 'Missed Payment';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Active: {
      container: 'bg-[#ECFDF3] text-[#027A48]',
      dot: 'bg-[#027A48]'
    },
    Scheduled: {
      container: 'bg-[rgba(255,147,38,0.1)] text-[#FF9326]',
      dot: 'bg-[#FF9326]'
    },
    'Missed Payment': {
      container: 'bg-[#FEF3F2] text-[#E91F11]',
      dot: 'bg-[#E91F11]'
    }
  };

  const style = styles[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-[16px] ${style.container}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span className="text-xs font-medium">{status}</span>
    </div>
  );
}
