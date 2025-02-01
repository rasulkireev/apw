import { useEffect, useState } from 'react';

interface TableOfContentsProps {
  className?: string;
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
  index: number;
}

export default function TableOfContents({ className = "" }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const elements = document.querySelectorAll("article h2, article h3");

    if (elements.length > 0) {
      const items: HeadingItem[] = Array.from(elements).map((element, index) => ({
        id: element.id || `heading-${index}`,
        text: element.textContent || "",
        level: Number(element.tagName.charAt(1)),
        index
      }));

      elements.forEach((element, index) => {
        if (!element.id) {
          element.id = `heading-${index}`;
        }
      });

      setHeadings(items);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        { rootMargin: "0% 0% -80% 0%" }
      );

      elements.forEach((elem) => observer.observe(elem));

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (isOpen && !target.closest(".table-of-contents") && window.innerWidth < 1024) {
          setIsOpen(false);
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => {
        observer.disconnect();
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className={`${!mounted || headings.length === 0 ? 'hidden' : ''}`}>
      {/* Toggle button with arrow */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="my-4 flex items-center text-blue-600 hover:text-blue-700 transition-colors table-of-contents lg:hidden"
        aria-label="Toggle Table of Contents"
      >
        <span className="mr-2">Table of Contents</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Mobile TOC - Dropdown under button */}
      <div
        className={`lg:hidden bg-white border border-gray-200 rounded-lg shadow-md mb-6 ${
          isOpen ? 'block' : 'hidden'
        } table-of-contents`}
      >
        <div className="p-4">
          <TableOfContentsList
            headings={headings}
            activeId={activeId}
            setIsOpen={setIsOpen}
          />
        </div>
      </div>

      {/* Desktop TOC - Left Sidebar */}
      <div className="hidden lg:block fixed left-[max(0px,calc(50%-45rem))] top-[12rem] px-4 py-6 border border-gray-100 rounded-lg shadow w-64 overflow-y-auto">
        <nav className="table-of-contents">
          <p className="font-bold mb-4 text-gray-900 border-b border-gray-200">Table of Contents</p>
          <TableOfContentsList
            headings={headings}
            activeId={activeId}
            setIsOpen={setIsOpen}
          />
        </nav>
      </div>
    </div>
  );
}


// TableOfContentsList component remains the same
function TableOfContentsList({
  headings,
  activeId,
  setIsOpen
}: {
  headings: HeadingItem[];
  activeId: string;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <ul className="space-y-2">
      {headings.map((heading) => (
        <li
          key={`${heading.id}-${heading.index}`}
          className={`
            ${heading.level === 3 ? "ml-4" : ""}
            ${activeId === heading.id ? "text-blue-600" : "text-gray-600"}
          `}
        >
          <a
            href={`#${heading.id}`}
            className="hover:text-blue-800 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector(`#${heading.id}`)?.scrollIntoView({
                behavior: "smooth"
              });
              setIsOpen(false);
            }}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
