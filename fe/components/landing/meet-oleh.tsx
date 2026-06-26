import Image from "next/image";

import { Eyebrow, Wrap } from "./primitives";
import { Reveal } from "./reveal";

// Minty grayscale that resolves to full color on hover (matches the prototype).
const TINT =
  "grayscale contrast-[1.05] brightness-[1.02] sepia-[0.35] hue-rotate-[105deg] saturate-[1.4]";

export function MeetOleh() {
  return (
    <section className="py-[88px] max-[560px]:py-16" id="meet">
      <Wrap>
        <Reveal className="max-w-[64ch] ">
          <Eyebrow>Meet the human</Eyebrow>
          <div className="flex gap-10 ">
            <Image
              src="/oleh-original.png"
              alt="Oleh"
              width={155}
              height={155}
              className={`my-[18px] mb-1 block size-[155px] rounded-[14px] border border-line object-cover object-[50%_18%] transition-[filter] duration-[250ms]  ${TINT}`}
            />
            <div className="flex h-full flex-col justify-between ">
              <div className="flex-col">
                <h2 className="mb-[8px] mt-3 text-[clamp(30px,4.2vw,50px)] font-semibold leading-[1.02] tracking-[-0.025em]">
                  The human is <span className="text-mint">Oleh.</span>
                  <br />
                </h2>
                <p className="mx-auto mb-[18px] text-normal max-w-[48ch] text-lg text-ink-dim">
                  He is just a human. He answers all questions personally.
                </p>
              </div>
              <div className="flex mt-2">
                <a
                  href="https://www.linkedin.com/in/oleh-velychko/"
                  target="_blank"
                  rel="noopener"
                  aria-label="Oleh on LinkedIn"
                  className="inline-flex size-12 mb-[18px] items-center justify-center rounded-[14px] border border-line bg-white text-ink transition-[border-color,transform,color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-line-2 hover:text-mint-hi hover:shadow-[0_18px_40px_-30px_rgba(13,40,32,0.5)]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="size-6"
                  >
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}
