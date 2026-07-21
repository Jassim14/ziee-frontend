import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, X, Calendar, Trophy, CheckCircle, XCircle } from 'lucide-react';

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', organizationId: '', deadline: '', status: 'OPEN' });

  useEffect(() => {
    api.get('/challenges/my').then(res => setChallenges(res.data.data)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/challenges', { ...form, organizationId: parseInt(form.organizationId) });
      setChallenges([...challenges, res.data.data]);
      setShowModal(false);
      setForm({ title: '', description: '', organizationId: '', deadline: '', status: 'OPEN' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create challenge');
    }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/challenges/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } });
    setChallenges(challenges.map(c => c.id === id ? { ...c, status } : c));
  };

  const deleteChallenge = async (id) => {
    if (!confirm('Delete this challenge?')) return;
    await api.delete(`/challenges/${id}`);
    setChallenges(challenges.filter(c => c.id !== id));
  };

  const statusBadge = (s) => ({
    OPEN: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    CLOSED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-700');

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> New Challenge
        </button>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No challenges yet</div>
      ) : (
        <div className="space-y-4">
          {challenges.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>{c.status}</span>
                  </div>
                  {c.description && <p className="text-gray-600 text-sm mt-1">{c.description}</p>}
                  {c.deadline && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1"><Calendar size={14} /> Deadline: {c.deadline}</p>
                  )}
                </div>
                <div className="flex gap-1 ml-4">
                  {c.status === 'OPEN' && (
                    <button onClick={() => updateStatus(c.id, 'IN_PROGRESS')} className="p-1.5 text-gray-400 hover:text-blue-600 transition" title="Start"><Trophy size={16} /></button>
                  )}
                  {c.status === 'IN_PROGRESS' && (
                    <button onClick={() => updateStatus(c.id, 'CLOSED')} className="p-1.5 text-gray-400 hover:text-green-600 transition" title="Close"><CheckCircle size={16} /></button>
                  )}
                  <button onClick={() => deleteChallenge(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition"><XCircle size={16} /></button>
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
              <h2 className="text-lg font-semibold text-gray-900">New Challenge</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
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
