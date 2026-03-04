import { fetchForecastHistoryWithSignedUrls } from "@/lib/forecastHistory";
import { formatDateTimeWithWeekday } from "@/lib/format";
import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HistoryHeader } from "../../components/history/history-header";
import "../../global.css";

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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
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
        /* FLATLIST TIENE UN MONTON DE OPCIONES, SEGUIR MIRANDO */
        onRefresh={onRefresh}
        ListEmptyComponent={
          isLoading ? <ActivityIndicator /> : <Text>No hay datos</Text>
        }
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <HistoryHeader
            day={day}
            setDay={setDay}
            setShowPicker={setShowPicker}
            showPicker={showPicker}
            search={search}
            setSearch={setSearch}
          />
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
    </SafeAreaView>
  );
}
