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
                <meta name="description" content="Panda Warriors is a collection of 10,000 generated NFTs, living on the Solana Blockchain, each asset is hand-drawn from scratch by a talented group of artists. Every art piece present on our website is hand-drawn by us. Each Panda Warrior is your lucky NFTicket, that will grow in value every phase of the Panda Warriors project development. Be a part of our journey full of adventures and fun." />
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
