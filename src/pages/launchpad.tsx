import Head from 'next/head'

import { Toaster } from 'react-hot-toast';
import Header from '../components/header';

const LaunchPad = () => {

  return (
    <div>
        <Toaster />
        <Head>
            <title>Panda Warriors</title>
            <meta name="description" content="You can purchase PANDA WARRIOR." />
            <link rel="icon" href="/icon.png" />
        </Head>

        <Header />

        <section>
            <img src={'/images/launchpad.jpg'} width="100%" />
        </section>
    </div>
  );
};

export default LaunchPad;



