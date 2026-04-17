# Gurukulams Design System


## Setup

### Qustion Loader

in Linux

```bash
export QUESTIONS_FOLDER="$PWD/exampleSite/questions"
export PUBLIC_FOLDER="$PWD/static" 
npm i
npm run watch
```

in Windows `Cmd`

```bash
set QUESTIONS_FOLDER=%cd%\exampleSite\questions
set PUBLIC_FOLDER=%cd%\static
npm i
npm run watch
```

### Static Server

```bash
cd exampleSite
hugo server  --themesDir ../.. --disableFastRender
```

