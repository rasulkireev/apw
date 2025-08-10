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
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  const updateHeadings = () => {
    const elements = document.querySelectorAll("article h2, article h3");

    if (elements.length > 0) {
      const items: HeadingItem[] = Array.from(elements)
        .filter((element) => {
          // Filter out highlights section and its subsections if they're hidden
          const highlightsSection = document.querySelector('div[style*="display: none"]');
          if (highlightsSection && highlightsSection.contains(element)) {
            return false;
          }
          return true;
        })
        .map((element, index) => ({
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
    }
  };

  useEffect(() => {
    setMounted(true);
    updateHeadings();

    const elements = document.querySelectorAll("article h2, article h3");
    if (elements.length > 0) {
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

      // Listen for highlights loaded event
      const handleHighlightsLoaded = () => {
        setTimeout(updateHeadings, 100); // Small delay to ensure DOM is updated
      };

      document.addEventListener("click", handleClickOutside);
      document.addEventListener("highlightsLoaded", handleHighlightsLoaded);
      
      return () => {
        observer.disconnect();
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("highlightsLoaded", handleHighlightsLoaded);
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
      <div className="hidden lg:block fixed left-[max(0px,calc(50%-45rem))] top-[1rem] px-4 py-6 border border-gray-100 rounded-lg shadow w-64 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <nav className="table-of-contents">
          <div className="mb-4 border-b border-gray-200">
            <p className="font-bold text-gray-900">Table of Contents</p>
          </div>
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

function TableOfContentsList({
  headings,
  activeId,
  setIsOpen
}: {
  headings: HeadingItem[];
  activeId: string;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({});

  // Group headings by their parent H2
  const groupedHeadings = headings.reduce((acc, heading) => {
    if (heading.level === 2) {
      acc[heading.id] = {
        parent: heading,
        children: []
      };
    } else if (heading.level === 3) {
      // Find the last H2 that appeared before this H3
      const parentH2 = [...headings]
        .slice(0, heading.index)
        .reverse()
        .find(h => h.level === 2);

      if (parentH2) {
        acc[parentH2.id].children.push(heading);
      }
    }
    return acc;
  }, {} as { [key: string]: { parent: HeadingItem; children: HeadingItem[] } });

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <ul className="space-y-2">
      {Object.entries(groupedHeadings).map(([id, { parent, children }]) => (
        <li key={id}>
          <div className="flex items-center justify-between">
            <a
              href={`#${parent.id}`}
              onClick={() => setIsOpen(false)}
              className={`block py-1 hover:text-blue-600 ${
                activeId === parent.id ? "text-blue-600 font-medium" : "text-gray-600"
              }`}
            >
              {parent.text}
            </a>
            {children.length > 0 && (
              <button
                onClick={() => toggleSection(id)}
                className="p-1 hover:bg-gray-100 rounded-full"
                aria-label={`Toggle section ${parent.text}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform duration-200 ${
                    collapsedSections[id] ? "" : "rotate-180"
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
            )}
          </div>
          {children.length > 0 && !collapsedSections[id] && (
            <ul className="ml-2 mt-2 space-y-2">
              {children.map(child => (
                <li key={child.id}>
                  <a
                    href={`#${child.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`block py-1 pl-4 hover:text-blue-600 ${
                      activeId === child.id ? "text-blue-600 font-medium" : "text-gray-600"
                    }`}
                  >
                    {child.text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
