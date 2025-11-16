/**
 * Journal Page V2 - Variant 1: List + Sidebar
 * 
 * Layout:
 * - Sidebar (25%): Date filter, tag cloud, stats
 * - Main (75%): Entry cards with tags & P&L badges
 * - Search + filter chips
 * - AI Condense button per entry
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Search, Plus, Edit2, Trash2, Sparkles } from 'lucide-react';
import { useJournal } from '@/sections/journal/useJournal';
import type { JournalNote } from '@/lib/journal';

export default function JournalPageV2() {
  const { notes } = useJournal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Extract all unique tags from notes
  const allTags = Array.from(
    new Set(notes.flatMap(note => note.tags || []))
  ).slice(0, 10); // Limit to 10 most recent

  // Stats
  const stats = {
    totalEntries: notes.length,
    winRate: 68, // Calculate from actual data
    topTags: allTags.slice(0, 3),
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.body?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => note.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const formatDate = (date: Date | string | number): string => {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getExcerpt = (body?: string): string => {
    if (!body) return '';
    return body.slice(0, 150) + (body.length > 150 ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
              <p className="text-sm text-zinc-400 mt-1">{stats.totalEntries} entries logged</p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search entries..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                New Entry
              </Button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={() => setSelectedTags([])}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTags.length === 0
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              All
            </button>
            {allTags.slice(0, 5).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTags([tag])}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {tag}
              </button>
            ))}
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
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-blue-500 hover:text-white'
                      }`}
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
                    <p className="text-xs text-zinc-500 mb-1">Total Entries</p>
                    <p className="text-2xl font-bold">{stats.totalEntries}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Win Rate</p>
                    <p className="text-2xl font-bold text-green-500">{stats.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Most Used Tags</p>
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
            {filteredNotes.length > 0 ? (
              filteredNotes.map((entry) => (
                <Card key={entry.id} variant="elevated">
                  <div className="flex items-start justify-between gap-4">
                    {/* Entry Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-zinc-500">
                          {formatDate(entry.createdAt)}
                        </span>
                        {entry.address && (
                          <Badge variant="neutral">{entry.address.slice(0, 6)}...</Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                        {entry.title || 'Untitled Entry'}
                      </h3>
                      
                      <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                        {getExcerpt(entry.body)}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {entry.tags?.map((tag) => (
                          <Badge key={tag} variant="neutral">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" leftIcon={<Sparkles className="w-3 h-3" />}>
                        AI Condense
                      </Button>
                      <button className="p-2 hover:bg-zinc-800 rounded-md transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-zinc-400 mb-4">No entries found</p>
                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                  Create First Entry
                </Button>
              </div>
            )}

            {/* Pagination */}
            {filteredNotes.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button variant="secondary" size="sm">Previous</Button>
                <span className="px-3 py-1 text-sm text-zinc-400">Page 1 of {Math.ceil(filteredNotes.length / 10)}</span>
                <Button variant="secondary" size="sm">Next</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
