function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] text-center">
      <div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-gray-500 mb-6">Page not found</p>
        <a
          href="/"
          className="text-blue-600 hover:underline"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}

export default NotFound;
