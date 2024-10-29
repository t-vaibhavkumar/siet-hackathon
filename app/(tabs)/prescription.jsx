import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { uploadPrescriptionFile, createPrescriptionRecord, getPrescriptions } from "../../lib/appwrite";
import { CustomButton } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const PrescriptionUpload = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [prescriptions, setPrescriptions] = useState({ active: [], inactive: [] });
  const [form, setForm] = useState({
    prescriptionFile: null,
    fileType: "",
  });

  useEffect(() => {
    if (user) fetchPrescriptions();
  }, [user]);

  // Fetch existing prescriptions
  const fetchPrescriptions = async () => {
    try {
      const data = await getPrescriptions(user.$id);
      const active = data.filter((pres) => pres.status === "active");
      const inactive = data.filter((pres) => pres.status === "inactive");
      setPrescriptions({ active, inactive });
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
    }
  };

  // Open Document Picker for Image or PDF
  const openPicker = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/jpeg", "image/png", "application/pdf"],
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedFile = {
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType,
        name: result.assets[0].name,
      };
  
      setForm({
        ...form,
        prescriptionFile: selectedFile, // Pass the formatted file object
      });
    } else {
      Alert.alert("Error", "No file selected.");
    }
  };

  // Submit prescription
  const submitPrescription = async () => {
    if (!form.prescriptionFile) {
      return Alert.alert("Error", "Please select a file.");
    }

    setUploading(true);
    try {
      // 1. Upload the file to the bucket
      const fileId = await uploadPrescriptionFile(form.prescriptionFile, form.fileType);

      // 2. Create a document in the `prescriptions` collection with file details
      await createPrescriptionRecord(user.$id, fileId, form.fileType);

      Alert.alert("Success", "Prescription uploaded successfully");
      fetchPrescriptions(); // Refresh list after upload
    } catch (error) {
      Alert.alert("Error", "Failed to upload prescription.");
    } finally {
      setUploading(false);
      setForm({ prescriptionFile: null, fileType: "" });
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-semibold">Upload Prescription</Text>

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100">Prescription File</Text>
          <TouchableOpacity onPress={openPicker}>
            {form.prescriptionFile ? (
              form.fileType === "application/pdf" ? (
                <Text className="text-blue-500 underline">View PDF</Text>
              ) : (
                <Image
                  source={{ uri: form.prescriptionFile.uri }}
                  resizeMode="cover"
                  className="w-full h-64 rounded-2xl"
                />
              )
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 flex justify-center items-center">
                <Text className="text-sm text-gray-100">Choose a file</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Submit Prescription"
          handlePress={submitPrescription}
          containerStyles="mt-7"
          isLoading={uploading}
        />

        <View className="mt-7">
          <Text className="text-xl text-white font-semibold">Active Prescriptions</Text>
          <View className="flex-row flex-wrap">
            {prescriptions.active.map((pres) => (
              <TouchableOpacity key={pres.$id} onPress={() => {}}>
                {pres.fileType === "application/pdf" ? (
                  <Text className="text-blue-500 underline">View PDF</Text>
                ) : (
                  <Image
                    source={{ uri: pres.fileId }} // Adjust based on how getFilePreview returns URL
                    className="w-24 h-24 rounded-lg m-2"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-xl text-white font-semibold mt-5">Inactive Prescriptions</Text>
          <View className="flex-row flex-wrap">
            {prescriptions.inactive.map((pres) => (
              <TouchableOpacity key={pres.$id} onPress={() => {}}>
                {pres.fileType === "application/pdf" ? (
                  <Text className="text-blue-500 underline">View PDF</Text>
                ) : (
                  <Image
                    source={{ uri: pres.fileId }} // Adjust based on how getFilePreview returns URL
                    className="w-24 h-24 rounded-lg m-2"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrescriptionUpload;
