import { Text, View } from "react-native";
import { IconoUser } from "../../components/icons";
import "../../global.css";
import { prueba_usuario_1 } from "../../mocks/prueba_objeto";

const user = prueba_usuario_1;

export default function Profile() {
  return (
    <View className="flex flex-1 items-center p-4 gap-4 bg-white">
      <View className="mt-16 p-6 bg-slate-400 rounded-full">
        <IconoUser size={64} />
      </View>
      <Text className="font-bold text-2xl p-4">{user.nombre}</Text>
      <View className="flex flex-row w-full bg-white rounded-xl py-4 px-6 shadow-sm">
        <Text className="text-xl font-semibold">Email:</Text>
        <Text className="flex-auto text-xl text-center">{user.email}</Text>
      </View>
      <View className="flex flex-row w-full bg-white rounded-xl py-4 px-6 shadow-sm">
        <Text className="text-xl font-semibold">Fecha de nacimiento:</Text>
        <Text className="flex-auto text-xl text-center">
          {user.fecha_nacimiento}
        </Text>
      </View>
    </View>
  );
}
