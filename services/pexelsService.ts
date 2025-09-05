if (!process.env.PEXELS_API_KEY) {
    console.warn("PEXELS_API_KEY environment variable is not set. Web image search will be disabled.");
}

interface PexelsPhoto {
    src: {
        large: string;
    };
}

interface PexelsResponse {
    photos: PexelsPhoto[];
}

export const fetchImagesFromPexels = async (query: string): Promise<string[]> => {
    if (!process.env.PEXELS_API_KEY) {
        return [];
    }

    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=squarish`, {
            headers: {
                Authorization: `${process.env.PEXELS_API_KEY}`
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch images from Pexels:", response.statusText);
            return [];
        }

        const data: PexelsResponse = await response.json();
        return data.photos.map(photo => photo.src.large);

    } catch (error) {
        console.error("Error fetching images from Pexels:", error);
        return [];
    }
};