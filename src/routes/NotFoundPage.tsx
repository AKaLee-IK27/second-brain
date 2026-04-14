import { Link } from 'react-router-dom';
import { MaterialIcon } from '../components/shared/MaterialIcon';

function NotFoundPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 opacity-50">
          <MaterialIcon name="search" size={64} className="text-outline-variant" />
        </div>
        <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">Page Not Found</h1>
        <p className="font-serif text-on-surface-variant mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/sessions"
          className="sb-btn-primary px-8 py-3 rounded-lg font-headline font-bold inline-flex items-center gap-2"
        >
          Go to Sessions
          <MaterialIcon name="arrow_forward" size={18} />
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
