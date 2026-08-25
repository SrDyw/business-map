import React from 'react'
import { Map, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";

export function MyMap() {
  return (
    <Map center={[-74.006, 40.7128]} zoom={11}>
      <MapControls />
    </Map>
  );
}

export default function page() {
  return (
    <div className='h-screen w-screen'>
      <MyMap/>
    </div>
  )
}
