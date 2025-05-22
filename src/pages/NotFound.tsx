
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Layout from '../components/Layout';

const NotFound = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
