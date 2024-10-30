import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../constants";
import { CustomButton, Loader } from "../components";
import { useGlobalContext } from "../context/GlobalProvider";

const Welcome = () => {
  const { loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-[#FFFFFF]">
      <View className="absolute top-36">
        <Image source={images.indexImg} className="w-[48vh] h-[35vh] resize-contain"/>
      </View>
      <View>
        <Text className="font-rbold text-2xl text-center mt-12 p-4">Your Complete Health Care Companion App</Text>
        <Text className="font-rbolditalic text-4xl text-center absolute top-[20vh] right-[10vh]">HealthSync</Text>
      </View>
      <View className="absolute bottom-[150px]">
        <CustomButton
          title="Continue with email"
          containerStyles="rounded-2xl bg-[#927ccc] opacity"
          textStyles="px-7 py-6 text-xl font-rmedium text-gray-200"
          handlePress={()=>{
            router.push("sign-in")
          }}
        />
      </View> 
      <StatusBar barStyle="dark-content"/>
    </SafeAreaView>
  );
};

export default Welcome;
