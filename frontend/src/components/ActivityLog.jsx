import React, { useEffect, useState } from 'react';
import { fetchActions } from '../utils/api';
import { socket } from '../utils/socket';

const actionIcons = {
  'create': <span className="inline-block mr-1">🟢</span>,
  'update': <span className="inline-block mr-1">✏️</span>,
  'delete': <span className="inline-block mr-1">🗑️</span>,
  'smart-assign': <span className="inline-block mr-1">✨</span>,
};

export default function ActivityLog() {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    fetchActions().then(res => setActions(res.data));
    socket.on('actionLogged', action => setActions(a => [action, ...a.slice(0, 19)]));
    return () => { socket.off('actionLogged'); };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full md:w-96 max-h-[500px] overflow-y-auto border border-blue-100">
      <h3 className="text-xl font-bold mb-4 text-blue-700">Activity Log</h3>
      <ul className="space-y-4 relative">
        {actions.map((a, i) => (
          <li key={a._id || i} className="flex items-start gap-2 relative">
            <span className="absolute left-0 top-2 w-1 h-6 bg-blue-200 rounded-full -z-10" style={{ left: '-10px' }}></span>
            <span className="flex-shrink-0 mt-1">{actionIcons[a.action] || <span className="w-4 h-4 inline-block" />}</span>
            <div>
              <span className="font-semibold text-blue-700">{a.user?.username || 'Unknown'}</span>
              <span className="ml-1 text-gray-700">{a.action}</span>
              <span className="ml-1 text-gray-500">{a.details}</span>
              <span className="ml-2 text-gray-400 text-xs">{new Date(a.timestamp).toLocaleTimeString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 