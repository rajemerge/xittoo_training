import Image from "next/image";
import RegistrationForm from "./components/RegistrationForm";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f3f8ff] px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:gap-8">
        <section className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-blue-900/5">
          <Image
            src="/xittootraining.png"
            alt="Xittoo Sewa Free Technician Training - Two months of home appliance repair and maintenance training in Banepa"
            width={1024}
            height={1536}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="hidden lg:block h-auto w-full"
          />
        </section>

        <section
          className="min-w-0 lg:sticky lg:top-6"
          aria-labelledby="form-title"
        >
          <RegistrationForm />
        </section>
      </div>
    </main>
  );
}
