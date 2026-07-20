'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Eye, Plus, RefreshCw,
  TrendingUp, Filter, ChevronDown, Shield, X, Send,
} from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/types/index';
import { apiPost } from '@/lib/api-client';
import SafeHereModal from './SafeHereModal';
import StartDiscussionModal from './StartDiscussionModal';
import PostAnonModal from './PostAnonModal';

// ── types ──────────────────────────────────────────────────────────────────────

interface CommunityPost {
  id: string;
  company_id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_anonymous: boolean;
  likes: number;
  replies: number;
  views: number;
  is_pinned: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface CommunityReply {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
}

interface NewPostData {
  title: string;
  content: string;
  category: string;
}

// ── helpers ────────────────────────────────────────────────────────────────────

const categoryLabel: Record<string, string> = {
  general:           'General',
  stress_relief:     'Stress Relief',
  work_life_balance: 'Work-Life Balance',
  mental_health:     'Mental Health',
  success_stories:   'Success Stories',
  seeking_support:   'Seeking Support',
};

// Outlined pill style matching the design
const categoryBorder: Record<string, string> = {
  general:           'border-emerald-400 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400',
  stress_relief:     'border-blue-400 text-blue-600 dark:border-blue-500 dark:text-blue-400',
  work_life_balance: 'border-purple-400 text-purple-600 dark:border-purple-500 dark:text-purple-400',
  mental_health:     'border-pink-400 text-pink-600 dark:border-pink-500 dark:text-pink-400',
  success_stories:   'border-yellow-400 text-yellow-600 dark:border-yellow-500 dark:text-yellow-400',
  seeking_support:   'border-red-400 text-red-600 dark:border-red-500 dark:text-red-400',
};

const avatarColors = ['#f87171','#fb923c','#facc15','#4ade80','#60a5fa','#a78bfa','#f472b6'];

function AvatarIcon({ seed, size = 8 }: { seed: string; size?: number }) {
  const color = avatarColors[seed.charCodeAt(0) % avatarColors.length];
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size * 4, height: size * 4, background: color }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 1.5 }}>?</span>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}  ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day ago`;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

// ── Category pill ──────────────────────────────────────────────────────────────

function CategoryPill({ cat }: { cat: string }) {
  const cls = categoryBorder[cat] ?? categoryBorder.general;
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md border bg-transparent ${cls}`}>
      {categoryLabel[cat] ?? cat}
    </span>
  );
}

// ── Post Card ──────────────────────────────────────────────────────────────────

