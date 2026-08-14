import { socialLinks } from "@/shared/constants/footerData";
import { cacheLife } from "next/cache";

export default async function Footer() {
  "use cache";
  cacheLife("hours");
  return (
    <footer className="border-t border-slate-200/80 bg-slate-950 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-8 text-center lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">
          Developed by
        </p>
        <p className="mt-2 text-lg font-semibold text-white">
          Mohammed Roshidh S
        </p>

        <div className="mt-4 flex items-center gap-3">
          {socialLinks.map(
            ({ label, href, icon: Icon, className: className }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex p-4 items-center justify-center rounded-full   text-slate-200 transition hover:border-slate-700 hover:text-white"
              >
                <Icon className={className} />
              </a>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}
