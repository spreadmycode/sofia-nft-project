import Head from 'next/head'

import { useState, ChangeEvent } from "react";
import { Toaster } from 'react-hot-toast';
import { useWallet } from "@solana/wallet-adapter-react";
import useCandyMachine from '../hooks/use-candy-machine';
import Header from '../components/header';
import Footer from '../components/footer';
import useWalletBalance from '../hooks/use-wallet-balance';
import { shortenAddress } from '../utils/candy-machine';
import Countdown from 'react-countdown';
import usePresale from '../hooks/use-presale';
import toast from 'react-hot-toast';

const Home = () => {
  const [balance] = useWalletBalance();
  const [isActive, setIsActive] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const wallet = useWallet();

  const { isSoldOut, mintStartDate, isMinting, onMintNFT, nftsData } = useCandyMachine();
  const [isLoading, isPossibleMint] = usePresale();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setQuantity(value);
  }

  const handleMintAction = async () => {
    if (isPossibleMint) {
      await onMintNFT(quantity);
    } else {
      toast.error("Mint failed! You have no 'Crazy Pirate NFT'!");
    }
  }

  return (
    <main className="p-5">
      <Toaster />
      <Head>
        <title>Branden NFT Project</title>
        <meta name="description" content="You can purchase this NFT if you only have specific collection." />
        <link rel="icon" href="/icon.png" />
      </Head>

      <Header />

      <div className="flex flex-col justify-center items-center flex-1 space-y-3 mt-20">

        {!wallet.connected && <span
          className="text-gray-800 font-bold text-2xl cursor-default">
          NOT CONNECTED, PLEASE CLICK SELECT WALLET...
        </span>}

        {wallet.connected &&
          <p className="text-gray-800 font-bold text-lg cursor-default">Address: {shortenAddress(wallet.publicKey?.toBase58() || "")}</p>
        }

        {wallet.connected &&
          <>
            <p className="text-gray-800 font-bold text-lg cursor-default">Balance: {(balance || 0).toLocaleString()} SOL</p>
            <p className="text-gray-800 font-bold text-lg cursor-default">Available / Minted / Total: {nftsData.itemsRemaining} / {nftsData.itemsRedeemed} / {nftsData.itemsAvailable}</p>
          </>
        }

        <div className="flex flex-col justify-center items-center">

          {wallet.connected && 
            (
              isLoading ?
              <div className="loader"></div>
              :
              <>
                <input 
                  min={1}
                  max={15}
                  type="number" 
                  onChange={(e) => handleChange(e)} 
                  style={{border: 'solid 1px grey', textAlign: 'center', width: '50%', margin: 5}} 
                  value={quantity} />
                <button
                  disabled={isSoldOut || isMinting || !isActive}
                  onClick={handleMintAction}
                  className="w-full mt-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded"
                >
                  {isSoldOut ? (
                    "SOLD OUT"
                  ) : isActive ?
                    <span>MINT {quantity} {isMinting && 'LOADING...'}</span> :
                    <Countdown
                      date={mintStartDate}
                      onMount={({ completed }) => completed && setIsActive(true)}
                      onComplete={() => setIsActive(true)}
                      renderer={renderCounter}
                    />
                  }
                </button>
              </>
            )
          }
        </div>
        {/* <Footer /> */}
      </div>
    </main>
  );
};

const renderCounter = ({ days, hours, minutes, seconds }: any) => {
  return (
    <span className="text-gray-800 font-bold text-2xl cursor-default">
      Live in {days} days, {hours} hours, {minutes} minutes, {seconds} seconds
    </span>
  );
};

export default Home;



