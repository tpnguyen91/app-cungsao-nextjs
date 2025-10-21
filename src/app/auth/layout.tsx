export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='w-full max-w-md'>{children}</div>
      </div>
    </div>
  );
}
