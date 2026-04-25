import type { ComponentProps } from "react"
import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from "@/config/theme"

type IoniconName = ComponentProps<typeof Ionicons>["name"]

function TabIcon({
  name,
  color,
  size,
}: {
  name: IoniconName
  color: string
  size: number
}) {
  return <Ionicons name={name} size={size} color={color} />
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.emerald,
        tabBarInactiveTintColor: "rgba(244,247,242,0.45)",
        tabBarStyle: {
          backgroundColor: "rgba(5,13,10,0.97)",
          borderTopColor: "rgba(255,255,255,0.08)",
          height: 66,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <TabIcon name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size }) => <TabIcon name="bag-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="grow"
        options={{
          title: "Grow",
          tabBarIcon: ({ color, size }) => <TabIcon name="leaf-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="impact"
        options={{
          title: "Impact",
          tabBarIcon: ({ color, size }) => <TabIcon name="globe-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => <TabIcon name="person-circle-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
