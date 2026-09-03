import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challengeApi } from '../../api/services';
import StatusBadge from '../../components/StatusBadge';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import getErrorMessage from '../../utils/errors';
import toast from 'react-hot-toast';
import {
  FileText,
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Mail,
  Phone,
  Trophy,
  Send,
} from 'lucide-react';

const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function ChallengeApplications() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApplicationData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [chalData, appData] = await Promise.all([
        challengeApi.get(id).catch(() => null),
        challengeApi.getApplications(id, { page, size: 10 }),
      ]);
      setChallenge(chalData);
      setApplications(appData.items);
      setTotalPages(appData.totalPages);
      setTotalElements(appData.totalElements);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load applications'));
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    fetchApplicationData();
  }, [fetchApplicationData]);

  const handleUpdateStatus = async (applicationId, newStatus) => {
    setActionLoading(applicationId);
    try {
      await challengeApi.updateApplicationStatus(id, applicationId, newStatus);
      toast.success(`Application ${newStatus.toLowerCase()} successfully`);
      fetchApplicationData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update application status'));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApplications = applications.filter((a) => {
    if (statusFilter && a.applicationStatus !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.userName?.toLowerCase().includes(q) ||
      a.userEmail?.toLowerCase().includes(q) ||
      a.motivation?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/org-challenges"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} /> Back to Managed Challenges
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xs border border-gray-200 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={20} className="text-amber-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Application Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {challenge ? challenge.title : 'Challenge Applications'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Total Applications: <strong className="text-gray-900">{totalElements}</strong>
              {challenge?.maxParticipants && ` / ${challenge.maxParticipants} Max Slots`}
            </p>
            {challenge?.status && (
              <div className="mt-2">
                <StatusBadge status={challenge.status} />
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by applicant name, email, or motivation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div className="w-full sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
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
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search || statusFilter ? 'No matching applications' : 'No applications received yet'}
          message={
            search || statusFilter
              ? `No application found matching your filters.`
              : 'Applications from entrepreneurs and innovators will appear here once they apply to your challenge.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((a) => (
            <div
              key={a.applicationId || a.id}
              className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 sm:p-6 transition hover:shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-base">{a.userName || 'Applicant'}</h3>
                    <StatusBadge status={a.applicationStatus} />
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    {a.userEmail && (
                      <span className="flex items-center gap-1">
                        <Mail size={13} className="text-gray-400" /> {a.userEmail}
                      </span>
                    )}
                    {a.userPhone && (
                      <span className="flex items-center gap-1">
                        <Phone size={13} className="text-gray-400" /> {a.userPhone}
                      </span>
                    )}
                    {a.appliedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-gray-400" />
                        Applied {new Date(a.appliedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {a.motivation && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700">
                      <p className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                        <Send size={13} className="text-gray-500" /> Motivation & Pitch:
                      </p>
                      <p className="leading-relaxed whitespace-pre-line">{a.motivation}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end lg:self-start pt-2 lg:pt-0 border-t lg:border-0 border-gray-100 w-full lg:w-auto justify-end flex-wrap">
                  {a.applicationStatus === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(a.applicationId || a.id, 'ACCEPTED')}
                        disabled={actionLoading === (a.applicationId || a.id)}
                        className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} /> Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(a.applicationId || a.id, 'REJECTED')}
                        disabled={actionLoading === (a.applicationId || a.id)}
                        className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                  {a.applicationStatus !== 'PENDING' && a.applicationStatus !== 'CANCELLED' && (
                    <span className="text-xs text-gray-500 italic">
                      {a.applicationStatus === 'ACCEPTED' ? 'Applicant accepted' : 'Applicant rejected'}
                    </span>
                  )}
                  {a.applicationStatus === 'CANCELLED' && (
                    <span className="text-xs text-gray-400 italic">Withdrawn by applicant</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
