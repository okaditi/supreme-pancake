"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  useAppKitAccount,
  useAppKitProvider,
  useAppKitNetworkCore,
  type Provider,
} from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import {
  Target,
  Clock,
  User,
  Coins,
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { CampaignForm } from "./Form";

// Toast notification types
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string | React.ReactNode;
}

// Toast notification component
function ToastNotification({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: (id: number) => void;
}) {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-600 text-white border-green-700";
      case "error":
        return "bg-red-600 text-white border-red-700";
      case "warning":
        return "bg-yellow-600 text-white border-yellow-700";
      case "info":
        return "bg-blue-600 text-white border-blue-700";
      default:
        return "bg-gray-600 text-white border-gray-700";
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-white" />;
      case "error":
        return <XCircle className="h-5 w-5 text-white" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-white" />;
      case "info":
        return <AlertCircle className="h-5 w-5 text-white" />;
      default:
        return <AlertCircle className="h-5 w-5 text-white" />;
    }
  };

  return (
    <div
      className={`${getToastStyles(
        toast.type
      )} border rounded-lg p-4 shadow-lg animate-in slide-in-from-bottom-2 duration-300 min-w-80`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon(toast.type)}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          <div className="mt-1 text-sm opacity-90">
            {typeof toast.message === "string" ? toast.message : toast.message}
          </div>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="ml-4 inline-flex text-white hover:text-gray-200 hover:bg-white/10 rounded-full p-1 transition-all duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Toast container component
function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

// Helper function to ellipsify addresses
function ellipsifyAddress(address: string, startLength = 6, endLength = 4) {
  if (!address || address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

// Helper function to create Etherscan link
function createEtherscanLink(txHash: string, chainId: number) {
  const baseUrl =
    chainId === 11155111
      ? "https://sepolia.etherscan.io"
      : "https://etherscan.io";
  return (
    <a
      href={`${baseUrl}/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-gray-200 transition-colors"
    >
      View on Etherscan
    </a>
  );
}

// Donation Modal Component
function DonationModal({
  isOpen,
  onClose,
  onDonate,
  campaignTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDonate: (amount: string) => void;
  campaignTitle: string;
}) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    try {
      await onDonate(amount);
      setAmount("");
      onClose();
    } catch (error) {
      console.error("Donation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto animate-in zoom-in-95 slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">
            Donate to Campaign
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign
            </label>
            <div className="text-base font-semibold text-gray-900 mb-4 p-3 bg-gray-50 rounded-lg">
              {campaignTitle}
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-3">
              Donation Amount (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                required
                disabled={isLoading}
                autoFocus
              />
              <span className="absolute right-3 top-3 text-gray-500 font-medium">
                ETH
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 py-3 border-gray-300 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? "Processing..." : "Donate Now"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const CONTRACT_ADDRESS = "0x7f00c3698fA1CbEEa3a3BF25DC272695A0a0e179"; // Replace with actual deployed contract address
const CONTRACT_ABI = [
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "campaigns",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "target",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountCollected",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "_title",
        type: "string",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_target",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_deadline",
        type: "uint256",
      },
    ],
    name: "createCampaign",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "donateToCampaign",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getCampaign",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "string",
            name: "title",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "target",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountCollected",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "donators",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "donations",
            type: "uint256[]",
          },
        ],
        internalType: "struct CrowdFund.Campaign",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCampaigns",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "string",
            name: "title",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "target",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "amountCollected",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "donators",
            type: "address[]",
          },
          {
            internalType: "uint256[]",
            name: "donations",
            type: "uint256[]",
          },
        ],
        internalType: "struct CrowdFund.Campaign[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getDonators",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "numberOfCampaigns",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

// Types
interface Campaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  target: string; // Will be converted from BigNumber
  deadline: number;
  amountCollected: string; // Will be converted from BigNumber
  donators: string[];
  donations: string[];
}

// Contract utility functions
const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum as any);
  }
  return null;
};

const getContract = async (
  withSigner = false,
  walletProvider?: any,
  chainId?: number,
  address?: string
) => {
  if (withSigner && walletProvider && chainId && address) {
    // Use Reown AppKit provider and signer for ethers v5
    const provider = new ethers.providers.Web3Provider(walletProvider);
    const signer = provider.getSigner(address);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  } else if (walletProvider && chainId) {
    // Use provider from Reown AppKit (read-only)
    const provider = new ethers.providers.Web3Provider(walletProvider);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  } else {
    // Fallback to window.ethereum
    const provider = getProvider();
    if (!provider) throw new Error("No ethereum provider found");
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }
};

const formatEthFromWei = (weiValue: any): string => {
  return ethers.utils.formatEther(weiValue.toString());
};

const parseEthToWei = (ethValue: string) => {
  return ethers.utils.parseEther(ethValue);
};

// Content Components
function CreateContent({
  addToast,
}: {
  addToast: (
    type: ToastType,
    title: string,
    message: string | React.ReactNode
  ) => void;
}) {
  // Use Reown AppKit hooks
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetworkCore();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");

  const handleCreateCampaign = async (formData: any) => {
    try {
      if (!isConnected || !address || !walletProvider || !chainId) {
        addToast(
          "warning",
          "Wallet Connection Required",
          "Please connect your wallet first to create a campaign."
        );
        return;
      }

      // Check if contract is available
      try {
        const contract = await getContract(
          false,
          walletProvider,
          Number(chainId)
        );
        await contract.numberOfCampaigns(); // Test call to verify contract exists
      } catch (error) {
        console.error("Contract not available:", error);
        addToast(
          "error",
          "Smart Contract Not Found",
          "Please deploy the contract first or update the CONTRACT_ADDRESS in the code."
        );
        return;
      }

      addToast(
        "info",
        "Creating Campaign",
        "Transaction submitted! Please wait for confirmation..."
      );

      // Get contract with signer for transaction
      const contract = await getContract(
        true,
        walletProvider,
        Number(chainId),
        address
      );

      // Convert target amount to Wei
      const targetInWei = parseEthToWei(formData.target);

      // Convert deadline to Unix timestamp
      const deadlineTimestamp = Math.floor(
        new Date(formData.deadline).getTime() / 1000
      );

      // Create campaign transaction
      const tx = await contract.createCampaign(
        address, // Pass the user's address as owner
        formData.title,
        formData.description,
        targetInWei,
        deadlineTimestamp
      );

      console.log("Transaction sent:", tx.hash);
      addToast(
        "info",
        "Transaction Submitted",
        <div>
          <p>
            Transaction submitted!{" "}
            {createEtherscanLink(tx.hash, Number(chainId))}
          </p>
        </div>
      );

      // Wait for transaction confirmation
      await tx.wait();

      console.log("Campaign created successfully!");
      addToast(
        "success",
        "Campaign Created!",
        "Your campaign has been successfully created and is now live."
      );

      // Optionally redirect or refresh
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error creating campaign:", error);
      addToast(
        "error",
        "Campaign Creation Failed",
        "There was an error creating your campaign. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-4 px-6 md:px-12">
      <div
        className="relative bg-cover bg-center bg-no-repeat rounded-3xl p-4 md:p-6 min-h-[calc(100vh-4rem)]"
        style={{
          backgroundImage: "url(/bg_2.jpeg)",
        }}
      >
        {/* Enhanced gradient overlay for better blending */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50 rounded-3xl" />

        {/* Content container */}
        <div className="relative flex items-center justify-center min-h-full">
          <div className="w-full max-w-lg">
            {/* Form container with glassmorphism */}
            <div className="backdrop-blur-md bg-white/95 border border-white/30 rounded-2xl p-4 shadow-xl">
              <CampaignForm onSubmit={handleCreateCampaign} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnedContent({
  setActiveTab,
  addToast,
}: {
  setActiveTab: (tab: string) => void;
  addToast: (
    type: ToastType,
    title: string,
    message: string | React.ReactNode
  ) => void;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  // Use Reown AppKit hooks
  const { address: userAddress, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetworkCore();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");

  useEffect(() => {
    const fetchOwnedCampaigns = async () => {
      if (!userAddress || !isConnected || !walletProvider || !chainId) return;

      setLoading(true);
      try {
        const contract = await getContract(
          false,
          walletProvider,
          Number(chainId)
        );

        // First check if the contract is deployed by calling a simple function
        try {
          const numberOfCampaigns = await contract.numberOfCampaigns();
          console.log("Number of campaigns:", numberOfCampaigns.toString());

          if (numberOfCampaigns.eq(0)) {
            // No campaigns exist yet
            setCampaigns([]);
            return;
          }
        } catch (error) {
          console.error("Contract not found or not deployed:", error);
          console.log("Using mock data for development...");

          // Use mock data for development when contract is not available
          const mockCampaigns: Campaign[] = [
            {
              id: 0,
              owner: userAddress,
              title: "My Demo Campaign",
              description: "This is a demo campaign for testing purposes",
              target: "5.0",
              deadline: Math.floor(new Date("2025-12-31").getTime() / 1000),
              amountCollected: "2.3",
              donators: [],
              donations: [],
            },
          ];

          setCampaigns(mockCampaigns);
          return;
        }

        const allCampaignsRaw = await contract.getCampaigns();

        // Transform contract data and filter for owned campaigns
        const allCampaigns: Campaign[] = allCampaignsRaw.map(
          (campaign: any, index: number) => ({
            id: index,
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: formatEthFromWei(campaign.target),
            deadline: campaign.deadline.toNumber(),
            amountCollected: formatEthFromWei(campaign.amountCollected),
            donators: campaign.donators,
            donations: campaign.donations.map((donation: any) =>
              formatEthFromWei(donation)
            ),
          })
        );

        // Filter campaigns owned by current user
        const ownedCampaigns = allCampaigns.filter(
          (campaign) =>
            campaign.owner.toLowerCase() === userAddress.toLowerCase()
        );

        setCampaigns(ownedCampaigns);
      } catch (error) {
        console.error("Error fetching owned campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnedCampaigns();
  }, [userAddress, isConnected, walletProvider, chainId]);

  const formatEth = (value: string): string => {
    return `${parseFloat(value).toFixed(2)} ETH`;
  };

  const formatDeadline = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  const calculateProgress = (collected: string, target: string): number => {
    return Math.min((parseFloat(collected) / parseFloat(target)) * 100, 100);
  };

  if (!userAddress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Campaigns</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600">
            Connect your wallet to view campaigns you've created
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Campaigns</h1>

      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Campaigns Yet
          </h3>
          <p className="text-gray-600 mb-4">
            You haven't created any campaigns yet. Start your first fundraising
            campaign!
          </p>
          <Button
            onClick={() => setActiveTab("create")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {campaign.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {campaign.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User className="h-4 w-4 mr-1" />
                  {ellipsifyAddress(campaign.owner)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Target className="h-4 w-4" />
                      Target
                    </span>
                    <span className="font-medium">
                      {formatEth(campaign.target)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Coins className="h-4 w-4" />
                      Raised
                    </span>
                    <span className="font-medium">
                      {formatEth(campaign.amountCollected)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Clock className="h-4 w-4" />
                      Deadline
                    </span>
                    <span className="font-medium">
                      {formatDeadline(campaign.deadline)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">
                        {calculateProgress(
                          campaign.amountCollected,
                          campaign.target
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${calculateProgress(
                            campaign.amountCollected,
                            campaign.target
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExploreContent({
  addToast,
}: {
  addToast: (
    type: ToastType,
    title: string,
    message: string | React.ReactNode
  ) => void;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationModal, setDonationModal] = useState<{
    isOpen: boolean;
    campaignId: number;
    campaignTitle: string;
  }>({
    isOpen: false,
    campaignId: -1,
    campaignTitle: "",
  });

  // Use Reown AppKit hooks
  const { chainId } = useAppKitNetworkCore();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");

  useEffect(() => {
    const fetchAllCampaigns = async () => {
      setLoading(true);
      try {
        const contract = await getContract(
          false,
          walletProvider,
          chainId ? Number(chainId) : undefined
        );

        // First check if the contract is deployed by calling a simple function
        try {
          const numberOfCampaigns = await contract.numberOfCampaigns();
          console.log("Number of campaigns:", numberOfCampaigns.toString());

          if (numberOfCampaigns.eq(0)) {
            // No campaigns exist yet
            setCampaigns([]);
            return;
          }
        } catch (error) {
          console.error("Contract not found or not deployed:", error);
          console.log("Using mock data for development...");

          // Use mock data for development when contract is not available
          const mockCampaigns: Campaign[] = [
            {
              id: 0,
              owner: "0x1234567890123456789012345678901234567890",
              title: "Save the Ocean",
              description:
                "Help us clean up ocean plastic waste and protect marine life for future generations",
              target: "5.0",
              deadline: Math.floor(new Date("2025-12-31").getTime() / 1000),
              amountCollected: "2.3",
              donators: [],
              donations: [],
            },
            {
              id: 1,
              owner: "0xabcdef1234567890123456789012345678901234",
              title: "Education for All",
              description:
                "Building schools in rural areas to provide quality education to underprivileged children",
              target: "10.0",
              deadline: Math.floor(new Date("2025-11-30").getTime() / 1000),
              amountCollected: "7.8",
              donators: [],
              donations: [],
            },
            {
              id: 2,
              owner: "0x9876543210987654321098765432109876543210",
              title: "Clean Water Initiative",
              description:
                "Providing clean drinking water to remote villages through innovative filtration systems",
              target: "8.5",
              deadline: Math.floor(new Date("2025-10-15").getTime() / 1000),
              amountCollected: "3.2",
              donators: [],
              donations: [],
            },
          ];

          setCampaigns(mockCampaigns);
          return;
        }

        const allCampaignsRaw = await contract.getCampaigns();

        // Transform contract data to Campaign interface
        const allCampaigns: Campaign[] = allCampaignsRaw.map(
          (campaign: any, index: number) => ({
            id: index,
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: formatEthFromWei(campaign.target),
            deadline: campaign.deadline.toNumber(),
            amountCollected: formatEthFromWei(campaign.amountCollected),
            donators: campaign.donators,
            donations: campaign.donations.map((donation: any) =>
              formatEthFromWei(donation)
            ),
          })
        );

        setCampaigns(allCampaigns);
      } catch (error) {
        console.error("Error fetching all campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCampaigns();
  }, [walletProvider, chainId]);

  const handleDonate = async (donationAmount: string) => {
    try {
      if (!walletProvider || !chainId) {
        addToast(
          "warning",
          "Wallet Connection Required",
          "Please connect your wallet first to make a donation."
        );
        return;
      }

      // Check if contract is available
      try {
        const contract = await getContract(
          false,
          walletProvider,
          Number(chainId)
        );
        const numberOfCampaigns = await contract.numberOfCampaigns();

        if (numberOfCampaigns.eq(0)) {
          addToast(
            "warning",
            "No Campaigns Available",
            "No campaigns are available in the smart contract."
          );
          return;
        }
      } catch (error) {
        console.error("Contract not available:", error);
        addToast(
          "error",
          "Smart Contract Not Found",
          "This appears to be demo data. Please deploy the contract to enable real donations."
        );
        return;
      }

      addToast(
        "info",
        "Processing Donation",
        "Transaction submitted! Please wait for confirmation..."
      );

      // Get user address for the signer using ethers v5
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Get contract with signer for transaction
      const contract = await getContract(
        true,
        walletProvider,
        Number(chainId),
        address
      );

      // Convert ETH to Wei using ethers v5
      const donationInWei = ethers.utils.parseEther(donationAmount);

      // Send donation transaction
      const tx = await contract.donateToCampaign(donationModal.campaignId, {
        value: donationInWei,
      });

      console.log("Transaction sent:", tx.hash);
      addToast(
        "info",
        "Transaction Submitted",
        <div>
          <p>
            Transaction submitted!{" "}
            {createEtherscanLink(tx.hash, Number(chainId))}
          </p>
        </div>
      );

      // Wait for transaction confirmation
      await tx.wait();

      console.log("Donation successful!");
      addToast(
        "success",
        "Donation Successful!",
        `Thank you for donating ${donationAmount} ETH to this campaign!`
      );

      // Refresh campaigns to show updated amounts
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error donating to campaign:", error);
      addToast(
        "error",
        "Donation Failed",
        "There was an error processing your donation. Please try again."
      );
    }
  };

  const openDonationModal = (campaignId: number, campaignTitle: string) => {
    setDonationModal({
      isOpen: true,
      campaignId,
      campaignTitle,
    });
  };

  const closeDonationModal = () => {
    setDonationModal({
      isOpen: false,
      campaignId: -1,
      campaignTitle: "",
    });
  };

  const formatEth = (value: string): string => {
    return `${parseFloat(value).toFixed(2)} ETH`;
  };

  const formatDeadline = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Ended";
    if (diffDays === 0) return "Ends today";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  const calculateProgress = (collected: string, target: string): number => {
    return Math.min((parseFloat(collected) / parseFloat(target)) * 100, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Campaigns</h1>
        <p className="text-gray-600">
          Discover and support amazing causes from our community
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse"
            >
              <div className="h-32 bg-gray-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {campaign.title}
                  </h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                    {formatDeadline(campaign.deadline)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {campaign.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <User className="h-4 w-4" />
                      Owner
                    </span>
                    <span className="font-mono text-xs">
                      {ellipsifyAddress(campaign.owner)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Coins className="h-4 w-4" />
                      Raised
                    </span>
                    <span className="font-medium">
                      {formatEth(campaign.amountCollected)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Target className="h-4 w-4" />
                      Goal
                    </span>
                    <span className="font-medium">
                      {formatEth(campaign.target)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">
                        {calculateProgress(
                          campaign.amountCollected,
                          campaign.target
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${calculateProgress(
                            campaign.amountCollected,
                            campaign.target
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t">
                <Button
                  onClick={() => openDonationModal(campaign.id, campaign.title)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  Donate Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && campaigns.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Campaigns Found
          </h3>
          <p className="text-gray-600">
            No campaigns are currently available. Check back later!
          </p>
        </div>
      )}

      <DonationModal
        isOpen={donationModal.isOpen}
        onClose={closeDonationModal}
        onDonate={handleDonate}
        campaignTitle={donationModal.campaignTitle}
      />
    </div>
  );
}

export default function Navbar() {
  const [activeTab, setActiveTab] = useState("create");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Reown AppKit hooks
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetworkCore();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");

  // Toast management functions
  const addToast = (
    type: ToastType,
    title: string,
    message: string | React.ReactNode
  ) => {
    const id = Date.now();
    const newToast: Toast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return <CreateContent addToast={addToast} />;
      case "owned":
        return <OwnedContent setActiveTab={setActiveTab} addToast={addToast} />;
      case "explore":
        return <ExploreContent addToast={addToast} />;
      default:
        return <CreateContent addToast={addToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-[100] w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex h-20 items-center justify-between px-8 md:px-12 py-4">
          {/* Main Navigation - Left Side */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <Button
              variant="ghost"
              size="default"
              onClick={() => setActiveTab("create")}
              className={`hover:bg-gray-100 hover:text-black px-6 py-3 ${
                activeTab === "create" ? "bg-gray-100 text-black" : ""
              }`}
            >
              Create
            </Button>
            <Button
              variant="ghost"
              size="default"
              onClick={() => setActiveTab("owned")}
              className={`hover:bg-gray-100 hover:text-black px-6 py-3 ${
                activeTab === "owned" ? "bg-gray-100 text-black" : ""
              }`}
            >
              Owned
            </Button>
            <Button
              variant="ghost"
              size="default"
              onClick={() => setActiveTab("explore")}
              className={`hover:bg-gray-100 hover:text-black px-6 py-3 ${
                activeTab === "explore" ? "bg-gray-100 text-black" : ""
              }`}
            >
              Explore
            </Button>
          </div>

          {/* Connect Button - Right Side */}
          <appkit-button />
        </div>
      </nav>

      {/* Content Area */}
      <main>{renderContent()}</main>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
