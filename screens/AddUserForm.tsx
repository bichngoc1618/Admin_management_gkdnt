import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { db } from '../firebaseConfig';

interface IUser {
  email: string;
  username: string;
  password: string;
  image?: string; // Base64 string
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddUserForm({ visible, onClose, onAdded }: Props) {
  const [formData, setFormData] = useState<IUser>({
    email: '',
    username: '',
    password: '',
    image: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: keyof IUser, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // 🖼️ Chọn ảnh, nén và lưu Base64
  const pickImage = async () => {
    try {
      setUploading(true);
      setErrorMessage('');

      // B1: Mở thư viện ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        base64: false, // nén rồi mới lấy base64
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      // B2: Nén ảnh để giảm kích thước
      let compressLevel = 0.7;
      let manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 400 } }],
        { compress: compressLevel, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      let base64Img = `data:image/jpeg;base64,${manipulated.base64}`;
      let sizeKB = (base64Img.length * (3 / 4)) / 1024;

      // Nếu ảnh vẫn lớn hơn 950KB thì giảm tiếp
      while (sizeKB > 950 && compressLevel > 0.1) {
        compressLevel -= 0.1;
        manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 400 } }],
          { compress: compressLevel, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        base64Img = `data:image/jpeg;base64,${manipulated.base64}`;
        sizeKB = (base64Img.length * (3 / 4)) / 1024;
      }

      console.log(`📸 Ảnh sau nén: ${sizeKB.toFixed(1)} KB`);

      if (sizeKB > 950) {
        setErrorMessage('Ảnh vẫn quá lớn (>1MB). Hãy chọn ảnh nhỏ hơn.');
        return;
      }

      handleInputChange('image', base64Img);
    } catch (err) {
      console.error('Lỗi chọn ảnh:', err);
      setErrorMessage('Lỗi khi chọn ảnh');
    } finally {
      setUploading(false);
    }
  };

  // 🧾 Thêm người dùng mới
  const handleSubmit = async () => {
    setErrorMessage('');
    if (!formData.email || !formData.username || !formData.password) {
      setErrorMessage('Vui lòng điền đầy đủ Email, Tên và Mật khẩu');
      return;
    }

    try {
      await addDoc(collection(db, 'users'), formData);
      setFormData({ email: '', username: '', password: '', image: '' });
      onAdded();
      onClose();
    } catch (err) {
      console.log('Lỗi add:', err);
      setErrorMessage('Có lỗi xảy ra khi thêm người dùng');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalCard}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarPicker} disabled={uploading}>
            {formData.image ? (
              <Image source={{ uri: formData.image }} style={styles.avatarLarge} />
            ) : (
              <View style={[styles.avatarLarge, styles.avatarPlaceholder]}>
                <IconButton icon={uploading ? 'progress-upload' : 'file'} size={32} />
              </View>
            )}
          </TouchableOpacity>

          <Text style={{ textAlign: 'center', marginBottom: 10 }}>
            {uploading ? 'Đang tải ảnh...' : 'Chọn ảnh đại diện'}
          </Text>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(t) => handleInputChange('email', t)}
            style={styles.input}
          />
          <TextInput
            label="Tên người dùng"
            value={formData.username}
            onChangeText={(t) => handleInputChange('username', t)}
            style={styles.input}
          />
          <TextInput
            label="Mật khẩu"
            secureTextEntry
            value={formData.password}
            onChangeText={(t) => handleInputChange('password', t)}
            style={styles.input}
          />

          {errorMessage ? (
            <Text style={{ color: 'red', marginBottom: 5, textAlign: 'center' }}>{errorMessage}</Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            labelStyle={{ color: '#1E90FF', fontWeight: 'bold' }}
          >
            Thêm người dùng
          </Button>
          <Button onPress={onClose} style={styles.cancelButton} labelStyle={{ color: '#1E90FF' }}>
            Hủy
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  avatarPicker: { alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 10 },
  avatarPlaceholder: { backgroundColor: '#1E90FF', justifyContent: 'center', alignItems: 'center' },
  input: { marginBottom: 10, backgroundColor: '#fff' },
  submitButton: {
    backgroundColor: '#E6F0FF',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cancelButton: { backgroundColor: '#fff', borderColor: '#1E90FF', borderWidth: 1 },
});
