import React, { useEffect, useState } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask, smartAssign } from '../utils/api';
import { socket } from '../utils/socket';
import TaskCard from './TaskCard';
import ConflictModal from './ConflictModal';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLUMNS = [
  { name: 'Todo', color: 'bg-blue-100' },
  { name: 'In Progress', color: 'bg-yellow-100' },
  { name: 'Done', color: 'bg-green-100' },
];

const nextStatus = {
  'Todo': 'In Progress',
  'In Progress': 'Done',
  'Done': 'Done',
};

export default function Board({ username }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 1, assignedUser: '' });
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(null);

  useEffect(() => {
    fetchTasks().then(res => setTasks(res.data));
    axios.get(`${API_URL.replace(/\/api$/, '')}/api/users`).then(res => {
      const usersArr = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.users) ? res.data.users : []);
      setUsers(usersArr);
      console.log('Fetched users:', usersArr);
    });
    socket.connect();

    // Handlers
    const handleCreated = t => setTasks(ts => [...ts, t]);
    const handleUpdated = t => setTasks(ts => ts.map(x => x._id === t._id ? t : x));
    const handleDeleted = ({ _id }) => setTasks(ts => ts.filter(x => x._id !== _id));

    socket.on('taskCreated', handleCreated);
    socket.on('taskUpdated', handleUpdated);
    socket.on('taskDeleted', handleDeleted);

    return () => {
      socket.off('taskCreated', handleCreated);
      socket.off('taskUpdated', handleUpdated);
      socket.off('taskDeleted', handleDeleted);
      socket.disconnect();
    };
  }, []);

  const onDragStart = (task) => setDragged(task);
  const onDrop = (status) => {
    if (!dragged) return;
    handleUpdate(dragged._id, { status, updatedAt: dragged.updatedAt });
    setDragged(null);
  };

  const handleUpdate = async (id, data) => {
    try {
      const res = await updateTask(id, data);
      setTasks(ts => ts.map(t => t._id === id ? res.data : t));
    } catch (err) {
      if (err.response?.status === 409) {
        setConflict({ server: err.response.data.serverTask, client: err.response.data.clientTask, id });
      } else {
        setError(err.response?.data?.message || 'Error');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(ts => ts.filter(t => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createTask({ ...newTask, assignedUser: newTask.assignedUser || undefined });
      setNewTask({ title: '', description: '', priority: 1, assignedUser: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const handleSmartAssignNew = async () => {
    // Create a temp task, then smart assign it
    try {
      const res = await createTask({ ...newTask, assignedUser: undefined });
      await smartAssign(res.data._id);
      setNewTask({ title: '', description: '', priority: 1, assignedUser: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const handleSmartAssign = async (id) => {
    try {
      const res = await smartAssign(id);
      setTasks(ts => ts.map(t => t._id === id ? res.data : t));
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    }
  };

  const handleResolveConflict = async (resolution, id) => {
    if (resolution === 'overwrite') {
      await handleUpdate(id, { ...conflict.client, updatedAt: conflict.server.updatedAt });
    } else if (resolution === 'merge') {
      setTasks(ts => ts.map(t => t._id === id ? conflict.server : t));
    }
    setConflict(null);
  };

  const handleNextStatus = (task) => {
    if (task.status !== 'Done') {
      handleUpdate(task._id, { ...task, status: nextStatus[task.status], updatedAt: task.updatedAt });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-green-50 min-h-[90vh] rounded-xl shadow-xl">
      <form className="flex flex-col md:flex-row gap-2 mb-4 bg-white p-4 rounded-lg shadow items-center" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Task title"
          className="flex-1 px-3 py-2 border rounded focus:ring focus:ring-blue-200"
          value={newTask.title}
          onChange={e => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          className="flex-1 px-3 py-2 border rounded focus:ring focus:ring-blue-200"
          value={newTask.description}
          onChange={e => setNewTask({ ...newTask, description: e.target.value })}
        />
        <input
          type="number"
          min="1"
          max="5"
          className="w-24 px-3 py-2 border rounded focus:ring focus:ring-blue-200"
          value={newTask.priority}
          onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
        />
        <select
          className="border rounded px-2 py-1"
          value={newTask.assignedUser || ''}
          onChange={e => setNewTask({ ...newTask, assignedUser: e.target.value })}
        >
          <option value="">Unassigned</option>
          {(Array.isArray(users) ? users : []).map(u => (
            <option key={u._id} value={u._id}>{u.username}</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Add Task</button>
        <button type="button" className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition" onClick={handleSmartAssignNew}>
          ✨ Smart Assign
        </button>
      </form>
      {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
      <div className="flex flex-col md:flex-row gap-6">
        {COLUMNS.map(col => (
          <div
            key={col.name}
            className={`flex-1 ${col.color} rounded-xl p-3 min-h-[350px] shadow-inner overflow-y-auto max-h-[70vh]`}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(col.name)}
          >
            <h3 className="text-lg font-bold mb-4 text-center tracking-wide uppercase text-gray-700">{col.name}</h3>
            <div className="flex flex-col gap-4">
              {tasks.filter(t => t.status === col.name).map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  users={users}
                  onDragStart={() => onDragStart(task)}
                  onDelete={() => handleDelete(task._id)}
                  onUpdate={data => handleUpdate(task._id, { ...data, updatedAt: task.updatedAt })}
                  onNextStatus={() => handleNextStatus(task)}
                  username={username}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {conflict && (
        <ConflictModal
          server={conflict.server}
          client={conflict.client}
          onResolve={res => handleResolveConflict(res, conflict.id)}
        />
      )}
    </div>
  );
} 