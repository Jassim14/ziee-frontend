import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, X, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', organizationId: '', type: 'IN_PERSON', startDate: '', endDate: '' });

  useEffect(() => {
    api.get('/trainings/my').then(res => setTrainings(res.data.data)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/trainings', { ...form, organizationId: parseInt(form.organizationId) });
      setTrainings([...trainings, res.data.data]);
      setShowModal(false);
      setForm({ title: '', description: '', organizationId: '', type: 'IN_PERSON', startDate: '', endDate: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create training');
    }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/trainings/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } });
    setTrainings(trainings.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTraining = async (id) => {
    if (!confirm('Delete this training?')) return;
    await api.delete(`/trainings/${id}`);
    setTrainings(trainings.filter(t => t.id !== id));
  };

  const statusBadge = (s) => ({
    UPCOMING: 'bg-blue-100 text-blue-700',
    ONGOING: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-700');

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trainings</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> New Training
        </button>
      </div>

      {trainings.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No trainings yet</div>
      ) : (
        <div className="space-y-4">
          {trainings.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{t.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(t.status)}`}>{t.status}</span>
                  </div>
                  {t.description && <p className="text-gray-600 text-sm mt-1">{t.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {t.startDate && <span className="flex items-center gap-1"><Calendar size={14} /> {t.startDate}</span>}
                    {t.endDate && <span>— {t.endDate}</span>}
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  {t.status === 'UPCOMING' && (
                    <button onClick={() => updateStatus(t.id, 'ONGOING')} className="p-1.5 text-gray-400 hover:text-green-600 transition" title="Start"><CheckCircle size={16} /></button>
                  )}
                  {t.status === 'ONGOING' && (
                    <button onClick={() => updateStatus(t.id, 'COMPLETED')} className="p-1.5 text-gray-400 hover:text-blue-600 transition" title="Complete"><CheckCircle size={16} /></button>
                  )}
                  <button onClick={() => deleteTraining(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition"><XCircle size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">New Training</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={2}
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Type *</label>
                <select required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="IN_PERSON">In Person</option>
                  <option value="ONLINE">Online</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
