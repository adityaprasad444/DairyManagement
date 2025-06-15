import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Delivery } from '../../types';

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  const updateDeliveryStatus = (deliveryId: string, newStatus: Delivery['status']) => {
    setDeliveries(prevDeliveries =>
      prevDeliveries.map(delivery =>
        delivery.id === deliveryId
          ? { ...delivery, status: newStatus }
          : delivery
      )
    );
  };

  const renderDeliveryItem = ({ item }: { item: Delivery }) => (
    <View style={styles.deliveryCard}>
      <Text style={styles.deliveryId}>Delivery #{item.id}</Text>
      <Text style={styles.address}>Address: {item.address}</Text>
      <Text style={styles.date}>
        Date: {new Date(item.deliveryDate).toLocaleDateString()}
      </Text>
      <View style={styles.statusContainer}>
        <Text style={styles.status}>Status: {item.status}</Text>
        {item.status !== 'delivered' && (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => {
              const newStatus = item.status === 'pending' ? 'in-progress' : 'delivered';
              updateDeliveryStatus(item.id, newStatus);
            }}
          >
            <Text style={styles.updateButtonText}>
              {item.status === 'pending' ? 'Start Delivery' : 'Mark as Delivered'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Delivery Dashboard</Text>
      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
  },
  listContainer: {
    padding: 10,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deliveryId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DeliveryDashboard; 