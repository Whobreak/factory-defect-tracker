import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  name: string;
  role: string;
  bands: string[];
}

interface ProfilePageProps {
  currentUser?: {
    name: string;
    avatar?: string;
  };
}

const bandsList = ['Band 1', 'Band 2'];

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser }) => {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'band çalışanı1', role: 'Admin', bands: ['Band 1'] },
    { id: '2', name: 'band çalışanı2', role: 'User', bands: ['Band 2'] },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempBands, setTempBands] = useState<string[]>([]);
  const [tempRole, setTempRole] = useState<'Admin' | 'User'>('User'); // ✅ rol state

  const openAddUserModal = () => {
    setEditingUser(null);
    setTempName('');
    setTempBands([]);
    setTempRole('User');
    setModalVisible(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setTempName(user.name);
    setTempBands(user.bands);
    setTempRole(user.role as 'Admin' | 'User');
    setModalVisible(true);
  };

  const handleSaveUser = () => {
    if (!tempName) return;

    if (editingUser) {
      const updatedUser: User = { ...editingUser, name: tempName, bands: tempBands, role: tempRole };
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        name: tempName,
        role: tempRole,
        bands: tempBands,
      };
      setUsers([...users, newUser]);
    }
    setModalVisible(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const toggleBand = (band: string) => {
    if (tempBands.includes(band)) {
      setTempBands(tempBands.filter(b => b !== band));
    } else {
      setTempBands([...tempBands, band]);
    }
  };

  const handleLogout = () => {
    router.replace('/(auth)/sign-in'); // ✅ login ekranına yönlendir
  };

  const renderUserItem = (user: User) => (
    <View key={user.id} style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>{user.role} - {user.bands.join(', ')}</Text>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditUserModal(user)}
        >
          <Text style={styles.actionButtonText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(user.id)}
        >
          <Text style={styles.actionButtonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Profil Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            {currentUser?.avatar ? (
              <Image source={{ uri: currentUser.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>
                  {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{currentUser?.name || 'ADMİN'}</Text>
        </View>

        {/* Kullanıcı Yönetimi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kullanıcı Yönetimi</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddUserModal}>
              <Text style={styles.addButtonText}>+ Kullanıcı Ekle</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.usersList}>{users.map(renderUserItem)}</View>
        </View>
      </ScrollView>

      {/* Çıkış Yap Butonu */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
            </Text>
            <TextInput
              placeholder="Kullanıcı Adı"
              value={tempName}
              onChangeText={setTempName}
              style={styles.input}
            />

            {/* ✅ Rol seçimi */}
            <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Rol Seçimi:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleOption, tempRole === 'User' && styles.roleSelected]}
                onPress={() => setTempRole('User')}
              >
                <Text style={[styles.roleText, tempRole === 'User' && styles.roleTextSelected]}>
                  User
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, tempRole === 'Admin' && styles.roleSelected]}
                onPress={() => setTempRole('Admin')}
              >
                <Text style={[styles.roleText, tempRole === 'Admin' && styles.roleTextSelected]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>

            {/* ✅ Bant seçimi */}
            <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Bant Seçimi:</Text>
            {bandsList.map(band => (
              <View key={band} style={styles.checkboxContainer}>
                <Checkbox
                  value={tempBands.includes(band)}
                  onValueChange={() => toggleBand(band)}
                />
                <Text style={styles.checkboxLabel}>{band}</Text>
              </View>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveUser}>
                <Text style={styles.buttonText}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { flex: 1 },
  profileHeader: { alignItems: 'center', padding: 20, backgroundColor: '#fff', marginBottom: 10 },
  profileAvatar: { marginBottom: 15 },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  defaultAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  section: { backgroundColor: '#fff', margin: 10, borderRadius: 8, padding: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  addButton: { backgroundColor: '#28a745', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  usersList: { gap: 10 },
  userItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#e9ecef' },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6c757d', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  userAvatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  userDetails: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: '#333' },
  userRole: { fontSize: 12, color: '#007AFF', marginTop: 2 },
  userActions: { flexDirection: 'row', gap: 8 },
  actionButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  editButton: { backgroundColor: '#ffc107' },
  deleteButton: { backgroundColor: '#dc3545' },
  actionButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginTop: 5 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  checkboxLabel: { marginLeft: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  saveButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, flex: 1, marginRight: 5, alignItems: 'center' },
  cancelButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#6c757d', padding: 14, borderRadius: 8, alignItems: 'center', margin: 16 },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // ✅ Rol seçimi stilleri
  roleContainer: { flexDirection: 'row', marginTop: 5, marginBottom: 10 },
  roleOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginRight: 10,
  },
  roleSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  roleText: { fontSize: 14, color: '#333' },
  roleTextSelected: { color: '#fff', fontWeight: 'bold' },
});

export default ProfilePage;
