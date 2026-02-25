import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { CrossIcon, SearchIcon } from "../icons";

export function HistoryHeader({
  day,
  setShowPicker,
  setDay,
  showPicker,
  search,
  setSearch,
}) {
  return (
    <View className="flex bg-white w-full gap-4">
      <Text className="font-bold text-4xl">Historial</Text>
      <View className="flex-row items-center justify-between w-full rounded-3xl bg-zinc-100 px-6 py-1 shadow-sm">
        <SearchIcon />
        <TextInput
          value={search}
          onChangeText={(text) => setSearch(text)}
          placeholder="Buscar..."
          placeholderTextColor="#94a3b8"
          className="flex-1 ml-2 pb-1 text-base text-slate-900"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          //clearButtonMode={isIOS ? "while-editing" : "never"} // ✅ nativo iOS
        />
        <View className="flex-row items-center gap-1">
          <DateTimePicker
            value={day ?? new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "compact" : "default"}
            onChange={(e, selected) => {
              if (e.type === "set" && selected) setDay(selected);
            }}
          />
          {day && (
            <View>
              {/* Clear day */}
              <Pressable onPress={() => setDay(null)} className="self-start">
                <CrossIcon />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

/*
<View className="flex-row items-center justify-between w-full rounded-3xl bg-[#314468] px-6 py-4 shadow-sm">
    <View className="flex-1">
    </View>
    */
