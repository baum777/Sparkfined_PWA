import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AlertTriangle } from "lucide-react";

interface WalletGuardProps {
  children: React.ReactNode;
}

export function WalletGuard({ children }: WalletGuardProps) {
  const { connected, publicKey } = useWallet();

  if (!connected || !publicKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] p-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-muted">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Wallet Connection Required</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            This feature requires an active wallet connection to verify ownership and interact with the blockchain.
          </p>
        </div>
        <div className="pt-2">
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

