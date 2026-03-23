// src/utils/mediaUtils.js
export const isVideoUrl = (url) => {
    if (!url) return false;
    // Checks if the URL ends with a standard video extension (case insensitive)
    // or if it contains video identifiers from providers like Cloudinary
    return url.match(/\.(mp4|webm|ogg)$/i) != null || url.includes('video/upload');
};