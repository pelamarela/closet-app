import { useEffect, useSyncExternalStore } from 'react'
import { loadPhotos, onPhotos, photosLoaded } from './data'

/** True once the local sample photos are assigned; re-renders the caller when they arrive. */
export function usePhotos() {
  useEffect(() => { loadPhotos() }, [])
  return useSyncExternalStore(onPhotos, photosLoaded)
}
