import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FaDownload, FaSpinner } from 'react-icons/fa';

// Main App component
const App = () => {
  // State for image URL, loading status, and error message
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Prompts for different styles
  const prompts = {
    minimal: 'A high-quality, minimalist profile picture for a programmer. A stylized character, from the shoulders up, against a simple, clean, abstract background with subtle glowing lines. The style is flat digital art, vector-like, with a limited color palette of dark blue, purple, and neon cyan. The character has a confident and focused expression. The image is circular and perfect for a social media avatar.',
    creative: 'An artistic and creative profile picture for a programmer. A digital illustration of a person wearing headphones, sitting in a cozy, dimly lit room, with the soft glow of a laptop screen illuminating their face. The style is a beautiful digital painting with a warm, aesthetic color palette, soft focus, and a comfortable, relaxed mood. Ideal for a personal brand.',
    futuristic: 'A futuristic and high-tech profile picture for a developer. The subject is a stylized person with subtle glowing circuit board patterns overlaying their skin. The background is a swirling network of glowing binary code and abstract data lines. The color scheme is a dynamic mix of electric blue, vibrant green, and deep black. The style is cyberpunk and sci-fi-inspired, perfect for a tech-savvy profile.',
  };

  /**
   * Generates an image using the Gemini API based on a given prompt.
   * @param {string} prompt The text prompt for image generation.
   */
  const generateImage = async (prompt) => {
    setLoading(true);
    setError(null);
    setImageUrl('');

    try {
      // The payload for the image generation API call
      const payload = {
        instances: { prompt: prompt },
        parameters: { "sampleCount": 1 }
      };

      // API details
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

      // Fetch call to the API with exponential backoff for retries
      let response;
      let retries = 0;
      const maxRetries = 5;
      while (retries < maxRetries) {
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            break; // Exit the loop on a successful response
          } else {
            // Log a non-ok response and retry with exponential backoff
            console.error(`Attempt ${retries + 1} failed with status: ${response.status}`);
            const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            retries++;
          }
        } catch (fetchError) {
          // Log fetch errors and retry
          console.error(`Attempt ${retries + 1} failed with error:`, fetchError);
          const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        }
      }

      if (!response || !response.ok) {
        throw new Error('Failed to fetch image after multiple retries.');
      }

      const result = await response.json();
      
      // Extract the base64 encoded image data from the response
      const base64Data = result?.predictions?.[0]?.bytesBase64Encoded;
      
      if (base64Data) {
        // Create a data URL from the base64 data and set it to the state
        const imageUrl = `data:image/png;base64,${base64Data}`;
        setImageUrl(imageUrl);
      } else {
        throw new Error('Image data not found in the response.');
      }

    } catch (err) {
      console.error(err);
      setError('مشکلی در تولید تصویر پیش آمد. لطفا دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle image download
  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'github-profile-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 font-inter">
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          ساخت تصویر پروفایل برنامه‌نویسی
        </h1>
        <p className="text-sm sm:text-base mb-8 text-gray-300">
          یکی از سبک‌های زیر را انتخاب کنید تا یک تصویر پروفایل جذاب برای حساب گیت‌هاب شما تولید شود.
        </p>

        {/* Buttons for image generation */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <button
            onClick={() => generateImage(prompts.minimal)}
            className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-lg text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            disabled={loading}
          >
            استایل مینیمال
          </button>
          <button
            onClick={() => generateImage(prompts.creative)}
            className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-lg text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            disabled={loading}
          >
            استایل خلاقانه
          </button>
          <button
            onClick={() => generateImage(prompts.futuristic)}
            className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            disabled={loading}
          >
            استایل آینده‌نگر
          </button>
        </div>

        {/* Loading and image display area */}
        <div className="relative w-full aspect-square max-w-sm mx-auto rounded-full overflow-hidden border-4 border-gray-700 shadow-xl transition-all duration-300">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-700 bg-opacity-80 backdrop-blur-sm z-10">
              <FaSpinner className="animate-spin text-5xl text-cyan-400 mb-4" />
              <p className="text-lg font-semibold text-gray-200">درحال تولید...</p>
            </div>
          )}

          {imageUrl && !loading && (
            <img
              src={imageUrl}
              alt="تصویر پروفایل برنامه‌نویسی"
              className="w-full h-full object-cover transition-all duration-500"
            />
          )}

          {!imageUrl && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <p className="text-gray-400">تصویر شما در اینجا نمایش داده خواهد شد.</p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {/* Download button */}
        {imageUrl && !loading && (
          <button
            onClick={handleDownload}
            className="mt-6 px-8 py-3 rounded-full font-bold text-white bg-green-600 hover:bg-green-700 transition-colors duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto"
          >
            <FaDownload className="mr-2" />
            دانلود تصویر
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
