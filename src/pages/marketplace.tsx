import Head from 'next/head'

import { Toaster } from 'react-hot-toast';
import Header from '../components/header';
import { useWindowSize } from '../hooks/use-window-size';

const Marketplace = () => {

    const {width, height} = useWindowSize();

    return (
        <div className="theme-bg-color">
            <Toaster />
            <Head>
                <title>Panda Warriors</title>
                <meta name="description" content="You can purchase PANDA WARRIOR." />
                <link rel="icon" href="/icon.png" />
            </Head>
    
            <Header />
    
            <section className="w-screen h-screen flex justify-center items-center">
                <img src={'/images/marketplace.png'} width={width > 768 ? "30%" : "70%"} />
            </section>
        </div>
    );
};

export default Marketplace;
