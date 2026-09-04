import { useEffect, useRef, useState } from "react"

export default function useGeolocation() {
  const [userLocation, setUserLocation] = useState(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [locationError, setLocationError] = useState(null)
  const [followUser, setFollowUser] = useState(true)

  const hasLocationRef = useRef(false)

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        hasLocationRef.current = true

        setUserLocation([lat, lng])
        setIsLoadingLocation(false)
        setLocationError(null)
      },
      (error) => {
        console.error("geolocation failed", error)

        if (!hasLocationRef.current) {
          setLocationError(
            "unable to access your location. you can still explore trees in the default area",
          )
          setIsLoadingLocation(false)
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  function locateNow() {
    setFollowUser(true)
  }

  return {
    userLocation,
    isLoadingLocation,
    locationError,
    followUser,
    setFollowUser,
    locateNow,
  }
}
