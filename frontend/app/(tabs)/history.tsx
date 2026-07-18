import React from 'react';
import { View, FlatList, Pressable, Text, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { PatientHeader, PatientCard } from '../../components/patients/PatientComponents';
import SearchBar from '../../components/reports/SearchBar';
import { usePatients } from '../../hooks/usePatients';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

export default function HistoryScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { filteredPatients, isLoading, searchQuery, setSearchQuery } = usePatients();

  return (
    <ScreenContainer scrollable={false}>
      {/* Tab Root Patient Header (No Back Button) */}
      <PatientHeader 
        title="Patient Intake Registry" 
        subtitle="Hospital EHR Case files" 
      />

      <View className={`flex-1 ${isTablet ? 'px-12' : 'px-5'} pt-3`}>
        {/* Search bar and Add quick action */}
        <View className="flex-row gap-2 mb-4 items-center">
          <View className="flex-1">
            <SearchBar 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
              placeholder="Search patient name, ID, or notes..." 
            />
          </View>
          
          <Pressable
            onPress={() => router.push('/patients/add')}
            className="w-10 h-10 rounded-xl bg-primary dark:bg-primary-dark items-center justify-center shadow-sm shadow-primary/10"
            style={({ pressed }) => pressed && { opacity: 0.9 }}
            accessibilityRole="button"
            accessibilityLabel="Add new patient"
          >
            <Ionicons name="add" size={20} color="white" />
          </Pressable>
        </View>

        {/* Patients Registry List */}
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          removeClippedSubviews={true}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={
            <View className="py-12 px-4 items-center justify-center" accessibilityRole="text" accessibilityLabel="No patients found">
              <View className="w-12 h-12 rounded-full bg-border/20 dark:bg-border-dark/20 items-center justify-center mb-4">
                <Ionicons name="people-outline" size={24} color={isDark ? '#C4C7C5' : '#5F6368'} />
              </View>
              <Text className="text-sm font-bold text-text dark:text-text-dark text-center">
                No Patients Found
              </Text>
              <Text className="text-xs text-subText dark:text-subText-dark text-center mt-1.5 leading-5 max-w-[260px]">
                {isLoading ? 'Loading patient records...' : (searchQuery ? `No matching records found for "${searchQuery}".` : 'Add patient records to link AI segmentation scans.')}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <PatientCard
              patient={item}
              index={index}
              onPress={() => router.push(`/patients/${item.id}` as any)}
            />
          )}
        />
      </View>
    </ScreenContainer>
  );
}
