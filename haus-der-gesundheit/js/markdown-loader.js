// Loader nur für Markdown-Inhalte, ohne Layout zu verändern

const pageMap = {
    "index.html": { targetId: "page-content", path: "content/index.md" },
    "ueber-mich.html": { targetId: "page-content", path: "content/ueber-mich.md" },
    "leistungen.html": { targetId: "page-content", path: "content/leistungen.md" },
    "praxis.html": { targetId: "page-content", path: "content/praxis.md" },
    "kontakt.html": { targetId: "page-content", path: "content/kontakt.md" },
    "anfahrt.html": { targetId: "page-content", path: "content/anfahrt.md" },
    "datenschutz.html": { targetId: "page-content", path: "content/datenschutz.md" },
    "impressum.html": { targetId: "page-content", path: "content/impressum.md" },
    "agb.html": { targetId: "legal-content", path: "content/agb.md" }
};

const currentPage = window.location.pathname.split("/").pop() || "index.html";
const config = pageMap[currentPage];

if (config) {
    const target = document.getElementById(config.targetId);

    if (!target) {
        console.warn("Target nicht gefunden:", config.targetId);
    } else {
        fetch(config.path)
            .then(response => {
                if (!response.ok) throw new Error("Markdown-Datei nicht gefunden: " + config.path);
                return response.text();
            })
            .then(markdown => {
                target.innerHTML = parseMarkdown(markdown);
            })
            .catch(error => {
                console.error(error);
                target.innerHTML = "<p>Inhalt konnte nicht geladen werden.</p>";
            });
    }
}

function parseMarkdown(markdown) {
    const lines = markdown.split("\n");
    let html = "";
    let inList = false;
    let paragraphBuffer = [];

    const flushParagraph = () => {
        if (paragraphBuffer.length === 0) return;
        const text = paragraphBuffer.join(" ").trim();
        if (text) {
            html += `<p>${renderInline(text)}</p>`;
        }
        paragraphBuffer = [];
    };

    const closeList = () => {
        if (inList) {
            html += "</ul>";
            inList = false;
        }
    };

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            flushParagraph();
            closeList();
            continue;
        }

        if (line.startsWith("# ")) {
            flushParagraph();
            closeList();
            html += `<h1>${renderInline(line.replace("# ", ""))}</h1>`;
            continue;
        }

        if (line.startsWith("## ")) {
            flushParagraph();
            closeList();
            html += `<h2>${renderInline(line.replace("## ", ""))}</h2>`;
            continue;
        }

        if (line.startsWith("### ")) {
            flushParagraph();
            closeList();
            html += `<h3>${renderInline(line.replace("### ", ""))}</h3>`;
            continue;
        }

        if (line.startsWith("- ")) {
            flushParagraph();
            if (!inList) {
                html += "<ul>";
                inList = true;
            }
            html += `<li>${renderInline(line.replace("- ", ""))}</li>`;
            continue;
        }

        if (trimmed.startsWith("Stand der Bearbeitung:")) {
            flushParagraph();
            closeList();
            html += `<p class="legal-date">${renderInline(trimmed)}</p>`;
            continue;
        }

        paragraphBuffer.push(trimmed);
    }

    flushParagraph();
    closeList();
    return html;
}

function renderInline(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\[([^\]]+)\]\((mailto:[^\s)]+)\)/g, '<a href="$2">$1</a>');
}