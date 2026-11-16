import { ParallaxComponent } from "@/components/ui/parallax-scrolling"

export default function ParallaxDemo() {
  return (
    <>
      <ParallaxComponent />
      <div className="osmo-credits text-center py-6 text-sm text-muted-foreground">
        <p className="osmo-credits__p">
          Resource by <a target="_blank" rel="noopener noreferrer" href="https://www.osmo.supply/" className="underline hover:text-foreground">Osmo</a>
        </p>
      </div>
    </>
  )
}
