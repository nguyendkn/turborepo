/**
 * Dashboard Page Component
 * Main dashboard with navigation and user information
 */

import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { useAuthGuard } from '@/components/auth/protected-route';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthGuard();

  const handleLogout = async () => {
    const { authActions } = await import('@/store');
    authActions.logout();
    navigate({ to: '/auth/login', search: { redirect: '' } });
  };

  if (!isAuthenticated || !user) {
    return null; // ProtectedRoute will handle redirect
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Navigation Header */}
      <nav className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex items-center'>
              <h1 className='text-xl font-semibold text-gray-900'>
                CSmart Dashboard
              </h1>
            </div>

            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-700'>
                Welcome, {user.firstName} {user.lastName}
              </span>

              <div className='relative'>
                <button
                  onClick={handleLogout}
                  className='bg-white text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium border border-gray-300 hover:border-gray-400 transition-colors'
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='border-4 border-dashed border-gray-200 rounded-lg p-8'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Welcome to CSmart
              </h2>
              <p className='text-gray-600 mb-8'>
                Your comprehensive management system is ready to use.
              </p>

              {/* Quick Actions Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto'>
                {/* User Management */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'>
                  <div className='text-blue-600 mb-4'>
                    <svg
                      className='w-8 h-8 mx-auto'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    User Management
                  </h3>
                  <p className='text-gray-600 text-sm mb-4'>
                    Manage users, roles, and permissions
                  </p>
                  <button
                    onClick={() => navigate({ to: '/users' })}
                    className='w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
                  >
                    Manage Users
                  </button>
                </div>

                {/* Role Management */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'>
                  <div className='text-green-600 mb-4'>
                    <svg
                      className='w-8 h-8 mx-auto'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Role Management
                  </h3>
                  <p className='text-gray-600 text-sm mb-4'>
                    Create and manage user roles
                  </p>
                  <button
                    onClick={() => navigate({ to: '/roles' })}
                    className='w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors'
                  >
                    Manage Roles
                  </button>
                </div>

                {/* Policy Management */}
                <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow'>
                  <div className='text-purple-600 mb-4'>
                    <svg
                      className='w-8 h-8 mx-auto'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5H7a2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    Policy Management
                  </h3>
                  <p className='text-gray-600 text-sm mb-4'>
                    Configure access policies and rules
                  </p>
                  <button
                    onClick={() => navigate({ to: '/policies' })}
                    className='w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors'
                  >
                    Manage Policies
                  </button>
                </div>
              </div>

              {/* User Info Section */}
              <div className='mt-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Your Account
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-left'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Name
                    </label>
                    <p className='mt-1 text-sm text-gray-900'>
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Email
                    </label>
                    <p className='mt-1 text-sm text-gray-900'>{user.email}</p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Status
                    </label>
                    <p className='mt-1 text-sm text-gray-900'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Roles
                    </label>
                    <p className='mt-1 text-sm text-gray-900'>
                      {user.roles?.map(role => role.name).join(', ') ||
                        'No roles assigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
