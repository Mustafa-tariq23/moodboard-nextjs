import { useState } from "react";
import ImageCard from "../../components/ImageCard";

type ImageSearchProps = {
  onImageDragStart: (e: React.DragEvent, src: string) => void;
};

// Mock data for Unsplash API (replace with actual API integration)
const MOCK_IMAGES = [
  {
    id: "1",
    urls: {
      regular:
        "https://plus.unsplash.com/premium_photo-1666900440561-94dcb6865554?q=80&w=3027&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    alt_description: "rings",
  },
  {
    id: "2",
    urls: {
      regular:
        "https://plus.unsplash.com/premium_photo-1664392248318-4e1d9361726e?q=80&w=2783&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    alt_description: "man with dog",
  },
  {
    id: "3",
    urls: {
      regular:
        "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?q=80&w=3039&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    alt_description: "banana",
  },
  {
    id: "4",
    urls: { regular: "https://plus.unsplash.com/premium_photo-1666901328734-3c6eb9b6b979?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHJhbmRvbXxlbnwwfHwwfHx8MA%3D%3D" },
    alt_description: "tree",
  },
  {
    id: "5",
    urls: { regular: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=2607&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    alt_description: "something",
  },
  {
    id: "6",
    urls: { regular: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHJhbmRvbXxlbnwwfHwwfHx8MA%3D%3D" },
    alt_description: "books",
  },
  {
    id: "7",
    urls: { regular: "https://images.unsplash.com/photo-1495001258031-d1b407bc1776?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fHJhbmRvbXxlbnwwfHwwfHx8MA%3D%3D" },
    alt_description: "good vibes",
  },
  {
    id: "8",
    urls: {
      regular: "https://images.unsplash.com/photo-1550686041-366ad85a1355?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fHJhbmRvbXxlbnwwfHwwfHx8MA%3D%3D",
    },
    alt_description: "mountain",
  },
];

export default function ImageSearch({ onImageDragStart }: ImageSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState(MOCK_IMAGES);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // In a real implementation, you would call the Unsplash API here
    // For now, we'll just simulate a search with our mock data
    setTimeout(() => {
      setImages(MOCK_IMAGES);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-md p-4 text-gray-700">
      <h2 className="text-xl font-bold mb-4">Image Search</h2>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for images..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              src={image.urls.regular}
              alt={image.alt_description || "Unsplash image"}
              onDragStart={onImageDragStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
