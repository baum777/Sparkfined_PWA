import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWalletStore } from '@/store/walletStore';
import { getHoldings, HoldingDTO } from '@/api/wallet';
import { RefreshCw, Wallet, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export const HoldingsCard = () => {
  const activeWallets = useWalletStore((state) => state.wallets.filter(w => w.isActive));
  const hasConnectedWallet = activeWallets.length > 0;
  
  const [holdings, setHoldings] = useState<HoldingDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasConnectedWallet) {
      setHoldings([]);
      return;
    }

    const fetchHoldings = async () => {
      setLoading(true);
      setError(null);
      try {
        const primaryWallet = activeWallets[0]?.address;
        const data = await getHoldings(primaryWallet);
        setHoldings(data);
      } catch (err) {
        setError('Failed to load holdings');
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, [hasConnectedWallet, activeWallets]);

  const handleRowClick = (symbol: string) => {
    // Navigate to watchlist detail or fallback to watchlist page
    // Using query param for now as a safe linking strategy if detail route isn't confirmed
    navigate(`/watchlist?symbol=${symbol}`);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatCrypto = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(val);
  };

  // Not Connected State
  if (!hasConnectedWallet) {
    return (
      <div className="sf-card p-6 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[320px]">
        <div className="p-3 bg-surface-raised rounded-full text-text-secondary">
          <Wallet size={32} />
        </div>
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-1">No Wallet Connected</h3>
          <p className="text-sm text-text-secondary max-w-[240px]">
            Connect a Solana wallet to track your holdings and performance.
          </p>
        </div>
        <Link 
          to="/settings" 
          className="sf-btn sf-btn-primary"
        >
          Connect Wallet
        </Link>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="sf-card p-6 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[320px]">
        <div className="p-3 bg-danger/10 text-danger rounded-full">
          <AlertCircle size={32} />
        </div>
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-1">Unable to Load Holdings</h3>
          <p className="text-sm text-text-secondary">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="sf-btn sf-btn-secondary"
        >
          Retry
        </button>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="sf-card p-6 h-full min-h-[320px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-32 bg-surface-raised animate-pulse rounded" />
          <div className="h-8 w-8 bg-surface-raised animate-pulse rounded-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-surface-raised animate-pulse rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-surface-raised animate-pulse rounded" />
                  <div className="h-3 w-10 bg-surface-raised animate-pulse rounded" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-20 bg-surface-raised animate-pulse rounded" />
                <div className="h-3 w-12 bg-surface-raised animate-pulse rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (holdings.length === 0) {
    return (
      <div className="sf-card p-6 flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[320px]">
        <div className="p-3 bg-surface-raised rounded-full text-text-secondary">
          <Wallet size={32} />
        </div>
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-1">Wallet Empty</h3>
          <p className="text-sm text-text-secondary">
            No holdings found in the connected wallet.
          </p>
        </div>
      </div>
    );
  }

  // Render List
  return (
    <div className="sf-card p-6 h-full min-h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-text-primary">Holdings</h3>
        <button 
          onClick={() => {/* Refresh logic */}}
          className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-raised"
          aria-label="Refresh holdings"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      <div className="overflow-x-auto -mx-6 px-6 pb-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-text-tertiary border-b border-border-1">
              <th className="pb-2 font-medium pl-2">Asset</th>
              <th className="pb-2 font-medium text-right">Balance</th>
              <th className="pb-2 font-medium text-right">Value</th>
              <th className="pb-2 font-medium text-right pr-2">24h</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {holdings.map((holding) => {
              const isPositive = (holding.changePct24h || 0) >= 0;
              const isNeutral = holding.changePct24h === 0;
              
              return (
                <tr 
                  key={holding.symbol}
                  onClick={() => handleRowClick(holding.symbol)}
                  className="group cursor-pointer hover:bg-surface-raised/50 transition-colors border-b border-border-1 last:border-0"
                >
                  <td className="py-3 pl-2">
                    <div className="flex items-center space-x-3">
                      {/* Icon placeholder if no image */}
                      <div className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center text-xs font-bold text-text-secondary">
                        {holding.symbol[0]}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{holding.symbol}</div>
                        <div className="text-xs text-text-secondary">{holding.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right text-text-secondary font-mono">
                    {formatCrypto(holding.amount)}
                  </td>
                  <td className="py-3 text-right text-text-primary font-medium font-mono">
                    {formatCurrency(holding.valueUsd)}
                  </td>
                  <td className="py-3 text-right pr-2 font-mono">
                    <div className={`flex items-center justify-end space-x-1 ${
                      isNeutral ? 'text-text-secondary' : isPositive ? 'text-success' : 'text-danger'
                    }`}>
                      {holding.changePct24h !== undefined && (
                         <>
                           {!isNeutral && (isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
                           <span>{Math.abs(holding.changePct24h).toFixed(2)}%</span>
                         </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
