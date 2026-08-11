import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, MapPin, Eye } from 'lucide-react';

const FILTERS = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

export default function ApproveBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const endpoint = filter === 'ALL'
      ? '/businesses/all'
      : `/businesses/status/${filter.toLowerCase()}`;
    api.get(endpoint)
      .then(res => { if (active) setBusinesses(res.data.data); })
      .catch(err => { if (active) setError(getErrorMessage(err, 'Failed to load businesses')); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/businesses/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } });
      setBusinesses(businesses.map(b => b.id === id ? { ...b, status } : b));
      toast.success(`Business ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update status'));
    }
  };

  const badgeColor = (s) => s === 'APPROVED' ? 'bg-green-100 text-green-700' : s === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Approve Businesses</h1>
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : businesses.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200">
          {filter === 'PENDING' ? 'No businesses pending approval. Great job!' : 'No businesses found'}
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-lg">{b.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor(b.status)}`}>{b.status}</span>
                  </div>
                  {b.description && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{b.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                    {b.location && <span className="flex items-center gap-1"><MapPin size={14} /> {b.location}</span>}
                    {b.categoryName && <span>Category: {b.categoryName}</span>}
                    {b.ownerName && <span>Owner: {b.ownerName}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4 items-center">
                  <Link to={`/businesses/${b.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition" title="View">
                    <Eye size={18} />
                  </Link>
                  {b.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateStatus(b.id, 'APPROVED')}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition">
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button onClick={() => updateStatus(b.id, 'REJECTED')}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition">
                        <XCircle size={16} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
