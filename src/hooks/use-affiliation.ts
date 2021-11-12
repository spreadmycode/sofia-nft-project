import { WalletContextState } from '@solana/wallet-adapter-react';
import React, { useEffect, useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const InsertAffiliationMutation = gql`
  mutation InsertAffiliationMutation($pubkey: String, $code: String) {
    insertAffiliation(input: { pubkey: $pubkey, code: $code }) {
      affiliation {
          id
          pubkey
          code
      }
    }
  }
`;

const GetPubkeyMutation = gql`
  mutation GetPubkeyMutation($code: String) {
    getPubkey(input: { code: $code}) {
        pubkey
    }
  }
`;

const GetCodeMutation = gql`
  mutation GetCodeMutation($pubkey: String) {
    getCode(input: { pubkey: $pubkey}) {
        code
    }
  }
`;

const useAffiliation = () => {
  const [isAffiliationLoading, setIsAffiliationLoading] = useState(false);

  const [insertAffiliation] = useMutation(InsertAffiliationMutation);
  const [getPubkey] = useMutation(GetPubkeyMutation);
  const [getCode] = useMutation(GetCodeMutation);

  const getCodeByWallet = async (wallet: WalletContextState) => {
    setIsAffiliationLoading(true);

    let codeMut = await getCode({
      variables: {
          pubkey: wallet.publicKey?.toBase58()
      }
    });
    const code = codeMut.data.getCode.code;

    setIsAffiliationLoading(false);

    return code;
  }

  const getPubKeyByCode = async (code: string) => {
    setIsAffiliationLoading(true);

    let pubkeyMut = await getPubkey({
      variables: {
        code
      }
    });
    const pubkey = pubkeyMut.data.getPubkey.pubkey;

    setIsAffiliationLoading(false);

    return pubkey;
  }

  const insertCode = async (wallet: WalletContextState, code: string) => {
    setIsAffiliationLoading(true);

    await insertAffiliation({
      variables: {
          pubkey: wallet.publicKey?.toBase58(),
          code
      }
    });

    setIsAffiliationLoading(false);
  }

  return { isAffiliationLoading, getCodeByWallet, getPubKeyByCode, insertCode };
}

export default useAffiliation;