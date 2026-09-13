import React from 'react';
import { Card } from './Card';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-md"></div>
            </div>
            <div className="h-7 w-32 bg-slate-200 rounded"></div>
            <div className="h-3 w-28 bg-slate-200 rounded"></div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="h-4 w-40 bg-slate-200 rounded"></div>
              <div className="h-3 w-56 bg-slate-200 rounded"></div>
            </div>
            <div className="h-8 w-36 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="h-60 bg-slate-100 rounded-xl"></div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <div className="h-4 w-36 bg-slate-200 rounded"></div>
            <div className="h-3 w-44 bg-slate-200 rounded"></div>
          </div>
          <div className="h-60 bg-slate-100 rounded-xl flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-8 border-slate-200"></div>
          </div>
        </Card>
      </div>

      {/* Tables Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-44 bg-slate-200 rounded"></div>
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="h-10 bg-slate-100 rounded flex items-center justify-between px-4">
                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                <div className="h-3 w-28 bg-slate-200 rounded"></div>
                <div className="h-3 w-16 bg-slate-200 rounded"></div>
                <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="h-4 w-36 bg-slate-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-12 bg-slate-100 rounded-lg p-2.5 flex justify-between items-center">
                <div className="space-y-1.5">
                  <div className="h-3 w-28 bg-slate-200 rounded"></div>
                  <div className="h-2 w-16 bg-slate-200 rounded"></div>
                </div>
                <div className="h-5 w-14 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
