import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { 
  uploadPrescriptionFile, 
  createPrescriptionRecord, 
  getPrescriptions, 
  updatePrescriptionStatus, 
  getFilePreview 
} from "../../lib/appwrite";
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
  const [selectedImage, setSelectedImage] = useState(null); // State for modal image
  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility

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
        prescriptionFile: selectedFile,
        fileType: selectedFile.mimeType,
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
      const fileId = await uploadPrescriptionFile(form.prescriptionFile);

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

  // Toggle status between Active and Inactive
  const toggleStatus = async (prescription) => {
    const newStatus = prescription.status === "active" ? "inactive" : "active";
    try {
      await updatePrescriptionStatus(prescription.$id, newStatus);
      fetchPrescriptions(); // Refresh prescription list after toggle
    } catch (error) {
      console.error("Failed to toggle status:", error);
      Alert.alert("Error", "Failed to update prescription status.");
    }
  };

  // Open image in modal for a larger view
  const openImageModal = (fileId) => {
    const fullSizeImageUrl = getFilePreview(fileId); // Get full-size URL from storage
    setSelectedImage(fullSizeImageUrl);
    setModalVisible(true);
  };

  return (
    <SafeAreaView className=" h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-black font-rbold">Upload Prescription</Text>

        <View className="mt-7 space-y-2">
          <Text className="text-base text-black font-rmedium">Prescription File</Text>
          <TouchableOpacity onPress={openPicker}>
            {form.prescriptionFile ? (
              form.fileType === "application/pdf" ? (
                <Text className="text-blue-500 underline font-rregular">View PDF</Text>
              ) : (
                form.prescriptionFile.uri && ( // Check for valid URI
                  <Image
                    source={{ uri: form.prescriptionFile.uri }}
                    resizeMode="cover"
                    className="w-full h-64 rounded-2xl"
                  />
                )
              )
            ) : (
              <View className="w-full h-16 px-4 bg-gray-100 rounded-2xl border-2 border-black-200 flex justify-center items-center">
                <Text className="text-sm text-black-100 font-rmedium">Choose a file</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Submit Prescription"
          handlePress={submitPrescription}
          containerStyles="bg-[#ffa300] rounded-2xl mt-6"
          textStyles="px-7 py-4 text-2xl font-rmedium text-center"
          isLoading={uploading}
        />

        {/* Active Prescriptions Heading */}
        <View className="my-5 p-3 bg-gray-700 rounded-lg">
          <Text className="text-xl text-white font-semibold text-center font-rbold">Active Prescriptions</Text>
        </View>
        <View className="flex-row flex-wrap justify-center">
          {prescriptions.active.map((pres) => (
            <View key={pres.$id} className="m-2 items-center">
              <TouchableOpacity onPress={() => openImageModal(pres.fileId)}>
                {getFilePreview(pres.fileId, pres.fileType) && ( // Check if file URI exists
                  <Image
                    source={{ uri: getFilePreview(pres.fileId, pres.fileType) }} // Thumbnail preview
                    className="w-24 h-24 rounded-lg"
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleStatus(pres)}
                className="mt-2 bg-red-600 px-3 py-1 rounded"
              >
                <Text className="text-white font-rbold">Set Inactive</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Inactive Prescriptions Heading */}
        <View className="my-5 p-3 bg-gray-700 rounded-lg">
          <Text className="text-xl text-white font-rbold text-center">Inactive Prescriptions</Text>
        </View>
        <View className="flex-row flex-wrap justify-center">
          {prescriptions.inactive.map((pres) => (
            <View key={pres.$id} className="m-2 items-center">
              <TouchableOpacity onPress={() => openImageModal(pres.fileId)}>
                {getFilePreview(pres.fileId, pres.fileType) && ( // Check if file URI exists
                  <Image
                    source={{ uri: getFilePreview(pres.fileId, pres.fileType) }} // Thumbnail preview
                    className="w-24 h-24 rounded-lg"
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleStatus(pres)}
                className="mt-2 bg-green-600 px-3 py-1 rounded"
              >
                <Text className="text-white font-rbold">Set Active</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Modal to display full-sized image */}
        <Modal visible={isModalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black bg-opacity-75">
            <TouchableOpacity onPress={() => setModalVisible(false)} className="absolute top-5 right-5">
              <Text className="text-white text-xl">X</Text>
            </TouchableOpacity>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                resizeMode="contain"
                className="w-3/4 h-3/4"
              />
            )}
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrescriptionUpload;
