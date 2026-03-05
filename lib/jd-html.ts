const SAFE_LINK_RE = /^(https?:|mailto:|tel:|\/|#)/i;

function normalizeAndTrim(html: string): string {
  const container = document.createElement("div");
  container.innerHTML = html;

  container.querySelectorAll("p, h1, h2, h3, li").forEach((el) => {
    const text = (el.textContent || "").replace(/\u00a0/g, " ").trim();
    const hasBr = !!el.querySelector("br");
    if (!text && !hasBr) {
      el.remove();
    }
  });

  return container.innerHTML.trim();
}

function cleanWordJunk(root: HTMLElement) {
  root.querySelectorAll("o\\:p, xml, script, style, iframe, object, embed, meta, link").forEach((el) => el.remove());

  root.querySelectorAll("*").forEach((el) => {
    const node = el as HTMLElement;
    const className = node.getAttribute("class") || "";
    const style = node.getAttribute("style") || "";

    if (/mso|Mso/i.test(className) || /mso-|font-family|font-size|line-height/i.test(style)) {
      node.removeAttribute("class");
      node.removeAttribute("style");
    }

    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name === "style" || name === "class" || name === "id" || name.startsWith("on")) {
        node.removeAttribute(attr.name);
      }
    });
  });
}

export function sanitizeJobDescriptionHtml(html: string): string {
  const doc = document.implementation.createHTMLDocument("");
  doc.body.innerHTML = html || "";
  cleanWordJunk(doc.body);

  const cleanNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return doc.createTextNode(node.textContent || "");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const mappedTag =
      tag === "b" ? "strong" :
      tag === "i" ? "em" :
      tag === "div" ? "p" :
      tag;

    const allowed = new Set(["p", "br", "ul", "ol", "li", "h1", "h2", "h3", "strong", "em", "u", "a", "blockquote"]);
    const unwrapOnly = new Set(["span", "font"]);
    const dropCompletely = new Set(["script", "style", "iframe", "object", "embed", "xml", "meta", "link"]);

    if (dropCompletely.has(mappedTag)) return null;

    if (!allowed.has(mappedTag) || unwrapOnly.has(mappedTag)) {
      const frag = doc.createDocumentFragment();
      Array.from(el.childNodes).forEach((child) => {
        const cleaned = cleanNode(child);
        if (cleaned) frag.appendChild(cleaned);
      });
      return frag;
    }

    const out = doc.createElement(mappedTag);
    if (mappedTag === "a") {
      const href = (el.getAttribute("href") || "").trim();
      if (SAFE_LINK_RE.test(href)) {
        out.setAttribute("href", href);
        out.setAttribute("target", "_blank");
        out.setAttribute("rel", "noopener noreferrer");
      }
    }

    Array.from(el.childNodes).forEach((child) => {
      const cleaned = cleanNode(child);
      if (cleaned) out.appendChild(cleaned);
    });

    return out;
  };

  const wrapper = doc.createElement("div");
  Array.from(doc.body.childNodes).forEach((child) => {
    const cleaned = cleanNode(child);
    if (cleaned) wrapper.appendChild(cleaned);
  });

  return normalizeAndTrim(wrapper.innerHTML);
}

export function plainTextToSemanticHtml(text: string): string {
  const escaped = (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const asHtml = escaped
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");

  return sanitizeJobDescriptionHtml(asHtml);
}
