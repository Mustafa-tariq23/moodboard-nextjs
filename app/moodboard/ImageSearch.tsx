import { useEffect, useState } from "react";
import ImageCard from "../../components/ImageCard";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ImageSearchProps = {
  onImageDragStart: (e: React.DragEvent, src: string) => void;
};

type UnsplashImage = {
  id: string;
  urls: { regular: string };
  alt_description: string;
};

export default function ImageSearch({ onImageDragStart }: ImageSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/photos/`, {
          method: "GET"
        })

        const data = await response.json();
        setImages(data.results);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching images:", error);
      }
    }
    fetchImages();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/photos/`, {
        method: "GET",
        headers: {
          "query": searchQuery,
        }
      })
      const data = await response.json();
      setImages(data.results);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg p-4 text-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Image Search</h2>
        <div className="text-sm text-gray-500">
          {images.length} images found
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search for images..."
              className="pl-10"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto scrollbar">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : images.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Search className="h-12 w-12 mb-4" />
            <p className="text-lg">No images found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-max">
            {images.map((image: UnsplashImage) => (
              <ImageCard
                key={image.id}
                src={image.urls.regular}
                alt={image.alt_description || "Unsplash image"}
                onDragStart={onImageDragStart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
