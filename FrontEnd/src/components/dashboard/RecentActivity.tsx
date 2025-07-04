import React from "react";
import { User, Book, Clock } from "lucide-react";

const activities = [
  {
    type: "user",
    message: "User baru mendaftar: John Doe",
    time: "2 menit lalu",
  },
  {
    type: "borrow",
    message: "Buku 'Atomic Habits' dipinjam oleh Jane",
    time: "10 menit lalu",
  },
  {
    type: "book",
    message: "Buku baru ditambahkan: Deep Work",
    time: "1 jam lalu",
  },
  {
    type: "borrow",
    message: "Buku 'Clean Code' dikembalikan oleh Alex",
    time: "2 jam lalu",
  },
  {
    type: "user",
    message: "User baru mendaftar: Maria",
    time: "3 jam lalu",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  user: <User className="w-5 h-5 text-blue-500" />,
  book: <Book className="w-5 h-5 text-green-500" />,
  borrow: <Clock className="w-5 h-5 text-yellow-500" />,
};

const RecentActivity: React.FC = () => {
  return (
    <div className="card">
      <div className="border-b border-gray-100 p-4">
        <h3 className="font-semibold text-lg">Aktivitas Terbaru</h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {activities.map((activity, idx) => (
          <li key={idx} className="flex items-center p-4">
            <span className="mr-3">{iconMap[activity.type]}</span>
            <div className="flex-1">
              <div className="text-sm text-gray-800">{activity.message}</div>
              <div className="text-xs text-gray-500">{activity.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity; 