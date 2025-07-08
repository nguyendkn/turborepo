/**
 * Unauthorized Page Component
 * Displayed when user lacks required permissions
 */

import { useNavigate } from '@tanstack/react-router';
import React from 'react';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 text-center'>
        <div>
          <div className='mx-auto h-24 w-24 text-red-500'>
            <svg
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              className='w-full h-full'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
              />
            </svg>
          </div>

          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Access Denied
          </h2>

          <p className='mt-2 text-sm text-gray-600'>
            You don&apos;t have permission to access this resource.
          </p>
        </div>

        <div className='space-y-4'>
          <p className='text-gray-500'>
            If you believe this is an error, please contact your administrator
            or try logging in with a different account.
          </p>

          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className='w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => window.history.back()}
              className='w-full sm:w-auto bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors'
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
