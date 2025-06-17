import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  Filter,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  isTrending?: boolean;
  isNew?: boolean;
}

const ForumPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const categories = [
    { id: "all", name: "All Discussions", icon: MessageSquare },
    { id: "general", name: "General", icon: MessageSquare },
    { id: "books", name: "Books", icon: Bookmark },
    { id: "reading", name: "Reading Tips", icon: Star },
    { id: "events", name: "Events", icon: TrendingUp },
  ];

  const discussions: Discussion[] = [
    {
      id: "1",
      title: "What's your favorite book of 2024 so far?",
      content:
        "I've been reading some amazing books this year and would love to hear your recommendations...",
      author: {
        name: "Sarah Johnson",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      category: "books",
      tags: ["recommendations", "2024", "discussion"],
      likes: 42,
      comments: 15,
      createdAt: "2 hours ago",
      isTrending: true,
    },
    {
      id: "2",
      title: "Tips for maintaining a reading habit",
      content:
        "I've been struggling to maintain a consistent reading habit. Any tips from fellow readers?",
      author: {
        name: "Mike Chen",
        avatar: "https://i.pravatar.cc/150?img=2",
      },
      category: "reading",
      tags: ["habits", "tips", "reading"],
      likes: 28,
      comments: 8,
      createdAt: "5 hours ago",
      isNew: true,
    },
    {
      id: "3",
      title: "Upcoming Book Club Meeting",
      content:
        "Join us this weekend for our monthly book club meeting where we'll discuss 'The Midnight Library'...",
      author: {
        name: "Emma Wilson",
        avatar: "https://i.pravatar.cc/150?img=3",
      },
      category: "events",
      tags: ["bookclub", "meeting", "events"],
      likes: 35,
      comments: 12,
      createdAt: "1 day ago",
    },
  ];

  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesSearch =
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || discussion.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    if (sortBy === "recent") {
      return a.createdAt.localeCompare(b.createdAt);
    } else if (sortBy === "popular") {
      return b.likes - a.likes;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-4">Join the Discussion</h1>
            <p className="text-lg text-blue-100 mb-8">
              Connect with fellow readers, share your thoughts, and discover new
              perspectives in our vibrant community.
            </p>
            <div className="flex justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/forum/create"
                  className="bg-white text-primary-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Start a Discussion
                </Link>
              ) : (
                <Link
                  to="/sign-in"
                  className="bg-white text-primary-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium"
                >
                  Sign in to Join
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                        selectedCategory === category.id
                          ? "bg-primary-50 text-primary-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                  </select>
                  {isAuthenticated && (
                    <Link
                      to="/forum/create"
                      className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="h-5 w-5" />
                      New Discussion
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Discussions List */}
            <AnimatePresence>
              <div className="space-y-6">
                {sortedDiscussions.map((discussion) => (
                  <motion.div
                    key={discussion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={discussion.author.avatar}
                            alt={discussion.author.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {discussion.title}
                              </h3>
                              {discussion.isTrending && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Trending
                                </span>
                              )}
                              {discussion.isNew && (
                                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  New
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{discussion.author.name}</span>
                              <span>•</span>
                              <span>{discussion.createdAt}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                            <Bookmark className="h-5 w-5" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                            <Share2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{discussion.content}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {discussion.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-6">
                          <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600">
                            <ThumbsUp className="h-5 w-5" />
                            <span>{discussion.likes}</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600">
                            <MessageSquare className="h-5 w-5" />
                            <span>{discussion.comments}</span>
                          </button>
                        </div>
                        <Link
                          to={`/forum/${discussion.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Read more
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {/* Empty State */}
            {sortedDiscussions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <MessageSquare className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No discussions found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
