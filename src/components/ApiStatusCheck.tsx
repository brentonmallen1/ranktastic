
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Check, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/db/config';

const ApiStatusCheck = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Checking API connection...');
  
  const checkApiStatus = async () => {
    setStatus('loading');
    setMessage('Checking API connection...');
    
    try {
      const healthEndpoint = `${API_BASE_URL}/health`;
      console.log(`Testing API connection at: ${healthEndpoint}`);
      
      const response = await fetch(healthEndpoint);
      console.log(`API health response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries([...response.headers.entries()]));
      
      // Check content-type and body
      const contentType = response.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      
      const text = await response.text();
      console.log(`Response body: ${text}`);
      
      // Check if it's HTML (error case)
      if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
        throw new Error('Received HTML instead of JSON - API proxy misconfiguration');
      }
      
      // Try to parse as JSON if possible
      try {
        const data = JSON.parse(text);
        setStatus('success');
        setMessage(`API connected successfully! Response: ${JSON.stringify(data)}`);
      } catch (e) {
        // Non-JSON response
        setStatus('error');
        setMessage(`API returned non-JSON response: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('API check error:', error);
      setStatus('error');
      setMessage(`API connection failed: ${error.message}`);
    }
  };
  
  useEffect(() => {
    checkApiStatus();
  }, []);
  
  return (
    <div className="space-y-4 max-w-lg mx-auto my-4 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold">API Connection Status</h2>
      
      <Alert variant={status === 'success' ? "default" : "destructive"}>
        {status === 'success' ? (
          <Check className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>
          {status === 'loading' ? 'Checking API...' : 
           status === 'success' ? 'API Connected' : 'API Connection Error'}
        </AlertTitle>
        <AlertDescription>
          {message}
        </AlertDescription>
      </Alert>
      
      <Button onClick={checkApiStatus}>
        Recheck API Connection
      </Button>
      
      <div className="text-xs text-muted-foreground">
        <p>API URL: {API_BASE_URL}</p>
        <p>This tool helps diagnose API connection issues.</p>
      </div>
    </div>
  );
};

export default ApiStatusCheck;
