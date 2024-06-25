import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { useReportWebVitals } from 'next/web-vitals';
import { store } from '../store/store';
import Deposit from '../components/Deposit';

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Report web vitals for each route change
      reportWebVitals;
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  const reportWebVitals = useReportWebVitals((metric: any) => {
    console.log(metric);
  });

  return (
    <Provider store={store}>
      <Deposit />
    </Provider>
  );
};

export default Home;