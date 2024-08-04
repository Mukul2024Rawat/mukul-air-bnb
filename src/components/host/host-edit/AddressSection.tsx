import React from 'react';
import { MdEdit } from 'react-icons/md';

interface AddressProps {
  address: {
    id:number;
    nearest_landmark: string;
    locality: string;
    city: string;
    state: string;
    country: string;
    pincode: string|number;
    latitude:number;
    longitude:number;
    property_id: number; 
    created_at: string; 
    updated_at: string; 
  };
  isEditing: boolean;
  onEdit: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: () => void;
}

const AddressSection: React.FC<AddressProps> = ({
  address,
  isEditing,
  onEdit,
  onInputChange,
  onCancel,
  onSave,
}) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">Address</h3>
        {!isEditing && (
          <button onClick={onEdit} className="text-blue-500 hover:text-blue-600">
            <MdEdit size={24} />
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nearest Landmark</label>
              <input
                type="text"
                name="nearest_landmark"
                value={address.nearest_landmark}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Locality</label>
              <input
                type="text"
                name="locality"
                value={address.locality}
                onChange={onInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 ease-in-out"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">
          {`${address.nearest_landmark}, ${address.locality}, ${address.city}, ${address.state}, ${address.country} - ${address.pincode}`}
        </p>
      )}
    </div>
  );
};

export default AddressSection;