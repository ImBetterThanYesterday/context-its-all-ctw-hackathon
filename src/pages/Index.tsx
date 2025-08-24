
import UXForgeDashboard from '@/components/UXForgeDashboard';
import Navbar from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16"> {/* Add padding top to account for fixed navbar */}
        <UXForgeDashboard />
      </div>
    </div>
  );
};

export default Index;
