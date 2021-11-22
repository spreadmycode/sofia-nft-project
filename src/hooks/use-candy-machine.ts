import { useEffect, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { awaitTransactionSignatureConfirmation, CandyMachine, getCandyMachineState, mintOneToken, mintMultipleToken } from "../utils/candy-machine";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from 'react-hot-toast';
import useWalletBalance from "./use-wallet-balance";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AFFILIATION_WEIGHT } from "../utils/constant";

const MINT_PRICE_SOL = Number(process.env.NEXT_PUBLIC_MINT_PRICE_SOL!);

const treasury = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS!
);

const config = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_CANDY_MACHINE_CONFIG!
);

const candyMachineId = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_CANDY_MACHINE_ID!
);

const rpcHost = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

const txTimeout = 30000;

export default function useCandyMachine() {
  const [, setBalance] = useWalletBalance();
  const [candyMachine, setCandyMachine] = useState<CandyMachine>();
  const wallet = useWallet();
  const [nftsData, setNftsData] = useState<any>({} = {
    itemsRemaining: 0,
    itemsRedeemed: 0,
    itemsAvailable: 0
  } as any);
  const [isMinting, setIsMinting] = useState(false);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [mintStartDate, setMintStartDate] = useState(new Date(parseInt(process.env.NEXT_PUBLIC_CANDY_START_DATE!, 10)));

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

      const anchorWallet = {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as anchor.Wallet;
      const { candyMachine, goLiveDate, itemsRemaining } =
        await getCandyMachineState(
          anchorWallet,
          candyMachineId,
          connection
        );

      setIsSoldOut(itemsRemaining === 0);
      setMintStartDate(goLiveDate);
      setCandyMachine(candyMachine);
    })();
  }, [wallet, candyMachineId, connection]);

  useEffect(() => {
    (async () => {
      if (!isMinting) {
        const anchorWallet = {
          publicKey: wallet.publicKey,
          signAllTransactions: wallet.signAllTransactions,
          signTransaction: wallet.signTransaction,
        } as anchor.Wallet;

        const { itemsRemaining, itemsRedeemed, itemsAvailable } =
          await getCandyMachineState(
            anchorWallet,
            candyMachineId,
            connection
          );

        setNftsData({ itemsRemaining, itemsRedeemed, itemsAvailable });
      }
    })();
  }, [wallet, candyMachineId, connection, isMinting]);

  const onMint = async (affiliatorPubkey: string) => {
    try {
      setIsMinting(true);
      const anchorWallet = {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as anchor.Wallet;
      const { candyMachine } =
        await getCandyMachineState(
          anchorWallet,
          candyMachineId,
          connection
        );

      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const affiliator = new anchor.web3.PublicKey(affiliatorPubkey);
        const affiliateAmount = (MINT_PRICE_SOL * LAMPORTS_PER_SOL) / AFFILIATION_WEIGHT;
        const mintTxId = await mintOneToken(
          candyMachine,
          config,
          wallet.publicKey,
          treasury,
          affiliator,
          affiliateAmount,
        );

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          txTimeout,
          connection,
          "singleGossip",
          false
        );

        if (!status?.err) {
          toast.success("Congratulations! You have just got PW.");
        } else {
          toast.error("Mint failed! Please try again!");
        }
      }
    } catch (error: any) {
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }
      toast.error(message)
    } finally {
      if (wallet?.publicKey) {
        const balance = await connection.getBalance(wallet?.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
    }
  };

  const onMintMultiple = async (quantity: number, affiliatorPubkey: string) => {
    try {
      setIsMinting(true);
      const anchorWallet = {
        publicKey: wallet.publicKey,
        signAllTransactions: wallet.signAllTransactions,
        signTransaction: wallet.signTransaction,
      } as anchor.Wallet;
      const { candyMachine } =
        await getCandyMachineState(
          anchorWallet,
          candyMachineId,
          connection
        );
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const affiliator = new anchor.web3.PublicKey(affiliatorPubkey);
        const affiliateAmount = (MINT_PRICE_SOL * LAMPORTS_PER_SOL) / AFFILIATION_WEIGHT;
        const signedTransactions: any = await mintMultipleToken(
          candyMachine,
          config,
          wallet.publicKey,
          treasury,
          quantity,
          affiliator,
          affiliateAmount
        );

        const promiseArray = [];
        

        for (let index = 0; index < signedTransactions.length; index++) {
          const tx = signedTransactions[index];
          promiseArray.push(awaitTransactionSignatureConfirmation(
            tx,
            txTimeout,
            connection,
            "singleGossip",
            true
          ));
        }

        const allTransactionsResult = await Promise.all(promiseArray);
        let totalSuccess = 0;
        let totalFailure = 0;

        for (let index = 0; index < allTransactionsResult.length; index++) {
          const transactionStatus = allTransactionsResult[index];
          if (!transactionStatus?.err) {
            totalSuccess += 1;
          } else {
            totalFailure += 1;
          }
        }

        if(totalSuccess) {
          toast.success(`Congratulations! You've got ${totalSuccess} PWs`, { duration: 6000})
        }

        if(totalFailure) {
          toast.error(`Some mints failed! ${totalFailure} mints failed.`, { duration: 6000})
        }
      }
    } catch (error: any) {
      let message = error.msg || "Minting failed! Please try again!";
      if (!error.msg) {
        if (error.message.indexOf("0x138")) {
        } else if (error.message.indexOf("0x137")) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf("0x135")) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          setIsSoldOut(true);
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }
      toast.error(message)
    } finally {
      if (wallet?.publicKey) {
        const balance = await connection.getBalance(wallet?.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
      setIsMinting(false);
    }
  };

  const onMintNFT = async (quantity: number, affilatorPubkey: string) => {    
    if (quantity == 1) {
      await onMint(affilatorPubkey);
    } else if (quantity > 1) {
      await onMintMultiple(quantity, affilatorPubkey);
    }
  }

  return { isSoldOut, mintStartDate, isMinting, nftsData, onMintNFT };
}