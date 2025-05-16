import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { SidebarProvider } from './context/SidebarContext'
import { I18nProvider } from './context/I18nContext'
import { ErrorBoundary } from './components/ui/error-boundary'
import { Toaster } from './components/ui/toaster'
import * as Tooltip from '@radix-ui/react-tooltip'
import './index.css'

// Configure query client with better error handling and caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
})

// Performance monitoring
const reportWebVitals = (metric: any) => {
  // In production, send to analytics service
  if (process.env.NODE_ENV === 'production') {
    console.log(metric);
    // Example: Send to analytics
    // navigator.sendBeacon('/analytics', JSON.stringify(metric));
  }
};

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // In production, send to error reporting service
});

// React error handler
const onError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('React error boundary caught an error:', error, errorInfo);
  // In production, send to error reporting service
};

// Root component with all providers
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary onError={onError}>
      <I18nProvider>
        <Tooltip.Provider delayDuration={300}>
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <SidebarProvider>
                  <App />
                  <Toaster />
                </SidebarProvider>
              </AuthProvider>
            </QueryClientProvider>
          </BrowserRouter>
        </Tooltip.Provider>
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// For future web vitals implementation:
// import { ReportHandler } from 'web-vitals';
// import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
// 
// function sendToAnalytics({ name, delta, value, id }: Metric) {
//   // Example: Send to analytics
//   console.log({ name, delta, value, id });
// }
// 
// getCLS(sendToAnalytics);
// getFID(sendToAnalytics);
// getFCP(sendToAnalytics);
// getLCP(sendToAnalytics);
// getTTFB(sendToAnalytics);
