import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/ui/Layout';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch {
      toast.error('Project not found');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (Object.keys(errs).length) return setErrors(errs);
    setSubmitting(true);
    try {
      await api.post('/tasks', { ...form, projectId: id });
      toast.success('Task created!');
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success('Updated!');
      fetchProject();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProject();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await api.put(`/projects/${id}`, { status });
      toast.success('Project updated!');
      fetchProject();
    } catch {
      toast.error('Failed to update');
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    </Layout>
  );

  const todo = project.tasks.filter(t => t.status === 'TODO');
  const inProgress = project.tasks.filter(t => t.status === 'IN_PROGRESS');
  const done = project.tasks.filter(t => t.status === 'DONE');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button onClick={() => navigate('/projects')}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
              ← Back to Projects
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            {project.description && <p className="text-gray-500 mt-1">{project.description}</p>}
            <div className="flex items-center gap-3 mt-3">
              <Badge status={project.status} />
              <span className="text-xs text-gray-400">{project.tasks.length} tasks total</span>
            </div>
          </div>
          <div className="flex gap-2">
            <select value={project.status}
              onChange={e => handleUpdateStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <button onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              + Add Task
            </button>
          </div>
        </div>

        {/* Kanban columns */}
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { label: 'To Do', tasks: todo, color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
            { label: 'In Progress', tasks: inProgress, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
            { label: 'Done', tasks: done, color: 'bg-green-100 text-green-700', dot: 'bg-green-400' },
          ].map(col => (
            <div key={col.label} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${col.dot}`}></span>
                <h3 className="font-semibold text-gray-700 text-sm">{col.label}</h3>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${col.color}`}>
                  {col.tasks.length}
                </span>
              </div>
              {col.tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No tasks</div>
              ) : (
                <div className="space-y-3">
                  {col.tasks.map(t => (
                    <div key={t.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium text-gray-900 text-sm">{t.title}</p>
                        <Badge status={t.priority} />
                      </div>
                      {t.description && (
                        <p className="text-xs text-gray-400 mb-3">{t.description}</p>
                      )}
                      {t.dueDate && (
                        <p className="text-xs text-gray-400 mb-3">
                          Due: {new Date(t.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <select value={t.status}
                          onChange={e => handleStatusChange(t.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                        <button onClick={() => handleDeleteTask(t.id)}
                          className="text-xs text-red-400 hover:text-red-600">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Task to {project.title}</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.title ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Task title" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setErrors({}); }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
