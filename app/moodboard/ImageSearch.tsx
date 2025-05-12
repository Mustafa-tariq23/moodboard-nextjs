import { useEffect, useState } from "react";
import ImageCard from "../../components/ImageCard";

type ImageSearchProps = {
  onImageDragStart: (e: React.DragEvent, src: string) => void;
};

export default function ImageSearch({ onImageDragStart }: ImageSearchProps) {

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/photos/`, {
          method: "GET"
        })

        const data = await response.json();
        setImages(data.results);
        setIsLoading(false);

        console.log("response for fetch req", response);
      } catch (error) {
        console.error("Error fetching images:", error);
        setIsLoading(false);
      }
    }
    fetchImages();
  }, []);


  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/search/photos/`, {
        method: "GET",
        headers: {
          "query": searchQuery,
        }
      })
      console.log("response for fetch req", response);
      const data = await response.json();
      setImages(data.results);
      setIsLoading(false);

      console.log("response", response);

    } catch (error) {
      console.error("Error fetching images:", error);
      setIsLoading(false);
    }

    // setTimeout(() => {
    //   setImages(MOCK_IMAGES);
    //   setIsLoading(false);
    // }, 500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-md p-4 text-gray-700">
      <h2 className="text-xl font-bold mb-4">Image Search</h2>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              console.log("searchQuery", searchQuery);
            }}
            placeholder="Search for images..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-75`}
            disabled={isLoading || searchQuery.trim() === ""}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {images?.map((image : any) => (
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
