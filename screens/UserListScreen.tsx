import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button } from 'react-native-paper';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import AddUserForm from './AddUserForm';
import EditUserForm from './EditUserForm';

interface IUser {
  id?: string;
  email: string;
  username: string;
  password: string;
  image?: string;
}

export default function UserListScreen({ navigation }: any) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);

  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IUser)));
    } catch (err) {
      console.log("Lỗi loadUsers:", err);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const userRef = doc(db, "users", userToDelete.id!);
      await deleteDoc(userRef);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    } catch (err) {
      console.log("Lỗi xóa user:", err);
    } finally {
      setUserToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const startDeleteUser = (user: IUser) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (err) {
      console.log("Lỗi logout:", err);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const startEditUser = (user: IUser) => {
    setEditingUser(user);
    setShowEditForm(true);
  };

  const renderUser = ({ item }: any) => (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={{ color: '#fff', fontWeight:'bold' }}>{item.username?.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <View style={styles.actions}>
          <IconButton icon="pencil" size={24} onPress={() => startEditUser(item)} style={styles.iconButton}/>
          <IconButton icon="delete" size={24} onPress={() => startDeleteUser(item)} style={styles.iconButton}/>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách User</Text>
        <IconButton icon="logout" size={28} onPress={handleLogout} />
      </View>

      {/* FlatList chính, không cần ScrollView */}
      <FlatList
        data={users}
        keyExtractor={item => item.id!}
        renderItem={renderUser}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Chưa có user nào</Text>}
        contentContainerStyle={{ padding: 10 }}
      />

      {/* Nút thêm user */}
      <View style={styles.addButtonContainer}>
        <IconButton
          icon="plus-circle"
          size={48}
          iconColor="#1E90FF"
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        />
      </View>

      {/* Modal Add User */}
      <AddUserForm
        visible={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdded={loadUsers}
      />

      {/* Modal Edit User */}
      {editingUser && (
        <EditUserForm
          visible={showEditForm}
          user={editingUser}
          onClose={() => { setShowEditForm(false); setEditingUser(null); }}
          onUpdated={loadUsers}
        />
      )}

      {/* Modal Confirm Delete */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>Bạn có chắc muốn xóa người dùng này?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button mode="text" onPress={() => setShowDeleteModal(false)}>Hủy</Button>
              <Button mode="contained" style={{ marginLeft: 10, backgroundColor:'#6594daff' }} onPress={handleDeleteUser}>Xóa</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F0FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#d6e6f7', borderBottomLeftRadius:12, borderBottomRightRadius:12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color:'#1E90FF' },
  card: { marginVertical: 6, padding: 10, borderRadius:10, backgroundColor:'#fff', shadowColor:"#000", shadowOffset:{width:0,height:2}, shadowOpacity:0.2, shadowRadius:3, elevation:3 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width:50, height:50, borderRadius:25, marginRight:10 },
  avatarPlaceholder: { backgroundColor:'#1E90FF', justifyContent:'center', alignItems:'center' },
  info: { flex: 1 },
  username: { fontSize:16, fontWeight:'bold', color:'#333' },
  email: { fontSize:14, color:'#555' },
  actions: { flexDirection:'row' },
  iconButton: { backgroundColor:'#E6F0FF', marginHorizontal:2, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.2, shadowRadius:1, elevation:2 },
  addButtonContainer: { position:'absolute', bottom:20, right:20 },
  addButton: { backgroundColor:'#fff', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.3, shadowRadius:3, elevation:4, borderRadius:24 },
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  modalContainer: { width:300, padding:20, backgroundColor:'#fff', borderRadius:12, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.25, shadowRadius:5, elevation:6 }
});
