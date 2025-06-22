import { Clock, BookOpen, MapPin, Users, GraduationCap, Wifi } from 'lucide-react';

interface QuickActionsProps {
  onQuickAction: (action: string) => void;
}

const quickActions = [
  { icon: Clock, text: 'College timings?', action: 'What are the college timings?' },
  { icon: BookOpen, text: 'Library hours?', action: 'What are the library hours?' },
  { icon: MapPin, text: 'Hostel facilities?', action: 'Does the college offer hostel facilities?' },
  { icon: Users, text: 'Extracurricular?', action: 'What extracurricular activities are available?' },
  { icon: GraduationCap, text: 'Attendance?', action: 'Is attendance compulsory?' },
  { icon: Wifi, text: 'Wi-Fi access?', action: 'Is there Wi-Fi on campus?' },
];

export default function QuickActions({ onQuickAction }: QuickActionsProps) {
  return (
    <div className="p-4 border-t border-slate-700/50 dark:border-gray-700/30">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Questions</h3>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((item, index) => (
          <button
            key={index}
            onClick={() => onQuickAction(item.action)}
            className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
          >
            <item.icon className="w-3 h-3" />
            <span className="truncate">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}