import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { RootStackParamList } from '../types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRegister = async () => {
    setErrorMessage('');

    if (!email || !password || !confirmPassword) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Email không hợp lệ');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu không khớp');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.replace('Login');
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrorMessage('Email này đã được sử dụng. Vui lòng thử email khác.');
          break;
        case 'auth/invalid-email':
          setErrorMessage('Email không hợp lệ.');
          break;
        case 'auth/weak-password':
          setErrorMessage('Mật khẩu quá yếu. Cần ít nhất 6 ký tự.');
          break;
        default:
          setErrorMessage('Đăng ký thất bại. Vui lòng thử lại.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        label="Nhập lại mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        secureTextEntry
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Button
        mode="contained"
        onPress={handleRegister}
        style={styles.registerButton}
        labelStyle={{ color: '#1E90FF', fontWeight: 'bold' }}
      >
        Đăng ký
      </Button>

      <View style={styles.footer}>
        <Text>Đã có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  registerButton: {
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: '#E6F0FF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  footer: { flexDirection: 'row', marginTop: 16, justifyContent: 'center' },
  link: { color: '#1E90FF', fontWeight: 'bold' },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
});
