import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { businessApi } from '../../api/services';
import getErrorMessage from '../../utils/errors';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import BusinessForm from '../../components/BusinessForm';

export default function EditBusiness() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    businessApi.get(id)
      .then((data) => { if (active) setBusiness(data); })
      .catch((err) => { if (active) setError(getErrorMessage(err, 'Failed to load business')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-2xl mx-auto px-4 py-8"><Alert type="error">{error}</Alert></div>;
  if (!business) return <div className="max-w-2xl mx-auto px-4 py-8"><Alert type="info">Business not found</Alert></div>;

  return (
    <BusinessForm
      mode="edit"
      businessId={id}
      initial={business}
      onSaved={() => navigate('/my-businesses')}
    />
  );
}