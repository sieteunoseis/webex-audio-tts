import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Home } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();
  const handleGoHome = () => {
    navigate('/')
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-destructive/10">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We encountered an error while processing your request. 
            Please try again later.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button 
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go back home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorPage;