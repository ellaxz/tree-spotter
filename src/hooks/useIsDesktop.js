import { useEffect, useState } from "react"

const DESKTOP_BREAKPOINT = "(min-width:768px)"

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia(DESKTOP_BREAKPOINT).matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT)

    const handleChange = (event) => {
      setIsDesktop(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return isDesktop
}

export default useIsDesktop
