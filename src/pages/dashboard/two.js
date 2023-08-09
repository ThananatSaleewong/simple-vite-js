import { Helmet } from 'react-helmet-async';
import { OverviewFileView } from 'src/sections/two/file/view';
// sections
import TwoView from 'src/sections/two/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Two</title>
      </Helmet>
      <OverviewFileView />
      {/* <TwoView /> */}
    </>
  );
}
