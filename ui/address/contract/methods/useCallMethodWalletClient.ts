import React from 'react';
import { encodeFunctionData, getAddress, type Abi } from 'viem';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';

import type { FormSubmitResult, SmartContractMethod } from './types';

import config from 'configs/app';

import useFacet from './useFacet';
import { getNativeCoinValue } from './utils';

interface Params {
  item: SmartContractMethod;
  args: Array<unknown>;
  addressHash: string;
}

interface FacetTransactionParams {
  to: `0x${ string }`;
  value?: bigint;
  maxFeePerGas: bigint;
  gasLimit: bigint;
  data?: `0x${ string }`;
}

export default function useCallMethodWalletClient(): (params: Params) => Promise<FormSubmitResult> {
  const publicClient = usePublicClient({ chainId: Number(config.chain.id) });
  const { data: walletClient } = useWalletClient();
  const { isConnected, address: from } = useAccount();
  const sendFacetTransaction = useFacet();

  return React.useCallback(async({ args, item, addressHash }) => {
    if (!isConnected || !from) {
      throw new Error('Wallet is not connected');
    }

    if (!walletClient) {
      throw new Error('Wallet Client is not defined');
    }

    const address = getAddress(addressHash);

    const estimateFeesPerGas = await publicClient?.estimateFeesPerGas({ type: 'eip1559' });

    const facetTransactionParams: FacetTransactionParams = {
      to: address,
      maxFeePerGas: estimateFeesPerGas?.maxFeePerGas || BigInt(0),
      gasLimit: BigInt(0),
    };

    if (item.type === 'receive' || item.type === 'fallback') {
      facetTransactionParams.value = getNativeCoinValue(args[0]);
    } else {
      const _args = args.slice(0, item.inputs.length);
      facetTransactionParams.value = getNativeCoinValue(args[item.inputs.length]);

      const methodName = item.name;

      if (!methodName) {
        throw new Error('Method name is not defined');
      }

      const encodedFunctionData = encodeFunctionData({
        abi: [ item ] as Abi,
        functionName: methodName,
        args: _args,
      });

      if (encodedFunctionData) {
        facetTransactionParams.data = encodedFunctionData;
      }
    }

    const estimateGas = await publicClient?.estimateGas({
      account: from,
      to: facetTransactionParams.to,
      value: facetTransactionParams.value,
      data: facetTransactionParams.data,
    });

    if (!estimateGas) {
      throw 'Could not estimate gas';
    }

    facetTransactionParams.gasLimit = estimateGas;

    const hash = await sendFacetTransaction(facetTransactionParams);

    return { source: 'wallet_client', data: { hash } };
  }, [ from, isConnected, publicClient, sendFacetTransaction, walletClient ]);
}
