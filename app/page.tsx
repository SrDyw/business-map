'use client'
import React, { useState, useEffect } from 'react'
import { 
  Map, 
  MapControls, 
  MapMarker, 
  MarkerContent, 
  MarkerLabel,
  MarkerPopup,
  MapRoute 
} from "@/components/ui/map";

export function MyMap() {
  const [rutaReal, setRutaReal] = useState<[number, number][]>([]);
  
  const [miUbicacion, setMiUbicacion] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  
  const [errorUbicacion, setErrorUbicacion] = useState<string>("");
  const [permisoEstado, setPermisoEstado] = useState<string>("");
  
  const [viewport, setViewport] = useState({
    center: [-82.3635, 23.1395] as [number, number],
    zoom: 14,
    bearing: 0,
    pitch: 0
  });
  
  const calleSol = {
    longitude: -82.3585,
    latitude: 23.1367,
    nombre: "Calle Sol",
    descripcion: "Una calle importante en Centro Habana"
  };
  
  const malecon = {
    longitude: -82.3685,
    latitude: 23.1423,
    nombre: "Malecón",
    descripcion: "El famoso malecón habanero"
  };

  // Verificar el estado del permiso
  const verificarPermiso = async () => {
    if (navigator.permissions) {
      try {
        const resultado = await navigator.permissions.query({ name: 'geolocation' });
        setPermisoEstado(resultado.state); // 'granted', 'denied', 'prompt'
        
        // Si está denegado, mostrar mensaje
        if (resultado.state === 'denied') {
          setErrorUbicacion("El permiso está bloqueado. Necesitas desbloquearlo en la configuración del navegador.");
        }
        
        // Si es 'prompt', podemos pedir permiso
        if (resultado.state === 'prompt') {
          pedirUbicacion();
        }
        
        // Si está concedido, obtener ubicación
        if (resultado.state === 'granted') {
          pedirUbicacion();
        }
      } catch (error) {
        console.log("No se puede verificar permiso directamente");
        pedirUbicacion();
      }
    } else {
      // Navegadores antiguos
      pedirUbicacion();
    }
  };

  // Función para pedir ubicación
  const pedirUbicacion = () => {
    if (!navigator.geolocation) {
      setErrorUbicacion("Tu navegador no soporta geolocalización");
      return;
    }

    // Método simple para forzar el popup
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const nuevaUbicacion = {
          longitude: posicion.coords.longitude,
          latitude: posicion.coords.latitude
        };
        
        console.log("¡Ubicación obtenida!", nuevaUbicacion);
        setMiUbicacion(nuevaUbicacion);
        setErrorUbicacion("");
        
        // Centrar el mapa en tu ubicación
        setViewport({
          center: [nuevaUbicacion.longitude, nuevaUbicacion.latitude],
          zoom: 16,
          bearing: 0,
          pitch: 0
        });

        // Iniciar seguimiento
        navigator.geolocation.watchPosition(
          (pos) => {
            const ubicacionActualizada = {
              longitude: pos.coords.longitude,
              latitude: pos.coords.latitude
            };
            setMiUbicacion(ubicacionActualizada);
            setViewport(prev => ({
              ...prev,
              center: [ubicacionActualizada.longitude, ubicacionActualizada.latitude]
            }));
          },
          (error) => {
            console.error("Error en seguimiento:", error);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      },
      (error) => {
        console.error("Error código:", error.code);
        
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            setErrorUbicacion("Permiso denegado. Ve a la configuración de tu navegador y permite la ubicación para este sitio.");
            break;
          case 2: // POSITION_UNAVAILABLE
            setErrorUbicacion("Tu ubicación no está disponible. Verifica que el GPS esté activado.");
            break;
          case 3: // TIMEOUT
            setErrorUbicacion("Tiempo agotado. Verifica tu conexión.");
            break;
          default:
            setErrorUbicacion("Error al obtener ubicación.");
        }
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Ejecutar al cargar
  useEffect(() => {
    const timer = setTimeout(() => {
      verificarPermiso();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Obtener la ruta real
  useEffect(() => {
    const obtenerRuta = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/` +
                    `${calleSol.longitude},${calleSol.latitude};` +
                    `${malecon.longitude},${malecon.latitude}` +
                    `?overview=full&geometries=geojson`;
        
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        
        if (datos.routes && datos.routes[0]) {
          const puntos = datos.routes[0].geometry.coordinates.map(
            (coord: number[]) => [coord[0], coord[1]] as [number, number]
          );
          setRutaReal(puntos);
        }
      } catch (error) {
        console.error("Error al obtener la ruta:", error);
      }
    };

    obtenerRuta();
  }, []);

  // Botón manual para pedir ubicación
  const pedirUbicacionManual = () => {
    setErrorUbicacion("");
    pedirUbicacion();
  };

  return (
    <div className="relative h-full w-full">
      <Map 
        viewport={viewport}
        onViewportChange={setViewport}
      >
        {/* Ruta real */}
        {rutaReal.length > 0 && (
          <MapRoute 
            coordinates={rutaReal}
            color="#e74c3c"
            width={4}
            opacity={0.8}
          />
        )}

        {/* TU UBICACIÓN REAL */}
        {miUbicacion && (
          <MapMarker 
            longitude={miUbicacion.longitude} 
            latitude={miUbicacion.latitude}
          >
            <MarkerContent>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                <div className="relative bg-green-500 w-6 h-6 rounded-full border-2 border-white shadow-lg" />
              </div>
            </MarkerContent>
            
            <MarkerLabel>
              Tu ubicación
            </MarkerLabel>
          </MapMarker>
        )}

        {/* Marcador de Calle Sol */}
        <MapMarker 
          longitude={calleSol.longitude} 
          latitude={calleSol.latitude}
        >
          <MarkerContent>
            <div className="bg-red-500 w-5 h-5 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform" />
          </MarkerContent>
          
          <MarkerLabel>
            {calleSol.nombre}
          </MarkerLabel>
        </MapMarker>

        {/* Marcador del Malecón */}
        <MapMarker 
          longitude={malecon.longitude} 
          latitude={malecon.latitude}
        >
          <MarkerContent>
            <div className="bg-blue-500 w-5 h-5 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform" />
          </MarkerContent>
          
          <MarkerLabel position="bottom">
            {malecon.nombre}
          </MarkerLabel>
        </MapMarker>
        
        <MapControls />
      </Map>

      {/* Panel de control */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        {errorUbicacion && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded-lg text-sm max-w-xs">
            <p>{errorUbicacion}</p>
            <button
              onClick={pedirUbicacionManual}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
            >
              Intentar de nuevo
            </button>
          </div>
        )}
        
        {!miUbicacion && !errorUbicacion && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded-lg text-sm">
            Esperando permiso de ubicación...
          </div>
        )}
      </div>
    </div>
  );
}

export default function page() {
  return (
    <div className='h-screen w-screen'>
      <MyMap/>
    </div>
  )
}