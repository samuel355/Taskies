declare module 'react-native-vector-icons/Ionicons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  const Ionicons: typeof Icon;
  export default Ionicons;
}

declare module 'react-native-vector-icons/MaterialIcons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  import { ComponentType } from 'react';
  const MaterialIcons: Icon & ComponentType<any>;
  export default MaterialIcons;
} 