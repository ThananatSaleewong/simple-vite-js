import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
//
import { useAuthContext } from '../hooks';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

export default function GuestGuard({ children }) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo') || paths.dashboard.root;
  const navigate = useNavigate();
  const { authenticated } = useAuthContext();

  const check = useCallback(() => {
    if (authenticated) {
      navigate(paths.dashboard.root);
    }
  }, [authenticated, returnTo, router]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

GuestGuard.propTypes = {
  children: PropTypes.node,
};
