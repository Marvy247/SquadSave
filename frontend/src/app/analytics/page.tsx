'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressChart from '@/components/ProgressChart';
import { StreakBadge } from '@/components/AchievementBadge';
import Loading from '@/components/Loading';
import { useWallet } from '@/lib/wallet-context';
import { ethers } from 'ethers';

// Mock data for demonstration - in production this would come from the CSV export or on-chain data
const mockAnalyticsData = {
  totalUsers: 1250,
  totalMissions: 89,
  totalValueLocked: 45678.90,
  activeMissions: 23,
  completedMissions: 66,
  averageStreak: 12.5,
  topStreaks: [
    { user: '0x1234...5678', streak: 45 },
    { user: '0x9876...4321', streak: 38 },
    { user: '0xabcd...ef12', streak: 32 }
  ],
  missionCompletionRate: 74.2,
  dailyActiveUsers: [120, 135, 142, 158, 167, 145, 133],
  tvlGrowth: [12000, 15000, 18000, 22000, 28000, 35000, 45678]
};

interface AnalyticsData {
  totalUsers: number;
  totalMissions: number;
  totalValueLocked: number;
  activeMissions: number;
  completedMissions: number;
  averageStreak: number;
  topStreaks: Array<{ user: string; streak: number }>;
  missionCompletionRate: number;
  dailyActiveUsers: number[];
  tvlGrowth: number[];
}

export default function AnalyticsPage() {
  const { account } = useWallet();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setLoading(true);
      // In production, this would fetch from your analytics API or CSV data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockAnalyticsData);
      setLoading(false);
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Unable to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time insights into Social Savings Missions performance
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalValueLocked.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeMissions}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.totalMissions} total missions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.missionCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.completedMissions} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Active Users</CardTitle>
            <CardDescription>User engagement over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart
              data={analyticsData.dailyActiveUsers}
              labels={analyticsData.dailyActiveUsers.map((_, index) => `Day ${index + 1}`)}
              title="Daily Active Users"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TVL Growth</CardTitle>
            <CardDescription>Total Value Locked growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressChart
              data={analyticsData.tvlGrowth}
              labels={analyticsData.tvlGrowth.map((_, index) => `Week ${index + 1}`)}
              title="TVL Growth"
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Streaks</CardTitle>
            <CardDescription>Users with the longest saving streaks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topStreaks.map((streak, index) => (
                <div key={streak.user} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{streak.user}</p>
                      <p className="text-sm text-muted-foreground">{streak.streak} day streak</p>
                    </div>
                  </div>
                  <StreakBadge days={streak.streak} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mission Statistics</CardTitle>
            <CardDescription>Breakdown of mission performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Streak Length</span>
                <span className="font-medium">{analyticsData.averageStreak} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Missions Created</span>
                <span className="font-medium">{analyticsData.totalMissions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Missions</span>
                <span className="font-medium">{analyticsData.activeMissions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed Missions</span>
                <span className="font-medium">{analyticsData.completedMissions}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>Export analytics data for further analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={() => {
                // In production, this would trigger the CSV export
                alert('CSV export functionality would be implemented here');
              }}
            >
              Export to CSV
            </button>
            <button
              className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
              onClick={() => {
                // In production, this would trigger Dune upload
                alert('Dune upload functionality would be implemented here');
              }}
            >
              Upload to Dune
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            CSV files are generated from on-chain events and can be uploaded to Dune Analytics for advanced querying and visualization.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
