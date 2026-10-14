
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../services/api";

const CACHE_PREFIX = "hospital_live_translation_v2";
const BATCH_SIZE = 20;
const PARALLEL_REQUESTS = 2;

function getCacheKey(language, text) {
  return `${CACHE_PREFIX}_${language}_${text}`;
}

function readCache(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Keş yazılmasa da tərcümə davam etsin.
  }
}

function getTrimmedText(text) {
  return (text ?? "").trim();
}

export default function LiveTranslation() {
  const { i18n } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    let timer = null;
    let observer = null;
    let running = false;
    let rerunRequested = false;

    // Orijinal mətnləri dil dəyişəndə bərpa etmək üçün saxlayırıq.
    const originalTexts = new Map();
    const translatedNodes = new Map();

    const language = i18n.language?.startsWith("en") ? "en" : "az";

    function isIgnoredNode(node) {
      const parent = node.parentElement;

      if (!parent) return true;

      return Boolean(
        parent.closest(
          [
            "script",
            "style",
            "noscript",
            "textarea",
            "input",
            "select",
            "option",
            "svg",
            "canvas",
            "code",
            "pre",
            "[contenteditable='true']",
            "[data-no-translate]",
          ].join(",")
        )
      );
    }

    function collectTextNodes() {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      );

      const nodes = [];
      let node;

      while ((node = walker.nextNode())) {
        if (!getTrimmedText(node.textContent)) continue;
        if (isIgnoredNode(node)) continue;

        nodes.push(node);
      }

      return nodes;
    }

    function restoreOriginalTexts() {
      for (const [node, translated] of translatedNodes) {
        if (!node.isConnected) continue;

        const current = getTrimmedText(node.textContent);

        // Başqa kod mətni dəyişibsə, onun üzərinə yazmırıq.
        if (current === translated.text) {
          node.textContent = translated.original;
        }
      }

      translatedNodes.clear();
      originalTexts.clear();
    }

    if (language === "az") {
      return undefined;
    }

    async function translateBatch(batch, pending) {
      if (cancelled || batch.length === 0) return;

      try {
        const response = await api.post("/Translation", {
          texts: batch,
          targetLanguage: language,
        });

        if (cancelled) return;

        const translations = response.data?.translations;

        if (!Array.isArray(translations)) return;

        batch.forEach((original, index) => {
          const translated = translations[index];

          if (
            typeof translated !== "string" ||
            !translated.trim()
          ) {
            return;
          }

          const cleanTranslation = translated.trim();

          writeCache(
            getCacheKey(language, original),
            cleanTranslation
          );

          const nodes = pending.get(original) ?? [];

          for (const node of nodes) {
            if (cancelled || !node.isConnected) continue;

            const current = getTrimmedText(node.textContent);

            // React və ya başqa kod mətni dəyişibsə, toxunmuruq.
            if (current !== original) continue;

            const previousOriginal =
              originalTexts.get(node) ?? node.textContent;

            const leadingWhitespace =
              node.textContent.match(/^\s*/)?.[0] ?? "";

            const trailingWhitespace =
              node.textContent.match(/\s*$/)?.[0] ?? "";

            node.textContent =
              leadingWhitespace +
              cleanTranslation +
              trailingWhitespace;

            originalTexts.set(node, previousOriginal);

            translatedNodes.set(node, {
              original: previousOriginal,
              text: cleanTranslation,
            });
          }
        });
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Canlı tərcümə xətası:",
            error.response?.data ?? error.message
          );
        }
      }
    }

    async function translateVisibleText() {
      if (cancelled) return;

      if (running) {
        rerunRequested = true;
        return;
      }

      running = true;

      try {
        do {
          rerunRequested = false;

          const nodes = collectTextNodes();
          const pending = new Map();

          for (const node of nodes) {
            if (cancelled) return;

            const alreadyTranslated = translatedNodes.get(node);

            if (alreadyTranslated) {
              if (
                getTrimmedText(node.textContent) ===
                alreadyTranslated.text
              ) {
                continue;
              }

              // React mətni yenidən dəyişibsə, yeni mətnə baxırıq.
              translatedNodes.delete(node);
            }

            const original = getTrimmedText(node.textContent);

            if (!original) continue;

            originalTexts.set(
              node,
              originalTexts.get(node) ?? node.textContent
            );

            const cached = readCache(
              getCacheKey(language, original)
            );

            if (cached) {
              const current = node.textContent ?? "";

              if (getTrimmedText(current) !== original) continue;

              const leadingWhitespace =
                current.match(/^\s*/)?.[0] ?? "";

              const trailingWhitespace =
                current.match(/\s*$/)?.[0] ?? "";

              node.textContent =
                leadingWhitespace + cached + trailingWhitespace;

              translatedNodes.set(node, {
                original: originalTexts.get(node),
                text: cached,
              });

              continue;
            }

            if (!pending.has(original)) {
              pending.set(original, []);
            }

            pending.get(original).push(node);
          }

          const texts = [...pending.keys()];

          // Kiçik qrupları məhdud sayda paralel göndəririk.
          const batches = [];

          for (let i = 0; i < texts.length; i += BATCH_SIZE) {
            batches.push(texts.slice(i, i + BATCH_SIZE));
          }

          for (
            let i = 0;
            i < batches.length;
            i += PARALLEL_REQUESTS
          ) {
            if (cancelled) return;

            const currentBatches = batches.slice(
              i,
              i + PARALLEL_REQUESTS
            );

            await Promise.all(
              currentBatches.map((batch) =>
                translateBatch(batch, pending)
              )
            );
          }
        } while (rerunRequested && !cancelled);
      } finally {
        running = false;

        if (rerunRequested && !cancelled) {
          scheduleTranslation(100);
        }
      }
    }

    function scheduleTranslation(delay = 300) {
      if (cancelled) return;

      window.clearTimeout(timer);

      timer = window.setTimeout(() => {
        translateVisibleText();
      }, delay);
    }

    observer = new MutationObserver(() => {
      scheduleTranslation(500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // İlk tərcüməni gecikdirmədən başlayırıq.
    scheduleTranslation(100);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer?.disconnect();
      restoreOriginalTexts();
    };
  }, [i18n.language]);

  return null;
}
