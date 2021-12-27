import { WalletContextState } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const AddTransactionLogMutation = gql`
  mutation AddTransactionLogMutation($pubkey: String, $holdcnt: Int, $txid: String) {
    addTransactionLog(input: { pubkey: $pubkey, holdcnt: $holdcnt, txid: $txid }) {
        transaction {
          id
          pubkey
          txid
      }
    }
  }
`;

const useTransactionLog = () => {
  const [isAddingLog, setIsAddingLog] = useState(false);

  const [addTransactionLogMutation] = useMutation(AddTransactionLogMutation);

  const addTransactionLog = async (pubkey: string, holdcnt: number, txid: string) => {
    setIsAddingLog(true);

    await addTransactionLogMutation({
        variables: {
          pubkey,
          holdcnt,
          txid
        }
    });

    setIsAddingLog(false);
  }

  return { isAddingLog, addTransactionLog };
}

export default useTransactionLog;