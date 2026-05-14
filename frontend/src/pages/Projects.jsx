import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/ui/Layout';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) return setErrors(e2);
    setSubmitting(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ title: '', description: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">{projects.length} total projects</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition">
            + New Project
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📁</p>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6">Create your first project to get started</p>
            <button onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">{p.title}</h3>
                  <Badge status={p.status} />
                </div>
                {p.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{p.description}</p>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{p._count?.tasks || 0} tasks</span>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/projects/${p.id}`)}
                      className="text-sm text-blue-600 hover:underline font-medium">View</button>
                    <button onClick={() => handleDelete(p.id)}
                      className="text-sm text-red-500 hover:underline font-medium">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.title ? 'border-red-400' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Project title" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3} placeholder="Optional description" />
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