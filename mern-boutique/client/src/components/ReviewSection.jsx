import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { FaStar, FaThumbsUp, FaImage, FaCheck, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'helpful', 'rating'

  const { user: userInfo } = useContext(ShopContext);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${productId}/reviews`);
      setReviews(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching reviews');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post(
        `/api/products/${productId}/reviews`,
        { rating, comment, images },
        config
      );

      toast.success('Review submitted successfully');
      setComment('');
      setRating(5);
      setImages([]);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting review');
    }

    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('/api/upload', formData, config);
      setImages((prev) => [...prev, ...data.data.map((img) => img.url)]);
    } catch (error) {
      toast.error('Error uploading images');
    }
  };

  const handleVote = async (reviewId, helpful) => {
    if (!userInfo) {
      toast.error('Please login to vote');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post(
        `/api/products/${productId}/reviews/${reviewId}/vote`,
        { helpful },
        config
      );

      fetchReviews();
    } catch (error) {
      toast.error('Error recording vote');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!userInfo) {
      toast.error('Please login to delete review');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.delete(
        `/api/products/${productId}/reviews/${reviewId}`,
        config
      );

      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting review');
    }
  };

  const sortReviews = () => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'helpful':
        return sorted.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  };

  return (
    <div className="my-8">
      {/* Review Form */}
      {userInfo ? (
        <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-prata text-secondary mb-4">Write a Review</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              rows="4"
              placeholder="Share your thoughts about this product..."
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-2"
            />
            <div className="flex gap-2">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Review ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-blue-50 rounded-xl text-center">
          <p className="text-blue-700">Please log in to write a review</p>
        </div>
      )}

      {/* Sort Controls */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortReviews().map((review) => (
          <div key={review._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="font-medium text-gray-900">{review.name}</span>
                {review.verifiedPurchase && (
                  <span className="text-green-600 flex items-center gap-1 text-sm bg-green-50 px-2 py-1 rounded-full">
                    <FaCheck className="w-3 h-3" /> Verified Purchase
                  </span>
                )}
              </div>
              {/* Delete button - only show for review owner or admin */}
              {userInfo && (userInfo._id === review.user._id || userInfo.isAdmin) && (
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete review"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-gray-700 mb-4">{review.comment}</p>
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mb-4">
                {review.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Review ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <button
                onClick={() => handleVote(review._id, true)}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <FaThumbsUp className="w-4 h-4" /> 
                <span>Helpful ({review.helpfulVotes})</span>
              </button>
              <span className="text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        
        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this product!
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection; 