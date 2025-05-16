/**
 * Loading component for test-server-components route
 * Demonstrates Next.js 15's improved loading state handling
 */

export default function Loading() {
  return (
    <div className="server-component-loading-container">
      <div className="loading-spinner"></div>
      <p>Loading server component test...</p>
      <style jsx>{`
        .server-component-loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          text-align: center;
        }

        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
