// Improved Replay5SecondsIcon and Forward5SecondsIcon

import React from "react";
import { Svg, Path, Circle, Text } from "react-native-svg";

export const Replay5SecondsIcon = ({ size = 24, color = "currentColor" }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Circular path */}
    <Path
      d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.68.94 6.36 2.64l1.64-1.64v4h-4l1.83-1.83C16.19 5.57 14.2 4.5 12 4.5 7.31 4.5 3.5 8.31 3.5 13S7.31 21.5 12 21.5c4.69 0 8.5-3.81 8.5-8.5"
      strokeWidth="1.5"
    />

    {/* Circle for the number 5 */}
    <Circle cx="12" cy="12" r="5" fill="none" strokeWidth="1.5" />

    {/* Number 5 in the center */}
    <Text
      x="12"
      y="14"
      fontSize="8"
      fontWeight="bold"
      fill={color}
      textAnchor="middle"
      dominantBaseline="middle"
    >
      5
    </Text>
  </Svg>
);

export const Forward5SecondsIcon = ({ size = 24, color = "currentColor" }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Circular path (reversed direction from replay) */}
    <Path
      d="M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9c-2.39 0-4.68.94-6.36 2.64L3.64 3.64v4h4L5.83 5.83C7.45 4.23 9.44 3.16 11.64 3.16c4.69 0 8.5 3.81 8.5 8.5S16.33 21.5 11.64 21.5c-4.69 0-8.5-3.81-8.5-8.5"
      strokeWidth="1.5"
    />

    {/* Circle for the number 5 */}
    <Circle cx="12" cy="12" r="5" fill="none" strokeWidth="1.5" />

    {/* Number 5 in the center */}
    <Text
      x="12"
      y="14"
      fontSize="8"
      fontWeight="bold"
      fill={color}
      textAnchor="middle"
      dominantBaseline="middle"
    >
      5
    </Text>
  </Svg>
);
