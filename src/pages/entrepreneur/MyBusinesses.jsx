import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

export default function MyBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/businesses/my').then(res => setBusinesses(res.data.data)).finally(() => setLoading(false));
  }, []);

  const deleteBusiness = async (id) => {
    if (!confirm('Delete this business?')) return;
    await api.delete(`/businesses/${id}`);
    setBusinesses(businesses.filter(b => b.id !== id));
  };

  const statusColor = (status) => ({
    APPROVED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    REJECTED: 'bg-red-100 text-red-700',
  }[status] || 'bg-gray-100 text-gray-700');

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Businesses</h1>
        <Link to="/business/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> Add Business
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">You haven't created any businesses yet</p>
          <Link to="/business/new" className="text-blue-600 font-medium hover:text-blue-700">Create your first business</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 text-lg">{b.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(b.status)}`}>{b.status}</span>
                  </div>
                  {b.description && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{b.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {b.location && <span className="flex items-center gap-1"><MapPin size={14} /> {b.location}</span>}
                    <span>Category: {b.categoryName}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link to={`/business/${b.id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 transition"><Edit2 size={18} /></Link>
                  <button onClick={() => deleteBusiness(b.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
