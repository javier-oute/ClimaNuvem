import { Text, TextInput, View } from "react-native";

export default function EditableField({
  label,
  value,
  onChangeText,
  isEditing,
  ...inputProps
}) {
  return (
    <View className="w-full">
      <Text className="mb-2 text-sm text-slate-500">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={isEditing}
        showSoftInputOnFocus={isEditing}
        placeholderTextColor="#94a3b8"
        className={`rounded-xl border w-80 px-4 pb-3 pt-3 ${
          isEditing
            ? "border-slate-200 bg-white text-slate-900"
            : "border-slate-200 bg-gray-200 text-slate-500"
        }`}
        {...inputProps}
      />
    </View>
  );
}

/*
export default function ProfileField({
  label,
  value,
  onChangeText,
  isEditing,
  ...inputProps
}) {
  return (
    <View className="w-full">
      <Text className="mb-2 text-sm text-slate-500">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={isEditing}
        showSoftInputOnFocus={isEditing}
        placeholderTextColor="#94a3b8"
        className={`rounded-xl border w-80 px-4 pb-3 pt-3 ${
          isEditing
            ? "border-slate-200 bg-white text-slate-900"
            : "border-slate-200 bg-gray-200 text-slate-500"
        }`}
        {...inputProps}
      />
    </View>
  );
}

*/
