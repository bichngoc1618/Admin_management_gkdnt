import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../firebaseConfig';

interface IUser {
  id?: string;
  email: string;
  username: string;
  password: string;
  image?: string;
}

interface Props {
  visible: boolean;
  user: IUser;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditUserForm({ visible, user, onClose, onUpdated }: Props) {
  const [formData, setFormData] = useState<IUser>(user);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(()=> { setFormData(user); }, [user]);

  const handleInputChange = (field: keyof IUser, value: string) => {
    setFormData({...formData, [field]: value});
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      handleInputChange('image', uri);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    if (!formData.email || !formData.username || !formData.password) {
      setErrorMessage('Vui lòng điền đầy đủ Email, Tên và Mật khẩu');
      return;
    }
    try {
      const userRef = doc(db, 'users', user.id!);
      await updateDoc(userRef, formData as any);
      onUpdated();
      onClose();
    } catch(err) {
      console.log('Lỗi update:', err);
      setErrorMessage('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalCard}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarPicker}>
            {formData.image ? (
              <Image source={{uri: formData.image}} style={styles.avatarLarge} />
            ) : (
              <View style={[styles.avatarLarge, styles.avatarPlaceholder]}>
                <IconButton icon="file" size={32} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={{textAlign:'center', marginBottom:10}}>Chọn ảnh đại diện</Text>

          <TextInput label="Email" value={formData.email} onChangeText={(t)=>handleInputChange('email',t)} style={styles.input}/>
          <TextInput label="Tên người dùng" value={formData.username} onChangeText={(t)=>handleInputChange('username',t)} style={styles.input}/>
          <TextInput label="Mật khẩu" secureTextEntry value={formData.password} onChangeText={(t)=>handleInputChange('password',t)} style={styles.input}/>

          {errorMessage ? <Text style={{color:'red', marginBottom:5}}>{errorMessage}</Text> : null}

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton} labelStyle={{ color:'#1E90FF', fontWeight:'bold' }}>
            Cập nhật User
          </Button>
          <Button onPress={onClose} style={styles.cancelButton} labelStyle={{ color:'#1E90FF' }}>Hủy</Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' },
  modalCard: { width:'90%', padding:20, borderRadius:12, backgroundColor:'#fff',
    shadowColor: "#000", shadowOffset:{width:0, height:4}, shadowOpacity:0.25, shadowRadius:5, elevation:6
  },
  avatarPicker: { alignItems:'center', justifyContent:'center', marginBottom:10 },
  avatarLarge: { width:100, height:100, borderRadius:50, alignSelf:'center', marginBottom:10 },
  avatarPlaceholder: { backgroundColor:'#1E90FF', justifyContent:'center', alignItems:'center' },
  input: { marginBottom:10, backgroundColor:'#fff' },
  submitButton: { backgroundColor:'#E6F0FF', marginBottom:8, shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.2, shadowRadius:3, elevation:3 },
  cancelButton: { backgroundColor:'#fff', borderColor:'#1E90FF', borderWidth:1 },
});
