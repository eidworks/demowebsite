document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-include]").forEach(async (element) => {
        const file = element.dataset.include;

        try {
            const response = await fetch(file);

            if (!response.ok) {
                throw new Error("Fehler beim Laden: " + file);
            }

            const html = await response.text();
            element.innerHTML = html;

            document.querySelectorAll("[data-current-year]").forEach((yearEl) => {
                yearEl.textContent = new Date().getFullYear();
            });
        } catch (error) {
            console.error(error);
            element.innerHTML = "<p>Inhalt konnte nicht geladen werden.</p>";
        }
    });
});