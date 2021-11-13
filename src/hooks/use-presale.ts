import { useWallet } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import { CURRENT_COLLECTION, PRESALE_MAX_NFT_HOLD_COUNT, NORMALSALE_MAX_NFT_HOLD_COUNT, MINT_STATUS } from '../utils/constant';
import useWalletNfts from './use-wallet-nfts';
import { WHITELIST_FOR_FREE, WHITELIST_FOR_PRES } from '../utils/whitelist';

const affiliationPeriod = (Number(process.env.NEXT_PUBLIC_AFFILIATION_PERIOD) == 1);
const presalePeriod = (Number(process.env.NEXT_PUBLIC_PRESALE_PERIOD) == 1);
const treasuryPubkey = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;

const usePresale = () => {
  const wallet = useWallet();
  const [isStatusLoading, nfts]: any = useWalletNfts();
  const [mintStatus, setMintStatus] = useState(MINT_STATUS.WAIT_OPENING);
  const [currentHoldedCount, setCurrentHoldedCount] = useState(0);
  const [maxNFTHoldCount, setMaxNFTHoldCount] = useState(PRESALE_MAX_NFT_HOLD_COUNT);

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

        if (affiliationPeriod) {                                               // Affiliation period
            setMintStatus(MINT_STATUS.WAIT_OPENING);
        } else {
            if (presalePeriod) {                                               // Pre-sale period
                setMaxNFTHoldCount(PRESALE_MAX_NFT_HOLD_COUNT);

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
            } else {                                                            // Normal-sale period
                setMaxNFTHoldCount(NORMALSALE_MAX_NFT_HOLD_COUNT);
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
            if (holdedNFTCount >= maxNFTHoldCount) {                            // Check max hold count
                setMintStatus(MINT_STATUS.OVERFLOW_MAX_HOLD);
            }

            if (wallet.publicKey.toBase58() == treasuryPubkey) {                // Owner of store can mint at anytime
                setMintStatus(MINT_STATUS.POSSIBLE);
            }
        }
    })();
  }, [wallet, isStatusLoading]);

  return [isStatusLoading, mintStatus, currentHoldedCount, maxNFTHoldCount];
}

export default usePresale;