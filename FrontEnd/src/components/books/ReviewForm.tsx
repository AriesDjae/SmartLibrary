import React, { useState } from "react";
import { Star, X, Send, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface ReviewFormProps {
  bookId: string;
  onSubmit: (review: {
    rating: number;
    comment: string;
    images?: File[];
  }) => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  bookId,
  onSubmit,
  onCancel,
}) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files]);
      // Create preview URLs
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    onSubmit({ rating, comment, images: selectedImages });
  };

  return (
    <div className="flex items-start gap-3 w-full mb-6">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center font-bold text-lg shadow">
        {currentUser?.name?.[0] || 'U'}
      </div>
      {/* Input & Actions */}
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="w-full">
          {/* Input Box */}
          <div className="flex flex-col gap-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-gray-900 placeholder-gray-400"
              placeholder="Tambahkan komentar..."
              rows={2}
              maxLength={1000}
              style={{ minHeight: 44 }}
            />
            {/* Image Preview */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-1">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-16 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Actions Row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {/* Star Rating */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      className={`h-6 w-6 ${star <= (hoveredRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
              {/* Emoji Button (optional, can be replaced with real emoji picker) */}
              <button type="button" className="text-gray-400 hover:text-primary-500 p-1 rounded-full">
                <span role="img" aria-label="emoji">😊</span>
              </button>
              {/* Image Upload */}
              <label className="cursor-pointer text-gray-400 hover:text-primary-500 p-1 rounded-full">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={previewUrls.length >= 4}
                />
                <ImageIcon className="h-6 w-6" />
              </label>
            </div>
            <div className="flex gap-2">
              {/* Cancel button only if needed, can be hidden if not used */}
              {/* <button type="button" onClick={onCancel} className="text-gray-500 font-medium px-3 py-1 rounded hover:bg-gray-100">Batal</button> */}
              <button
                type="submit"
                className={`px-5 py-1.5 rounded-full font-semibold transition text-white ${comment.trim() && rating ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 cursor-not-allowed'}`}
                disabled={!comment.trim() || !rating}
              >
                Komentar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
