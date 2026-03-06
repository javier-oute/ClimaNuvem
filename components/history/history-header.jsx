import DateTimePicker from "@react-native-community/datetimepicker";
//import { SearchBar } from "@rneui/themed";
import { SearchBar } from "@rneui/themed";
import { Platform, Pressable, Text, View } from "react-native";
import { CrossIcon } from "../icons";

export function HistoryHeader({
  day,
  setShowPicker,
  setDay,
  showPicker,
  search,
  setSearch,
}) {
  return (
    <View className="flex bg-white w-full">
      <View className="flex flex-row justify-between">
        <Text className="font-bold text-4xl">Historial</Text>
        {Platform.OS === "ios" ? (
          <View className="flex-row items-center justify-center">
            <DateTimePicker
              value={day ?? new Date()}
              mode="date"
              display={"compact"}
              onChange={(e, selected) => {
                if (e.type === "set" && selected) setDay(selected);
              }}
            />
            {day && (
              <View>
                {/* Clear day */}
                <Pressable onPress={() => setDay(null)}>
                  <CrossIcon />
                </Pressable>
              </View>
            )}
          </View>
        ) : null}
      </View>

      <SearchBar
        platform={Platform.OS === "ios" ? "ios" : "android"}
        placeholder="Buscar..."
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        showCancel={false}
        lightTheme
        round
        // Contenedor exterior (donde “vive” la searchbar)
        containerStyle={{
          backgroundColor: "transparent",
          paddingHorizontal: 0,
          paddingVertical: 0,
          borderTopWidth: 0,
          borderBottomWidth: 0,
          marginTop: 16,
        }}
        // Caja principal (la pastilla)
        inputContainerStyle={{
          backgroundColor: "#F1F5F9", // slate-100
          borderRadius: 18,
          height: 44,
          paddingHorizontal: 10,
        }}
        // Texto dentro
        inputStyle={{
          fontSize: 16,
          color: "#0F172A", // slate-900
        }}
        // Iconos
        searchIcon={{ size: 18, color: "#64748B" }} // slate-500
        clearIcon={{ size: 18, color: "#64748B" }}
      />
    </View>
  );
}

/*

import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { CalendarIcon, CrossIcon, SearchIcon } from "../icons";
import { SearchBar } from '@rneui/themed';

export function HistoryHeader({
  day,
  setShowPicker,
  setDay,
  showPicker,
  search,
  setSearch,
}) {
  return (
    <View className="flex bg-white w-full">
      <View className="flex flex-row justify-between">
        <Text className="font-bold text-4xl">Historial</Text>
        {Platform.OS === "ios" ? (
          <View className="flex-row items-center justify-center">
            <DateTimePicker
              value={day ?? new Date()}
              mode="date"
              display={"compact"}
              onChange={(e, selected) => {
                if (e.type === "set" && selected) setDay(selected);
              }}
            />
            {day && (
              <View>
                <Pressable onPress={() => setDay(null)}>
                  <CrossIcon />
                </Pressable>
              </View>
            )}
          </View>
        ) : null}
      </View>
      <View
        className={`flex-row items-center justify-between w-full rounded-2xl bg-zinc-100 h-20 shadow-sm mt-4 overflow-visible`}
      >
        <View
          className={`flex-1 flex-row items-center justify-start gap-2 ml-3`}
        >
          <View className={`${Platform.OS === "ios" ? "mt-1" : "pb-3"}`}>
            <SearchIcon />
          </View>
          <TextInput
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholder="Buscar..."
            placeholderTextColor="#94a3b8"
            className={`flex-1 text-base text-slate-900`}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            //clearButtonMode={isIOS ? "while-editing" : "never"} // ✅ nativo iOS
          />
        </View>
        <View className="flex-row items-center gap-2">
          {Platform.OS === "android" ? (
            <>
              <Pressable onPress={() => setShowPicker(true)}>
                {day ? (
                  <Text className="text-slate-700 text-sm px-3 py-1 rounded-lg bg-zinc-200">
                    {day.toLocaleDateString("es-ES")}
                  </Text>
                ) : (
                  <CalendarIcon />
                )}
              </Pressable>

              {showPicker && (
                <DateTimePicker
                  value={day ?? new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, selected) => {
                    setShowPicker(false);
                    if (e.type === "set" && selected) setDay(selected);
                  }}
                />
              )}

              {day && (
                <View>
                  <Pressable onPress={() => setDay(null)}>
                    <CrossIcon />
                  </Pressable>
                </View>
              )}
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}










-----------------------------


${Platform.OS === "ios" ? "pb-1" : "pb-3"}




<View className="flex-row items-center justify-between w-full rounded-3xl bg-[#314468] px-6 py-4 shadow-sm">
    <View className="flex-1">
    </View>
    */
