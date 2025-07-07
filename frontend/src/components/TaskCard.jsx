import React, { useState } from 'react';

const statusColors = {
  'Todo': 'bg-blue-200 text-blue-800',
  'In Progress': 'bg-yellow-200 text-yellow-800',
  'Done': 'bg-green-200 text-green-800',
};

const priorityColors = [
  'bg-gray-300', // 0 (unused)
  'bg-green-400', // 1
  'bg-blue-400', // 2
  'bg-yellow-400', // 3
  'bg-orange-400', // 4
  'bg-red-500', // 5
];

export default function TaskCard({ task, users = [], onDragStart, onDelete, onUpdate, onNextStatus, username }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ ...task });

  const handleEdit = (e) => {
    e.preventDefault();
    onUpdate(form);
    setEdit(false);
  };

  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg p-4 mb-4 cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-2xl`}
      draggable
      onDragStart={onDragStart}
      style={{ minHeight: 120 }}
    >
      {!edit ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${priorityColors[task.priority || 1]}`}></span>
            <span className="font-bold text-lg flex-1">{task.title}</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[task.status]}`}>{task.status}</span>
          </div>
          <div className="text-gray-600">{task.description}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-xl">👤</span>
            <span className="bg-gray-100 px-2 py-1 rounded-full">{task.assignedUser?.username || 'Unassigned'}</span>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <button className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" onClick={() => setEdit(true)} title="Edit">
              <span role="img" aria-label="Edit">✏️</span> Edit
            </button>
            <button className="flex items-center gap-1 bg-red-200 px-3 py-1 rounded hover:bg-red-300" onClick={onDelete} title="Delete">
              <span role="img" aria-label="Delete">🗑️</span> Delete
            </button>
            {task.status !== 'Done' && (
              <button className="flex items-center gap-1 bg-green-200 px-3 py-1 rounded hover:bg-green-300" onClick={onNextStatus} title="Next Status">
                <span role="img" aria-label="Next">➡️</span> Next
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleEdit} className="flex flex-col gap-2">
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="number"
            min="1"
            max="5"
            className="border rounded px-2 py-1"
            value={form.priority}
            onChange={e => setForm({ ...form, priority: e.target.value })}
          />
          <select
            className="border rounded px-2 py-1"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            <option>Todo</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <select
            className="border rounded px-2 py-1"
            value={form.assignedUser || ''}
            onChange={e => setForm({ ...form, assignedUser: e.target.value })}
          >
            <option value="">Unassigned</option>
            {(Array.isArray(users) ? users : []).map(u => (
              <option key={u._id} value={u._id}>{u.username}</option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Save</button>
            <button type="button" className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" onClick={() => setEdit(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}