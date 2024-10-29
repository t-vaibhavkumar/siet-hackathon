import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { getUsername } from '../../lib/appwrite';
import { images } from "../../constants";

import useAppwrite from "../../lib/useAppwrite";
import { getAllPosts, getLatestPosts } from "../../lib/appwrite";
import { EmptyState, SearchInput, Trending, VideoCard } from "../../components";

const Home = () => {
    const [username, setUsername] = useState('');
    useEffect(() => {
      const fetchUsername = async () => {
        const name = await getUsername();
        setUsername(name || 'User');
      };
  
      fetchUsername();
    }, []);

    return (
      <>
      <SafeAreaView className="flex-1">
        <ScrollView>
          <View className="  p-4 flex-row justify-start items-center">
          <Text className="font-rbold text-xl">Welcome, {username}!</Text>
          </View>
          <View className="p-4">
            <Text className="font-rbold text-xl">Appointments</Text>
            <View className="mt-4 w-full rounded-2xl bg-[#FFE3CF]">
              <Text className="text-center py-4 font-rregular">Lorem ipsum dolor sit amet.</Text>
              <Text className="text-center py-4 font-rregular">Lorem ipsum dolor sit amet.</Text>
              <Text className="text-center py-4 font-rregular">Lorem ipsum dolor sit amet.</Text>
              <Text className="text-center py-4 font-rregular">Lorem ipsum dolor sit amet.</Text>
              <Text className="text-center py-4 font-rregular">Lorem ipsum dolor sit amet.</Text>
            </View>
          </View>

          <View className="p-4">
            <Text className="font-rbold text-xl">Today's Medication</Text>
            <View className="mt-4 w-full rounded-2xl bg-[#FFCBCB]">
              <Text className="text-center py-4 font-rregular">Lorem ipsum dolor sit amet.</Text>
              <Text className="text-center py-4 font-rregular">Lorem ipsum dolor sit amet.</Text>
              <Text className="text-center py-4 font-rregular">Lorem ipsum dolor sit amet.</Text>
              <Text className="text-center py-4 font-rregular">Lorem ipsum dolor sit amet.</Text>
              <Text className="text-center py-4 font-rregular">Lorem ipsum dolor sit amet.</Text>
            </View>
          </View>
        </ScrollView>

      </SafeAreaView>

      </>

    );
};

export default Home;
