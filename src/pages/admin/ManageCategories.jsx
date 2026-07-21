import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data)).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditId(null); setForm({ name: '', description: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditId(c.id); setForm({ name: c.name, description: c.description || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await api.put(`/categories/${editId}`, form);
        setCategories(categories.map(c => c.id === editId ? res.data.data : c));
      } else {
        const res = await api.post('/categories', form);
        setCategories([...categories, res.data.data]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete category that has businesses');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No categories yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map(c => (
              <div key={c.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h3 className="font-medium text-gray-900">{c.name}</h3>
                  {c.description && <p className="text-sm text-gray-500 mt-0.5">{c.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-blue-600 transition"><Edit2 size={16} /></button>
                  <button onClick={() => deleteCategory(c.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={2}
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
