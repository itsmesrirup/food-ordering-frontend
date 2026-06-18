// src/utils/mediaUtils.js
export const isVideoUrl = (url) => {
    if (!url) return false;
    // Checks if the URL ends with a standard video extension (case insensitive)
    // or if it contains video identifiers from providers like Cloudinary
    return url.match(/\.(mp4|webm|ogg)$/i) != null || url.includes('video/upload');
};

// Generates a fallback image from a standard MP4 url
export const getPosterUrl = (videoUrl) => {
    if (!videoUrl) return '';
    if (videoUrl.toLowerCase().endsWith('.mp4')) {
        return videoUrl.substring(0, videoUrl.lastIndexOf('.')) + '.jpg';
    }
    return '';
};

// Automatically injects Cloudinary optimizations
export const getOptimizedUrl = (url, targetWidth) => {
    if (!url) return '';
    
    // Only apply this to Cloudinary image URLs (don't mess with videos or external links)
    if (url.includes('res.cloudinary.com') && !url.includes('.mp4')) {
        
        // If the URL already has transformations (like the user manually added them), leave it alone
        if (url.includes('/upload/q_')) return url;

        // Build the optimization string (e.g., "q_auto,f_auto,w_800")
        const optimizations = `q_auto,f_auto,c_limit,w_${targetWidth}`;

        // Inject it right after the "/upload/" part of the URL
        return url.replace('/upload/', `/upload/${optimizations}/`);
    }
    
    return url; // Return normal URL if it's not Cloudinary
};