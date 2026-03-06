import "@/global.css";
import { fetchForecastHistoryWithSignedUrls } from "@/lib/forecastHistory";
import { formatDateTimeWithWeekday } from "@/lib/format";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Link, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
//import { SearchBar } from "@rneui/themed";
import { CalendarIcon, CrossIcon } from "@/components/icons";
import { Modal } from "react-native";

const PAGE_SIZE = 15;

export default function Historial() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [day, setDay] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const openDateFilter = useCallback(() => {
    if (Platform.OS === "android") {
      setShowPicker(true);
    } else {
      //setTempDay(day ?? new Date());
      setIsDateModalOpen(true);
    }
  }, [setShowPicker]);

  const closeDateFilter = useCallback(() => {
    setIsDateModalOpen(false);
    console.log(day);
  }, [day]);

  const loadPage = useCallback(
    async (pageIndex) => {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      return await fetchForecastHistoryWithSignedUrls(
        from,
        to,
        debouncedSearch,
        day,
      );
    },
    [debouncedSearch, day],
  );

  const loadInitial = useCallback(async () => {
    try {
      setPageIndex(0);
      setHasMore(true);

      const rowsWithUrl = await loadPage(0);
      setItems(rowsWithUrl);
      setHasMore(rowsWithUrl.length === PAGE_SIZE);
    } catch (err) {
      console.error("Error fetching signed URLs:", err);
      setItems([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || isLoading || isRefreshing || !hasMore) return;
    if (items.length === 0) return;

    setIsLoadingMore(true);
    try {
      const nextPage = pageIndex + 1;
      const rowsWithUrl = await loadPage(nextPage);

      if (rowsWithUrl.length === 0) {
        setHasMore(false);
        return;
      }

      setItems((prev) => [...prev, ...rowsWithUrl]);
      setPageIndex(nextPage);
      setHasMore(rowsWithUrl.length === PAGE_SIZE);
    } catch (err) {
      console.error("Error loadMore:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    pageIndex,
    hasMore,
    isLoadingMore,
    isLoading,
    isRefreshing,
    loadPage,
    items,
  ]);

  useEffect(() => {
    setIsRefreshing(true);
    loadInitial();
  }, [loadInitial, debouncedSearch, day]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadInitial();
  }, [loadInitial]);

  // DEBOUNCE SIMPLE
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLargeTitle: false,
          headerTitle: "Historial",
          headerTransparent: Platform.OS === "ios",
          //headerShadowVisible: false,
          //headerLargeTitleShadowVisible: false,
          headerTitleStyle: {
            fontSize: 30,
            lineHeight: 36,
            fontWeight: "700", // si quieres equivalente a font-bold
            color: "#0F172A",
          },
          headerRight: () => (
            <Pressable
              onPress={openDateFilter}
              hitSlop={10}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <CalendarIcon />
            </Pressable>
          ),

          headerSearchBarOptions: {
            placeholder: "Buscar...",
            onChangeText: (e) => setSearch(e.nativeEvent.text),

            // iOS look
            ...(Platform.OS === "ios"
              ? {
                  placement: "automatic",
                  hideWhenScrolling: false,
                  //tintColor: "#314468",
                  //barTintColor: "#F1F5F9",
                  //textColor: "#0F172A",
                }
              : {
                  // Android look (props específicas)
                  //textColor: "#0F172A",
                  headerIconColor: "black",
                  //hintTextColor: "#94a3b8",
                  //headerIconColor: "#314468",
                  // opcional: si quieres que al abrir se enfoque
                  autoFocus: false,
                }),
          },
        }}
      />
      <FlatList
        data={items}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          gap: 24,
        }}
        ListHeaderComponent={
          day ? (
            <View className="flex flex-row gap-3">
              <View className="self-start bg-[#314468] py-1 px-2 rounded-3xl">
                <Text className="text-base text-balance font-semibold text-white">
                  {formatDateTimeWithWeekday(day).fecha}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setDay(null);
                }}
              >
                <CrossIcon />
              </Pressable>
            </View>
          ) : null
        }
        contentInsetAdjustmentBehavior="automatic"
        keyExtractor={(item) => String(item.id)}
        refreshing={isRefreshing}
        /* FLATLIST TIENE UN MONTON DE OPCIONES, SEGUIR MIRANDO */
        onRefresh={onRefresh}
        ListEmptyComponent={
          isLoading ? <ActivityIndicator /> : <Text>No hay datos</Text>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4">
              <ActivityIndicator />
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const { texto } = formatDateTimeWithWeekday(item.created_at);

          return (
            <Link href={`/${item.id}`} asChild>
              <Pressable className="active:opacity-80">
                <View className="flex bg-white rounded-xl shadow-sm">
                  <Image
                    source={
                      item.signedUrl
                        ? { uri: item.signedUrl }
                        : require("@/assets/images/fondo-nubes-1.avif")
                    }
                    className="w-full h-32 mb-4 rounded-t-xl"
                    resizeMode="cover"
                  />
                  <View className="px-4 pb-4 gap-1">
                    <Text className="text-lg font-semibold">
                      Predicción: {item.name}
                    </Text>
                    <Text>Fecha: {texto} </Text>
                    <Text className="mt-1">Pronóstico: {item.forecast}</Text>
                    <Text className="mt-1">
                      Probabilidad: {item.probability}%
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          );
        }}
      />
      {/* ANDROID: picker nativo modal */}
      {Platform.OS === "android" && showPicker && (
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

      {Platform.OS === "ios" && (
        <Modal
          visible={isDateModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={closeDateFilter}
          presentationStyle="overFullScreen"
        >
          <Pressable onPress={closeDateFilter} className="flex-1 justify-end">
            <View className="bg-white items-center rounded-t-3xl px-6 pt-4">
              <DateTimePicker
                value={day ?? new Date()}
                mode="date"
                display="inline"
                onChange={(e, selected) => {
                  if (selected) setDay(selected);
                }}
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

/*

import "@/global.css";
import { fetchForecastHistoryWithSignedUrls } from "@/lib/forecastHistory";
import { formatDateTimeWithWeekday } from "@/lib/format";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Link, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
//import { SearchBar } from "@rneui/themed";
import { CalendarIcon } from "@/components/icons";
import { Modal } from "react-native";

const PAGE_SIZE = 15;

export default function Historial() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [pageIndex, setPageIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [day, setDay] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempDay, setTempDay] = useState(day ?? new Date());

  const openDateFilter = useCallback(() => {
    if (Platform.OS === "android") {
      setShowPicker(true);
    } else {
      //setTempDay(day ?? new Date());
      setDay(day ?? new Date());
      setIsDateModalOpen(true);
    }
  }, [day, setShowPicker]);

  const closeDateFilter = useCallback(() => {
    setIsDateModalOpen(false);
  }, []);

  const loadPage = useCallback(
    async (pageIndex) => {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      return await fetchForecastHistoryWithSignedUrls(
        from,
        to,
        debouncedSearch,
        day,
      );
    },
    [debouncedSearch, day],
  );

  const loadInitial = useCallback(async () => {
    try {
      setPageIndex(0);
      setHasMore(true);

      const rowsWithUrl = await loadPage(0);
      setItems(rowsWithUrl);
      setHasMore(rowsWithUrl.length === PAGE_SIZE);
    } catch (err) {
      console.error("Error fetching signed URLs:", err);
      setItems([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || isLoading || isRefreshing || !hasMore) return;
    if (items.length === 0) return;

    setIsLoadingMore(true);
    try {
      const nextPage = pageIndex + 1;
      const rowsWithUrl = await loadPage(nextPage);

      if (rowsWithUrl.length === 0) {
        setHasMore(false);
        return;
      }

      setItems((prev) => [...prev, ...rowsWithUrl]);
      setPageIndex(nextPage);
      setHasMore(rowsWithUrl.length === PAGE_SIZE);
    } catch (err) {
      console.error("Error loadMore:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    pageIndex,
    hasMore,
    isLoadingMore,
    isLoading,
    isRefreshing,
    loadPage,
    items,
  ]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial, debouncedSearch, day]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadInitial();
  }, [loadInitial]);

  // DEBOUNCE SIMPLE
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLargeTitle: false,
          headerTitle: "Historial",
          headerTransparent: true,
          //headerShadowVisible: false,
          //headerLargeTitleShadowVisible: false,
          headerTitleStyle: {
            fontSize: 28,
            fontWeight: "800",
            color: "#0F172A",
          },
          headerRight: () => (
            <Pressable
              onPress={openDateFilter}
              hitSlop={10}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <CalendarIcon />
            </Pressable>
          ),

          headerSearchBarOptions:
            Platform.OS === "ios"
              ? {
                  placeholder: "Buscar...",
                  placement: "automatic",
                  hideWhenScrolling: false,
                  tintColor: "#314468",
                  barTintColor: "#F1F5F9",
                  textColor: "#0F172A",
                  onChangeText: (e) => setSearch(e.nativeEvent.text),
                }
              : undefined,
        }}
      />
      <FlatList
        data={items}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          gap: 24,
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyExtractor={(item) => String(item.id)}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          isLoading ? <ActivityIndicator /> : <Text>No hay datos</Text>
        }
        ListHeaderComponent={null}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4">
              <ActivityIndicator />
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const { texto } = formatDateTimeWithWeekday(item.created_at);

          return (
            <Link href={`/${item.id}`} asChild>
              <Pressable className="active:opacity-80">
                <View className="flex bg-white rounded-xl shadow-sm">
                  <Image
                    source={
                      item.signedUrl
                        ? { uri: item.signedUrl }
                        : require("@/assets/images/fondo-nubes-1.avif")
                    }
                    className="w-full h-32 mb-4 rounded-t-xl"
                    resizeMode="cover"
                  />
                  <View className="px-4 pb-4 gap-1">
                    <Text className="text-lg font-semibold">
                      Predicción: {item.name}
                    </Text>
                    <Text>Fecha: {texto} </Text>
                    <Text className="mt-1">Pronóstico: {item.forecast}</Text>
                    <Text className="mt-1">
                      Probabilidad: {item.probability}%
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          );
        }}
      />
      {Platform.OS === "android" && showPicker && (
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

      {Platform.OS === "ios" && (
        <Modal
          visible={isDateModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={closeDateFilter}
          presentationStyle="overFullScreen"
        >
          <Pressable
            onPress={closeDateFilter}
            className="flex-1 justify-end"
          ></Pressable>
          <View className="bg-white rounded-t-3xl px-6 pt-4 pb-10">
            <View className="flex-row items-center justify-between mb-2">
              <Pressable onPress={closeDateFilter}>
                <Text className="text-slate-500">Cancelar</Text>
              </Pressable>

              <Text className="font-semibold text-slate-900">
                Filtrar por fecha
              </Text>

              <Pressable
                onPress={() => {
                  setDay(tempDay);
                  closeDateFilter();
                }}
              >
                <Text className="font-semibold text-[#314468]">Aplicar</Text>
              </Pressable>
            </View>

            <DateTimePicker
              value={tempDay}
              mode="date"
              display="inline"
              onChange={(e, selected) => {
                if (selected) setTempDay(selected);
              }}
            />

            {day && (
              <Pressable
                onPress={() => {
                  setDay(null);
                  closeDateFilter();
                }}
                className="mt-3 self-center px-4 py-2 rounded-2xl bg-slate-100"
              >
                <Text className="text-slate-700">Quitar filtro</Text>
              </Pressable>
            )}
          </View>
        </Modal>
      )}
    </>
  );
}































      {Platform.OS === "ios" && (
        <Modal
          visible={isDateModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={closeDateFilter}
          presentationStyle="overFullScreen"
        >
          <View className="flex-1 justify-end bg-black/30">
            <View className="bg-white rounded-t-3xl px-6 pt-4 pb-8">
              <View className="flex-row items-center justify-between mb-2">
                <Pressable onPress={closeDateFilter}>
                  <Text className="text-slate-500">Cancelar</Text>
                </Pressable>

                <Text className="font-semibold text-slate-900">
                  Filtrar por fecha
                </Text>

                <Pressable
                  onPress={() => {
                    setDay(tempDay);
                    closeDateFilter();
                  }}
                >
                  <Text className="font-semibold text-[#314468]">Aplicar</Text>
                </Pressable>
              </View>

              <DateTimePicker
                value={tempDay}
                mode="date"
                display="inline"
                onChange={(e, selected) => {
                  if (selected) setTempDay(selected);
                }}
              />

              {day && (
                <Pressable
                  onPress={() => {
                    setDay(null);
                    closeDateFilter();
                  }}
                  className="mt-3 self-center px-4 py-2 rounded-2xl bg-slate-100"
                >
                  <Text className="text-slate-700">Quitar filtro</Text>
                </Pressable>
              )}
            </View>
          </View>
        </Modal>
      )}



      
 <SafeAreaView className="flex-1 bg-white" edges={[""]}>
</SafeAreaView>
          <HistoryHeader
            day={day}
            setDay={setDay}
            setShowPicker={setShowPicker}
            showPicker={showPicker}
            search={search}
            setSearch={setSearch}
          />

*/
