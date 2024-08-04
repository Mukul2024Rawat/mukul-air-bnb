"use client";
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { timeDifference } from '@/utils/dateUtils';
import Loader from './Loader';
import { fetchHostReviews, submitHostReview } from '@/api';
import toast from 'react-hot-toast';
import StarRating from './StarRating';
import { Review } from '@/types/review';

const HostReview = ({ isOpen, onClose, guestId, booking_id }: { isOpen: boolean; onClose: () => void; guestId: number; booking_id: number }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestRating, setGuestRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchHostReviews(guestId);
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [guestId]);

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, fetchReviews]);

  const handleRatingChange = (newRating: number) => {
    setGuestRating(newRating);
    clearErrors();
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    clearErrors();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!booking_id) return;
  
    setLoading(true);
    try {
      const reviewData = {
        guest_rating: guestRating,
        comments: comment,
        booking_id,
      };
      await submitHostReview(reviewData);
      resetForm();
      onClose();
      toast.success('Review submitted successfully!');
    } catch (error: any) {
      let errorMessages: string[] = [];
  
      if (error?.response) {
        const { status, data } = error.response;
        if (status === 404) {
          errorMessages = error.response .message;
        } else {
          errorMessages = data?.message?.map((msg: any) => msg.message);
        }
      }
      setErrors(errorMessages);
    } finally {
      setLoading(false);
    }
  };
  

  const clearErrors = () => {
    setErrors([]);
  };

  const resetForm = () => {
    setGuestRating(0);
    setComment('');
    setErrors([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="modal relative bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 max-h-[90vh] flex flex-col">
        <button
          className="absolute text-2xl top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={handleClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 mt-6">Host Reviews</h2>
        
        {loading ? (
          <Loader />
        ) : reviews.length > 0 ? (
          <div className="flex-1 overflow-y-auto mb-4">
            <ul>
              {reviews.map(review => (
                <li key={review.id} className="mb-4 border p-2 px-4 rounded-lg">
                  <h2 className='text-xl font-bold font-sans'>{review.host.name}</h2>
                  <p className="text-sm text-gray-600">{timeDifference(review.created_at)}</p>
                  <div className="flex items-center">
                    {[...Array(review.guest_rating)].map((_, index) => (
                      <AiFillStar key={index} className="text-yellow-500" />
                    ))}
                  </div>
                  <p className="mt-2">{review.comments}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No reviews available.</p>
        )}

        <div className="p-2 bg-gray-100 rounded-lg mt-auto">
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold mb-4 mt-2">Post Your Review</h2>
            {errors.length > 0 && (
              <div className="bg-red-500 text-white p-3 mb-2 rounded">
                <p>Error Occurred:</p>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mb-2">
              <StarRating
                ratingName="Guest Rating"
                ratingValue={guestRating}
                onChange={handleRatingChange}
              />
            </div>
            <label className="block mb-4">
              Comment:
              <textarea
                value={comment}
                onChange={handleCommentChange}
                className="block w-full mt-1 border border-blue-900 rounded-lg p-1"
              />
            </label>
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className={`bg-rose-500 text-white px-4 py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HostReview;
