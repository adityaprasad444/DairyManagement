import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Subscription, Billing } from '../../types';

const ConsumerDashboard = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [bills, setBills] = useState<Billing[]>([]);

  const renderSubscriptionItem = ({ item }: { item: Subscription }) => (
    <View style={styles.subscriptionCard}>
      <Text style={styles.subscriptionName}>{item.name}</Text>
      <Text style={styles.subscriptionDescription}>{item.description}</Text>
      <Text style={styles.subscriptionPrice}>₹{item.price}/month</Text>
      <TouchableOpacity style={styles.subscribeButton}>
        <Text style={styles.subscribeButtonText}>Subscribe</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBillItem = ({ item }: { item: Billing }) => (
    <View style={styles.billCard}>
      <Text style={styles.billId}>Bill #{item.id}</Text>
      <Text style={styles.billAmount}>Amount: ₹{item.amount}</Text>
      <Text style={styles.billStatus}>Status: {item.status}</Text>
      <Text style={styles.billDueDate}>
        Due Date: {new Date(item.dueDate).toLocaleDateString()}
      </Text>
      {item.status === 'pending' && (
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Consumer Dashboard</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Subscriptions</Text>
        <FlatList
          data={subscriptions}
          renderItem={renderSubscriptionItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subscriptionList}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Bills</Text>
        <FlatList
          data={bills}
          renderItem={renderBillItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    padding: 15,
  },
  subscriptionList: {
    paddingHorizontal: 10,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    width: 250,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  subscriptionPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 10,
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  billCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  billId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  billAmount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  billStatus: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  billDueDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  payButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ConsumerDashboard; 