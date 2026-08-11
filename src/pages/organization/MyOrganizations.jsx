import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';

export default function MyOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/organizations/my')
      .then(res => setOrganizations(res.data.data))
      .catch(err => setError(getErrorMessage(err, 'Failed to load organizations')))
      .finally(() => setLoading(false));
  }, []);

  const deleteOrg = async (id) => {
    if (!window.confirm('Delete this organization? This cannot be undone.')) return;
    try {
      await api.delete(`/organizations/${id}`);
      setOrganizations(organizations.filter(o => o.id !== id));
      toast.success('Organization deleted');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete organization'));
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Organizations</h1>
        <Link to="/organizations/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> Add Organization
        </Link>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No organizations yet</p>
          <Link to="/organizations/new" className="text-blue-600 font-medium hover:text-blue-700">Create one</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {organizations.map(o => (
            <div key={o.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{o.name}</h3>
                  {o.description && <p className="text-gray-600 text-sm mt-1 line-clamp-2">{o.description}</p>}
                  {o.email && <p className="text-gray-500 text-sm mt-1">Email: {o.email}</p>}
                  {o.phone && <p className="text-gray-500 text-sm">Phone: {o.phone}</p>}
                </div>
                <div className="flex gap-2 ml-4">
                  <Link to={`/organizations/${o.id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 transition" title="Edit">
                    <Edit2 size={18} />
                  </Link>
                  <button onClick={() => deleteOrg(o.id)} className="p-2 text-gray-400 hover:text-red-500 transition" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
