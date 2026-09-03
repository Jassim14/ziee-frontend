import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { trainingApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/errors';
import toast from 'react-hot-toast';
import {
  Users,
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  Check,
} from 'lucide-react';

export default function TrainingParticipants() {
  const { id } = useParams();
  const [training, setTraining] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchParticipantData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [trainData, partData] = await Promise.all([
        trainingApi.get(id).catch(() => null),
        trainingApi.getParticipants(id, { page, size: 10 }),
      ]);
      setTraining(trainData);
      setParticipants(partData.items);
      setTotalPages(partData.totalPages);
      setTotalElements(partData.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load participant list'));
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    fetchParticipantData();
  }, [fetchParticipantData]);

  const handleUpdateStatus = async (registrationId, newStatus) => {
    try {
      await trainingApi.updateRegistrationStatus(id, registrationId, newStatus);
      toast.success(`Participant status updated to ${newStatus}`);
      fetchParticipantData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update participant status'));
    }
  };

  const filteredParticipants = participants.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.userName?.toLowerCase().includes(q) ||
      p.userEmail?.toLowerCase().includes(q) ||
      p.userPhone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/org-trainings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} /> Back to Managed Trainings
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users size={20} className="text-blue-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Participant Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {training ? training.title : 'Training Participants'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Total Registrations: <strong className="text-gray-900">{totalElements}</strong>
              {training?.capacity && ` / ${training.capacity} Max Seats`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by participant name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : filteredParticipants.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No matching participants' : 'No registrations recorded yet'}
          message={
            search
              ? `No participant found matching "${search}".`
              : 'Registered participants will appear here once entrepreneurs and customers sign up.'
          }
        />
      ) : (
        <div className="bg-white rounded-3xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs uppercase font-bold text-gray-500">
                  <th className="px-6 py-4">Participant</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParticipants.map((p) => (
                  <tr key={p.registrationId || p.userId} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{p.userName || 'Applicant'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 space-y-1">
                      {p.userEmail && (
                        <div className="flex items-center gap-1.5">
                          <Mail size={12} className="text-gray-400 shrink-0" />
                          <span>{p.userEmail}</span>
                        </div>
                      )}
                      {p.userPhone && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400 shrink-0" />
                          <span>{p.userPhone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={p.registrationStatus} />
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {p.registrationStatus !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateStatus(p.registrationId, 'APPROVED')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                            title="Approve registration"
                          >
                            Approve
                          </button>
                        )}
                        {p.registrationStatus !== 'ATTENDED' && (
                          <button
                            onClick={() => handleUpdateStatus(p.registrationId, 'ATTENDED')}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition"
                            title="Mark attendance"
                          >
                            Attended
                          </button>
                        )}
                        {p.registrationStatus !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateStatus(p.registrationId, 'REJECTED')}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition"
                            title="Reject registration"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
}