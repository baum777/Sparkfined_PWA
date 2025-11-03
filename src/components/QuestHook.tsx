import React from 'react';

export default function QuestHook() {
  const handleClick = () => {
    window.location.href = '/landing.html';
  };

  return (
    <div className="quest-hook-container">
      <div className="quest-hook-glow"></div>
      <button className="quest-hook-btn" onClick={handleClick}>
        <div className="quest-hook-content">
          <span className="quest-hook-label">FIRST UPDATE LIVE</span>
          <span className="quest-hook-title">Join the Quest</span>
          <div className="quest-hook-status">
            <span className="status-lock">🔒 Token Lock Required</span>
            <span className="status-nft">🎖️ 127/333 NFTs</span>
          </div>
        </div>
        <div className="quest-hook-badge">EARLY</div>
      </button>
      
      <style>{`
        .quest-hook-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 9999;
        }

        .quest-hook-glow {
          position: absolute;
          inset: -4px;
          background: linear-gradient(45deg, #8B5CF6, #06B6D4, #10B981);
          border-radius: 12px;
          filter: blur(8px);
          opacity: 0.7;
          animation: quest-hook-pulse 2s infinite;
        }

        .quest-hook-btn {
          position: relative;
          background: #0A0E27;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: block;
        }

        .quest-hook-btn:hover {
          transform: translateY(-2px);
          border-color: rgba(6, 182, 212, 0.5);
        }

        .quest-hook-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .quest-hook-label {
          display: block;
          font-size: 0.625rem;
          color: #8B5CF6;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.1em;
          animation: quest-hook-blink 1.5s infinite;
        }

        .quest-hook-title {
          display: block;
          font-size: 1.125rem;
          font-weight: bold;
          color: #F3F4F6;
          margin: 0.25rem 0;
        }

        .quest-hook-status {
          display: flex;
          gap: 0.5rem;
          font-size: 0.625rem;
        }

        .status-lock { 
          color: #06B6D4; 
        }
        
        .status-nft { 
          color: #10B981; 
        }

        .quest-hook-badge {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          background: #10B981;
          color: #0A0E27;
          font-size: 0.625rem;
          font-weight: bold;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
        }

        @keyframes quest-hook-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @keyframes quest-hook-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .quest-hook-container {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
          }
          
          .quest-hook-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
