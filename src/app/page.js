'use client'

import Scene from './components/Scene'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="absolute top-10 left-10 z-10">
    <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
  </div>
      <div className="h-screen w-screen">
        <Scene />
      </div>
    </main>
  )
}