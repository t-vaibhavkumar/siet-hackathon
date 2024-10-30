import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import { getCurrentUser, signIn } from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import { StatusBar } from "expo-status-bar";

const SignIn = () => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    setSubmitting(true);

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);

      // Alert.alert("Success", "User signed in successfully");
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="mt-48 items-center justify-center">
          <Text className="text-center font-rbold text-5xl ">
            Sign In
          </Text>
        </View>

        <View className="mt-36">
          <FormField
            mainView="mt-10"
            title="Email"
            value={`${form.email}`}
            containerStyles="w-[30vh] bg-gray-400 justify-center px-4 py-2 mt-2 ml-[80px]"
            handleChangeText={(e) => {setForm({...form, email: e})} }
            placeHolder="Enter your email"
            keyboardType="email"
          />

          <FormField
            mainView="mt-10"
            title="Password"
            value={`${form.password}`}
            containerStyles="w-[30vh] bg-gray-400 justify-center px-4 py-2 mt-2 ml-[80px]"
            handleChangeText={(e) => {setForm({...form, password: e})} }
            placeHolder="Enter your password"
            keyboardType="password"
          />
        </View>

        <View className="items-center justify-end flex-1 mt-14">
          <CustomButton 
            handlePress={submit}
            title="Sign In"
            containerStyles="bg-[#816EB4] rounded-2xl"
            textStyles="px-7 py-4 text-2xl font-rmedium"
            isLoading={isSubmitting}
          />
          <View className="flex-row mt-5">
            <Text className="font-rregular text-[16px]">Don't have a account? </Text>
            <Link href="sign-up" className="font-rbold text-[16px]">Sign Up</Link>
          </View>
        </View>
      </ScrollView>
      
      <StatusBar barStyle="dark-content"/>
    </SafeAreaView>
  );
};

export default SignIn;
