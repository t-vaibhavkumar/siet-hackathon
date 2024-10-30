import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";
import { CustomButton, FormField } from "../../components";
import { submitBPData, submitBloodSugarData, fetchBPData, fetchBloodSugarData, getCurrentUser } from "../../lib/appwrite";

const screenWidth = Dimensions.get("window").width;

const Charts = () => {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [userId, setUserId] = useState(null);
  const [bpData, setBPData] = useState([]);
  const [bloodSugarData, setBloodSugarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user ID and data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.$id);
          const bpRecords = await fetchBPData(user.$id);
          const bloodSugarRecords = await fetchBloodSugarData(user.$id);
          setBPData(bpRecords);
          setBloodSugarData(bloodSugarRecords);
        }
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Submit BP data
  const handleBPSubmit = async () => {
    if (userId && systolic && diastolic) {
      await submitBPData(userId, systolic, diastolic);
      const updatedBPData = await fetchBPData(userId); // Refresh data
      setBPData(updatedBPData);
    }
  };

  // Submit Blood Sugar data
  const handleBloodSugarSubmit = async () => {
    if (userId && bloodSugar) {
      await submitBloodSugarData(userId, bloodSugar);
      const updatedBloodSugarData = await fetchBloodSugarData(userId); // Refresh data
      setBloodSugarData(updatedBloodSugarData);
    }
  };

  // Limit the data to the last 10 entries
  const recentBPData = bpData.slice(-10);
  const recentBloodSugarData = bloodSugarData.slice(-10);

  // Format BP data for chart
  const bpLabels = recentBPData.map(data => new Date(data.timestamp).toLocaleDateString());
  const systolicValues = recentBPData.map(data => data.systolic);
  const diastolicValues = recentBPData.map(data => data.diastolic);

  // Format Blood Sugar data for chart
  const bloodSugarLabels = recentBloodSugarData.map(data => new Date(data.timestamp).toLocaleDateString());
  const bloodSugarValues = recentBloodSugarData.map(data => data.value);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>{error}</Text>;

  return (
    <SafeAreaView className="px-4 my-6 h-full">
      <ScrollView>
        <Text className="flex-1 justify-center items-center text-black font-rregular">
          Charts
        </Text>
        {/* <View className="flex-row">
          <Text className="absolute text-white font-rregular">Enter BP:</Text>
          <View>
            <FormField
              formW="w-[20vh]"
              otherStyles=""
              placeholder="Systolic"
              value={systolic}
              onChangeText={setSystolic}
            />
            <FormField
              formW="w-[20vh]"
              otherStyles=""
              placeholder="Diastolic"
              value={diastolic}
              onChangeText={setDiastolic}
            />
            <CustomButton
              title="Set"
              onPress={handleBPSubmit}
              containerStyles="bg-orange-500 h-[7vh] w-[15vh] p-5 text-center absolute top-[5vh] left-[24vh] rounded-xl"
              textStyles="text-center font-rbold items-center justify-center text-xl"
            />
          </View>
        </View> */}

        {/* <View className="w-full h-[20vh] bg-red-300 rounded-xl my-8">
          <Text className="text-white font-bold text-lg mb-2">Blood Pressure Over Time</Text>
          <LineChart
            data={{
              labels: bpLabels,
              datasets: [
                {
                  data: systolicValues,
                  color: () => 'rgba(255, 99, 132, 1)',
                  strokeWidth: 2,
                  label: 'Systolic BP',
                },
                {
                  data: diastolicValues,
                  color: () => 'rgba(54, 162, 235, 1)',
                  strokeWidth: 2,
                  label: 'Diastolic BP',
                }
              ],
            }}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundGradientFrom: '#1E2923',
              backgroundGradientTo: '#08130D',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' },
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </View>

        <View className="flex-row">
          <Text className="absolute text-white font-rregular">Enter Blood Sugar:</Text>
          <View>
            <FormField
              formW="w-[20vh]"
              otherStyles=""
              placeholder="Blood Sugar"
              value={bloodSugar}
              onChangeText={setBloodSugar}
            />
            <CustomButton
              title="Set"
              onPress={handleBloodSugarSubmit}
              containerStyles="bg-orange-500 h-[7vh] w-[15vh] p-5 text-center absolute top-[5vh] left-[24vh] rounded-xl"
              textStyles="text-center font-rbold items-center justify-center text-xl"
            />
          </View>
        </View>

        <View className="w-full h-[20vh] bg-red-300 rounded-xl my-8">
          <Text className="text-white font-bold text-lg mb-2">Blood Sugar Over Time</Text>
          <LineChart
            data={{
              labels: bloodSugarLabels,
              datasets: [
                {
                  data: bloodSugarValues,
                  color: () => 'rgba(75, 192, 192, 1)',
                  strokeWidth: 2,
                  label: 'Blood Sugar',
                }
              ],
            }}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundGradientFrom: '#1E2923',
              backgroundGradientTo: '#08130D',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' },
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Charts;
