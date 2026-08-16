import PracticeMaker from '@gurukulams/practice-js'


export default class QuestionLoader {
    constructor() {
        const modeSelect = document.getElementById('modeSelect');
        this.buildInstance(modeSelect.value);

        modeSelect
            .addEventListener('change', () => {
              this.buildInstance(modeSelect.value);
        });

        const complexityCmb = document.getElementById("complexityCmb");
        const savedComplexity = sessionStorage.getItem("selectedComplexity");
        if (savedComplexity !== null) {
          complexityCmb.value = savedComplexity;
        }

        complexityCmb.addEventListener('change', () => {
          sessionStorage.setItem("selectedComplexity", this.value);
          this.buildInstance(modeSelect.value);
        });

        

        const setupRepo = (item) => {
          
          const name = item.dataset.name;
          const img = item.querySelector('img').src;
          const baseUrl = item.querySelector('img').dataset.baseurl;

          sessionStorage.setItem('q-repo', name)
  
          // Update button avatar
          const avatar = document.getElementById('repoSelectedAvatar');
          avatar.src = img;
          avatar.alt = name;
          avatar.dataset.baseurl = baseUrl;
  
          // Update button title
          const btn = document.getElementById('repoDropdownBtn');
          btn.title = name;
          btn.setAttribute('aria-label', name);

  
          // Optional: mark selected item
          document.querySelectorAll('.repo-select-item')
              .forEach(el => el.classList.remove('d-none'));
  
          item.classList.add('d-none');

          this.buildInstance(modeSelect.value);
        };

        const getSelectedRepo = (reposName) => {
          const menu = document.getElementById("repoDropdownMenu");
          if (!menu) return null;
        
          // Query all dropdown items
          const items = menu.querySelectorAll(".repo-select-item");
        
          for (const item of items) {
            const text = item.querySelector("span")?.textContent.trim();
            const title = item.getAttribute("title");
            const name = item.getAttribute("data-name");
        
            // Check if reposName matches span text, title, or data-name attribute
            if (text === reposName || title === reposName || name === reposName) {
              return item;
            }
          }
        
          return null;
        }

        const repoName = sessionStorage.getItem('q-repo');
        if(repoName) {
          const item = getSelectedRepo(sessionStorage.getItem('q-repo'));
          if(item) {
            setupRepo(item);
          }
        }
        

        document.querySelectorAll('.repo-select-item').forEach(item => {
          item.addEventListener('click', (e) => {
            setupRepo(item);
          });
      });
    }

    buildInstance(mode) {
      const contentRoot = document.getElementById("practice-container");
        contentRoot.innerHTML = '';
        var complexity = null;

        if(document.getElementById("complexityCmb").value.trim() !== "") {
          complexity = document.getElementById("complexityCmb").value;
        }

        // Initialize your logic here
        this.practiceMaker = new PracticeMaker(
          contentRoot,
          { 
            "complexity":complexity,
            "mode":mode,
            "error":(message) => {
                window.error(message)
            }
        }
        );

        let baseUrl = document
        .getElementById("repoSelectedAvatar")
        .dataset.baseurl;

        console.log("base Url is " + baseUrl);

        const category = contentRoot.dataset.practiceCategory;
        const languageCode = contentRoot.dataset.practiceLang;

        if(languageCode) {
          baseUrl = baseUrl.replace("/"+languageCode, ""); 
        }
        
        console.log('Load Questions for category ' + category);
        console.log('Load Questions for languageCode ' + languageCode);

        const questionsUrl = baseUrl + 'data/' + category;
        console.log('Load Questions from ' + questionsUrl);

        this.loadQuestions(questionsUrl, undefined, languageCode);
    }

    loadQuestions(questionsUrl, maxQuestions = null, locale = null) {
        this.getQuestions(questionsUrl, maxQuestions, locale).then((questions) => {
          this.originalQuestions = JSON.parse(JSON.stringify(questions));
          console.log(questions);
          this.practiceMaker.setQuestions(questions);
        });
   }

   async getQuestions(questionsUrl, maxQuestions = null, locale = null) {
    const baseUrl = `${questionsUrl}`;
    const allQuestions = [];

    const fetchJSON = async (url) => {
      try {
        const res = await fetch(url);
        return res.ok ? await res.json() : null;
      } catch {
        return null;
      }
    };

    const resolveLocalized = (localized, fallback) => {
      return localized.map((q, i) => (typeof q === "number" ? fallback[q] : q));
    };

    const collectQuestions = async (folderUrl) => {
      const defaultQs = (await fetchJSON(`${folderUrl}/questions.json`)) || [];
      const localizedQs = locale
        ? await fetchJSON(`${folderUrl}/questions_${locale}.json`)
        : null;

      const finalQs = localizedQs
        ? resolveLocalized(localizedQs, defaultQs)
        : defaultQs;
      
      return this.assignIds(
        finalQs,
        folderUrl.split("/data/")[1]
      );
    };

    // === Load main category questions ===
    allQuestions.push(...(await collectQuestions(baseUrl)));

    // === Load subfolders recursively ===
    const subfolders = await fetchJSON(`${baseUrl}/sub-questions.json`);
    if (subfolders?.length) {
      const fetches = subfolders.map(async (sub) => {
        const subPath = `/${sub}`;
        const subUrl = `${questionsUrl}/${subPath}`;
        console.log('Sub Url ' + subUrl);
        const subQs = await collectQuestions(subUrl);
        allQuestions.push(...subQs);
      });
      await Promise.all(fetches);
    }

    const shuffled = this.shuffle(allQuestions);
    return maxQuestions ? shuffled.slice(0, maxQuestions) : shuffled;
  }

  assignIds(questions, baseId) {
    return questions.map((q, qIndex) => {
      const questionId = `${baseId}-q${qIndex}`;
      const choices = (q.choices || []).map((c, i) => ({
        ...c,
        id: `${questionId}-c${i}`,
        questionId,
      }));
      const matches = (q.matches || []).map((m, i) => ({
        ...m,
        id: `${questionId}-m${i}`,
        questionId,
      }));
      return {
        ...q,
        id: questionId,
        choices: choices,
        matches: matches,
      };
    });
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

}

new QuestionLoader();