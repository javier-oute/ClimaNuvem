import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import "../global.css";

export const IconoHome = (props) => (
  <Entypo name="home" size={24} color="black" {...props} />
);

export const IconoCamera = () => (
  <Entypo name="camera" size={24} color="white" />
);

export const IconoImage = () => (
  //<FontAwesome name="image" size={24} color="white" />
  //<Feather name="image" size={24} color="white" />
  <FontAwesome6 name="image" size={24} color="white" />
);

export const IconoUser = (props) => (
  <Feather name="user" color="black" {...props} />
);
