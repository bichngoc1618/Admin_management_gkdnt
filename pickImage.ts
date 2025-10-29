import * as ImagePicker from 'expo-image-picker';

/**
 * Pick an image from gallery and upload to server
 * @param uploadUrl URL to upload the image
 */
export const pickAndUploadImage = async (uploadUrl: string) => {
  try {
    // 1️⃣ Mở thư viện ảnh
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: false, // lấy URI, sẽ convert thành blob
      quality: 0.7,
    });

    if (result.canceled) return null;

    const asset = result.assets[0];
    if (!asset.uri) return null;

    // 2️⃣ Convert URI sang blob
    const response = await fetch(asset.uri);
    const blob = await response.blob();

    // 3️⃣ Tạo FormData
    const formData = new FormData();
    formData.append('file', blob, 'photo.jpg'); // tên file tùy ý

    // 4️⃣ Upload lên server
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await uploadResponse.json();
    return data; // trả về kết quả server

  } catch (error) {
    console.error('Error picking or uploading image:', error);
    return null;
  }
};
