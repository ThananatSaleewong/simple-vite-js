import PropTypes from 'prop-types';
import { useEffect, useCallback, useState } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
//
import { useAuthContext } from '../hooks';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

const loginPaths = {
  firebase: paths.auth.firebase.login,
};

// ----------------------------------------------------------------------

export default function AuthGuard({ children }) {
  const router = useRouter();

  const { authenticated, method } = useAuthContext();
  const navigate = useNavigate()
  const [checked, setChecked] = useState(false);
  console.log(authenticated)
  const check = useCallback(() => {
    if (!authenticated) {
      const searchParams = new URLSearchParams({
        returnTo: window.location.pathname,
      }).toString();

      const loginPath = loginPaths[method];

      const href = `${loginPath}?${searchParams}`;

      navigate(href);
    } else {
      setChecked(true);
    }
  }, [authenticated, method, router]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}

AuthGuard.propTypes = {
  children: PropTypes.node,
};
