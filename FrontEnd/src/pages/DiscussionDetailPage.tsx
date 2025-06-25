import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  Image as ImageIcon,
  X,
} from "lucide-react";

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  images?: string[];
}

const DiscussionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Dummy data untuk contoh
  const discussion = {
    id: "1",
    title: "What's your favorite book of 2024 so far?",
    content:
      "I've been reading some amazing books this year and would love to hear your recommendations. What books have you enjoyed the most in 2024? Share your thoughts and let's discuss!",
    author: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    category: "books",
    tags: ["recommendations", "2024", "discussion"],
    likes: 42,
    comments: 15,
    createdAt: "2 hours ago",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=60",
    ],
  };

  const comments: Comment[] = [
    {
      id: "1",
      content:
        "I recently finished 'The Midnight Library' and it was absolutely amazing! The concept of parallel lives was executed brilliantly.",
      author: {
        name: "Mike Chen",
        avatar: "https://i.pravatar.cc/150?img=2",
      },
      createdAt: "1 hour ago",
      likes: 8,
    },
    {
      id: "2",
      content:
        "I've been really into sci-fi this year. 'Project Hail Mary' by Andy Weir was my favorite so far!",
      author: {
        name: "Emma Wilson",
        avatar: "https://i.pravatar.cc/150?img=3",
      },
      createdAt: "45 minutes ago",
      likes: 5,
      images: [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=60",
      ],
    },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages]);

      // Create preview URLs
      const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviewUrls = [...imagePreviewUrls];
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    setImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement comment submission logic
    setComment("");
    setImages([]);
    setImagePreviewUrls([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold">Discussion</h1>
          </div>

          {/* Discussion Content */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={discussion.author.avatar}
                    alt={discussion.author.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {discussion.title}
                    </h2>
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

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {discussion.content}
              </p>

              {discussion.images && discussion.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {discussion.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Discussion image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {discussion.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600">
                  <ThumbsUp className="h-5 w-5" />
                  <span>{discussion.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600">
                  <MessageSquare className="h-5 w-5" />
                  <span>{discussion.comments}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>

            {/* Comment Form */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <form onSubmit={handleSubmitComment}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your comment..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
                  required
                />

                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      multiple
                    />
                    <div className="flex items-center gap-2 text-gray-500 hover:text-primary-600">
                      <ImageIcon className="h-5 w-5" />
                      <span>Add Images</span>
                    </div>
                  </label>
                  <button
                    type="submit"
                    className="btn-primary px-6 py-2 rounded-lg"
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {comment.author.name}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {comment.createdAt}
                          </span>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>

                    <p className="text-gray-700 mb-4">{comment.content}</p>

                    {comment.images && comment.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {comment.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Comment image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600">
                        <ThumbsUp className="h-5 w-5" />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-primary-600">
                        <MessageSquare className="h-5 w-5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetailPage;
