
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // In a real environment, we would log this to a service.
      // In Studio, we surface it for the agentive loop.
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: `Firestore operation '${error.context.operation}' was denied at: ${error.context.path}. Check your security rules.`,
      });
      
      // Throwing it so it hits the global error boundary in dev mode
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
