import Svg, { Circle, Path } from 'react-native-svg';

export type TabName = 'home' | 'shelf' | 'vote' | 'chat';

/**
 * Tab-bar glyphs recreated 1:1 from the prototype's inline SVGs. Home / Shelf /
 * Chat are filled; Vote is a stroked check-in-circle. `color` flows from the
 * navigator (terracotta when active, muted otherwise).
 */
export function TabBarIcon({ name, color, size = 22 }: { name: TabName; color: string; size?: number }) {
  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M3 11.4 12 4l9 7.4V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
        </Svg>
      );
    case 'shelf':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M5 4h3v16H5zM10 4h3v16h-3z" />
          <Path d="M16.2 5l2.9.8L15.6 20l-2.9-.8z" />
        </Svg>
      );
    case 'vote':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Circle cx={12} cy={12} r={8.5} />
          <Path d="M8.2 12.3l2.5 2.5 4.8-5.2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'chat':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v8A1.5 1.5 0 0 1 18.5 15H10l-4 4v-4H5.5A1.5 1.5 0 0 1 4 13.5z" />
        </Svg>
      );
  }
}

export default TabBarIcon;
