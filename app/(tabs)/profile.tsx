import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '~/hooks/useTheme';
import { currentUser, mockUsers, mockErrorCodes, addUser, addErrorCode, User, ErrorCode } from '~/services/mock';
import { getUserRole, getUserName, getUserLine } from '~/services/storage';
import LogoLight from '~/sersim-light.svg';
import LogoDark from '~/sersim-dark.svg';
import { useAuth } from '~/contexts/AuthContext';







// handle sign in butona eklenecek 06.09.2025










const bandOptions = [
  'Pişirici 1', 'Pişirici 2', 'Pişirici 3', 'Pişirici 4', 'Pişirici 5',
  'Pişirici 6', 'Pişirici 7', 'Pişirici 8', 'Pişirici 9', 'Pişirici 10',
  'Soğutucu 1', 'Soğutucu 2', 'Soğutucu 3', 'Soğutucu 4', 'Soğutucu 5',
  'Soğutucu 6', 'Soğutucu 7', 'Soğutucu 8', 'Soğutucu 9', 'Soğutucu 10'
];

const ProfilePage = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [errorCodes, setErrorCodes] = useState<ErrorCode[]>(mockErrorCodes);
  const [userRole, setUserRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [userLine, setUserLine] = useState<string>('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [bandDropdownOpen, setBandDropdownOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingError, setEditingError] = useState<ErrorCode | null>(null);
  
  const [tempName, setTempName] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [tempRole, setTempRole] = useState<'admin' | 'user'>('user');
  const [tempBands, setTempBands] = useState<string[]>([]);
  
  const [tempErrorCode, setTempErrorCode] = useState('');
  const [tempErrorDesc, setTempErrorDesc] = useState('');

  const styles = getStyles(colors, isDark);

  // Load user role, username and line from storage
  useEffect(() => {
    (async () => {
      const role = await getUserRole();
      const name = await getUserName();
      const line = await getUserLine();
      setUserRole(role || '');
      setUsername(name || '');
      setUserLine(line || '');
    })();
  }, []);

  // Admin kontrolü
  const isAdmin = userRole === 'SuperAdmin';

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setTempName(user.username);
      setTempPassword(user.password);
      setTempRole(user.role);
      setTempBands([user.line]); // mock.ts'de line string olarak tutuluyor
    } else {
      setEditingUser(null);
      setTempName('');
      setTempPassword('');
      setTempRole('user');
      setTempBands([]);
    }
    setModalVisible(true);
    setBandDropdownOpen(false);
  };

  const openErrorModal = (error?: ErrorCode) => {
    if (error) {
      setEditingError(error);
      setTempErrorCode(error.code);
      setTempErrorDesc(error.description);
    } else {
      setEditingError(null);
      setTempErrorCode('');
      setTempErrorDesc('');
    }
    setErrorModalVisible(true);
  };

  const saveUser = () => {
    if (!tempName || !tempPassword) return;
    
    if (editingUser) {
      // Güncelleme
      setUsers(users.map(u => u.id === editingUser.id ? { 
        ...editingUser, 
        name: tempName,
        password: tempPassword,
        role: tempRole,
        line: tempBands[0] || ''
      } : u));
    } else {
      // Yeni kullanıcı ekleme
      addUser(tempName, tempBands[0] || '', tempPassword);
      setUsers([...users, { 
        id: users.length + 1, 
        username: tempName,
        password: tempPassword,
        role: tempRole,
        line: tempBands[0] || ''
      }]);
    }
    setModalVisible(false);
  };

  const saveErrorCode = () => {
    if (!tempErrorCode || !tempErrorDesc) return;
    
    if (editingError) {
      setErrorCodes(errorCodes.map(e => e.id === editingError.id ? { 
        ...editingError, 
        code: tempErrorCode, 
        description: tempErrorDesc 
      } : e));
    } else {
      addErrorCode(tempErrorCode, tempErrorDesc);
      setErrorCodes([...errorCodes, { 
        id: errorCodes.length + 1, 
        code: tempErrorCode, 
        description: tempErrorDesc 
      }]);
    }
    setErrorModalVisible(false);
  };

  const deleteUser = (id: number) => setUsers(users.filter(u => u.id !== id));
  const deleteError = (id: number) => setErrorCodes(errorCodes.filter(e => e.id !== id));

  const toggleBand = (band: string) => {
    setTempBands(prev => prev.includes(band) ? prev.filter(b => b !== band) : [...prev, band]);
  };

  // User rolündeki kullanıcılar için sadece çıkış yap butonu
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.userOnlyContainer}>
          {/* Header */}
          <View style={styles.header}>
            {isDark ? (
              <LogoDark width={150} height={60} />
            ) : (
              <LogoLight width={150} height={60} />
            )}
          </View>

          {/* Kullanıcı Bilgileri */}
          <View style={styles.userInfoCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{username[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <Text style={styles.userName}>{username || 'Kullanıcı'}</Text>
            <Text style={styles.userRole}>{userRole === 'SuperAdmin' ? 'Yönetici' : 'Çalışan'} - {userLine || 'Bant Yok'}</Text>
          </View>

        {isAdmin && (
          <TouchableOpacity 
            style={[styles.logoutBtn, { backgroundColor: colors.accent, marginBottom: 12 }]} 
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.logoutText}>Tüm Raporları Görüntüle</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/sign-in')}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Admin kullanıcıları için tam profil ekranı
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          {isDark ? (
            <LogoDark width={150} height={60} />
          ) : (
            <LogoLight width={150} height={60} />
          )}
        </View>

        {/* Kullanıcı Yönetimi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kullanıcı Yönetimi</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
              <Text style={styles.addBtnText}>+ Kullanıcı Ekle</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.sectionScroll} nestedScrollEnabled>
            {users.map(user => (
              <View key={user.id} style={styles.userItem}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                                      <Text style={styles.userAvatarText}>{user.username[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.userName}>{user.username}</Text>
                    <Text style={styles.userRole}>{user.role === 'admin' ? 'Yönetici' : 'Çalışan'} - {user.line}</Text>
                  </View>
                </View>
                <View style={styles.userActions}>
                  <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openModal(user)}>
                    <Text style={styles.actionBtnText}>Düzenle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => deleteUser(user.id)}>
                    <Text style={styles.actionBtnText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Hata Kodu Yönetimi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hata Kodları</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => openErrorModal()}>
              <Text style={styles.addBtnText}>+ Hata Ekle</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.sectionScroll} nestedScrollEnabled>
            {errorCodes.map(error => (
              <View key={error.id} style={styles.userItem}>
                <View style={styles.userInfo}>
                  <View style={styles.errorIcon}>
                    <Text style={styles.errorIconText}>!</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{error.code}</Text>
                    <Text style={styles.userRole}>{error.description}</Text>
                  </View>
                </View>
                <View style={styles.userActions}>
                  <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openErrorModal(error)}>
                    <Text style={styles.actionBtnText}>Düzenle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => deleteError(error.id)}>
                    <Text style={styles.actionBtnText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/sign-in')}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Kullanıcı Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</Text>
            
            <TextInput placeholder="Kullanıcı Adı" placeholderTextColor={styles.placeholderColor.color} value={tempName} onChangeText={setTempName} style={styles.input} />
            <TextInput placeholder="Şifre" placeholderTextColor={styles.placeholderColor.color} value={tempPassword} onChangeText={setTempPassword} style={styles.input} secureTextEntry />

            <Text style={styles.label}>Rol:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity style={[styles.roleBtn, tempRole === 'user' && styles.roleBtnSelected]} onPress={() => setTempRole('user')}>
                <Text style={[styles.roleText, tempRole === 'user' && styles.roleTextSelected]}>Çalışan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.roleBtn, tempRole === 'admin' && styles.roleBtnSelected]} onPress={() => setTempRole('admin')}>
                <Text style={[styles.roleText, tempRole === 'admin' && styles.roleTextSelected]}>Yönetici</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Bant Seçimi:</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setBandDropdownOpen(!bandDropdownOpen)}>
              <Text style={styles.dropdownText}>
                {tempBands.length > 0 ? `${tempBands.length} bant seçildi` : 'Bant seçiniz'}
              </Text>
              <Text style={styles.dropdownArrow}>{bandDropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {bandDropdownOpen && (
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {bandOptions.map(band => (
                    <TouchableOpacity key={band} style={styles.dropdownItem} onPress={() => toggleBand(band)}>
                      <Text style={[styles.dropdownItemText, tempBands.includes(band) && styles.selectedText]}>
                        {tempBands.includes(band) ? '✓ ' : ''}{band}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveUser}>
                <Text style={styles.btnText}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Hata Kodu Modal */}
      <Modal visible={errorModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingError ? 'Hata Düzenle' : 'Yeni Hata Ekle'}</Text>
            
            <TextInput placeholder="Hata Kodu (E001)" placeholderTextColor={styles.placeholderColor.color} value={tempErrorCode} onChangeText={setTempErrorCode} style={styles.input} />
            <TextInput placeholder="Açıklama" placeholderTextColor={styles.placeholderColor.color} value={tempErrorDesc} onChangeText={setTempErrorDesc} style={styles.input} />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveErrorCode}>
                <Text style={styles.btnText}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setErrorModalVisible(false)}>
                <Text style={styles.btnText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  userOnlyContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: colors.surface, 
    margin: 16, 
    borderRadius: 30, 
    elevation: 3, 
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  userInfoCard: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  section: { 
    backgroundColor: colors.surface, 
    margin: 16, 
    borderRadius: 12, 
    padding: 20, 
    elevation: 3, 
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  sectionScroll: { maxHeight: 300 },
  addBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, elevation: 3 },
  addBtnText: { color: colors.primaryForeground, fontSize: 14, fontWeight: '600' },
  userItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: colors.surfaceSecondary, 
    borderRadius: 10, 
    marginBottom: 12, 
    elevation: 2, 
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2 
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userAvatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: colors.primary, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  userAvatarText: { color: colors.primaryForeground, fontSize: 16, fontWeight: 'bold' },
  errorIcon: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: colors.error, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  errorIconText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  userName: { fontSize: 16, fontWeight: '600', color: colors.text },
  userRole: { fontSize: 12, color: colors.primary, marginTop: 2, fontWeight: '500' },
  userActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  editBtn: { backgroundColor: colors.accent },
  deleteBtn: { backgroundColor: colors.error },
  actionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  logoutBtn: { 
    backgroundColor: colors.error, 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    margin: 16, 
    elevation: 3 
  },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modal: { 
    width: '88%', 
    backgroundColor: colors.surface, 
    padding: 24, 
    borderRadius: 16, 
    elevation: 10, 
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 6 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: colors.text, 
    textAlign: 'center' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: colors.border, 
    backgroundColor: colors.surfaceSecondary, 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 12, 
    color: colors.text, 
    fontSize: 16 
  },
  placeholderColor: { color: colors.textMuted },
  label: { 
    marginTop: 8, 
    marginBottom: 8, 
    fontWeight: 'bold', 
    color: colors.text, 
    fontSize: 16 
  },
  roleContainer: { flexDirection: 'row', marginBottom: 16, gap: 12 },
  roleBtn: { 
    borderWidth: 1, 
    borderColor: colors.border, 
    backgroundColor: colors.surfaceSecondary, 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    minWidth: 80, 
    alignItems: 'center' 
  },
  roleBtnSelected: { backgroundColor: colors.primary, borderColor: colors.primary, elevation: 3 },
  roleText: { fontSize: 14, color: colors.text },
  roleTextSelected: { fontWeight: 'bold', color: colors.primaryForeground },
  dropdownBtn: { 
    borderWidth: 1, 
    borderColor: colors.border, 
    backgroundColor: colors.surfaceSecondary, 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 8, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  dropdownText: { color: colors.text, fontSize: 16 },
  dropdownArrow: { color: colors.text, fontSize: 16 },
  dropdown: { 
    backgroundColor: colors.surfaceSecondary, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: colors.border, 
    marginBottom: 16, 
    maxHeight: 200 
  },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },
  dropdownItemText: { color: colors.text, fontSize: 16 },
  selectedText: { color: colors.primary, fontWeight: 'bold' },
  modalBtns: { flexDirection: 'row', marginTop: 24, gap: 12 },
  saveBtn: { 
    backgroundColor: colors.primary, 
    padding: 14, 
    borderRadius: 8, 
    flex: 1, 
    alignItems: 'center', 
    elevation: 3 
  },
  cancelBtn: { 
    backgroundColor: colors.textMuted, 
    padding: 14, 
    borderRadius: 8, 
    flex: 1, 
    alignItems: 'center' 
  },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});

export default ProfilePage;