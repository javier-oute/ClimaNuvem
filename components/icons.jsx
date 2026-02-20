import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import "../global.css";

export const IconoHome = (props) => (
  <Entypo name="home" size={24} color="black" {...props} />
);

export const IconoCamera = () => (
  <Entypo name="camera" size={24} color="black" />
);

export const IconoImage = () => (
  <FontAwesome name="image" size={24} color="black" />
);

export const IconoUser = (props) => (
  <Feather name="user" color="black" {...props} />
);
