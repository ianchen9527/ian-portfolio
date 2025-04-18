import Image from "next/image"

export default function PaulArcherDesignDemoPage() {
  const menuButtonClassName = `fixed tracking-wider top-2 md:top-10 right-5 md:right-32 
    rounded-4xl text-sm text-black py-1 md:py-2 hover:text-gray-400 
    px-2 md:px-3 border hover:border-gray-400 z-50 cursor-pointer`
  const sectionClassName = "relative px-5 md:py-2 md:px-32 mb-30"

  const getImagePath = (imageId: number) => {
    return `/projects/replica-showcase/paul-archer-design/demo-${imageId}.jpg`
  }

  return (
    <main className="bg-stone-100">
      <button className={menuButtonClassName}>Menu</button>

      <section className={`${sectionClassName} mb-[0px]`}>
        <h1 className="text-3xl md:text-8xl leading-tight mb-16">
          Paul Archer Design
        </h1>
      </section>

      <section className={sectionClassName}>
        <div className="grid grid-cols-2 md:grid-cols-[repeat(16,1fr)] md:grid-rows-[repeat(2,auto)] gap-y-15 md:gap-y-30 ">
          <Image
            className="col-start-1 col-span-1 md:col-span-3 md:row-start-1 md:row-span-1"
            src={getImagePath(2)}
            alt="Paul Archer Design"
            width={888}
            height={1332}
          />
          <Image
            className="col-start-1 md:col-start-7 col-span-2 md:col-span-10 md:row-start-1 md:row-span-1"
            src={getImagePath(1)}
            alt="Paul Archer Design"
            width={1560}
            height={1060}
          />
          <Image
            className="col-start-1 col-span-2 md:col-start-1 md:col-span-8 md:row-start-2 md:row-span-1"
            src={getImagePath(3)}
            alt="Paul Archer Design"
            width={1560}
            height={1060}
          />
          <article className="col-start-1 col-span-2 md:col-start-11 md:col-span-6 md:row-start-2 md:row-span-1 text-[clamp(18px,calc(2vw),28px)] leading-[1.25] tracking-[-0.025em] self-start">
            <p className="font-thin">
              <span className="font-bold">Projects.</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; This is the mock
              up message of the projects part. It is a placeholder text for the
              projects section. The actual content will be added later. This is
              the mock up message of the projects part. It is a placeholder text
              for the projects section. The actual content will be added later.
            </p>
          </article>
        </div>
      </section>

      <section className={sectionClassName}>
        <div className="grid grid-cols-2 md:grid-cols-[repeat(16,1fr)] md:grid-rows-[repeat(2,auto)] gap-y-15 md:gap-y-30 gap-x-5 md:gap-x-0 ">
          <Image
            className="col-start-1 col-span-1 md:col-start-1 md:col-span-3 md:row-start-1 md:row-span-1"
            src={getImagePath(4)}
            alt="Paul Archer Design"
            width={888}
            height={1332}
          />
          <Image
            className="col-start-2 col-span-1 md:col-start-11 md:col-span-6 md:row-start-1 md:row-span-2"
            src={getImagePath(7)}
            alt="Paul Archer Design"
            width={888}
            height={1332}
          />
          <article className="col-start-1 col-span-2 md:col-start-1 md:col-span-6 md:row-start-2 md:row-span-1 text-[clamp(18px,calc(2vw),28px)] leading-[1.25] tracking-[-0.025em] self-end">
            <p className="font-thin">
              <span className="font-bold">Process.</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; This is the mock
              up message of the process part. It is a placeholder text for the
              process section. The actual content will be added later. This is
              the mock up message of the process part. It is a placeholder text
              for the process section. The actual content will be added later.
            </p>
          </article>
        </div>
      </section>

      <section className={sectionClassName}>
        <div className="grid grid-cols-2 md:grid-cols-[repeat(16,1fr)] md:grid-rows-[repeat(2,auto)] gap-y-15 md:gap-y-30 gap-x-5 md:gap-x-0 ">
          <Image
            className="col-start-1 col-span-2 md:col-start-1 md:col-span-10 md:row-start-1 md:row-span-1"
            src={getImagePath(5)}
            alt="Paul Archer Design"
            width={1560}
            height={1060}
          />
          <Image
            className="col-start-1 col-span-1 md:col-start-14 md:col-span-3 md:row-start-1 md:row-span-1"
            src={getImagePath(8)}
            alt="Paul Archer Design"
            width={1560}
            height={1060}
          />
          <Image
            className="col-start-1 col-span-2 md:col-start-1 md:col-span-10 md:row-start-2 md:row-span-1"
            src={getImagePath(6)}
            alt="Paul Archer Design"
            width={888}
            height={1332}
          />
          <article className="col-start-1 col-span-2 md:col-start-11 md:col-span-6 md:row-start-2 md:row-span-1 text-[clamp(18px,calc(2vw),28px)] leading-[1.25] tracking-[-0.025em] self-start">
            <p className="font-thin">
              <span className="font-bold">About.</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; This is the mock
              up message of the about part. It is a placeholder text for the
              about section. The actual content will be added later. This is the
              mock up message of the about part. It is a placeholder text for
              the about section. The actual content will be added later.
            </p>
          </article>
        </div>
      </section>

      <footer className="bg-black text-white py-12 text-center text-sm">
        &copy; {new Date().getFullYear()} Paul Archer Design (Replica)
      </footer>
    </main>
  )
}
