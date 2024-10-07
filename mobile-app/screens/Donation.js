import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function Donation({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support Wildlife Conservation</Text>

      {/* How Funds Will Be Used */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How Your Donations Help</Text>
        <Text style={styles.sectionContent}>
          Your generous donations help protect endangered wildlife and support sustainable tourism efforts at the Semenggoh Nature Reserve. Donations go towards:
        </Text>
        <Text style={styles.list}>
          - Habitat restoration{'\n'}
          - Orangutan rehabilitation programs{'\n'}
          - Educational programs for visitors and locals{'\n'}
          - Wildlife monitoring and research
        </Text>
      </View>

      {/* Online Donation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Make a Donation Online</Text>
        <Text style={styles.sectionContent}>
          You can make a secure online donation through our website. Every contribution, no matter how small, makes a difference!
        </Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Payment')}  // Navigate to Payment screen
        >
          <Text style={styles.buttonText}>Donate Online</Text>
        </TouchableOpacity>
      </View>

      {/* Physical Donations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Physical Donations</Text>
        <Text style={styles.sectionContent}>
          Prefer to make a donation in person? You can visit us at the visitor center and donate directly. All donations are greatly appreciated!
        </Text>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.sectionContent}>
          For more information on how your donations can help, feel free to contact us at:
        </Text>
        <Text style={styles.contactInfo}>
          Phone: +60 82-617300{'\n'}
          Email: donations@semenggohnaturereserve.com
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B95E0',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  list: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#1B95E0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactInfo: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginTop: 10,
  },
});
