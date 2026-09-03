import { useState, useEffect, useCallback } from 'react';
import { notificationPreferenceApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import toast from 'react-hot-toast';
import { Bell, Save, ShieldCheck, Mail, Inbox } from 'lucide-react';

const LABELS = {
  BUSINESS_APPROVED: 'Business Approved',
  BUSINESS_REJECTED: 'Business Rejected',
  BUSINESS_STATUS_CHANGED: 'Business Status Changed',
  REVIEW_RECEIVED: 'New Review Received',
  REVIEW_REPORTED: 'Review Reported',
  TRAINING_REGISTRATION: 'Training Registration',
  TRAINING_REGISTRATION_APPROVED: 'Training Registration Approved',
  TRAINING_REGISTRATION_REJECTED: 'Training Registration Rejected',
  TRAINING_REGISTRATION_CANCELLED: 'Training Registration Cancelled',
  CHALLENGE_APPLICATION: 'Challenge Application',
  CHALLENGE_APPLICATION_ACCEPTED: 'Challenge Application Accepted',
  CHALLENGE_APPLICATION_REJECTED: 'Challenge Application Rejected',
  CHALLENGE_CLOSED: 'Challenge Closed',
  SYSTEM: 'System Announcements',
};

const DESCRIPTIONS = {
  BUSINESS_APPROVED: 'When a business you submitted is approved.',
  BUSINESS_REJECTED: 'When a business you submitted is rejected.',
  BUSINESS_STATUS_CHANGED: 'When the status of one of your businesses changes.',
  REVIEW_RECEIVED: 'When a customer leaves a review on one of your businesses.',
  REVIEW_REPORTED: 'When one of your reviews is reported.',
  TRAINING_REGISTRATION: 'When someone registers for one of your trainings.',
  TRAINING_REGISTRATION_APPROVED: 'When your training registration is approved.',
  TRAINING_REGISTRATION_REJECTED: 'When your training registration is rejected.',
  TRAINING_REGISTRATION_CANCELLED: 'When a training registration is cancelled.',
  CHALLENGE_APPLICATION: 'When someone applies to one of your challenges.',
  CHALLENGE_APPLICATION_ACCEPTED: 'When your challenge application is accepted.',
  CHALLENGE_APPLICATION_REJECTED: 'When your challenge application is rejected.',
  CHALLENGE_CLOSED: 'When a challenge you applied to closes.',
  SYSTEM: 'Important platform updates and announcements.',
};

function Toggle({ checked, onChange, label, icon }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
      <span className="text-xs text-gray-500 flex items-center gap-1">
        {icon}
      </span>
    </label>
  );
}

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const fetchPreferences = useCallback(() => {
    setLoading(true);
    setError('');
    notificationPreferenceApi.get()
      .then(setPrefs)
      .catch(err => setError(getErrorMessage(err, 'Unable to load notification preferences.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPreferences(); }, [fetchPreferences]);

  const update = (type, field, value) => {
    setSaved(false);
    setPrefs(prev => prev.map(p =>
      p.notificationType === type ? { ...p, [field]: value } : p
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    const payload = prefs.map(p => ({
      notificationType: p.notificationType,
      inAppEnabled: p.inAppEnabled,
      emailEnabled: p.emailEnabled,
    }));
    try {
      await notificationPreferenceApi.update(payload);
      toast.success('Notification preferences saved');
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save notification preferences'));
      toast.error(getErrorMessage(err, 'Failed to save preferences'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Bell size={24} className="text-gray-700" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Choose how and where you receive notifications for each activity on ZIEE.
      </p>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-blue-800">
              Security emails — such as email verification and password reset — are always sent and
              cannot be disabled, regardless of these settings.
            </p>
          </div>

          {saved && <div className="mb-4"><Alert type="success">Notification preferences saved.</Alert></div>}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <Mail size={16} className="text-gray-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-gray-700">Email channel</span>
            </div>

            <div className="divide-y divide-gray-100">
              {prefs.map(p => {
                const label = LABELS[p.notificationType] || p.notificationType;
                const desc = DESCRIPTIONS[p.notificationType] || '';
                return (
                  <div key={p.notificationType} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <Toggle
                        checked={p.emailEnabled}
                        label={`Email notifications for ${label}`}
                        icon={<Mail size={14} className="text-gray-400" />}
                        onChange={() => update(p.notificationType, 'emailEnabled', !p.emailEnabled)}
                      />
                      <Toggle
                        checked={p.inAppEnabled}
                        label={`In-app notifications for ${label}`}
                        icon={<Inbox size={14} className="text-gray-400" />}
                        onChange={() => update(p.notificationType, 'inAppEnabled', !p.inAppEnabled)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}
    </div>
  );
}
