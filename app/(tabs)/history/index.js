import "@/global.css";
import { CalendarIcon, CrossIcon, TrashIcon } from "@/components/icons";
import {
  deleteForecast,
  fetchForecastHistoryWithSignedUrls,
} from "@/lib/forecastHistory";
import { bandForConfidence, forecastTitleKey } from "@/lib/forecast/model-meta";
import { ReliabilityRow } from "@/components/forecast/reliability-row";
import { PublishedBadge } from "@/components/published-badge";
import { formatDateTimeWithWeekday } from "@/lib/format";
import { LOCALE_MAP, useT } from "@/lib/i18n";
import { useSettingsStore } from "@/stores/settings.store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Link, Stack, useFocusEffect } from "expo-router";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
//import { SearchBar } from "@rneui/themed";
import { useColorScheme } from "nativewind";

function DeleteAction({
  progress,
  onPress,
  title,
  message,
  cancelLabel,
  confirmLabel,
}) {
  const { colorScheme } = useColorScheme();

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [0, 1],
      [0.3, 1],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scale }] };
  });

  return (
    <View
      style={{
        width: 80,
        backgroundColor: colorScheme === "dark" ? "#18181b" : "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pressable
        onPress={() =>
          Alert.alert(title, message, [
            { text: cancelLabel, style: "cancel" },
            { text: confirmLabel, style: "destructive", onPress },
          ])
        }
        hitSlop={8}
      >
        <Animated.View
          style={[
            {
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: "#E24B4A",
              alignItems: "center",
              justifyContent: "center",
            },
            animatedStyle,
          ]}
        >
          <TrashIcon />
        </Animated.View>
      </Pressable>
    </View>
  );
}

// Badge de estado de publicación en el mapa: azul si está publicada (activa), gris atenuado si lo
// estuvo pero ya no, nada si nunca se publicó.
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

  // Mapa de refs para cerrar el swipeable abierto al abrir otro
  const rowRefs = useRef(new Map());

  const t = useT();
  const { colorScheme } = useColorScheme();
  const language = useSettingsStore((s) => s.language);
  const locale = LOCALE_MAP[language];

  const openDateFilter = useCallback(() => {
    if (Platform.OS === "android") {
      setShowPicker(true);
    } else {
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

  // Recarga al volver a la pestaña (salta el primer foco, que coincide con el montaje) para reflejar
  // cambios de estado de publicación hechos fuera: despublicar desde el detalle o desactivar
  // "compartir en el mapa" desde Ajustes. Así los badges (azul → gris) quedan siempre coherentes.
  const didFocusOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!didFocusOnce.current) {
        didFocusOnce.current = true;
        return;
      }
      loadInitial();
    }, [loadInitial]),
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadInitial();
  }, [loadInitial]);

  // Optimistic delete: elimina de la lista al instante y borra en Supabase en paralelo.
  // Si falla el borrado en servidor, recarga la lista para restaurar el item.
  const handleDeleteItem = useCallback(
    async (item) => {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      try {
        await deleteForecast({ id: item.id, imagePath: item.image_path });
      } catch (err) {
        console.error("Error deleting forecast:", err);
        setIsRefreshing(true);
        loadInitial();
      }
    },
    [loadInitial],
  );

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
          headerTitle: t("history.title"),
          headerTransparent: Platform.OS === "ios",
          //headerShadowVisible: false,
          //headerLargeTitleShadowVisible: false,
          headerTitleStyle: {
            fontSize: 30,
            lineHeight: 36,
            fontWeight: "700",
            color: colorScheme === "dark" ? "#FFFFFF" : "#0F172A",
          },
          headerRight: () => (
            <Pressable
              onPress={openDateFilter}
              hitSlop={10}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <CalendarIcon
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </Pressable>
          ),

          headerSearchBarOptions: {
            placeholder: t("history.search"),
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
                  // Android look (props específicas). Colores según el tema: el ThemeProvider no
                  // controla la SearchView nativa, así que se ajustan a mano para que el icono, el
                  // texto y el placeholder sean legibles sobre el header oscuro.
                  textColor: colorScheme === "dark" ? "#FFFFFF" : "#0F172A",
                  headerIconColor: colorScheme === "dark" ? "white" : "black",
                  hintTextColor: colorScheme === "dark" ? "#a1a1aa" : "#94a3b8",
                  // opcional: si quieres que al abrir se enfoque
                  autoFocus: false,
                }),
          },
        }}
      />
      <FlatList
        data={items}
        className="flex-1 bg-white dark:bg-zinc-900"
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
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-slate-600 dark:text-zinc-400">
              {t("history.empty")}
            </Text>
          )
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
        renderItem={({ item }) => {
          const { texto } = formatDateTimeWithWeekday(item.created_at, locale);
          const band = bandForConfidence(item.probability ?? 0);
          const forecastTitle = t(forecastTitleKey(item.forecast, band));
          const forecastDisplay = forecastTitle.startsWith("alerts.")
            ? item.forecast
            : forecastTitle;

          return (
            <Swipeable
              ref={(ref) => {
                if (ref) rowRefs.current.set(item.id, ref);
                else rowRefs.current.delete(item.id);
              }}
              onSwipeableWillOpen={() => {
                rowRefs.current.forEach((ref, id) => {
                  if (id !== item.id) ref.close();
                });
              }}
              renderRightActions={(progress) => (
                <DeleteAction
                  progress={progress}
                  onPress={() => handleDeleteItem(item)}
                  title={t("detail.deleteTitle")}
                  message={t("detail.deleteMsg")}
                  cancelLabel={t("buttons.cancel")}
                  confirmLabel={t("buttons.delete")}
                />
              )}
              friction={1}
              rightThreshold={40}
              containerStyle={{ borderRadius: 12, overflow: "hidden" }}
            >
              <Link href={`/${item.id}`} asChild>
                <Pressable className="active:opacity-80">
                  <View className="flex bg-white dark:bg-zinc-800 rounded-xl shadow-sm m-[3]">
                    <Image
                      source={
                        item.signedUrl
                          ? { uri: item.signedUrl }
                          : require("@/assets/images/fondo-nubes-1.avif")
                      }
                      className="w-full h-32 mb-4 rounded-t-xl"
                      resizeMode="cover"
                    />
                    <View className="px-4 pb-4 gap-0.5">
                      <View className="flex-row items-center justify-between gap-2">
                        <Text className="flex-1 text-lg font-semibold text-slate-900 dark:text-zinc-100">
                          {item.name}
                        </Text>
                        <PublishedBadge
                          active={item.isPublishedActive}
                          wasPublished={!!item.published_at}
                          label={t("history.publishedBadge")}
                        />
                      </View>
                      <Text className="text-base font-medium text-slate-800 dark:text-zinc-100">
                        {t("history.forecast")}: {forecastDisplay}
                      </Text>
                      <ReliabilityRow clase={item.forecast} band={band} />
                      {item.description ? (
                        <Text
                          className="italic text-slate-600 dark:text-zinc-400"
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                      ) : null}
                      <Text className="text-sm text-slate-400 dark:text-zinc-500">
                        {texto}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Link>
            </Swipeable>
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
                    <Text className="text-slate-600">Fecha: {texto} </Text>
                    <Text className="mt-1 text-slate-600">
                      Pronóstico: {item.forecast}
                    </Text>
                    <Text className="mt-1 text-slate-600">
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
