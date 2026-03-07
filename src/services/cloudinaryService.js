import axios from 'axios';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';

/**
 * Uploads an image to Cloudinary using an unsigned upload preset.
 * @param {Object} imageAsset - The image asset object from react-native-image-picker
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (imageAsset) => {
    if (!imageAsset || !imageAsset.uri) {
        throw new Error('Invalid image asset');
    }

    const cloudName = CLOUDINARY_CLOUD_NAME || 'dcwz6f9m5'; // Fallback or placeholder
    const uploadPreset = CLOUDINARY_UPLOAD_PRESET || 'fitzing_unsigned';

    const formData = new FormData();
    formData.append('file', {
        uri: imageAsset.uri,
        type: imageAsset.type || 'image/jpeg',
        name: imageAsset.fileName || `tournament_${Date.now()}.jpg`,
    });
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new Error(error.response?.data?.error?.message || 'Failed to upload image to Cloudinary');
    }
};
