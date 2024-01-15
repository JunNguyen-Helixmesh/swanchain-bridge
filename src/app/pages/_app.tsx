import '../globals.css';
import type { AppProps } from 'next/app';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Provider } from 'react-redux';
import { WagmiConfig } from 'wagmi';
import { store } from '../store';
import { config } from '../index';
import { useReportWebVitals } from 'next/web-vitals'
import { useEffect } from 'react';
import { useRouter } from 'next/router';


function MyApp({ Component, pageProps }: AppProps) {
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

  const reportWebVitals = useReportWebVitals((metric) => {
    console.log(metric);
  });

  return (
    <WagmiConfig config={config}>
      <Provider store={store}>
        <Header />
        <div className="main_wrap">
          <Component {...pageProps} />
        </div>
        <Footer />
      </Provider>
    </WagmiConfig>
  );
}

export default MyApp;



