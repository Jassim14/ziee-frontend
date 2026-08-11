import { useState, useEffect } from 'react';
import api from '../../api/axios';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import toast from 'react-hot-toast';
import { Plus, X, Calendar, Trophy, CheckCircle, XCircle } from 'lucide-react';

const emptyForm = { title: '', description: '', organizationId: '', deadline: '', status: 'OPEN' };

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Promise.all([api.get('/challenges/my'), api.get('/organizations/my')])
      .then(([cRes, oRes]) => {
        setChallenges(cRes.data.data);
        setOrganizations(oRes.data.data);
        if (oRes.data.data?.length === 1) {
          setForm(f => ({ ...f, organizationId: oRes.data.data[0].id }));
        }
      })
      .catch(err => setError(getErrorMessage(err, 'Failed to load challenges')))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/challenges', { ...form, organizationId: parseInt(form.organizationId) });
      setChallenges([...challenges, res.data.data]);
      setShowModal(false);
      setForm(emptyForm);
      toast.success('Challenge created');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create challenge'));
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/challenges/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } });
      setChallenges(challenges.map(c => c.id === id ? { ...c, status } : c));
      toast.success('Challenge status updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update challenge'));
    }
  };

  const deleteChallenge = async (id) => {
    if (!window.confirm('Delete this challenge?')) return;
    try {
      await api.delete(`/challenges/${id}`);
      setChallenges(challenges.filter(c => c.id !== id));
      toast.success('Challenge deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete challenge'));
    }
  };

  const statusBadge = (s) => ({
    OPEN: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    CLOSED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-700');

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Challenges</h1>
        <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> New Challenge
        </button>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200">No challenges yet</div>
      ) : (
        <div className="space-y-4">
          {challenges.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
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
                  <button onClick={() => deleteChallenge(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition" title="Delete"><XCircle size={16} /></button>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                <select required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })}>
                  <option value="">Select organization</option>
                  {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                {organizations.length === 0 && <p className="text-xs text-gray-400 mt-1">Create an organization first.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input type="date" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
