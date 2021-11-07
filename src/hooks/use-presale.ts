import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import { PRESALE_NFT_COLLECTION_NAME } from '../utils/constant';
import useWalletNfts from './use-wallet-nfts';

const presalePeriod = (Number(process.env.NEXT_PUBLIC_PRESALE_PERIOD) == 1);

const usePresale = () => {
  const wallet = useWallet();
  const [isLoading, nfts]: any = useWalletNfts();
  const [isPossibleMint, setIsPossibleMint] = useState(false);

  useEffect(() => {
    (async () => {
        if (
            !wallet ||
            !wallet.publicKey ||
            !wallet.signAllTransactions ||
            !wallet.signTransaction
        ) {
            return;
        }

        setIsPossibleMint(false);

        if (presalePeriod) {
            for (let i = 0; i < nfts.length; i++) {
                const nft = nfts[i];
                console.log(`NFT ${i}`, nft);
                if (nft.collection?.name == PRESALE_NFT_COLLECTION_NAME) {
                    setIsPossibleMint(true);
                    break;
                }
            }
        } else {
            setIsPossibleMint(true);
        }
    })();
  }, [wallet, isLoading]);

  return [isLoading, isPossibleMint];
}

export default usePresale;