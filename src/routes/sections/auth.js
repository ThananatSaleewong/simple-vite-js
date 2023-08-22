import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { GuestGuard } from 'src/auth/guard';
// layouts
import AuthClassicLayout from 'src/layouts/auth/classic';
// components
import { SplashScreen } from 'src/components/loading-screen';


// ----------------------------------------------------------------------

// JWT
const FirebaseLoginPage = lazy(() => import('src/pages/auth/firebase/login'));
const FirebaseRegisterPage = lazy(() => import('src/pages/auth/firebase/register'));
const FirebaseForgotPasswordPage = lazy(() => import('src/pages/auth/firebase/forgot-password'))
const FirebaseVerifyPage = lazy(() => import('src/pages/auth/firebase/verify'))
// ----------------------------------------------------------------------

const authFirebase = {
  path: 'firebase',
  element: (
    <GuestGuard>
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    </GuestGuard>
  ),
  children: [
    {
      path: 'login',
      element: (
        <AuthClassicLayout>
          <FirebaseLoginPage />
        </AuthClassicLayout>
      ),
    },
    {
      path: 'register',
      element: (
        <AuthClassicLayout title="Manage the job more effectively with Minimal">
          <FirebaseRegisterPage />
        </AuthClassicLayout>
      ),
    },
    {
      path: 'forgotpassword',
      element: (
        <AuthClassicLayout title="Manage the job more effectively with Minimal">
          <FirebaseForgotPasswordPage  />
        </AuthClassicLayout>
      ),
    },
    {
      path: 'verify',
      element: (
        <AuthClassicLayout title="Manage the job more effectively with Minimal">
          <FirebaseVerifyPage  />
        </AuthClassicLayout>
      ),
    },
  ],
};

export const authRoutes = [
  {
    path: 'auth',
    children: [authFirebase],
  },
];
