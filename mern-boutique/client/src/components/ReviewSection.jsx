import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { FaStar, FaThumbsUp, FaImage, FaCheck, FaTrash, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useTranslation from '../utils/useTranslation';

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [selectedImage, setSelectedImage] = useState(null);

  const { user: userInfo } = useContext(ShopContext);
  const { t } = useTranslation();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${productId}/reviews`);
      setReviews(data);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      setImages([...images, ...data.data.map(img => img.url)]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload images');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/api/products/${productId}/reviews`, {
        rating,
        comment,
        images,
      });
      setComment('');
      setRating(5);
      setImages([]);
      fetchReviews();
      toast.success('Review submitted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`/api/products/${productId}/reviews/${reviewId}`);
      fetchReviews();
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    if (!userInfo) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      await axios.post(`/api/products/${productId}/reviews/${reviewId}/vote`);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const sortReviews = () => {
    const sortedReviews = [...reviews];
    switch (sortBy) {
      case 'helpful':
        return sortedReviews.sort((a, b) => (b.votedBy?.length || 0) - (a.votedBy?.length || 0));
      case 'rating':
        return sortedReviews.sort((a, b) => b.rating - a.rating);
      case 'recent':
      default:
        return sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  return (
    <>
      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Review image"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="w-full bg-white">
        <div className="border-b border-gray-200 mb-8">
          <h2 className="text-2xl font-prata text-secondary pb-4">{t('customer_reviews')}</h2>
        </div>
        
        {/* Review Statistics */}
        {reviews.length > 0 && (
          <div className="py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length}
                  <span className="text-lg text-gray-600"> {t('out_of')} 5</span>
                </p>
                <p className="text-sm text-gray-600">{reviews.length} {t('reviews')}</p>
              </div>
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="recent">{t('newest_first')}</option>
                  <option value="helpful">{t('most_helpful')}</option>
                  <option value="rating">{t('rating_high_to_low')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Write Review Section */}
        {userInfo ? (
          <div className="py-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('write_a_review')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${
                      rating >= star ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-500`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
              
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('share_your_thoughts')}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
              />
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <FaImage className="text-gray-600" />
                  <span className="text-gray-700">{t('add_images')}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {images.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {images.length} {t(images.length === 1 ? 'image' : 'images')}
                  </span>
                )}
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={loading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('submitting') : t('submit_review')}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 border-b border-gray-200">
            <p className="text-gray-700">{t('please_login_review')}</p>
          </div>
        )}

        {/* Reviews List */}
        <div className="py-6 space-y-6">
          {sortReviews().map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
              {/* Header with user info */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 mr-4">
                  <img
                    src={review.user.profileImage}
                    alt={review.user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-prata text-secondary">{review.user.name}</h3>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    {review.user.profession && (
                      <>
                        <span>{review.user.profession}</span>
                        {review.user.location && <span className="mx-1">•</span>}
                      </>
                    )}
                    {review.user.location && <span>{review.user.location}</span>}
                    <span className="mx-1">•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {review.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`${t('review_image')} ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
                        <FaImage className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleHelpfulVote(review._id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    review.votedBy?.some(vote => vote.user === userInfo?._id && vote.helpful)
                      ? 'bg-primary-light text-primary'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <FaThumbsUp className="w-3 h-3" />
                  <span>{t('helpful')} ({review.votedBy?.length || 0})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="py-12">
            <p className="text-gray-600">{t('no_reviews_yet')}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ReviewSection; 