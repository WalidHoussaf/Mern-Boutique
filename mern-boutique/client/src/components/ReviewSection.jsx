import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { FaStar, FaThumbsUp, FaImage, FaCheck, FaTrash, FaTimes, FaEdit } from 'react-icons/fa';
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
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [editImages, setEditImages] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

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

  const handleImageUpload = async (e, isEdit = false) => {
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
      
      if (isEdit) {
        setEditImages([...editImages, ...data.data.map(img => img.url)]);
      } else {
        setImages([...images, ...data.data.map(img => img.url)]);
      }
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

  const handleStartEdit = (review) => {
    setEditingReview(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setEditImages(review.images || []);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditRating(5);
    setEditComment('');
    setEditImages([]);
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`/api/products/${productId}/reviews/${reviewId}`, {
        rating: editRating,
        comment: editComment,
        images: editImages,
      });
      setEditingReview(null);
      setEditRating(5);
      setEditComment('');
      setEditImages([]);
      fetchReviews();
      toast.success('Review updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
      await axios.delete(`/api/products/${productId}/reviews/${reviewToDelete}`);
      fetchReviews();
      toast.success(t('review_deleted_success'));
      setShowDeleteModal(false);
      setReviewToDelete(null);
    } catch (error) {
      toast.error(t('review_delete_error'));
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleDeleteCancel}></div>

            {/* Modal panel */}
            <div className="relative inline-block w-full max-w-lg p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={handleDeleteCancel}
                >
                  <span className="sr-only">{t('close')}</span>
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FaTrash className="h-5 w-5 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {t('delete_review_confirmation_title')}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {t('delete_review_confirmation_message')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={handleDeleteConfirm}
                >
                  {t('delete')}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={handleDeleteCancel}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
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
                      {review.verifiedPurchase && (
                        <>
                          <span className="mx-1">•</span>
                          <div className="bg-green-50 rounded-full px-2 py-1 flex items-center">
                            <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span className="text-xs font-medium text-green-700">{t('verified_purchase')}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit/Delete buttons */}
                <div className="flex items-center gap-2">
                  {(userInfo?._id === review.user._id || userInfo?.isAdmin) && (
                    <>
                      {userInfo?._id === review.user._id && (
                        <button
                          onClick={() => handleStartEdit(review)}
                          className="text-gray-400 hover:text-primary transition-colors"
                          title={t('edit_review')}
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(review._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title={t('delete_review')}
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Review content */}
              {editingReview === review._id ? (
                // Edit form
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setEditRating(star)}
                        className={`text-2xl transition-colors ${
                          editRating >= star ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-500`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder={t('share_your_thoughts')}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                  />
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary-dark">
                      <FaImage className="text-xl" />
                      <span>{t('add_photos')}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, true)}
                      />
                    </label>
                    
                    {editImages.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {editImages.length} {t('photos_selected')}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={() => handleUpdateReview(review._id)}
                      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                      disabled={loading}
                    >
                      {loading ? t('updating') : t('update_review')}
                    </button>
                  </div>
                </div>
              ) : (
                // Review content
                <>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`${
                          review.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
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
                </>
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