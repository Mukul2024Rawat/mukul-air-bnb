import React, { useState, useEffect } from 'react';
import Modal from './Modal'; 
import { ReviewCard } from '../guest/listing/Review';
import { Review } from '@/types/property';
import { fetchReviews } from '@/api/property';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number;
}

const PropertyModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, propertyId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetchGuestReviews();
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, propertyId]);

  const fetchGuestReviews = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReviews(propertyId);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const bodyContent = (
    <div className="max-h-[70vh] overflow-y-auto">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        reviews.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="All Reviews"
      body={bodyContent}
      actionLabel="Close"
      onSubmit={onClose}
    />
  );
};

export default PropertyModal;
