import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, User, Camera, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const RatingsReview: React.FC = () => {
  const navigate = useNavigate();
  const [mechanicRating, setMechanicRating] = useState(0);
  const [workshopRating, setWorkshopRating] = useState(0);
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const serviceDetails = {
    service: 'Engine Breakdown Repair',
    mechanic: 'Rajesh Kumar',
    workshop: 'AutoCare Plus',
    duration: '45 minutes',
    cost: '₹1,417'
  };

  const handleStarClick = (rating: number, type: 'mechanic' | 'workshop') => {
    if (type === 'mechanic') {
      setMechanicRating(rating);
    } else {
      setWorkshopRating(rating);
    }
  };

  const handlePhotoUpload = () => {
    const newPhoto = `https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=400`;
    setPhotos([...photos, newPhoto]);
    toast.success('Photo added');
  };

  const handleSubmit = () => {
    if (mechanicRating === 0 || workshopRating === 0) {
      toast.error('Please rate both mechanic and workshop');
      return;
    }

    toast.success('Thank you for your feedback!');
    setTimeout(() => {
      navigate('/user');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/user')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Rate & Review</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Details</h2>
          <div className="flex justify-between text-gray-600">
            <div>
              <div className="text-sm">Service</div>
              <div className="font-medium">{serviceDetails.service}</div>
            </div>
            <div>
              <div className="text-sm">Duration</div>
              <div className="font-medium">{serviceDetails.duration}</div>
            </div>
            <div>
              <div className="text-sm">Cost</div>
              <div className="font-medium">{serviceDetails.cost}</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Rate the Mechanic</h2>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star, 'mechanic')}
                className={`p-2 rounded-full ${
                  mechanicRating >= star ? 'bg-yellow-400' : 'bg-gray-200'
                }`}
              >
                <Star className="w-5 h-5 text-yellow-500" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Rate the Workshop</h2>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star, 'workshop')}
                className={`p-2 rounded-full ${
                  workshopRating >= star ? 'bg-yellow-400' : 'bg-gray-200'
                }`}
              >
                <Star className="w-5 h-5 text-yellow-500" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Comments</h2>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            rows={4}
            placeholder="Share your experience..."
          />
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Photos</h2>
          <div className="flex space-x-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img src={photo} alt={`Uploaded Photo ${index + 1}`} className="w-16 h-16 rounded-lg object-cover" />
                <button
                  onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              onClick={handlePhotoUpload}
              className="flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Camera className="w-8 h-8" />
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigate('/user')}
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingsReview;
