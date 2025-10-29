/**
 * @deprecated This file is deprecated. Use /project/[id]/generate instead.
 * This file is kept temporarily for backward compatibility.
 * It automatically redirects to the new location.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Tabs() {
  const router = useRouter()
  const { id } = router.query
  
  // Redirect to new location
  useEffect(() => {
    if (id) {
      router.replace(`/project/${id}/generate`)
    }
  }, [id, router])

  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-secondary">Redirecting...</p>
      </div>
    </div>
  )
}

// Prevent static generation - this page needs authentication and query params
export async function getServerSideProps() {
  return {
    props: {},
  }
}

