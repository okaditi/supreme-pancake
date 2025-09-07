"use client";

import { createAppKit } from "@reown/appkit/react";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { mainnet, arbitrum, sepolia } from "@reown/appkit/networks";
import Home from "@/app/page";

if(!process.env.NEXT_PUBLIC_PROJECT_ID) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined in environment variables");
}

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!; 

const metadata = {
  name: "My Website",
  description: "Hello Web3 ki website",
  url: "http://localhost:3000",
  icons: ["https://www.youtube.com/watch?v=7CgM8fEJQKE"]
};

// 3. Create the AppKit instance
createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata: metadata,
  networks: [mainnet, arbitrum, sepolia],
  projectId,
  features: {
    analytics: true, 
  },
});

export function AppKit() {
  return (
    <Home /> 
  );
}