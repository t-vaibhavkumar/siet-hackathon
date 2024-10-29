import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { createUser } from "../../lib/appwrite";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";
import { StatusBar } from "expo-status-bar";

const SignUp = () => {
  const { setUser, setIsLogged } = useGlobalContext();

  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const submit = async () => {
    if (form.username === "" || form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    setSubmitting(true);
    try {
      const result = await createUser(form.email, form.password, form.username);
      setUser(result);
      setIsLogged(true);

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
      <View className="mt-44 items-center justify-center">
        <Text className="absolute bottom-[7vh] text-center font-rbold text-5xl ">
          Sign Up
        </Text>
      </View>

      <View className="">
        <FormField
          mainView="mt-10"
          title="Username"
          value={`${form.username}`}
          containerStyles="w-[30vh] bg-gray-400 justify-center px-4 py-2 mt-2 ml-[80px]"
          handleChangeText={(e) => {setForm({...form, username: e})} }
          placeHolder="Enter your username"
          // keyboardType="email"
        />

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
        <FormField
          mainView="mt-10"
          title="Confirm Password"
          value={`${form.confirmPassword}`}
          containerStyles="w-[30vh] bg-gray-400 justify-center px-4 py-2 mt-2 ml-[80px]"
          handleChangeText={(e) => {setForm({...form, confirmPassword: e})} }
          placeHolder="Confirm your password"
          keyboardType="password"
        />
      </View>

      <View className="items-center justify-end flex-1 mt-12">
        <CustomButton 
          handlePress={submit}
          title="Sign Up"
          containerStyles="bg-[#816EB4] rounded-2xl"
          textStyles="px-7 py-4 text-2xl font-rmedium"
          isLoading={isSubmitting}
        />
        <View className="flex-row mt-5">
          <Text className="font-rregular text-[16px]">Already have a account? </Text>
          <Link href="signIn" className="font-rbold text-[16px]">Sign In</Link>
        </View>
      </View>
      </ScrollView>
      <StatusBar barStyle="dark-content"/>
    </SafeAreaView>
  );
};

export default SignUp;
