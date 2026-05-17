import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api/axios';
import Layout from '../components/ui/Layout';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'TODO', title: '⏳ To Do', bg: 'bg-gray-100' },
  { id: 'IN_PROGRESS', title: '🚀 In Progress', bg: 'bg-blue-50/70' },
  { id: 'DONE', title: '✅ Done', bg: 'bg-green-50/70' }
];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', projectId: '', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.priority) params.append('priority', filter.priority);
      const { data } = await api.get(`/tasks?${params}`);
      setTasks(data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const { data } = await api.get('/projects');
    setProjects(data.projects);
  };

  useEffect(() => { fetchTasks(); }, [filter]);
  useEffect(() => { fetchProjects(); }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.projectId) e.projectId = 'Project is required';
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) return setErrors(e2);
    setSubmitting(true);
    try {
      await api.post('/tasks', form);
      toast.success('Task created!');
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'MEDIUM', projectId: '', dueDate: '' });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const endStatus = destination.droppableId;
    const updatedTasks = tasks.map(t => t.id === draggableId ? { ...t, status: endStatus } : t);
    setTasks(updatedTasks);

    try {
      await api.put(`/tasks/${draggableId}`, { status: endStatus });
      toast.success('Status updated!');
    } catch {
      toast.error('Failed to update status');
      fetchTasks();
    }
  };

  return (
    <Layout>
      {/* Enforced light background and text color wrapper */}
      <div className="w-full min-h-screen bg-gray-50 text-gray-900 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-500 mt-1">{tasks.length} total tasks</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm">
              + New Task
            </button>
          </div>

          {/* Filters Top Bar */}
          <div className="flex gap-3 mb-6">
            <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
              <option value="">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <select value={filter.priority} onChange={e => setFilter({ ...filter, priority: e.target.value })}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
              <option value="">All Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Board Area */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-6xl mb-4">✅</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-6">Create your first task to get started</p>
              <button onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
                Create Task
              </button>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {COLUMNS.map(column => {
                  const columnTasks = tasks.filter(t => t.status === column.id);

                  return (
                    <div key={column.id} className={`rounded-xl p-4 border border-gray-200 ${column.bg} flex flex-col max-h-[80vh]`}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                          {column.title}
                          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                            {columnTasks.length}
                          </span>
                        </h2>
                      </div>

                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 overflow-y-auto space-y-3 min-h-[250px] rounded-lg p-1 transition-colors ${
                              snapshot.isDraggingOver ? 'bg-gray-200/50' : ''
                            }`}
                          >
                            {columnTasks.map((t, index) => (
                              <Draggable key={t.id} draggableId={t.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition relative group ${
                                      snapshot.isDragging ? 'shadow-lg border-blue-500 ring-2 ring-blue-500/10' : ''
                                    }`}
                                  >
                                    <button 
                                      onClick={() => handleDelete(t.id)}
                                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                      title="Delete Task"
                                    >
                                      ✕
                                    </button>

                                    <h3 className="font-medium text-gray-900 text-sm pr-4 line-clamp-2">
                                      {t.title}
                                    </h3>
                                    
                                    {t.description && (
                                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                        {t.description}
                                      </p>
                                    )}

                                    <div className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap gap-2 items-center justify-between text-[11px]">
                                      <span className="text-gray-500 font-medium truncate max-w-[100px]">
                                        📁 {t.project?.title}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <Badge status={t.priority} />
                                        {t.dueDate && (
                                          <span className="text-gray-400">
                                            📅 {new Date(t.dueDate).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Modal - Kept strict light theme */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 text-gray-900">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.title ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900`}
                  placeholder="Task title" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                <select value={form.projectId}
                  onChange={e => setForm({ ...form, projectId: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.projectId ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900`}>
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                {errors.projectId && <p className="text-red-500 text-xs mt-1">{errors.projectId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 resize-none"
                  rows={2} placeholder="Optional description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setErrors({}); }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}