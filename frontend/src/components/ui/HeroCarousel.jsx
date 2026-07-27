import { useEffect, useState } from 'react'
import RechercheBar from './RechercheBar'
import hero1 from '../../assets/hero/hero-1.jpg'
import hero2 from '../../assets/hero/hero-2.jpg'
import hero3 from '../../assets/hero/hero-3.jpg'
import hero4 from '../../assets/hero/hero-4.webp'
import hero5 from '../../assets/hero/hero-5.jpg'
import hero6 from '../../assets/hero/hero-6.jpg'

const SLIDES = [hero1, hero2, hero3, hero4, hero5, hero6]
const INTERVAL_MS = 5000

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDES.length)
    }, INTERVAL_MS)

    return () => clearInterval(timer)
  }, [])

  return (
    <section id="hero" className="relative isolate overflow-hidden">
      {/* Les calques déborde de quelques px au-dessus du haut de la section, masqués
          derrière le Header opaque : ça absorbe l'arrondi sous-pixel du scroll qui
          laissait sinon apparaître un mince liseré entre le Header et l'image. */}
      <div className="absolute -top-1 inset-x-0 bottom-0">
        {SLIDES.map((src, index) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${src})`,
              opacity: index === activeIndex ? 1 : 0,
            }}
            aria-hidden={index !== activeIndex}
          />
        ))}
      </div>

      <div className="absolute -top-1 inset-x-0 bottom-0 bg-black/35" />

      <svg
        className="absolute inset-x-0 bottom-0 z-0 h-20 w-full text-cedre/40 sm:h-28"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0 200 L150 90 L300 160 L420 60 L560 150 L700 40 L860 170 L1000 80 L1200 200 Z" />
      </svg>

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-24 pb-8 text-center sm:pt-32 sm:pb-10">
        <h1 className="font-fraunces text-4xl font-semibold leading-tight text-cream drop-shadow-sm sm:text-5xl">
          L&apos;écotourisme authentique, au cœur de l&apos;Atlas
        </h1>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 pb-20 sm:pb-28">
        <RechercheBar />
      </div>
    </section>
  )
}
