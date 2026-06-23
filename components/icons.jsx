import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import "../global.css";

export const IconoHome = (props) => (
  <Entypo name="home" size={24} color="black" {...props} />
);

export const IconoCamera = () => (
  <Entypo name="camera" size={24} color="white" />
);

export const IconoImage = () => (
  <FontAwesome6 name="image" size={24} color="white" />
);

export const UserIcon = (props) => (
  <Feather name="user" color="white" {...props} />
);

export const EditIcon = () => <Feather name="edit" size={24} color="white" />;

export const PencilIcon = ({ size = 16, color = "white" }) => (
  <Feather name="edit-2" size={size} color={color} />
);

export const CancelIcon = () => (
  <MaterialCommunityIcons name="cancel" size={24} color="white" />
);

export const SaveIcon = () => (
  <FontAwesome5 name="save" size={24} color="white" />
);

export const SignOutIcon = () => (
  <Feather name="log-out" size={24} color="white" />
);

export const SearchIcon = () => (
  <Feather name="search" size={16} color="black" />
);

export const CrossIcon = ({ color = "#A1A1AA" }) => (
  <Entypo name="circle-with-cross" size={24} color={color} />
);

// Cerrar el visor de imagen a pantalla completa.
export const CloseIcon = ({ size = 26, color = "white" }) => (
  <Feather name="x" size={size} color={color} />
);

// Pista de "ampliar" sobre la foto de fondo (abre el visor a pantalla completa).
export const ExpandIcon = ({ size = 16, color = "white" }) => (
  <Feather name="maximize-2" size={size} color={color} />
);

export const CalendarIcon = ({ color = "black" }) => (
  <FontAwesome5 name="calendar-alt" size={24} color={color} />
);

export const ChevronUpIcon = () => (
  <Entypo name="chevron-up" size={24} color="black" />
);

export const ChevronDownIcon = () => (
  <Entypo name="chevron-down" size={24} color="black" />
);

export const ChevronLeftIcon = () => (
  <Entypo name="chevron-left" size={24} color="white" />
);

export const TrashIcon = ({ color = "white" }) => (
  <Feather name="trash-2" size={24} color={color} />
);

export const BookmarckIcon = () => (
  <Feather name="bookmark" size={24} color="white" />
);

export const ShareIcon = () => <Feather name="share" size={24} color="white" />;

export const DownloadIcon = ({ color, style }) => (
  <AntDesign
    name="cloud-download"
    size={24}
    color={color ?? "black"}
    style={style}
  />
);

export const BackIcon = ({ color = "black", style }) => (
  <Ionicons name="arrow-back" size={26} color={color} style={style} />
);

export const ClockIcon = (props) => (
  <AntDesign name="clock-circle" size={24} {...props} />
);

export const CloudIcon = ({ color = "black", ...props }) => (
  <Feather name="cloud" size={24} color={color} {...props} />
);

export const HelpIcon = ({ color = "black", style }) => (
  <Ionicons name="help" size={24} color={color} style={style} />
);

export const MapIcon = ({ color = "black" }) => (
  <Feather name="map" size={24} color={color} />
);

export const LockIcon = ({ size = 16, color = "black" }) => (
  <Feather name="lock" size={size} color={color} />
);

export const PublishIcon = ({ color = "white" }) => (
  <Feather name="map-pin" size={24} color={color} />
);

export const ReportIcon = ({ color = "white" }) => (
  <Feather name="flag" size={24} color={color} />
);
