import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

// Mock Icons
const SearchIcon = () => <span>🔍</span>;
const EditIcon = () => <span>✏️</span>;
const DeleteIcon = () => <span>🗑️</span>;
const AIIcon = () => <span>🤖</span>;
const PlusIcon = () => <span>+</span>;

interface JournalEntry {
  id: string;
  date: Date;
  title: string;
  excerpt: string;
  tags: string[];
  token?: string;
  pnl?: number;
  entryType: 'trade' | 'reflection' | 'lesson';
}

const JournalPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Mock data
  const entries: JournalEntry[] = [
    {
      id: '1',
      date: new Date(Date.now() - 3600000),
      title: 'SOL trade - took profit early',
      excerpt: 'Exited at $152, should have waited for $155 resistance. Need to trust my analysis more...',
      tags: ['SOL', 'profit-taking', 'discipline'],
      token: 'SOL',
      pnl: 120.50,
      entryType: 'trade',
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000),
      title: 'FOMO trade on BONK',
      excerpt: 'Entered late after seeing Twitter hype. Down 5%. Classic FOMO mistake...',
      tags: ['BONK', 'FOMO', 'mistake'],
      token: 'BONK',
      pnl: -45.20,
      entryType: 'trade',
    },
    {
      id: '3',
      date: new Date(Date.now() - 172800000),
      title: 'Weekly reflection - patience is key',
      excerpt: 'This week reminded me that waiting for confirmation saves more money than chasing pumps...',
      tags: ['reflection', 'patience'],
      entryType: 'reflection',
    },
  ];

  const allTags = ['SOL', 'BONK', 'FOMO', 'discipline', 'patience', 'profit-taking', 'mistake'];
  const stats = {
    totalEntries: 47,
    winRate: 68,
    topTags: ['SOL', 'discipline', 'FOMO'],
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
              <p className="text-sm text-neutral-400 mt-1">{stats.totalEntries} entries logged</p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search entries..."
                leftIcon={<SearchIcon />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button variant="primary" leftIcon={<PlusIcon />}>
                New Entry
              </Button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
              All
            </button>
            <button className="px-3 py-1 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-sm rounded-full transition-colors">
              Wins
            </button>
            <button className="px-3 py-1 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-sm rounded-full transition-colors">
              Losses
            </button>
            <button className="px-3 py-1 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-sm rounded-full transition-colors">
              Tags
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters + Stats */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Date Range Filter */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="text-base">Date Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input type="date" label="From" />
                  <Input type="date" label="To" />
                </div>
              </CardContent>
            </Card>

            {/* Tag Cloud */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      className="px-2.5 py-1 bg-neutral-800 text-neutral-300 hover:bg-blue-500 hover:text-white text-xs rounded-md transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="text-base">Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Total Entries</p>
                    <p className="text-2xl font-bold">{stats.totalEntries}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Win Rate</p>
                    <p className="text-2xl font-bold text-green-500">{stats.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Most Used Tags</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {stats.topTags.map((tag) => (
                        <Badge key={tag} variant="neutral">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Entry List */}
          <div className="lg:col-span-3 space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} variant="elevated">
                <div className="flex items-start justify-between gap-4">
                  {/* Entry Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-neutral-500">
                        {formatDate(entry.date)}
                      </span>
                      {entry.token && (
                        <Badge variant="neutral">{entry.token}</Badge>
                      )}
                      {entry.pnl !== undefined && (
                        <Badge variant={entry.pnl > 0 ? 'success' : 'error'}>
                          {entry.pnl > 0 ? '+' : ''}${Math.abs(entry.pnl).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                      {entry.title}
                    </h3>
                    
                    <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
                      {entry.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="neutral">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<AIIcon />}>
                      AI Condense
                    </Button>
                    <button className="p-2 hover:bg-neutral-800 rounded-md transition-colors">
                      <EditIcon />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-md transition-colors">
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="secondary" size="sm">Previous</Button>
              <span className="px-3 py-1 text-sm text-neutral-400">Page 1 of 5</span>
              <Button variant="secondary" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JournalPage;
