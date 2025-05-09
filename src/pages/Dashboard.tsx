
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionCard } from '@/components/ui/subscription-card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard.</p>
      </div>

      <div className="grid gap-6">
        <SubscriptionCard />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>You have 12 patients this week.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span className="text-sm">John Doe</span>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Jane Smith</span>
                  <span className="text-xs text-muted-foreground">3 hours ago</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Alice Johnson</span>
                  <span className="text-xs text-muted-foreground">Yesterday</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">View All</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Consults</CardTitle>
              <CardDescription>You have 5 consultations this week.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span className="text-sm">General Checkup</span>
                  <span className="text-xs text-muted-foreground">Today</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Follow-up Visit</span>
                  <span className="text-xs text-muted-foreground">Tomorrow</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Prescription Review</span>
                  <span className="text-xs text-muted-foreground">Next Week</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">View All</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Vitals Summary</CardTitle>
              <CardDescription>Recent patient vital statistics.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Average Blood Pressure</span>
                  <span className="text-sm font-medium">120/80</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average Heart Rate</span>
                  <span className="text-sm font-medium">72 bpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average Temperature</span>
                  <span className="text-sm font-medium">98.6°F</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
