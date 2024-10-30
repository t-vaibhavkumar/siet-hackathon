import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Image, ScrollView, TouchableOpacity, Text, TextInput, Alert } from "react-native";

import { icons } from "../../constants";
import { signOut, updateUserProfile } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { InfoBox, CustomButton } from "../../components";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const [isEditing, setIsEditing] = useState(false); // Editing mode toggle
  const [medicalInfo, setMedicalInfo] = useState({
    bloodType: user?.blood_type || "O+",
    medicalConditions: user?.medical_conditions || "",
    height: user?.height?.toString() || "",
    weight: user?.weight?.toString() || "",
    emergencyContact: user?.emergency_contact?.toString() || "",
  });

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
  };

  // Update user profile data in the database
  const handleSaveChanges = async () => {
    try {
      await updateUserProfile(user.$id, {
        blood_type: medicalInfo.bloodType || null,
        medical_conditions: medicalInfo.medicalConditions || null,
        height: medicalInfo.height ? parseFloat(medicalInfo.height) : null,
        weight: medicalInfo.weight ? parseFloat(medicalInfo.weight) : null,
        emergency_contact: medicalInfo.emergencyContact || null,
      });
  
      Alert.alert("Success", "Your medical information has been updated.");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <SafeAreaView className="h-full">
      <ScrollView className="px-4 my-6" keyboardShouldPersistTaps="handled">
        {/* Logout Button */}
        <TouchableOpacity onPress={logout} className="absolute left-[40vh]">
          <Image source={icons.logout} resizeMode="contain" className="w-6 h-6" />
        </TouchableOpacity>

        {/* Profile Picture and Username */}
        <View className="flex items-center mb-6">
          <View className="w-24 h-24 border border-secondary rounded-full overflow-hidden mb-3">
            <Image source={{ uri: user?.avatar }} className="w-full h-full" resizeMode="cover" />
          </View>
          <InfoBox 
            title={user?.username} 
            containerStyles="mt-2" 
            titleStyles="text-lg text-black font-semibold" 
          />
        </View>

        <View className="w-full px-4">
          <Text className="text-lg font-semibold text-black mb-4 underline font-rmedium">Medical Information</Text>

          {isEditing ? (
            <>
              <TextInputField
                label="Blood Type"
                value={medicalInfo.bloodType}
                onChangeText={(text) => setMedicalInfo({ ...medicalInfo, bloodType: text })}
                placeholder="Blood Type"
              />
              <TextInputField
                label="Medical Conditions and Allergies"
                value={medicalInfo.medicalConditions}
                onChangeText={(text) => setMedicalInfo({ ...medicalInfo, medicalConditions: text })}
                placeholder="Medical Conditions"
              />
              <TextInputField
                label="Height (cm)"
                value={medicalInfo.height}
                onChangeText={(text) => setMedicalInfo({ ...medicalInfo, height: text })}
                placeholder="Height"
                keyboardType="numeric"
              />
              <TextInputField
                label="Weight (kg)"
                value={medicalInfo.weight}
                onChangeText={(text) => setMedicalInfo({ ...medicalInfo, weight: text })}
                placeholder="Weight"
                keyboardType="numeric"
              />
              <TextInputField
                label="Emergency Contact"
                value={medicalInfo.emergencyContact}
                onChangeText={(text) => setMedicalInfo({ ...medicalInfo, emergencyContact: text })}
                placeholder="Emergency Contact"
                keyboardType="phone-pad"
              />
            </>
          ) : (
            <>
              <Text className="text-black mt-2 font-rmedium" >Blood Type: {medicalInfo.bloodType}</Text>
              <Text className="text-black mt-2 font-rmedium">Allergies/Medical Condition: {medicalInfo.medicalConditions}</Text>
              <Text className="text-black mt-2 font-rmedium">Height: {medicalInfo.height} cm</Text>
              <Text className="text-black mt-2 font-rmedium">Weight: {medicalInfo.weight} kg</Text>
              <Text className="text-black mt-2 font-rmedium">Emergency Contact: {medicalInfo.emergencyContact}</Text>
            </>
          )}
        </View>

        {/* Edit and Save Button */}
        <CustomButton 
          title={isEditing ? "Save Changes" : "Edit Profile"} 
          handlePress={isEditing ? handleSaveChanges : () => setIsEditing(true)} 
          containerStyles="bg-[#ffa300] rounded-full mt-8 mx-4"
          textStyles="py-3 text-xl font-semibold text-center text-black"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Custom reusable input field component for a cleaner layout
const TextInputField = ({ label, value, onChangeText, placeholder, keyboardType = "default" }) => (
  <View className="mb-4">
    <Text className="text-base text-black font-rregular mb-1">{label}</Text>
    <TextInput
      style={{ backgroundColor: 'white', padding: 10, borderRadius: 8, fontStyle:'RobotoMonoBold' }}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      placeholderTextColor="#888"
    />
  </View>
);

export default Profile;
