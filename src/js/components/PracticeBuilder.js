import PracticeMaker from '@gurukulams/practice-js'

export default class PracticeBuilder {
  constructor() {
      // Prevent duplicate instances from registering duplicate listeners.
      if (PracticeBuilder.instance) {
          return PracticeBuilder.instance;
      }

      PracticeBuilder.instance = this;

      this.STORAGE_KEY = "practiceSettings";

      this._elements = {
          contentRoot: document.getElementById("practice-container"),
          modeSelect: document.getElementById("modeSelect"),
          settingsBtn: document.getElementById("settingsBtn"),
          settingsOverlay: document.getElementById("settingsOverlay"),
          closeSettingsBtn: document.getElementById("closeSettingsBtn"),
          cancelSettingsBtn: document.getElementById("cancelSettingsBtn"),
          applySettingsBtn: document.getElementById("applySettingsBtn"),
          complexityCmb: document.getElementById("complexityCmb"),
          maxQInput: document.getElementById("maxQInput"),
          timerInput: document.getElementById("timerInput"),
          repoAvatar: document.getElementById("repoSelectedAvatar")
      };

      this._settings = this._loadSettingsFromStorage();
      this._initFormValues();
      this._manageSettings();

      if (this._settings.mode) {
          this._buildInstance();
      }
  }

  _loadSettingsFromStorage() {
      try {
          const stored = sessionStorage.getItem(this.STORAGE_KEY);

          if (stored) {
              return JSON.parse(stored);
          }
      } catch (error) {
          console.error("Failed to load practice settings:", error);
      }

      return {
          mode: null,
          complexity: null,
          timer: null,
          maxQ: null,
          category: null,
          languageCode: null,
          baseUrl: null,
          questionsUrl: null
      };
  }

  _initFormValues() {
      const {
          modeSelect,
          complexityCmb,
          maxQInput,
          timerInput
      } = this._elements;

      if (modeSelect && this._settings.mode) {
          modeSelect.value = this._settings.mode;
      }

      if (complexityCmb && this._settings.complexity) {
          complexityCmb.value = this._settings.complexity;
      }

      if (maxQInput && this._settings.maxQ != null) {
          maxQInput.value = this._settings.maxQ;
      }

      if (timerInput && this._settings.timer != null) {
          timerInput.value = this._settings.timer;
      }
  }

  _manageSettings() {
      const {
          settingsBtn,
          settingsOverlay,
          closeSettingsBtn,
          cancelSettingsBtn,
          applySettingsBtn
      } = this._elements;

      settingsBtn?.addEventListener("click", () => {
          settingsOverlay?.classList.remove("d-none");
      });

      const closeOverlay = () => {
          settingsOverlay?.classList.add("d-none");
      };

      closeSettingsBtn?.addEventListener("click", closeOverlay);
      cancelSettingsBtn?.addEventListener("click", closeOverlay);

      applySettingsBtn?.addEventListener("click", (event) => {
          event.preventDefault();

          this._updateSettings();
          closeOverlay();
          this._buildInstance();
      });
  }

  _updateSettings() {
      const {
          modeSelect,
          complexityCmb,
          maxQInput,
          timerInput,
          contentRoot,
          repoAvatar
      } = this._elements;

      const complexity = complexityCmb?.value.trim() || null;
      const maxQ = maxQInput?.value.trim() || null;
      const timer = timerInput?.value.trim() || null;

      const category = contentRoot?.dataset.practiceCategory || null;
      const languageCode = contentRoot?.dataset.practiceLang || null;

      let baseUrl = repoAvatar?.dataset.baseurl || "";

      if (languageCode && baseUrl.includes("/" + languageCode)) {
          baseUrl = baseUrl.replace("/" + languageCode, "");
      }

      const questionsUrl = baseUrl
          ? `${baseUrl}/data/${category || ""}`
          : null;

      this._settings = {
          mode: modeSelect?.value || null,
          complexity,
          timer: timer ? parseInt(timer, 10) : null,
          maxQ: maxQ ? parseInt(maxQ, 10) : null,
          category,
          languageCode,
          baseUrl,
          questionsUrl
      };

      try {
          sessionStorage.setItem(
              this.STORAGE_KEY,
              JSON.stringify(this._settings)
          );
      } catch (error) {
          console.error("Failed to save practice settings:", error);
      }
  }

  _buildInstance() {
      const { contentRoot } = this._elements;

      if (!contentRoot) {
          console.warn("Practice container not found.");
          return;
      }

      // Clear existing content before building the practice UI.
      contentRoot.replaceChildren();

      const pm = new PracticeMaker(contentRoot, this._settings);
      await pm.ready; // QuestionLoader fetches and prepares the question data
      // For in-memory data: await pm.setQuestions(questionsArray);
  

      console.log("Practice Settings:", this._settings);

      // Add your practice UI creation logic here.
  }
}

new PracticeBuilder();