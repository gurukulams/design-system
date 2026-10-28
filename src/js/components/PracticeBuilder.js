import PracticeMaker from "@gurukulams/practice-js";

export default class PracticeBuilder {
    static instance = null;

    constructor() {
        if (PracticeBuilder.instance) {
            return PracticeBuilder.instance;
        }

        PracticeBuilder.instance = this;

        this.STORAGE_KEY = "practiceSettings";
        this.practiceMaker = null;

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

        // Ensure dataset values are captured on startup.
        this._updateSettings();

        // Initialize PracticeMaker immediately.
        void this._initializePractice().catch(console.error);
    }

    /**
     * Restore settings from session storage.
     */
    _loadSettingsFromStorage() {
        try {
            const stored = sessionStorage.getItem(this.STORAGE_KEY);

            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error(
                "Failed to load practice settings:",
                error
            );
        }

        return {
            mode: null,
            complexity: null,
            timer: null,
            maxQ: null,
            repoUrl: null,
            languageCode: null,
            baseUrl: null
        };
    }

    /**
     * Populate controls from saved settings.
     */
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

    /**
     * Register settings popup events.
     */
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

        closeSettingsBtn?.addEventListener(
            "click",
            closeOverlay
        );

        cancelSettingsBtn?.addEventListener(
            "click",
            closeOverlay
        );

        applySettingsBtn?.addEventListener(
            "click",
            async event => {
                event.preventDefault();

                this._updateSettings();

                try {
                    await this._applySettings();
                    closeOverlay();
                } catch (error) {
                    console.error(
                        "Failed to apply settings:",
                        error
                    );
                }
            }
        );
    }

    /**
     * Read latest UI values and persist them.
     */
    _updateSettings() {
        const {
            modeSelect,
            complexityCmb,
            maxQInput,
            timerInput,
            contentRoot,
            repoAvatar
        } = this._elements;

        const complexity =
            complexityCmb?.value.trim() || null;

        const maxQ =
            maxQInput?.value.trim() || null;

        const timer =
            timerInput?.value.trim() || null;

        const repoUrl =
            contentRoot?.dataset.practiceCategory || null;

        const languageCode =
            contentRoot?.dataset.practiceLang || null;

        let baseUrl =
            repoAvatar?.dataset.baseurl || "";

        if (
            languageCode &&
            baseUrl.includes(`/${languageCode}`)
        ) {
            baseUrl = baseUrl.replace(
                `/${languageCode}`,
                ""
            );
        }

        this._settings = {
            mode: modeSelect?.value || null,
            complexity,
            timer: timer ? Number(timer) : null,
            maxQ: maxQ ? Number(maxQ) : null,
            repoUrl,
            languageCode,
            baseUrl
        };

        try {
            sessionStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(this._settings)
            );
        } catch (error) {
            console.error(
                "Failed to save settings:",
                error
            );
        }
    }

    /**
     * Create PracticeMaker once.
     */
    async _initializePractice() {
        const { contentRoot } = this._elements;

        if (!contentRoot) {
            console.warn(
                "Practice container not found."
            );
            return;
        }

        if (this.practiceMaker) {
            return;
        }

        contentRoot.replaceChildren();

        this.practiceMaker = new PracticeMaker(
            contentRoot,
            this._settings
        );

        await this.practiceMaker.ready;

        console.log(
            "PracticeMaker initialized",
            this._settings
        );
    }

    /**
     * Apply updated settings to PracticeMaker.
     * Uses the official setOptions() API.
     */
    async _applySettings() {
        if (!this.practiceMaker) {
            await this._initializePractice();
            return;
        }

        const changes = {
            mode: this._settings.mode,
            complexity: this._settings.complexity,
            timer: this._settings.timer,
            maxQ: this._settings.maxQ,
            repoUrl: this._settings.repoUrl,
            baseUrl: this._settings.baseUrl
        };

        console.log(
            "Applying PracticeMaker options:",
            changes
        );

        await this.practiceMaker.setOptions(
            changes
        );

        console.log(
            "PracticeMaker options updated"
        );
    }

    /**
     * Cleanup if page is destroyed.
     */
    destroy() {
        this.practiceMaker?.destroy?.();
        this.practiceMaker = null;
    }
}

new PracticeBuilder();
