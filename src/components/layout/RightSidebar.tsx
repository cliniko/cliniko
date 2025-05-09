
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionCard } from '@/components/ui/subscription-card';

const RightSidebar = () => {
  return (
    <div className="hidden lg:block w-80 h-screen border-l bg-white p-4 overflow-y-auto">
      <div className="space-y-6">
        <SubscriptionCard compact={true} />
      </div>
    </div>
  );
};

export default RightSidebar;
