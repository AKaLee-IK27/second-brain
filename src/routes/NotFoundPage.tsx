import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-semibold text-sb-text mb-2">Page Not Found</h1>
        <p className="text-sb-text-secondary mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/sessions"
          className="sb-btn sb-btn-accent px-6 py-2.5 text-sm font-medium inline-block"
        >
          Go to Sessions
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
