if (!process.env.UNSPLASH_API_KEY) {
    console.warn("UNSPLASH_API_KEY environment variable is not set. Real image search will be disabled, and the app will rely on AI-generated images.");
}

interface UnsplashImage {
    urls: {
        regular: string;
    };
    alt_description: string;
}

interface UnsplashResponse {
    results: UnsplashImage[];
}

export const fetchImagesForLandmark = async (query: string): Promise<string[]> => {
    if (!process.env.UNSPLASH_API_KEY) {
        return [];
    }

    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=4&orientation=squarish`, {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch images from Unsplash:", response.statusText);
            return [];
        }

        const data: UnsplashResponse = await response.json();
        return data.results.map(image => image.urls.regular);

    } catch (error) {
        console.error("Error fetching images from Unsplash:", error);
        return [];
    }
};
