import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/ui/Layout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projectsRes, tasksRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks')
        ]);
        // Agar data set karna ho toh un-comment karein:
        // setProjects(projectsRes.data.projects);
        // setTasks(tasksRes.data.tasks);
      } catch (error) {
        console.error("Dashboard loading failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []); 

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todoTasks = tasks.filter(t => t.status === 'TODO').length;
  const highPriority = tasks.filter(t => t.priority === 'HIGH').length;

  const pieData = [
    { name: 'To Do', value: todoTasks, color: '#94a3b8' },
    { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
    { name: 'Done', value: doneTasks, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const barData = projects.slice(0, 6).map(p => ({
    name: p.title.length > 12 ? p.title.slice(0, 12) + '...' : p.title,
    tasks: p._count?.tasks || 0,
  }));

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      {/* Mobile par padding responsive ki px-4 sm:px-6 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Good day, {user?.name} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your projects</p>
        </div>

        {/* Stats Grid updated for Mobile, Tablet and Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Projects" value={projects.length} color="blue" icon="📁" />
          <StatCard title="Total Tasks" value={totalTasks} color="amber" icon="✅" />
          <StatCard title="Completed" value={doneTasks} color="green" icon="🎯" />
          <StatCard title="High Priority" value={highPriority} color="red" icon="🔴" />
        </div>

        {/* Charts Container */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Tasks per Project</h2>
            {barData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data yet</div>
            ) : (
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Task Status Breakdown</h2>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No tasks yet</div>
            ) : (
              <div className="w-full overflow-hidden">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Recent Section Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Projects</h2>
              <button onClick={() => navigate('/projects')} className="text-sm text-blue-600 hover:underline">View all</button>
            </div>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📁</p>
                <p className="text-gray-500 text-sm">No projects yet</p>
                <button onClick={() => navigate('/projects')} className="mt-3 text-sm text-blue-600 font-medium hover:underline">
                  Create your first project
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map(p => (
                  <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-medium text-gray-900 text-sm truncate">{p.title}</p>
                      <p className="text-xs text-gray-500">{p._count?.tasks || 0} tasks</p>
                    </div>
                    <Badge status={p.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
              <button onClick={() => navigate('/tasks')} className="text-sm text-blue-600 hover:underline">View all</button>
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">✅</p>
                <p className="text-gray-500 text-sm">No tasks yet</p>
                <button onClick={() => navigate('/tasks')} className="mt-3 text-sm text-blue-600 font-medium hover:underline">
                  Create your first task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-medium text-gray-900 text-sm truncate">{t.title}</p>
                      <p className="text-xs text-gray-500 truncate">{t.project?.title}</p>
                    </div>
                    <div className="flex gap-1 sm:gap-2 shrink-0">
                      <Badge status={t.priority} />
                      <Badge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}