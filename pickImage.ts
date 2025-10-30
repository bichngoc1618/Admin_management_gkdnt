import * as ImagePicker from 'expo-image-picker';

export const pickImageBase64 = async (): Promise<string | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.3,
    });

    if (result.canceled) return null;

    const asset = result.assets[0];
    const base64Image = `data:image/jpeg;base64,${asset.base64}`;
    return base64Image; // trả về để lưu vào Firestore
  } catch (error) {
    console.error('Lỗi chọn ảnh:', error);
    return null;
  }
};
