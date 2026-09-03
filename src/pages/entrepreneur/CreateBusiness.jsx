import { useNavigate } from 'react-router-dom';
import BusinessForm from '../../components/BusinessForm';

export default function CreateBusiness() {
  const navigate = useNavigate();
  return <BusinessForm mode="create" onSaved={() => navigate('/my-businesses')} />;
}