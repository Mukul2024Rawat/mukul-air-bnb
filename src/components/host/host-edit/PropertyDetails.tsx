import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Property } from '@/types/PropertyDetails';
import { hostApi } from '@/api/host';
import GeneralDetailsSection from './GeneralDetails';
import AddressSection from './AddressSection';
import PriceSection from './PriceSection';
import AmenitiesSection from './AmenitiesSection';
import ImagesSection from './ImagesSection';

interface PropertyDetailsModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  isOpen,
  onClose,
  onUpdate,
}) => {
  

  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState<'general' | 'address' | 'price' | 'amenities' | 'images' | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [generalDetails, setGeneralDetails] = useState({
    title: property.title,
    subtitle: property.subtitle,
    description: property.description,
    capacity: Number(property.capacity),
    is_available: property.is_available,
    is_cancellable: property.is_cancellable,
    cancellation_days: property.cancellation_days,
  });
  const [address, setAddress] = useState({ ...property.property_address });
  const [priceDetails, setPriceDetails] = useState({
    price: property.property_price.price,
    cleaning_fee: property.property_price.cleaning_fee,
    service_fee: property.property_price.service_fee,
    tax: property.property_price.tax,
    daily_discount: property.property_price.daily_discount,
    weekly_discount: property.property_price.weekly_discount,
  });
  const [selectedAmenities, setSelectedAmenities] = useState(
    new Set(property.property_amenities.map((amenity) => amenity.amenity_id))
  );
  const [images, setImages] = useState(property.property_images || []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (editSection === 'general') {
      setGeneralDetails((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    } else if (editSection === 'address') {
      setAddress((prev) => ({ ...prev, [name]: value }));
    } else if (editSection === 'price') {
      setPriceDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleAmenity = (amenityId: number) => {
    setSelectedAmenities((prev) => {
      const updated = new Set(prev);
      if (updated.has(amenityId)) {
        updated.delete(amenityId);
      } else {
        updated.add(amenityId);
      }
      return updated;
    });
  };

  const handleImageUpload = async (files: File[]) => {
    try {
      await hostApi.uploadImages(property.id, files);
      const updatedProperty = await hostApi.getPropertyDetails(property.id);
      setImages(updatedProperty.property_images);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images. Please try again.');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await hostApi.deleteImage(property.id, imageId);
      setImages(images.filter((img) => img.id !== imageId));
      toast.success('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image. Please try again.');
    }
  };

  const validateGeneralDetails = () => {
    const newErrors: { [key: string]: string } = {};
    const capacity = Number(generalDetails.capacity);
    const cancellationDays = Number(generalDetails.cancellation_days);

    if (capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than zero';
    }
    if (!Number.isInteger(cancellationDays)) {
      newErrors.cancellation_days = 'Cancellation days must be an integer number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    try {
      if (editSection === 'general') {
        if (!validateGeneralDetails()) {
          return;
        }
        const updatedDetails:any = {
          ...generalDetails,
          capacity: Number(generalDetails.capacity),
          cancellation_days: Number(generalDetails.cancellation_days),
        };
        await hostApi.updateGeneralDetails(property.id, updatedDetails);
      } else if (editSection === 'address') {
        const { nearest_landmark, locality } = address;
        await hostApi.updateAddress(property.id, property.property_address.id, { nearest_landmark, locality });
      } else if (editSection === 'price') {
        await hostApi.updatePrice(property.id, property.property_price.id, priceDetails);
      } else if (editSection === 'amenities') {
        await hostApi.updateAmenities(property.id, Array.from(selectedAmenities));
      }

      setIsEditing(false);
      setEditSection(null);
      onUpdate();
      toast.success('Property updated successfully!');
    } catch (error: any) {
      console.error('Error updating property:', error);
      if (error.response && error.response.data && error.response.data.message) {
        const messages = error.response.data.message
          .map((msg: { property: string; message: string }) => msg.message)
          .join(' ');
        toast.error(messages);
      } else {
        toast.error('Failed to update property. Please try again.');
      }
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-black bg-opacity-50 absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{property.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <GeneralDetailsSection
            generalDetails={generalDetails}
            isEditing={isEditing && editSection === 'general'}
            errors={errors}
            onEdit={() => { setIsEditing(true); setEditSection('general'); }}
            onInputChange={handleInputChange}
            onCancel={() => { setIsEditing(false); setEditSection(null); }}
            onSave={handleUpdate}
          />

          <AddressSection
            address={address}
            isEditing={isEditing && editSection === 'address'}
            onEdit={() => { setIsEditing(true); setEditSection('address'); }}
            onInputChange={handleInputChange}
            onCancel={() => { setIsEditing(false); setEditSection(null); }}
            onSave={handleUpdate}
          />

          <PriceSection
            priceDetails={priceDetails}
            isEditing={isEditing && editSection === 'price'}
            onEdit={() => { setIsEditing(true); setEditSection('price'); }}
            onInputChange={handleInputChange}
            onCancel={() => { setIsEditing(false); setEditSection(null); }}
            onSave={handleUpdate}
          />

          <AmenitiesSection
            selectedAmenities={selectedAmenities}
            isEditing={isEditing && editSection === 'amenities'}
            onEdit={() => { setIsEditing(true); setEditSection('amenities'); }}
            onToggleAmenity={toggleAmenity}
            onCancel={() => { setIsEditing(false); setEditSection(null); }}
            onSave={handleUpdate}
          />

          <ImagesSection
            images={images}
            onImageUpload={handleImageUpload}
            onDeleteImage={handleDeleteImage}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;