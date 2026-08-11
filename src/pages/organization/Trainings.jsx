import { useState, useEffect } from 'react';
import api from '../../api/axios';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import toast from 'react-hot-toast';
import { Plus, X, Calendar, CheckCircle, XCircle } from 'lucide-react';

const emptyForm = { title: '', description: '', organizationId: '', type: 'IN_PERSON', startDate: '', endDate: '' };

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Promise.all([api.get('/trainings/my'), api.get('/organizations/my')])
      .then(([tRes, oRes]) => {
        setTrainings(tRes.data.data);
        setOrganizations(oRes.data.data);
        if (oRes.data.data?.length === 1) {
          setForm(f => ({ ...f, organizationId: oRes.data.data[0].id }));
        }
      })
      .catch(err => setError(getErrorMessage(err, 'Failed to load trainings')))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/trainings', { ...form, organizationId: parseInt(form.organizationId) });
      setTrainings([...trainings, res.data.data]);
      setShowModal(false);
      setForm(emptyForm);
      toast.success('Training created');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create training'));
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/trainings/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } });
      setTrainings(trainings.map(t => t.id === id ? { ...t, status } : t));
      toast.success('Training status updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update training'));
    }
  };

  const deleteTraining = async (id) => {
    if (!window.confirm('Delete this training?')) return;
    try {
      await api.delete(`/trainings/${id}`);
      setTrainings(trainings.filter(t => t.id !== id));
      toast.success('Training deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete training'));
    }
  };

  const statusBadge = (s) => ({
    UPCOMING: 'bg-blue-100 text-blue-700',
    ONGOING: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-700');

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trainings</h1>
        <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> New Training
        </button>
      </div>

      {trainings.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200">No trainings yet</div>
      ) : (
        <div className="space-y-4">
          {trainings.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{t.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(t.status)}`}>{t.status}</span>
                  </div>
                  {t.description && <p className="text-gray-600 text-sm mt-1">{t.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                    {t.startDate && <span className="flex items-center gap-1"><Calendar size={14} /> {t.startDate}</span>}
                    {t.endDate && <span>â€” {t.endDate}</span>}
                    {t.type && <span>Type: {t.type}</span>}
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  {t.status === 'UPCOMING' && (
                    <button onClick={() => updateStatus(t.id, 'ONGOING')} className="p-1.5 text-gray-400 hover:text-green-600 transition" title="Start"><CheckCircle size={16} /></button>
                  )}
                  {t.status === 'ONGOING' && (
                    <button onClick={() => updateStatus(t.id, 'COMPLETED')} className="p-1.5 text-gray-400 hover:text-blue-600 transition" title="Complete"><CheckCircle size={16} /></button>
                  )}
                  <button onClick={() => deleteTraining(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition" title="Delete"><XCircle size={16} /></button>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                <select required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })}>
                  <option value="">Select organization</option>
                  {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                {organizations.length === 0 && <p className="text-xs text-gray-400 mt-1">Create an organization first.</p>}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="date" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
