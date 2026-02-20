import { FlatList, Image, Text, View } from "react-native";
import "../../global.css";
import { prueba_objeto_1 } from "../../mocks/prueba_objeto";

const data = [];
for (let i = 1; i <= 15; i++) {
  data.push({ ...prueba_objeto_1, id: i });
}

export default function Historial() {
  return (
    <View className="flex-1 bg-white">
      {/* 
      <Image
        source={require("../../assets/images/fondo-nubes-1.avif")}
        className="w-full h-full absolute z-0 opacity-50"
        resizeMode="cover"
      />
 */}
      <FlatList
        data={data}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 32, gap: 24 }}
        keyExtractor={(item) => String(item.id)}
        refreshing={false}
        /* FLATLIST TIENE UN MONTON DE OPCIONES, SEGUIR MIRANDO */
        onRefresh={() => {}}
        ListEmptyComponent={<Text>No hay datos</Text>}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View className="flex items-start justify-start pb-4">
            <Text className="font-bold text-lg">Historial</Text>
          </View>
        }
        onEndReached={""}
        onEndReachedThreshold={""}
        renderItem={({ item, index }) => (
          <View className="flex bg-white rounded-xl shadow-sm">
            <Image
              source={require("../../assets/images/fondo-nubes-1.avif")}
              className="w-full h-32 mb-4 rounded-t-xl"
              resizeMode="cover"
            />
            <View className="px-4 pb-4 gap-1">
              <Text className="text-lg font-semibold">
                Predicción: {item.nombre}
              </Text>
              <Text>
                Fecha: {item.Fecha} {"   "} Hora: {item.Hora}
              </Text>
              <Text className="mt-1">Pronóstico: {item.Pronostico}</Text>
              <Text className="mt-1">
                Probabilidad: {item.ProbabilidadPronostico}%
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

/* 
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item, index }) => (
        <View className="flex">
          <Text className="text-lg font-semibold">Predicción {item.id}</Text>
          <Text>Fecha: {item.Fecha}</Text>
          <Text className="mt-1">Hora: {item.Hora}</Text>
          <Text className="mt-1">
            Probabilidad de Pronóstico: {item.ProbabilidadPronostico}%
          </Text>
          <Text className="mt-1">Pronóstico: {item.Pronostico}</Text>
        </View>
      )}
    />





    <View className="flex-auto p-4">
      <Text className="text-lg">
        Aquí encontrarás el historial de tus consultas de pronósticos
      </Text>
      <Link asChild href="/">
        <Pressable className="mt-4 rounded bg-blue-500 px-4 py-2">
          <IconoHome />
        </Pressable>
      </Link>
    </View>
     */
