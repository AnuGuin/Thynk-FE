import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Define Celo Sepolia testnet
export const celoSepolia = defineChain({
    id: 11142220,
    name: "Celo Sepolia",
    rpc: "https://forno.celo-sepolia.celo-testnet.org",
    nativeCurrency: {
        name: "CELO",
        symbol: "CELO",
        decimals: 18,
    },
    blockExplorers: [
        {
            name: "Celo Explorer",
            url: "https://explorer.celo.org/sepolia",
        },
    ],
});

export const contractAddress = "0x14211622320207699794414fa59d80d1c031bfb8";
export const tokenAddress = "0x01C5C0122039549AD1493B8220cABEdD739BC44E";

export const contract = getContract({
    client: client,
    chain: celoSepolia,
    address: contractAddress
});

export const tokenContract = getContract({
    client: client,
    chain: celoSepolia,
    address: tokenAddress
});