import React, { useState } from 'react';

const FitnessForm = ({ onAddFitnessData, onGetRecommendations }) => {
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    fitnessLevel: '',
    dietaryPreferences: '',
    workoutGoal: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddData = (e) => {
    e.preventDefault();
    onAddFitnessData(formData);
  };

  const handleGetRecommendations = (e) => {
    e.preventDefault();
    onGetRecommendations();
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <img
        src="/fitness.png"
        alt="Fitness"
        className="w-16 h-16 rounded mb-4"
      />
      <h2 className="text-2xl font-bold mb-4">Enter Your Fitness Details</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-gray-700">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Height (cm)</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Fitness Level</label>
          <select
            name="fitnessLevel"
            value={formData.fitnessLevel}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded"
            required
          >
            <option value="">Select your level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700">Dietary Preferences</label>
          <input
            type="text"
            name="dietaryPreferences"
            value={formData.dietaryPreferences}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded"
            placeholder="e.g. vegan, keto, etc."
          />
        </div>
        <div>
          <label className="block text-gray-700">Workout Goal</label>
          <input
            type="text"
            name="workoutGoal"
            value={formData.workoutGoal}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded"
            placeholder="e.g. weight loss, muscle gain, endurance"
          />
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleAddData}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Add Fitness Data
          </button>
          <button
            onClick={handleGetRecommendations}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Get Recommendations
          </button>
        </div>
      </form>
    </div>
  );
};

export default FitnessForm;
