import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Modal, FlatList, ActivityIndicator, Dimensions, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

interface Consumer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
}

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(true); // Set to true to show the modal on load
  const [consumers, setConsumers] = useState<Consumer[]>([]);
  const [newConsumer, setNewConsumer] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '',
    role: 'consumer' // Set default role
  });
  const [editingConsumer, setEditingConsumer] = useState<Consumer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Pagination and Search states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [itemsPerPage] = useState(10);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState<Consumer>({
    _id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'consumer'
  });

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', 
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.token) {
        setIsLoggedIn(true);
        setModalVisible(false);
        setToken(response.data.token); // Save the token
        fetchConsumers(response.data.token); // Fetch consumers with token
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setConsumers([]);
    setToken(null);
  };

  const fetchConsumers = async (authToken?: string, page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3000/api/consumers`, {
        headers: {
          Authorization: `Bearer ${authToken || token}`,
        },
        params: {
          page,
          limit: itemsPerPage,
          search,
        },
      });
      setConsumers(response.data.consumers);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
      setCurrentPage(page);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch consumers.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConsumer = async () => {
    try {
      if (!newConsumer.name || !newConsumer.email || !newConsumer.phone) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      await axios.post('http://localhost:3000/api/consumers', newConsumer, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewConsumer({ name: '', email: '', phone: '', address: '', role: 'consumer' });
      fetchConsumers();
      Alert.alert('Success', 'User added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add user.');
    }
  };

  const handleEditPress = (consumer: Consumer) => {
    setEditingConsumer(consumer);
    setEditForm(consumer);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      if (!editingConsumer || !token) return;

      await axios.put(
        `http://localhost:3000/api/consumers/${editingConsumer._id}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditModalVisible(false);
      setEditingConsumer(null);
      fetchConsumers(token, currentPage, searchQuery);
      Alert.alert('Success', 'Consumer updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update consumer');
    }
  };

  const handleDeleteConsumer = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/consumers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchConsumers();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete consumer.');
    }
  };

  // Handle search input with debounce
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      if (token) {
        fetchConsumers(token, 1, text);
      }
    }, 500);
    setSearchTimeout(timeout);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && token) {
      fetchConsumers(token, page, searchQuery);
    }
  };

  return (
    <View style={styles.container}>
      {/* Login Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isMobile && styles.mobileModalContent]}>
            <Text style={styles.modalTitle}>Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {isLoggedIn && (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Dairy Management System</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.screenContainer}>
            {/* Add Consumer Form */}
            <View style={[styles.addConsumerContainer, isMobile && styles.mobileCard]}>
              <Text style={styles.sectionTitle}>Add New User</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.flexInput]}
                  placeholder="Name"
                  value={newConsumer.name}
                  onChangeText={(text) => setNewConsumer({ ...newConsumer, name: text })}
                />
                <TextInput
                  style={[styles.input, styles.flexInput]}
                  placeholder="Email"
                  value={newConsumer.email}
                  onChangeText={(text) => setNewConsumer({ ...newConsumer, email: text })}
                />
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, styles.flexInput]}
                  placeholder="Phone"
                  value={newConsumer.phone}
                  onChangeText={(text) => setNewConsumer({ ...newConsumer, phone: text })}
                />
                <View style={[styles.pickerContainer, styles.flexInput]}>
                  <Picker
                    selectedValue={newConsumer.role}
                    style={styles.picker}
                    onValueChange={(value: string) => setNewConsumer({ ...newConsumer, role: value })}
                  >
                    <Picker.Item label="Consumer" value="consumer" />
                    <Picker.Item label="Delivery" value="delivery" />
                  </Picker>
                </View>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Address"
                value={newConsumer.address}
                onChangeText={(text) => setNewConsumer({ ...newConsumer, address: text })}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddConsumer}>
                <Text style={styles.addButtonText}>Add User</Text>
              </TouchableOpacity>
            </View>

            {/* Consumer List */}
            <View style={[styles.consumersListContainer, isMobile && styles.mobileCard]}>
              <Text style={styles.sectionTitle}>Consumer List</Text>
              
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search consumers..."
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>

              {isLoading ? (
                <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
              ) : (
                <>
                  <FlatList
                    data={consumers}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                      <View style={[styles.consumerItem, isMobile && styles.mobileConsumerItem]}>
                        <View style={styles.consumerInfo}>
                          <Text style={styles.consumerName}>{item.name}</Text>
                          <Text style={styles.consumerDetail}>{item.email}</Text>
                          <Text style={styles.consumerDetail}>{item.phone}</Text>
                          <Text style={styles.consumerDetail}>{item.address}</Text>
                        </View>
                        <View style={[styles.consumerActions, isMobile && styles.mobileConsumerActions]}>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.editButton]} 
                            onPress={() => handleEditPress(item)}
                          >
                            <Text style={styles.actionButtonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.deleteButton]} 
                            onPress={() => handleDeleteConsumer(item._id)}
                          >
                            <Text style={styles.actionButtonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />

                  {/* Pagination Controls */}
                  <View style={styles.paginationContainer}>
                    <TouchableOpacity
                      style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
                      onPress={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <Text style={styles.paginationButtonText}>Previous</Text>
                    </TouchableOpacity>
                    <Text style={styles.pageInfo}>
                      Page {currentPage} of {totalPages}
                    </Text>
                    <TouchableOpacity
                      style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
                      onPress={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <Text style={styles.paginationButtonText}>Next</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isMobile && styles.mobileModalContent]}>
            <Text style={styles.modalTitle}>Edit Consumer</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={editForm.phone}
              onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={editForm.address}
              onChangeText={(text) => setEditForm({ ...editForm, address: text })}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleEditSubmit}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    padding: isMobile ? 10 : 20,
  },
  addConsumerContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  mobileCard: {
    marginHorizontal: 0,
    borderRadius: 5,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  flexInput: {
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  consumersListContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  consumerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mobileConsumerItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  consumerInfo: {
    flex: 1,
  },
  consumerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  consumerDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  consumerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileConsumerActions: {
    marginTop: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: isMobile ? '90%' : 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  mobileModalContent: {
    width: '95%',
    padding: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  paginationButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  paginationButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pageInfo: {
    marginHorizontal: 15,
    color: '#666',
  },
  loader: {
    marginVertical: 20,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    width: '100%',
  },
});
