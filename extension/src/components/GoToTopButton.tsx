import { HiOutlineArrowUp } from "react-icons/hi2";

type GoToTopButtonProps = {
  visible: boolean;
};

export function GoToTopButton({ visible }: GoToTopButtonProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      title="Remonter en haut"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-4 right-4 z-20 rounded-full border border-slate-300 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 cursor-pointer"
    >
      <HiOutlineArrowUp className="h-4 w-4" />
    </button>
  );
}

