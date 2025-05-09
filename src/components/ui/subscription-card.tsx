
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SubscriptionCardProps {
  compact?: boolean;
}

export function SubscriptionCard({ compact = false }: SubscriptionCardProps) {
  return (
    <Card className={`w-full ${compact ? 'max-w-md' : 'max-w-2xl'}`}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Upgrade your subscription
        </CardTitle>
        <p className="text-gray-600 text-sm">
          You are currently on the free plan. Upgrade to the pro plan to get access to all features.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-4">
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="md:col-span-1">
              <Input placeholder="MM/YY" />
            </div>
            <div className="md:col-span-1">
              <Input placeholder="CVC" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan">Plan</Label>
          <p className="text-sm text-gray-500">Select the plan that best fits your needs.</p>
          <RadioGroup defaultValue="starter" className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center space-x-2 border rounded-md p-4">
              <RadioGroupItem value="starter" id="starter" />
              <div>
                <Label htmlFor="starter" className="font-medium">Starter Plan</Label>
                <p className="text-sm text-gray-500">Perfect for small businesses.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 border rounded-md p-4">
              <RadioGroupItem value="pro" id="pro" />
              <div>
                <Label htmlFor="pro" className="font-medium">Pro Plan</Label>
                <p className="text-sm text-gray-500">Advanced features with more storage.</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" placeholder="Enter notes" className="h-24" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label htmlFor="terms" className="text-sm">
              I agree to the terms and conditions
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="emails" defaultChecked />
            <label htmlFor="emails" className="text-sm">
              Allow us to send you emails
            </label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Upgrade Plan</Button>
      </CardFooter>
    </Card>
  );
}
