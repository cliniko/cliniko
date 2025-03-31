
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-medical-light p-4">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-full mb-6">
            <FileX size={64} className="text-medical-danger" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-medical-primary">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          Oops! We couldn't find the page you're looking for
        </p>
        <Button asChild className="bg-medical-primary hover:bg-medical-primary/90">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
