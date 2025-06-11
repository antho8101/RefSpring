
import { AdminRoute } from '@/components/AdminRoute';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Helmet } from 'react-helmet-async';

const AdminPage = () => {
  return (
    <>
      <Helmet>
        <title>RefSpring - Administration</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    </>
  );
};

export default AdminPage;
