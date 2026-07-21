import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { CheckCircle, XCircle, MapPin, Eye } from 'lucide-react';

export default function ApproveBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    setLoading(true);
    const endpoint = filter === 'ALL'
      ? '/businesses/all'
      : `/businesses/status/${filter.toLowerCase()}`;
    api.get(endpoint).then(res => setBusinesses(res.data.data)).finally(() => setLoading(false));
  }, [filter]);

  const updateStatus = async (id, status) => {
    await api.patch(`/businesses/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } });
    setBusinesses(businesses.map(b => b.id === id ? { ...b, status } : b));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Approve Businesses</h1>
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No businesses found</div>
      ) : (
        <div className="space-y-4">
          {businesses.map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 text-lg">{b.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      b.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      b.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{b.status}</span>
                  </div>
                  {b.description && <p className="text-gray-600 text-sm mt-1">{b.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {b.location && <span className="flex items-center gap-1"><MapPin size={14} /> {b.location}</span>}
                    <span>Category: {b.categoryName}</span>
                    <span>Owner: {b.ownerName}</span>
                  </div>
                </div>
                {b.status === 'PENDING' && (
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => updateStatus(b.id, 'APPROVED')}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition">
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button onClick={() => updateStatus(b.id, 'REJECTED')}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition">
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
