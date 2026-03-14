interface FullPageLoadingProps {
  message?: string;
}

export default function FullPageLoading({ message = "Loading..." }: FullPageLoadingProps) {
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        
        @keyframes slide {
          0% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
          100% { transform: translateY(0); }
        }
        
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 24px;
          min-height: 100vh;
          background: #000;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .loading-dots {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        
        .loading-dot {
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.22);
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        .loading-text {
          color: rgba(255, 255, 255, 0.22);
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -0.02em;
          animation: slide 2s ease-in-out infinite;
          font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
        <div className="loading-text">{message}</div>
      </div>
    </>
  );
}
