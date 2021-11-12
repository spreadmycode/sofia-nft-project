import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import { CURRENT_COLLECTION, MAX_NFT_HOLD_COUNT, MINT_STATUS } from '../utils/constant';
import useWalletNfts from './use-wallet-nfts';
import { WHITELIST_FOR_FREE, WHITELIST_FOR_PRES } from '../utils/whitelist';

const affiliationPeriod = (Number(process.env.NEXT_PUBLIC_AFFILIATION_PERIOD) == 1);
const presalePeriod = (Number(process.env.NEXT_PUBLIC_PRESALE_PERIOD) == 1);

const usePresale = () => {
  const wallet = useWallet();
  const [isStatusLoading, nfts]: any = useWalletNfts();
  const [mintStatus, setMintStatus] = useState(MINT_STATUS.WAIT_OPENING);
  const [currentHoldedCount, setCurrentHoldedCount] = useState(0);

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

        setMintStatus(MINT_STATUS.WAIT_OPENING);

        if (affiliationPeriod) {
            setMintStatus(MINT_STATUS.WAIT_OPENING);
        } else {
            if (presalePeriod) {
                for (let i = 0; i < WHITELIST_FOR_FREE.length; i++) {
                    let address = WHITELIST_FOR_FREE[i];
                    if (wallet.publicKey.toBase58() == address) {
                        setMintStatus(MINT_STATUS.POSSIBLE);
                        break;
                    }
                }
        
                for (let i = 0; i < WHITELIST_FOR_PRES.length; i++) {
                    let address = WHITELIST_FOR_PRES[i];
                    if (wallet.publicKey.toBase58() == address) {
                        setMintStatus(MINT_STATUS.POSSIBLE);
                        break;
                    }
                }

                if (mintStatus == MINT_STATUS.WAIT_OPENING) {
                    setMintStatus(MINT_STATUS.NOT_WHITELISTED);
                }
            } else {
                setMintStatus(MINT_STATUS.POSSIBLE);
            }

            let holdedNFTCount = 0;
            for (let i = 0; i < nfts.length; i++) {
                const nft = nfts[i];
                if (nft.collection?.name == CURRENT_COLLECTION) {
                    holdedNFTCount++;
                }
            }
            setCurrentHoldedCount(holdedNFTCount);
            if (holdedNFTCount >= MAX_NFT_HOLD_COUNT) {
                setMintStatus(MINT_STATUS.OVERFLOW_MAX_HOLD);
            }
        }
    })();
  }, [wallet, isStatusLoading]);

  return [isStatusLoading, mintStatus, currentHoldedCount];
}

export default usePresale;