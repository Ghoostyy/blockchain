import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { ABI, CONTRACT_ADDRESS, Web3State } from '../types/web3-types';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

const initialState: Web3State = {
    account: null,
    contract: null,
    isConnected: false,
};

export const useWeb3 = () => {
    const [web3State, setWeb3State] = useState<Web3State>(initialState);

    const connectWallet = useCallback(async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.getAccounts();
                const contract = new web3.eth.Contract(ABI as any, CONTRACT_ADDRESS);

                setWeb3State({
                    account: accounts[0],
                    contract: contract as unknown as Contract<AbiItem[]>,
                    isConnected: true,
                });

                return true;
            } else {
                console.error('Please install MetaMask!');
                return false;
            }
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            return false;
        }
    }, []);

    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                setWeb3State(prev => ({
                    ...prev,
                    account: accounts[0] || null,
                    isConnected: !!accounts[0],
                }));
            });

            window.ethereum.on('disconnect', () => {
                setWeb3State(initialState);
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners();
            }
        };
    }, []);

    return {
        ...web3State,
        connectWallet,
    };
}; 