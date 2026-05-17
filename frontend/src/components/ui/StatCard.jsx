export default function StatCard({ title, value, color, icon }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-4">
        <span className="text-xs sm:text-sm font-medium text-gray-500 line-clamp-2">{title}</span>
        <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg sm:text-xl shrink-0 ${colors[color]}`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-auto">{value}</p>
    </div>
  );
}