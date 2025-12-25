// Centralized scroll utility to avoid duplication
export const scrollToSection = (href: string, callback?: () => void) => {
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
  callback?.();
};
