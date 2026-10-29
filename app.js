const fileInput = document.querySelector("#report-file");
const dropzone = document.querySelector("#dropzone");
const browseButton = document.querySelector("#browse-button");
const selectedFile = document.querySelector("#selected-file");
const selectedFileName = document.querySelector("#selected-file-name");
const removeFileButton = document.querySelector("#remove-file");
const reviewButton = document.querySelector("#review-button");
const formMessage = document.querySelector("#form-message");
const prototypeNotice = document.querySelector("#prototype-notice");

const maxFileSize = 20 * 1024 * 1024;
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const allowedExtensions = /\.(pdf|jpe?g|png)$/i;

function clearSelection() {
  fileInput.value = "";
  selectedFile.hidden = true;
  selectedFileName.textContent = "";
  reviewButton.disabled = true;
  prototypeNotice.hidden = true;
}

function selectFile(file) {
  formMessage.textContent = "";
  prototypeNotice.hidden = true;

  if (!file) return;
  if (!allowedTypes.has(file.type) && !allowedExtensions.test(file.name)) {
    clearSelection();
    formMessage.textContent = "Choose a PDF, JPG or PNG file.";
    return;
  }
  if (file.size > maxFileSize) {
    clearSelection();
    formMessage.textContent = "This file is larger than 20 MB. Choose a smaller file.";
    return;
  }

  selectedFileName.textContent = `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  selectedFile.hidden = false;
  reviewButton.disabled = false;
}

browseButton.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("click", (event) => {
  if (event.target.closest("button")) return;
  fileInput.click();
});
fileInput.addEventListener("change", () => selectFile(fileInput.files[0]));
removeFileButton.addEventListener("click", () => {
  clearSelection();
  formMessage.textContent = "";
});
reviewButton.addEventListener("click", () => {
  prototypeNotice.hidden = false;
  prototypeNotice.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

for (const eventName of ["dragenter", "dragover"]) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("drag-over");
  });
}
for (const eventName of ["dragleave", "drop"]) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("drag-over");
  });
}
dropzone.addEventListener("drop", (event) => selectFile(event.dataTransfer.files[0]));

const views = {
  overview: document.querySelector("#overview-view"),
  reports: document.querySelector("#reports-view"),
  clinicians: document.querySelector("#clinicians-view"),
};
const breadcrumb = document.querySelector("#breadcrumb-current");

function showView(name) {
  if (!views[name]) return;
  for (const [viewName, panel] of Object.entries(views)) {
    panel.hidden = viewName !== name;
  }
  for (const link of document.querySelectorAll(".nav-link")) {
    const active = link.dataset.view === name;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  breadcrumb.textContent = name === "overview" ? "Overview" : name === "reports" ? "My reports" : "For clinicians";
}

for (const link of document.querySelectorAll(".nav-link")) {
  link.addEventListener("click", () => showView(link.dataset.view));
}
for (const button of document.querySelectorAll("[data-go]")) {
  button.addEventListener("click", () => showView(button.dataset.go));
}
