import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";

import { icons } from "../constants";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  formW,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex justify-center items-center">
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-500 font-rmedium p-2">{title}</Text>

      <View className={`w-[40vh] ${formW} h-16 px-4 rounded-2xl border-2 border-black-200 flex flex-row items-center`}>
        <TextInput
          className="flex-1 text-black font-rsemibold text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="black"
          onChangeText={handleChangeText}
          secureTextEntry={(title === "Password" || title ==="Confirm Password") && !showPassword}
          {...props}
        />

        {(title === "Password" || title ==="Confirm Password") && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
    </View>
  );
};

export default FormField;