function PostCard({
  post, selected, onSelect, onLike,
}: {
  post: CommunityPost;
  selected: boolean;
  onSelect: () => void;
  onLike: (id: string) => void;
}) {
  const cat = post.category || 'general';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className={`bg-white dark:bg-gray-900 rounded-xl border cursor-pointer transition-all duration-150 ${
        selected
          ? 'border-emerald-300 dark:border-emerald-700 shadow-md'
          : 'border-gray-200 dark:border-gray-800 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      {/* Card body */}
      <div className="px-6 pt-5 pb-4">
        {/* Category + date */}
        <div className="flex items-center gap-3 mb-3">
          <CategoryPill cat={cat} />
          <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">{post.title}</h3>

        {/* Author */}
        <div className="flex items-center gap-2 mb-4">
          <AvatarIcon seed={post.id} size={8} />
          <span className="text-sm text-gray-500 dark:text-gray-400">Anonymous User</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800 mb-4" />

        {/* Content */}
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">{post.content}</p>
      </div>

      {/* Actions row — right-aligned, separated by top border */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-end gap-5">
        <button
          onClick={e => { e.stopPropagation(); onLike(post.id); }}
          className="flex items-center gap-1.5 text-gray-400 hover:text-emerald-500 transition-colors"
        >
          <Heart className="h-5 w-5" />
          <span className="text-xs font-medium">{pad(post.likes)}</span>
        </button>
        <button
          onClick={e => { e.stopPropagation(); onSelect(); }}
          className="flex items-center gap-1.5 text-gray-400 hover:text-orange-400 transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-xs font-medium">{pad(post.replies)}</span>
        </button>
        <span className="flex items-center gap-1.5 text-gray-400">
          <Eye className="h-5 w-5" />
          <span className="text-xs font-medium">{pad(post.views)}</span>
        </span>
      </div>
    </motion.div>
  );
}

// ── Detail Panel ───────────────────────────────────────────────────────────────

function DetailPanel({
  post, replies, replyText, onReplyChange, onReplySubmit, onLike, onClose,
}: {
  post: CommunityPost;
  replies: CommunityReply[];
  replyText: string;
  onReplyChange: (v: string) => void;
  onReplySubmit: () => void;
  onLike: (id: string) => void;
  onClose: () => void;
}) {
  const cat = post.category || 'general';

  return (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.18 }}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
    >
      {/* Post */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <CategoryPill cat={cat} />
          <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">{post.title}</h3>
        <div className="flex items-center gap-2 mb-4">
          <AvatarIcon seed={post.id} size={8} />
          <span className="text-sm text-gray-500 dark:text-gray-400">Anonymous User</span>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{post.content}</p>
        <div className="flex items-center justify-end gap-5 mt-4">
          <button onClick={() => onLike(post.id)} className="flex items-center gap-1.5 text-gray-400 hover:text-emerald-500 transition-colors">
            <Heart className="h-5 w-5" /><span className="text-xs font-medium">{pad(post.likes)}</span>
          </button>
          <span className="flex items-center gap-1.5 text-gray-400">
            <MessageCircle className="h-5 w-5" /><span className="text-xs font-medium">{pad(post.replies)}</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <Eye className="h-5 w-5" /><span className="text-xs font-medium">{pad(post.views)}</span>
          </span>
        </div>
      </div>

      {/* Comments header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">All Comments</span>
          <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">{pad(replies.length)}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Comments */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
        {replies.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">No comments yet. Be the first!</div>
        ) : (
          replies.map(r => (
            <div key={r.id} className="flex items-start gap-3 px-6 py-3">
              <AvatarIcon seed={r.id} size={7} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Anonymous User</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(r.created_at)}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{r.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply input */}
      <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
          <input
            value={replyText}
            onChange={e => onReplyChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && replyText.trim()) { e.preventDefault(); onReplySubmit(); } }}
            placeholder="Write a comment…"
            className="flex-1 bg-transparent text-xs text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none"
          />
          <button onClick={onReplySubmit} disabled={!replyText.trim()} className="p-1 rounded-lg text-emerald-500 hover:text-emerald-600 disabled:opacity-30 transition-colors">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function CommunityFeed({ user }: { user: User }) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [repliesMap, setRepliesMap] = useState<Record<string, CommunityReply[]>>({});
  const [replyText, setReplyText] = useState('');

  const [showSafeHere, setShowSafeHere] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [pendingPost, setPendingPost] = useState<NewPostData | null>(null);
  const [showPostAnon, setShowPostAnon] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiPost<{ success: boolean; posts?: CommunityPost[] }>(
        '/community',
        { action: 'get_posts', company_id: user.company_id, data: { category, limit_count: 20 } },
      );
      if (data.success) setPosts(data.posts ?? []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [user, category]);

  const fetchReplies = useCallback(async (postId: string) => {
    try {
      const data = await apiPost<{ success: boolean; replies?: CommunityReply[] }>(
        '/community',
        { action: 'get_replies', data: { post_id: postId } },
      );
      if (data.success) setRepliesMap(prev => ({ ...prev, [postId]: data.replies ?? [] }));
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const seen = sessionStorage.getItem('community_safe_seen');
    if (!seen) setShowSafeHere(true);
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    try {
      await apiPost('/community', { action: 'like_post', data: { post_id: postId } });
    } catch { /* optimistic */ }
  };

  const handleSelectPost = (postId: string) => {
    if (selectedId === postId) { setSelectedId(null); return; }
    setSelectedId(postId);
    if (!repliesMap[postId]) fetchReplies(postId);
  };

  const handleReplySubmit = async () => {
    if (!selectedId || !replyText.trim() || !user) return;
    const text = replyText.trim();
    setReplyText('');
    try {
      const data = await apiPost<{ success: boolean }>(
        '/community',
        { action: 'create_reply', employee_id: user.id, company_id: user.company_id, data: { post_id: selectedId, content: text } },
      );
      if (data.success) {
        fetchReplies(selectedId);
        setPosts(prev => prev.map(p => p.id === selectedId ? { ...p, replies: p.replies + 1 } : p));
      }
    } catch { toast.error('Failed to post comment'); }
  };

  const handleAddPost = () => {
    if (!sessionStorage.getItem('community_safe_seen')) setShowSafeHere(true);
    else setShowDiscussion(true);
  };

  const handleSafeShare = () => { sessionStorage.setItem('community_safe_seen', '1'); setShowSafeHere(false); setShowDiscussion(true); };
  const handleSafeRead  = () => { sessionStorage.setItem('community_safe_seen', '1'); setShowSafeHere(false); };
  const handleDiscussionSubmit = (data: NewPostData) => { setPendingPost(data); setShowDiscussion(false); setShowPostAnon(true); };

  const handlePostAnonConfirm = async () => {
    if (!pendingPost || !user) return;
    setShowPostAnon(false);
    try {
      const data = await apiPost<{ success: boolean }>(
        '/community',
        { action: 'create_post', employee_id: user.id, company_id: user.company_id, data: { ...pendingPost, tags: [] } },
      );
      if (data.success) { toast.success('Post shared anonymously!'); fetchPosts(); }
      else toast.error('Failed to share post');
    } catch { toast.error('Something went wrong'); }
    setPendingPost(null);
  };

  const firstName = user?.first_name ?? 'there';
  const selectedPost = posts.find(p => p.id === selectedId) ?? null;

  return (
    <div className="flex flex-col flex-1 w-full h-full p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
            Our Star Community
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Connect, share, and support each other in a safe space.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Impact */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Impact</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>

          {/* All Filters */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="absolute right-0 top-full mt-1 w-44 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-30 py-1"
                >
                  {['all', ...Object.keys(categoryLabel)].map(c => (
                    <button key={c} onClick={() => { setCategory(c); setFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${category === c ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      {c === 'all' ? 'All Categories' : categoryLabel[c]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Add Post */}
          <button
            onClick={handleAddPost}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm"
          >
            <span className="hidden sm:inline">Add Post</span> <Plus className="h-3.5 w-3.5" />
          </button>

          {/* Refresh */}
          <button onClick={fetchPosts} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Feed + optional detail panel */}
      <div className={`grid gap-5 ${selectedPost ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>

        {/* Post list */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Loading posts…</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl py-14 flex flex-col items-center gap-3 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center shadow-inner">
                <Shield className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-2">No posts yet. Be the first to share!</p>
              <button onClick={handleAddPost} className="px-5 py-2 mt-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm">
                Add Post
              </button>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                selected={selectedId === post.id}
                onSelect={() => handleSelectPost(post.id)}
                onLike={handleLike}
              />
            ))
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedPost && (
            <div className="order-first lg:order-none lg:sticky lg:top-20 lg:self-start mb-6 lg:mb-0">
              <DetailPanel
                post={selectedPost}
                replies={repliesMap[selectedPost.id] ?? []}
                replyText={replyText}
                onReplyChange={setReplyText}
                onReplySubmit={handleReplySubmit}
                onLike={handleLike}
                onClose={() => setSelectedId(null)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleAddPost}
          className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg flex items-center justify-center transition-colors"
        >
          <Plus className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSafeHere && (
          <SafeHereModal firstName={firstName} onSharePost={handleSafeShare} onReadOnly={handleSafeRead} onClose={handleSafeRead} />
        )}
        {showDiscussion && (
          <StartDiscussionModal onSubmit={handleDiscussionSubmit} onClose={() => setShowDiscussion(false)} />
        )}
        {showPostAnon && pendingPost && (
          <PostAnonModal firstName={firstName} onConfirm={handlePostAnonConfirm} onCancel={() => { setShowPostAnon(false); setShowDiscussion(true); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
