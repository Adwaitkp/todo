import React from 'react';

export default function ConflictModal({ server, client, onResolve }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4 text-center">Conflict Detected</h3>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Server Version</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(server, null, 2)}</pre>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Your Version</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(client, null, 2)}</pre>
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300" onClick={() => onResolve('merge')}>Keep Server</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => onResolve('overwrite')}>Overwrite</button>
        </div>
      </div>
    </div>
  );
} 