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